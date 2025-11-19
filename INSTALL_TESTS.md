# Test Installation Instructions

## Quick Start

To install and run the test suite, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

This will install all required testing dependencies:

- `jest@^29.7.0` - Testing framework
- `jest-environment-jsdom@^29.7.0` - DOM environment for Jest
- `@testing-library/jest-dom@^6.1.5` - Custom DOM matchers
- `@testing-library/react@^14.1.2` - React testing utilities
- `@types/jest@^29.5.11` - TypeScript types for Jest

### 2. Run Tests

```bash
# Run all tests in watch mode (recommended for development)
npm test

# Run tests once (good for CI/CD)
npm run test:ci

# Run tests with coverage report
npm run test:coverage
```

### 3. Verify Setup

After installation, you should see:
