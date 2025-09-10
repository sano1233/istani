const fs = require('fs');
const path = require('path');

const linksPath = path.join(__dirname, '..', 'links.json');
const outPath = path.join(__dirname, '..', 'links.html');

function build() {
  const data = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
  const sections = Object.entries(data).map(([category, items]) => {
    const itemsHtml = items
      .map(({ label, url }) => `      <li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`)
      .join('\n');
    return `  <section>\n    <h2>${category}</h2>\n    <ul>\n${itemsHtml}\n    </ul>\n  </section>`;
  }).join('\n\n');

  const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>ISTANI Links</title>\n  <style>\n    body {font-family: Arial, sans-serif; margin: 0; padding: 0;}\n    header {background:#f5f5f5; padding:1rem 2rem;}\n    section {max-width:900px; margin:2rem auto; padding:1rem 2rem;}\n    ul {list-style:none; padding:0;}\n    li {margin:0.5rem 0;}\n  </style>\n</head>\n<body>\n  <header>\n    <h1>ISTANI Link Hub</h1>\n    <p>Quick access to our storefronts, content, and social channels.</p>\n  </header>\n${sections}\n</body>\n</html>\n`;

  fs.writeFileSync(outPath, html);
  console.log(`Generated ${outPath}`);
}

build();
