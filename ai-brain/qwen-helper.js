const https = require('https');

async function query(prompt) {
  const data = JSON.stringify({
    model: 'qwen-max',
    input: { messages: [{ role: 'user', content: prompt }] }
  });

  const options = {
    hostname: 'dashscope.aliyuncs.com',
    path: '/api/v1/services/aigc/text-generation/generation',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, res => {
    let body = '';
    res.on('data', chunk => (body += chunk));
    res.on('end', () => console.log(JSON.parse(body).output.text));
  });

  req.write(data);
  req.end();
}

query(process.argv[2]);
