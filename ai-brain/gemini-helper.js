const { GoogleGenerativeAI } = require('@google/generative-ai');

// Try to load unified config, fallback to environment variable
let apiKey, model;
try {
  const config = require('../config');
  if (!config.ai.gemini.enabled) {
    console.error('Gemini API is not configured. Please set GEMINI_API_KEY in your .env file.');
    console.error('See .env.example for configuration template.');
    process.exit(1);
  }
  apiKey = config.ai.gemini.apiKey;
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: config.ai.gemini.model });
} catch (error) {
  // Fallback to direct environment variable for backward compatibility
  apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY environment variable');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
}

async function chat(prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  console.log(response.text());
}

const prompt = process.argv.slice(2).join(' ') || 'Hello';
chat(prompt).catch(console.error);
