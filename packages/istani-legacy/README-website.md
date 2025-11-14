# istani.org website

This branch contains an open source, privacy-first static site with a WordPress-like layout.

- No analytics.
- No trackers.
- No external CDNs.
- All assets are local and MIT-licensed.

## Structure

site/
  index.html
  about.html
  contact.html
  blog/
    index.html
  css/
    pico.min.css
    theme.css
  js/
    main.js
  images/
    logo.svg
    hero.svg
    placeholders/
      post-1.svg
      post-2.svg
      post-3.svg

## Local development

Any static http server works.

python3 -m http.server -d site 8080

## Deploy options

- GitHub Pages for site/ folder
- Cloudflare Pages
- Netlify

## License

MIT for theme and templates. Images are original SVG created for this repo.
