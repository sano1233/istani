#!/usr/bin/env node

// Test Gemini API Integration
// Usage: node test-gemini-api.js

const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDCgb1P96ZYembmM4Z6Xeo13-dHOBVpmxY';
const GEMINI_MODEL = 'gemini-pro';

async function testGeminiAPI() {
  console.log('Testing Gemini API Integration...\n');

  const prompt = 'You are a UI/UX expert. Analyze this fitness app component and suggest 3 specific improvements. Component: Dashboard workout card showing exercise name, sets, reps, and weight. Be concise.';

  const requestData = JSON.stringify({
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            const text = response.candidates[0].content.parts[0].text;
            console.log('✅ Gemini API is operational!\n');
            console.log('Response:');
            console.log(text);
            console.log('\n---\n');
            resolve(true);
          } catch (error) {
            console.error('❌ Failed to parse response:', error.message);
            console.error('Raw response:', data);
            reject(error);
          }
        } else {
          console.error(`❌ API Error: ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
}

// Run test
testGeminiAPI()
  .then(() => {
    console.log('Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });
