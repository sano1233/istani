const https = require('https');

const data = JSON.stringify({
  model: 'gpt-4',
  messages: [{ role: 'user', content: process.argv[2] }]
});

const req = https.request(
  {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  res => {
    let body = '';
    res.on('data', chunk => (body += chunk));
    res.on('end', () => console.log(JSON.parse(body).choices[0].message.content));
  }
);

req.write(data);
req.end();
