# Quick Start: Running Tests

## 1. Install Dependencies (One-time setup)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

## 2. Add Scripts to package.json

Add these to the `"scripts"` section:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:ci": "jest --ci --coverage --maxWorkers=2"
```

## 3. Run Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (auto-rerun on changes)
npm run test:watch
```

## 4. Expected Output