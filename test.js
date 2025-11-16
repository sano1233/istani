const fs = require('fs');

const checks = {
  'index.html': 'bPKYqxtvvAXr6YAd9_MHFjn7euBAPgd9F7n6ruTEn0M',
  'google09fb6384e727b88f.html': 'google-site-verification: google09fb6384e727b88f.html',
};

for (const [file, snippet] of Object.entries(checks)) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }

  const contents = fs.readFileSync(file, 'utf8');
  if (!contents.includes(snippet)) {
    console.error(`Required content not found in: ${file}`);
    process.exit(1);
  }
}

console.log('All verification checks passed.');
