const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://istani.org/links.html';
const linksPath = path.join(__dirname, '..', 'links.json');
const outPath = path.join(__dirname, '..', 'links.html');

const PAYPAL_DONATION_FORM = `      <li>
        <form action="https://www.paypal.com/donate" method="post" target="_top" aria-label="Donate to ISTANI via PayPal">
          <input type="hidden" name="campaign_id" value="TB2RPVKE469QE" />
          <input
            type="image"
            src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
            name="submit"
            title="Donate with PayPal"
            alt="Donate with PayPal button"
          />
          <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
      </li>`;

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function build() {
  const data = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
  const sections = Object.entries(data)
    .map(([category, items]) => {
      const listItems = items
        .map(
          ({ label, url }) =>
            `      <li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`
        );

      if (category === 'Support') {
        listItems.push(PAYPAL_DONATION_FORM);
      }

      const slug = toSlug(category);

      return `    <section id="${slug}" aria-labelledby="heading-${slug}">
      <h2 id="heading-${slug}">${category}</h2>
      <ul>
${listItems.join('\n')}
      </ul>
    </section>`;
    })
    .join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ISTANI Links</title>
  <meta name="description" content="Explore ISTANI storefronts, social profiles, and support options all in one place.">
  <link rel="canonical" href="${SITE_URL}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="ISTANI Link Hub">
  <meta property="og:description" content="Quick access to ISTANI storefronts, content, and community channels.">
  <meta property="og:url" content="${SITE_URL}">
  <meta name="theme-color" content="#ffffff">
  <style>
    :root {
      color-scheme: light;
      font-family: "Helvetica Neue", Arial, sans-serif;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #222;
      line-height: 1.6;
    }

    header {
      background: #f5f5f5;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e5e5e5;
    }

    main {
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1.5rem 3rem;
      display: grid;
      gap: 2.5rem;
    }

    section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    section li + li {
      margin-top: 0.75rem;
    }

    a {
      color: #0055aa;
      text-decoration: none;
      font-weight: 600;
    }

    a:hover,
    a:focus {
      text-decoration: underline;
    }

    footer {
      background: #f5f5f5;
      border-top: 1px solid #e5e5e5;
      padding: 1.25rem 1.5rem;
      text-align: center;
      font-size: 0.95rem;
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
      }
    }
  </style>
  <script>
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "taai39esa1");
  </script>
</head>
<body>
  <header>
    <h1>ISTANI Link Hub</h1>
    <p>Quick access to our storefronts, content, and social channels.</p>
  </header>
  <main>
${sections}
  </main>
  <footer>
    <p>Looking for more? <a href="https://istani.org" target="_blank" rel="noopener noreferrer">Return to the ISTANI homepage</a>.</p>
  </footer>
</body>
</html>
`;

  fs.writeFileSync(outPath, html);
  console.log(`Generated ${outPath}`);
}

build();
