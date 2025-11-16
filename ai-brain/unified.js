const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function query(prompt, providers = ['gemini', 'claude', 'codex', 'qwen']) {
  const results = await Promise.all(
    providers.map(async p => {
      try {
        const cmd =
          p === 'codex'
            ? `curl -s https://api.openai.com/v1/chat/completions -H "Authorization: Bearer ${process.env.OPENAI_API_KEY}" -H "Content-Type: application/json" -d "{\\"model\\":\\"gpt-4\\",\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"${prompt}\\"}]}"`
            : `node ${p}-helper.js "${prompt}"`;
        const { stdout } = await execAsync(cmd);
        return { provider: p, response: stdout.trim() };
      } catch (e) {
        return { provider: p, response: `Error: ${e.message}` };
      }
    })
  );

  console.log(JSON.stringify(results, null, 2));
}

query(process.argv[2]);
