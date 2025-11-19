# Test Suite

This directory contains comprehensive unit tests for the ISTANI Fitness platform.

## Running Tests

```bash
# Install dependencies (includes vitest)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### `validation.test.ts`

Comprehensive tests for input validation utilities:

- ValidationError class
- Email, URL, UUID, and phone validation
- String sanitization and HTML escaping
- Required field validation
- String, number, and array length validation
- Enum and date range validation
- JSON parsing validation
- Pagination validation
- Password strength validation
- File upload validation

### `api-wrapper.test.ts`

Tests for API route wrapper functionality:

- API handler creation and execution
- Error handling (ValidationError, ApiError, generic errors)
- HTTP method validation
- Request body parsing
- Authentication and authorization
- Admin access control
- Rate limiting
- Custom validation hooks

### `db-helpers.test.ts`

Tests for database query helpers:

- Generic query with filtering, ordering, and pagination
- Get record by ID
- Insert single and multiple records
- Update records (by ID and with filters)
- Delete records (by ID and with filters)
- Count records with filters
- Check record existence
- Upsert operations
- Batch operations with error handling

### `app/__tests__/page.test.ts`

Tests for server action validation logic:

- DATABASE_URL validation
- Comment field validation
- FormData extraction and handling
- Error handling and user-friendly messages
- SQL injection prevention verification
- Form structure validation

## Test Coverage

To view detailed coverage report:

```bash
npm run test:coverage
```

This will generate an HTML coverage report in the `coverage/` directory.

## Mocking Strategy

The tests use Vitest's mocking capabilities to:

- Mock Supabase client for database operations
- Mock Next.js server utilities
- Mock logger for tracking calls
- Mock rate limiter
- Set up test environment variables

## Adding New Tests

When adding new functionality:

1. Create a new test file in the appropriate location
2. Follow the existing test structure and naming conventions
3. Mock external dependencies appropriately
4. Test happy paths, edge cases, and error conditions
5. Ensure tests are isolated and don't depend on external state

## Best Practices

- **Descriptive test names**: Use clear, specific descriptions
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
- **Mock external dependencies**: Keep tests fast and reliable
- **Test edge cases**: Include boundary conditions and error scenarios
- **Keep tests focused**: Each test should verify one specific behavior

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Ensure all tests pass before merging code.
