const Anthropic = require('@anthropic-ai/sdk');

// Try to load unified config, fallback to environment variable
let client, modelName, maxTokens;
try {
  const config = require('../config');
  if (!config.ai.anthropic.enabled) {
    console.error('Anthropic Claude API is not configured. Please set ANTHROPIC_API_KEY in your .env file.');
    console.error('See .env.example for configuration template.');
    process.exit(1);
  }
  client = new Anthropic({ apiKey: config.ai.anthropic.apiKey });
  modelName = config.ai.anthropic.model;
  maxTokens = config.ai.anthropic.maxTokens;
} catch (error) {
  // Fallback to direct environment variable for backward compatibility
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Set ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }
  client = new Anthropic({ apiKey });
  modelName = 'claude-3-5-sonnet-20241022';
  maxTokens = 4096;
}

async function query(prompt) {
  const message = await client.messages.create({
    model: modelName,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  });
  console.log(message.content[0].text);
}

query(process.argv[2]);
