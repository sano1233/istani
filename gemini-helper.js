const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Set GEMINI_API_KEY environment variable');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function chat(prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  console.log(response.text());
}

const prompt = process.argv.slice(2).join(' ') || 'Hello';
chat(prompt).catch(console.error);
