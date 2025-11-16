// ESLint configuration - JavaScript equivalent of Ruff/Pylint
// Comprehensive linting for JavaScript/React project

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    // 'plugin:security/recommended', // Equivalent to Bandit for Python - disabled for now
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'], // 'security' - disabled for now
  rules: {
    // Code quality (equivalent to Ruff select)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',

    // React specific
    'react/prop-types': 'off', // Using default props instead
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Security rules (equivalent to Bandit) - disabled until plugin is installed
    // 'security/detect-eval-with-expression': 'error',
    // 'security/detect-non-literal-regexp': 'warn',
    // 'security/detect-unsafe-regex': 'error',
    // 'security/detect-buffer-noassert': 'error',
    // 'security/detect-no-csrf-before-method-override': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'istani-rebuild/',
    'dist/',
    'build/',
    '*.min.js',
  ],
};
