const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.log('ANTHROPIC_API_KEY not configured - skipping Claude analysis');
  process.exit(0);
}

const client = new Anthropic({ apiKey });

async function query(prompt) {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log(message.content[0].text);
  } catch (error) {
    console.log(`Claude API error: ${error.message}`);
  }
}

query(process.argv[2]).catch(err => console.log(`Claude error: ${err.message}`));
