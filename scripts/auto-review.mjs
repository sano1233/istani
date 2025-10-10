#!/usr/bin/env node
import { execSync } from "node:child_process";
import process from "node:process";
import OpenAI from "openai";

const args = process.argv.slice(2);
let shouldMerge = false;
const positional = [];
for (const arg of args) {
  if (arg === "--merge") {
    shouldMerge = true;
  } else {
    positional.push(arg);
  }
}

if (positional.length === 0) {
  console.error("Usage: node scripts/auto-review.mjs <pr-number> [--merge]");
  process.exit(1);
}

const prNumber = positional[0];

try {
  execSync("gh --version", { stdio: "ignore" });
} catch (error) {
  console.error("The GitHub CLI (gh) is required but was not found in PATH.");
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Set the OPENAI_API_KEY environment variable before running the reviewer.");
  process.exit(1);
}

function runGh(command) {
  try {
    return execSync(command, { encoding: "utf8" });
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    if (error.stderr) {
      console.error(error.stderr.toString());
    }
    process.exit(1);
  }
}

const prInfoRaw = runGh(
  `gh pr view ${prNumber} --json title,body,url,headRefName,baseRefName,author,mergeStateStatus`
);
const prDiffRaw = runGh(`gh pr diff ${prNumber}`);

const prInfo = JSON.parse(prInfoRaw);
const diff = prDiffRaw.trim();

if (!diff) {
  console.log(`Pull request #${prNumber} has no diff to review.`);
  process.exit(0);
}

const MAX_DIFF_CHARS = 60000;
let diffForModel = diff;
if (diff.length > MAX_DIFF_CHARS) {
  const truncatedNotice = "\n\n[Diff truncated for review due to size limit.]";
  diffForModel = diff.slice(0, MAX_DIFF_CHARS) + truncatedNotice;
  console.warn(
    `Diff is ${diff.length} characters; truncated to ${MAX_DIFF_CHARS} characters for the model.`
  );
}

const client = new OpenAI({ apiKey });

const reviewSchema = {
  name: "code_review",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "verdict", "concerns"],
    properties: {
      summary: {
        type: "string",
        description: "One-paragraph summary of the review findings.",
      },
      verdict: {
        type: "string",
        enum: ["approve", "changes_requested"],
        description: "Overall decision for the pull request.",
      },
      concerns: {
        type: "array",
        description: "List of review concerns, if any.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["severity", "title", "details", "blocking"],
          properties: {
            severity: {
              type: "string",
              enum: ["critical", "major", "minor", "nit"],
              description: "Impact level of the concern.",
            },
            title: {
              type: "string",
              description: "Short headline for the concern.",
            },
            details: {
              type: "string",
              description: "Detailed explanation of the issue.",
            },
            files: {
              type: "array",
              items: { type: "string" },
              description: "Impacted files, when identifiable.",
            },
            blocking: {
              type: "boolean",
              description: "Whether the issue should block merging.",
            },
          },
        },
      },
      recommended_checks: {
        type: "array",
        items: { type: "string" },
        description: "Commands or tests recommended before merging.",
      },
    },
  },
};

const systemPrompt = `You are an automated senior software engineer tasked with reviewing pull requests.
Carefully inspect the diff, highlight security, reliability, performance, and maintainability issues,
and respond strictly in JSON using the provided schema. Only approve when there are no blocking
concerns. If something is unsafe, mark it as blocking.`;

const userPrompt = `Pull request #${prNumber}: ${prInfo.title}
Author: ${prInfo.author?.login ?? "unknown"}
URL: ${prInfo.url}
Base branch: ${prInfo.baseRefName}
Head branch: ${prInfo.headRefName}
Merge state: ${prInfo.mergeStateStatus}

Description:
${prInfo.body || "(no description provided)"}

Diff:
${diffForModel}`;

async function runReview() {
  const response = await client.responses.create({
    model: "gpt-5",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_schema", json_schema: reviewSchema },
  });

  const outputText = response.output_text;
  let review;
  try {
    review = JSON.parse(outputText);
  } catch (error) {
    console.error("Failed to parse model response as JSON:");
    console.error(outputText);
    throw error;
  }

  console.log("=== Review Summary ===");
  console.log(review.summary.trim());
  console.log("");

  if (Array.isArray(review.concerns) && review.concerns.length > 0) {
    console.log("=== Concerns ===");
    for (const [index, concern] of review.concerns.entries()) {
      console.log(`${index + 1}. [${concern.severity}] ${concern.title}`);
      console.log(concern.details.trim());
      if (concern.files && concern.files.length > 0) {
        console.log(`   Files: ${concern.files.join(", ")}`);
      }
      console.log(`   Blocking: ${concern.blocking ? "yes" : "no"}`);
      console.log("");
    }
  } else {
    console.log("No concerns reported.");
    console.log("");
  }

  if (Array.isArray(review.recommended_checks) && review.recommended_checks.length > 0) {
    console.log("=== Recommended Checks ===");
    for (const check of review.recommended_checks) {
      console.log(`- ${check}`);
    }
    console.log("");
  }

  console.log(`Verdict: ${review.verdict}`);

  const hasBlockingIssues = Array.isArray(review.concerns)
    ? review.concerns.some((concern) => concern.blocking)
    : false;

  if (shouldMerge) {
    if (review.verdict !== "approve" || hasBlockingIssues) {
      console.log("Skipping merge because the review is not an approval.");
      process.exit(2);
    }

    console.log("Merging PR via gh (squash + delete branch)…");
    try {
      execSync(`gh pr merge ${prNumber} --squash --delete-branch`, { stdio: "inherit" });
    } catch (error) {
      console.error("Failed to merge the pull request automatically.");
      process.exit(1);
    }
  }
}

runReview().catch((error) => {
  console.error("Review failed:", error.message ?? error);
  process.exit(1);
});
