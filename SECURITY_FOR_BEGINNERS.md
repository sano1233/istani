# 🔒 GitHub Security Guide for Beginners

**New to GitHub? Start here!** This guide will help you avoid common security mistakes.

---

## ⚠️ Most Important Rule

**NEVER commit these to GitHub:**

```
❌ API keys (like ANTHROPIC_API_KEY, OPENAI_API_KEY)
❌ Passwords
❌ Private keys (.pem, .key files)
❌ .env files
❌ credentials.json or secrets.json
❌ Database connection strings
❌ Any file containing "secret", "password", or "key"
```

---

## 🎓 Why Is This Important?

When you push code to GitHub:
- ✅ **Public repos** = Anyone in the world can see your code
- ⚠️ **Private repos** = Still visible to collaborators

If you commit an API key:
- 🤖 Bots scan GitHub 24/7 looking for keys
- 💸 Someone can use your key and cost you $$$$
- 🔓 They might access your private data
- ⏱️ Keys are found within **seconds** of pushing

---

## ✅ What Files ARE Safe to Commit?

**Safe to commit:**
- ✅ Your code (.js, .jsx, .html, .css files)
- ✅ README.md and documentation
- ✅ package.json (but NOT if it has secrets)
- ✅ Configuration files without secrets
- ✅ Public images and assets

**Example safe file:**
```javascript
// ✅ SAFE - No secrets here
function calculateTotal(price, tax) {
  return price + (price * tax);
}
```

---

## ❌ What Files Should NEVER Be Committed?

### .env Files
```bash
# ❌ NEVER commit .env files!
# This file should be in .gitignore

# .env file example:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx  # ❌ SECRET!
DATABASE_URL=postgres://user:password@host/db  # ❌ SECRET!
```

### Configuration Files with Secrets
```javascript
// ❌ NEVER do this!
const config = {
  apiKey: 'sk-ant-api03-xxxxxxxxxxxxx', // ❌ HARDCODED SECRET!
  password: 'mypassword123'              // ❌ HARDCODED SECRET!
};
```

### Private Keys
```
❌ id_rsa
❌ private.key
❌ certificate.pem
❌ credentials.json
```

---

## 🛡️ How to Use Secrets Safely

### Method 1: Use .env Files (LOCALLY ONLY)

**Step 1:** Create a `.env` file (locally)
```bash
# .env file (this stays on YOUR computer only)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
NETLIFY_TOKEN=xxxxxxxxxxxxxxxx
```

**Step 2:** Add `.env` to `.gitignore`
```bash
# .gitignore
.env
*.env
```

**Step 3:** Use environment variables in your code
```javascript
// ✅ SAFE - Uses environment variable
const apiKey = process.env.ANTHROPIC_API_KEY;

// ❌ NEVER do this!
const apiKey = 'sk-ant-api03-xxxxxxxxxxxxx';
```

### Method 2: Use GitHub Secrets (for CI/CD)

**For GitHub Actions:**

1. Go to your repo on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add your secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-xxxxxxxxxxxxx`
5. Use in workflows:

```yaml
# .github/workflows/example.yml
- name: Use secret
  env:
    API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: echo "Using secret safely!"
```

---

## 🚨 "I Already Committed a Secret! Help!"

**DON'T PANIC! Follow these steps:**

### Step 1: Remove the Secret from Your Code

```bash
# Remove the file from git (but keep it locally)
git rm --cached .env

# Or edit the file to remove the secret
nano myfile.js  # Remove the hardcoded key
```

### Step 2: Add to .gitignore

```bash
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
git add .gitignore
```

### Step 3: Commit the Changes

```bash
git commit -m "Remove sensitive files from tracking"
git push
```

### Step 4: **ROTATE THE SECRET IMMEDIATELY**

**This is THE MOST IMPORTANT step!**

Once a secret is on GitHub, consider it compromised forever.

- 🔄 **Anthropic API Key:** Generate new key at https://console.anthropic.com/
- 🔄 **OpenAI API Key:** Generate new key at https://platform.openai.com/api-keys
- 🔄 **GitHub Token:** Generate new token at https://github.com/settings/tokens
- 🔄 **Netlify Token:** Generate new token at https://app.netlify.com/user/applications
- 🔄 **Vercel Token:** Generate new token at https://vercel.com/account/tokens

**Delete the old key and create a new one!**

---

## 📋 Common Mistakes Beginners Make

### Mistake 1: Committing .env Files

```bash
# ❌ WRONG
git add .env
git commit -m "Add env file"

# ✅ CORRECT
echo ".env" >> .gitignore
# Never commit .env files!
```

### Mistake 2: Hardcoding API Keys

```javascript
// ❌ WRONG
const API_KEY = 'sk-ant-api03-xxxxxxxxxxxxx';

// ✅ CORRECT
const API_KEY = process.env.ANTHROPIC_API_KEY;
```

### Mistake 3: Sharing .env Files

```bash
# ❌ NEVER send your .env file to anyone!
# Not via email, Discord, Slack, or anywhere!

