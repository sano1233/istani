## ISTANI

[![Netlify Status](https://api.netlify.com/api/v1/badges/06176c52-805a-4be2-a8eb-732e5ab0f184/deploy-status)](https://app.netlify.com/projects/istani/deploys)

git init
git add .
git commit -m "Deploy ISTANI"
git branch -M main
git remote add origin https://github.com/sano1233/istani-org.git
git push -u origin main
rm -f .git/index.lock
git config --global user.name "Sano"
git config --global user.email ".com"

## Security

Requests are filtered with an Arcjet-powered Netlify function at `netlify/functions/protect.mjs` to block common attacks and unwanted bots.
