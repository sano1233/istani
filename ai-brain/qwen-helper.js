const https = require('https');

// Try to load unified config, fallback to environment variable
let apiKey, modelName, endpoint;
try {
  const config = require('../config');
  if (!config.ai.qwen.enabled) {
    console.error('Qwen API is not configured. Please set QWEN_API_KEY in your .env file.');
    console.error('See .env.example for configuration template.');
    process.exit(1);
  }
  apiKey = config.ai.qwen.apiKey;
  modelName = config.ai.qwen.model;
  endpoint = new URL(config.ai.qwen.endpoint);
} catch (error) {
  // Fallback to direct environment variable for backward compatibility
  apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    console.error('Set QWEN_API_KEY environment variable');
    process.exit(1);
  }
  modelName = 'qwen-max';
  endpoint = new URL('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation');
}

async function query(prompt) {
  const data = JSON.stringify({
    model: modelName,
    input: { messages: [{ role: 'user', content: prompt }] }
  });

  const options = {
    hostname: endpoint.hostname,
    path: endpoint.pathname,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(JSON.parse(body).output.text));
  });

  req.write(data);
  req.end();
}

query(process.argv[2]);