# ✅ Instead, share a template:
# Create .env.example:
ANTHROPIC_API_KEY=your_key_here
NETLIFY_TOKEN=your_token_here
```

### Mistake 4: Thinking Private Repos Are Safe

```
Private repos are NOT safe for secrets!
- Collaborators can see everything
- If repo becomes public, secrets are exposed
- GitHub staff can potentially see content
```

---

## 🔧 Quick Reference: .gitignore Template

Copy this into your `.gitignore`:

```bash
# Environment variables
.env
.env.*
*.env

# Credentials
credentials.json
secrets.json

# Private keys
*.key
*.pem
id_rsa

# API configs
.npmrc
.pypirc
```

---

## ✅ Security Checklist for Every Project

Before pushing code to GitHub, check:

- [ ] No hardcoded API keys in code
- [ ] No hardcoded passwords
- [ ] `.env` files are in `.gitignore`
- [ ] No private keys (`.pem`, `.key`)
- [ ] No `credentials.json` or `secrets.json`
- [ ] Created `.env.example` (template without actual secrets)
- [ ] Using environment variables in code
- [ ] Secrets are in GitHub Secrets (for CI/CD)

---

## 🎯 Real Example: Safe Configuration

### ❌ UNSAFE (Don't do this!)

```javascript
// config.js
module.exports = {
  anthropic: {
    apiKey: 'sk-ant-api03-xxxxxxxxxxxxx'  // ❌ EXPOSED!
  },
  netlify: {
    token: 'xxxxxxxxxxxxxxxx'  // ❌ EXPOSED!
  }
};
```

### ✅ SAFE (Do this instead!)

```javascript
// config.js
module.exports = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY  // ✅ SAFE!
  },
  netlify: {
    token: process.env.NETLIFY_TOKEN  // ✅ SAFE!
  }
};
```

```bash
# .env (NOT committed to GitHub)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
NETLIFY_TOKEN=xxxxxxxxxxxxxxxx
```

```bash
# .env.example (SAFE to commit - template only)
ANTHROPIC_API_KEY=your_anthropic_key_here
NETLIFY_TOKEN=your_netlify_token_here
```

---

## 🔍 How to Check if You're Safe

Run this in your project folder:

```bash
# Check if .env is ignored
git check-ignore .env

# Should output: .env
# If nothing, add it to .gitignore!

# Check for accidentally committed secrets
git log --all --full-history -- .env
# Should be empty!

# Search for potential API keys in code
grep -r "sk-ant-api" .
grep -r "API_KEY.*=" .

# If you find hardcoded keys, remove them!
```

---

## 📚 What Our FREE Security Automation Does

**Your repo has FREE security scanning that checks:**

1. ✅ **Secret Detection** - Scans for API keys
2. ✅ **File Checks** - Looks for .env, credentials.json
3. ✅ **.gitignore Verification** - Ensures sensitive files are ignored
4. ✅ **Dependency Security** - Checks for vulnerable packages
5. ✅ **Google Ads Integrity** - Makes sure ads aren't broken

**All happen automatically on every push/PR!**

---

## 🆘 Need Help?

### If You See Security Warnings:

1. **Read the error message** carefully
2. **Look at which file** triggered it
3. **Remove the secret** from that file
4. **Add the file** to .gitignore
5. **Rotate the secret** (create new key)
6. **Commit and push** the fix

### Still Confused?

- 📖 Read this guide again slowly
- 🔍 Look at the examples
- ✅ Use the checklist above
- 🤖 Let the FREE automation catch issues

---

## 💡 Pro Tips

### Tip 1: Use .env.example

```bash
# .env.example (SAFE to commit)
ANTHROPIC_API_KEY=get_from_console_anthropic_com
NETLIFY_TOKEN=get_from_netlify_dashboard
DATABASE_URL=your_database_connection_string
```

This helps other developers know what variables they need!

### Tip 2: Check Before You Commit

```bash
# See what you're about to commit
git status
git diff

# Look for secrets before committing!
```

### Tip 3: Use GitHub Desktop

If command-line is confusing, use GitHub Desktop:
- Visual interface
- See exactly what files you're committing
- Easier to catch mistakes

Download: https://desktop.github.com/

---

## ✨ Summary for Complete Beginners

**3 Simple Rules:**

1. **Never commit files with "secret" or "key" in them**
2. **Always use environment variables** (process.env.SOMETHING)
3. **Always add .env to .gitignore**

**Follow these 3 rules and you'll be 99% safe!**

---

## 🎉 You're Now More Secure!

- ✅ You know what NOT to commit
- ✅ You know how to use .env files
- ✅ You know how to use GitHub Secrets
- ✅ You know what to do if you make a mistake

**Great job learning about security!** 🚀

---

<div align="center">

**Remember: When in doubt, DON'T COMMIT IT!**

Ask first, commit later.

**Your FREE security automation will catch mistakes!**

</div>
