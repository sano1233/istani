#!/usr/bin/env bash
set -euo pipefail

# Helper script that guides developers through the environment variable setup
# required by the AI Brain utilities. It keeps local secrets files in sync and
# reports whether required keys are exported or present in .env.local.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_FILE="$REPO_ROOT/.env.example"
LOCAL_FILE="$REPO_ROOT/.env.local"
REQUIRED_VARS=("GEMINI_API_KEY" "ANTHROPIC_API_KEY" "QWEN_API_KEY")

if ! command -v python3 >/dev/null 2>&1; then
  echo "[setup-secrets] python3 is required to parse .env files." >&2
  exit 1
fi

create_example_file() {
  cat <<'EOT' > "$EXAMPLE_FILE"
# Copy this file to .env.local and populate the values with your real secrets.
# Values may be quoted. Blank entries indicate the secret has not been set.
GEMINI_API_KEY=""
ANTHROPIC_API_KEY=""
QWEN_API_KEY=""
EOT
}

if [[ ! -f "$EXAMPLE_FILE" ]]; then
  echo "[setup-secrets] Creating .env.example with placeholder keys."
  create_example_file
fi

if [[ ! -f "$LOCAL_FILE" ]]; then
  echo "[setup-secrets] Creating empty .env.local file. Update it with your secrets."
  cp "$EXAMPLE_FILE" "$LOCAL_FILE"
fi

mapfile -t ENV_REPORT < <(python3 - "$LOCAL_FILE" "${REQUIRED_VARS[@]}" <<'PY'
import os
import sys
from pathlib import Path

env_file = Path(sys.argv[1])
required = sys.argv[2:]
values_from_file = {}

if env_file.exists():
    for raw_line in env_file.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip("'\"")
        values_from_file[key] = value

for key in required:
    env_value = os.environ.get(key)
    file_value = values_from_file.get(key, '')
    masked = ''
    if file_value:
        if len(file_value) <= 4:
            masked = '***'
        else:
            masked = f"{file_value[:4]}…"
    exported = '1' if env_value else '0'
    configured = '1' if file_value else '0'
    print(f"{key}|{exported}|{configured}|{masked}")
PY
)

MISSING=()

for entry in "${ENV_REPORT[@]}"; do
  IFS='|' read -r key exported configured preview <<<"$entry"

  if [[ "$exported" == "1" ]]; then
    echo "[setup-secrets] $key is exported in the current shell."
  elif [[ "$configured" == "1" ]]; then
    if [[ -n "$preview" ]]; then
      echo "[setup-secrets] $key configured in .env.local (preview: $preview)."
    else
      echo "[setup-secrets] $key configured in .env.local."
    fi
  else
    echo "[setup-secrets] Missing secret: $key"
    MISSING+=("$key")
  fi
done

if ((${#MISSING[@]} > 0)); then
  echo "[setup-secrets] Update $LOCAL_FILE with the missing values or export them in your shell."
  exit 1
fi

echo "[setup-secrets] All required secrets are configured."
