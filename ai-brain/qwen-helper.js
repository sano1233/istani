const https = require('https');

const apiKey = process.env.QWEN_API_KEY;
if (!apiKey) {
  console.log('QWEN_API_KEY not configured - skipping Qwen analysis');
  process.exit(0);
}

async function query(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'qwen-max',
      input: { messages: [{ role: 'user', content: prompt }] }
    });

    const options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.output && parsed.output.text) {
            console.log(parsed.output.text);
            resolve();
          } else {
            console.log(`Qwen API error: ${body}`);
            resolve();
          }
        } catch (error) {
          console.log(`Qwen parse error: ${error.message}`);
          resolve();
        }
      });
    });

    req.on('error', error => {
      console.log(`Qwen request error: ${error.message}`);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Read from stdin if available, otherwise use command line args
async function getPrompt() {
  if (process.stdin.isTTY) {
    // No stdin, use command line arguments
    return process.argv.slice(2).join(' ') || 'Hello';
  } else {
    // Read from stdin
    return new Promise(resolve => {
      let data = '';
      process.stdin.on('data', chunk => (data += chunk));
      process.stdin.on('end', () => resolve(data.trim() || 'Hello'));
    });
  }
}

getPrompt()
  .then(prompt => query(prompt))
  .catch(err => console.log(`Qwen error: ${err.message}`));
