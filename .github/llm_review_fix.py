import os, re, time, json, subprocess
from unidiff import PatchSet
import requests

HF = "https://api-inference.huggingface.co/models/{}"
HF_TOKEN = os.getenv("HF_TOKEN","").strip()
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

MODELS = [m.strip() for m in os.getenv("MODEL_ALLOWLIST","").split(",") if m.strip()]
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS","900"))
MAX_DIFF_CHARS = int(os.getenv("MAX_DIFF_CHARS","80000"))

def sh(cmd):
  return subprocess.run(cmd, shell=True, check=False, capture_output=True, text=True).stdout

def read(p, limit=None):
  if not os.path.exists(p): return ""
  t = open(p,"r",encoding="utf-8",errors="ignore").read()
  return t[:limit] if limit else t

def extract_patch(text):
  m = re.findall(r"```(?:diff|patch)?\n(.*?)```", text, flags=re.S)
  for block in m:
    if "diff --git" in block or block.strip().startswith(("--- a/","Index: ")):
      return block
  if "diff --git" in text: return text
  return ""

def valid_patch(p):
  try:
    PatchSet(p.splitlines(True))
    return True
  except Exception:
    return False

def call(model, prompt):
  payload = {"inputs": prompt, "parameters":{"max_new_tokens": MAX_NEW_TOKENS, "temperature": 0.1, "return_full_text": False}}
  try:
    r = requests.post(HF.format(model), headers=HEADERS, json=payload, timeout=120)
    if r.status_code == 503:
      time.sleep(5)
      return None
    if r.status_code >= 400:
      return None
    data = r.json()
    if isinstance(data, list) and data and "generated_text" in data[0]:
      return data[0]["generated_text"]
    if isinstance(data, dict) and "generated_text" in data:
      return data["generated_text"]
    return None
  except Exception:
    return None

def main():
  diff = read("diff.trunc.patch", MAX_DIFF_CHARS)
  if not diff.strip():
    open(".github/llm_out.txt","w",encoding="utf-8").write("No code changes detected.")
    return

  files = sh("git ls-files | head -n 400")
  pyver = sh("python --version").strip()
  rules = """You are a senior code reviewer.
Part A Short bullets only. Note bugs security risks undefined names dead code missing tests and performance issues. Include file and line hints.
Part B Unified diff patch that applies with git apply -p0. Use zero context. Do not rename files. Only include the diff in Part B.
If unsafe or uncertain leave Part B empty.
"""

  prompt = f"""{rules}
Repo files sample
{files}
Python {pyver}
Pull request diff
{diff}
"""

  logs = []
  review = "No review generated."
  patch = ""

  for m in MODELS:
    out = call(m, prompt)
    logs.append(f"{m} {'ok' if out else 'fail'}")
    if not out: continue
    review = out.split("Part B")[0].strip() if "Part B" in out else out[:10000]
    cand = extract_patch(out)
    if cand and valid_patch(cand):
      patch = cand
      break

  open(".github/llm_out.txt","w",encoding="utf-8").write(f"LLM review\n\n{review}\n\nModels tried\n" + "\n".join(logs) + "\n")

  if not patch:
    return

  open("llm_autofix.patch","w",encoding="utf-8").write(patch)
  r = subprocess.run("git apply --index --reject --whitespace=fix llm_autofix.patch", shell=True)
  if r.returncode == 0:
    open(".github/llm_autofix_applied","w").write("1")
  else:
    with open(".github/llm_out.txt","a",encoding="utf-8") as f:
      f.write("\nAutofix could not be applied automatically. Patch attached.\n```diff\n"+patch+"\n```\n")

if __name__ == "__main__":
  main()
