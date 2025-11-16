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

// Read from stdin if available, otherwise use command line args
async function getPrompt() {
  if (process.stdin.isTTY) {
    // No stdin, use command line arguments
    return process.argv.slice(2).join(' ') || 'Hello';
  } else {
    // Read from stdin
    return new Promise((resolve) => {
      let data = '';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data.trim() || 'Hello'));
    });
  }
}

getPrompt()
  .then(prompt => chat(prompt))
  .catch(err => console.log(`Gemini error: ${err.message}`));
