const KEY_REGEXES = [
  /sk-[a-zA-Z0-9-_]{10,}/g, // generic sk- style
  /sk_or_v1_[a-zA-Z0-9]{20,}/gi, // openrouter variations
  /AIza[0-9A-Za-z\-_]{20,}/g, // Google style
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWT-like
];

export function redactSecrets(input: any): any {
  try {
    const str = typeof input === 'string' ? input : JSON.stringify(input);
    const redacted = KEY_REGEXES.reduce((acc, r) => acc.replace(r, '[REDACTED]'), str);
    return typeof input === 'string' ? redacted : JSON.parse(redacted);
  } catch {
    return '[UNSERIALIZABLE]';
  }
}

