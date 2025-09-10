let axios;
try {
  axios = require('axios');
} catch (err) {
  console.error('Axios is not installed. Run "npm install" before using this script.');
  process.exit(1);
}

async function postToX(text) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    console.log('X_BEARER_TOKEN not set, skipping X');
    return;
  }
  try {
    await axios.post('https://api.twitter.com/2/tweets', { text }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Posted to X');
  } catch (err) {
    console.error('Failed to post to X:', err.response?.data || err.message);
  }
}

async function postToDiscord(text) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    console.log('DISCORD_WEBHOOK_URL not set, skipping Discord');
    return;
  }
  try {
    await axios.post(webhook, { content: text });
    console.log('Posted to Discord');
  } catch (err) {
    console.error('Failed to post to Discord:', err.response?.data || err.message);
  }
}

async function main() {
  const message = process.argv.slice(2).join(' ') || 'Hello from ISTANI!';
  await Promise.all([postToX(message), postToDiscord(message)]);
}

main();
