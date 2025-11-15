const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log('GEMINI_API_KEY not configured - skipping Gemini analysis');
  process.exit(0);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function chat(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.log(`Gemini API error: ${error.message}`);
  }
}

const prompt = process.argv.slice(2).join(' ') || 'Hello';
chat(prompt).catch(err => console.log(`Gemini error: ${err.message}`));
