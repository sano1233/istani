#!/usr/bin/env bash
set -euo pipefail

# Helper script that guides developers through the environment variable setup
# required by the AI Brain utilities. It keeps local secrets files in sync and
# reports whether required keys are exported or present in .env.local.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_FILE="$REPO_ROOT/.env.example"
LOCAL_FILE="$REPO_ROOT/.env.local"
REQUIRED_VARS=("GEMINI_API_KEY" "ANTHROPIC_API_KEY" "QWEN_API_KEY")
OPTIONAL_VARS=(
  "OPENAI_API_KEY"
  "QWEN3_CODER_API_KEY"
  "QWEN_2_5_CODER_32_INSTRUCT_API_KEY"
  "DEEPSEEK_API_KEY"
  "TNG_TECH_DEEP_SEEK_API_KEY"
  "MISTRAL_AI_API_KEY"
  "MISTRAL_AI_DEV_STRALL_API_KEY"
  "COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY"
  "GLM_4_5_API_KEY"
  "GROK_X_API_KEY"
  "X_API_KEY"
  "ELEVEN_LABS_API_KEY"
  "HERMES_LLAMA_API_KEY"
  "AGENTICA_API_KEY"
  "AGENTICA_DEEP_CODER_API_KEY"
  "CODE_RABBIT_API_KEY"
  "KIMI_DEV_MOONSHOT_API_KEY"
  "MICROSOFT_AI_CODER_API_KEY"
  "MINIMAX_API_KEY"
  "NVIDIA_NEMATRON_NANO_API_KEY"
  "COHERE_API_KEY"
  "HUGGINGFACE_API_KEY"
  "GITHUB_TOKEN"
)
ALL_VARS=("${REQUIRED_VARS[@]}" "${OPTIONAL_VARS[@]}")

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

mapfile -t ENV_REPORT < <(python3 - "$LOCAL_FILE" "${ALL_VARS[@]}" <<'PY'
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

declare -A STATUS_EXPORTED
declare -A STATUS_CONFIGURED
declare -A STATUS_PREVIEW

for entry in "${ENV_REPORT[@]}"; do
  IFS='|' read -r key exported configured preview <<<"$entry"
  STATUS_EXPORTED["$key"]=$exported
  STATUS_CONFIGURED["$key"]=$configured
  STATUS_PREVIEW["$key"]=$preview
done

MISSING=()
OPTIONAL_MISSING=()

print_status() {
  local key=$1
  local exported=${STATUS_EXPORTED["$key"]}
  local configured=${STATUS_CONFIGURED["$key"]}
  local preview=${STATUS_PREVIEW["$key"]}

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
  fi
}

for key in "${REQUIRED_VARS[@]}"; do
  print_status "$key"
  if [[ "${STATUS_EXPORTED["$key"]}" != "1" && "${STATUS_CONFIGURED["$key"]}" != "1" ]]; then
    MISSING+=("$key")
  fi
done

for key in "${OPTIONAL_VARS[@]}"; do
  print_status "$key"
  if [[ "${STATUS_EXPORTED["$key"]}" != "1" && "${STATUS_CONFIGURED["$key"]}" != "1" ]]; then
    OPTIONAL_MISSING+=("$key")
  fi
done

if ((${#MISSING[@]} > 0)); then
  echo "[setup-secrets] Missing required secrets: ${MISSING[*]}"
  echo "[setup-secrets] Update $LOCAL_FILE with the missing values or export them in your shell."
  exit 1
fi

if ((${#OPTIONAL_MISSING[@]} > 0)); then
  echo "[setup-secrets] Optional secrets still missing (${#OPTIONAL_MISSING[@]}): ${OPTIONAL_MISSING[*]}"
fi

echo "[setup-secrets] All required secrets are configured."
