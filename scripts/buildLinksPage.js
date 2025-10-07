const fs = require('fs');
const path = require('path');

const linksPath = path.join(__dirname, '..', 'links.json');
const outPath = path.join(__dirname, '..', 'links.html');

function renderListItem(item) {
  if (item.url) {
    return `      <li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a></li>`;
  }

  if (item.value) {
    const label = item.label ? `<strong>${item.label}:</strong> ` : '';
    return `      <li>${label}<code>${item.value}</code></li>`;
  }

  return `      <li>${item.label}</li>`;
}

function build() {
  const data = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
  const sections = Object.entries(data)
    .map(([category, items]) => {
      const itemsHtml = items.map(renderListItem).join('\n');
      return `  <section>\n    <h2>${category}</h2>\n    <ul>\n${itemsHtml}\n    </ul>\n  </section>`;
    })
    .join('\n\n');

  const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>ISTANI Links</title>\n  <style>\n    body {font-family: Arial, sans-serif; margin: 0; padding: 0;}\n    header {background:#f5f5f5; padding:1rem 2rem;}\n    section {max-width:900px; margin:2rem auto; padding:1rem 2rem;}\n    ul {list-style:none; padding:0;}\n    li {margin:0.5rem 0;}\n    code {background:#f0f0f0; padding:0.1rem 0.3rem; border-radius:4px;}\n  </style>\n  <!-- Clarity tracking code for https://istaniorg.vercel.app/ -->\n  <script>\n    (function(c,l,a,r,i,t,y){\n        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n        t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i+\"?ref=bwt\";\n        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n    })(window, document, \"clarity\", \"script\", \"taai39esa1\");\n  </script>\n</head>\n<body>\n  <header>\n    <h1>ISTANI Link Hub</h1>\n    <p>Quick access to our storefronts, content, and social channels.</p>\n  </header>\n${sections}\n</body>\n</html>\n`;

  fs.writeFileSync(outPath, html);
  console.log(`Generated ${outPath}`);
}

build();
