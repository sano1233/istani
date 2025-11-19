# Test Suite Documentation

This project now includes comprehensive unit tests for the modified files in the current branch.

## Test Coverage

### Library Files (`lib/`)

- **validation.ts** - Comprehensive tests for all validation utilities
  - Email, URL, UUID, phone validation
  - String sanitization and HTML escaping
  - Required field validation
  - String, number, and array range validation
  - Enum and date range validation
  - JSON parsing
  - Pagination validation
  - Password strength checking
  - File upload validation

- **api-wrapper.ts** - API handler wrapper tests
  - Request method validation
  - Authentication and authorization
  - Rate limiting
  - Request body parsing
  - Custom validation
  - Error handling
  - Response helpers (apiResponse, apiError, apiSuccess)

- **db-helpers.ts** - Database operation tests
  - Query operations with filters, ordering, pagination
  - CRUD operations (Create, Read, Update, Delete)
  - Batch operations
  - Count and exists checks
  - Upsert operations
  - Error handling

### Documentation Files

- **CONTRIBUTING.md** - Structure and formatting validation
- **SECURITY.md** - Security guidelines validation
- **docs/PERFORMANCE.md** - Performance optimization guidelines validation
- **docs/TROUBLESHOOTING.md** - Troubleshooting guide validation

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI)
npm run test:ci

# Run tests with coverage report
npm run test:coverage
```

## Test Framework

- **Jest** - Testing framework
- **@testing-library/jest-dom** - Custom Jest matchers for DOM
- **@testing-library/react** - React component testing utilities

## Writing New Tests

Tests are located in `__tests__` directories next to the files they test:

- `lib/__tests__/` - Tests for lib files
- `docs/__tests__/` - Tests for documentation files

### Test File Naming Convention

- Unit tests: `<filename>.test.ts` or `<filename>.test.tsx`
- Integration tests: `<filename>.integration.test.ts`

### Example Test Structure

```typescript
import { functionToTest } from '../module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should handle valid input', () => {
      const result = functionToTest('valid input');
      expect(result).toBe(expectedValue);
    });

    it('should throw error for invalid input', () => {
      expect(() => functionToTest('invalid')).toThrow(Error);
    });
  });
});
```

## Coverage Goals

The test suite aims for:

- **80%+ line coverage** for critical business logic
- **100% coverage** for validation utilities
- **100% coverage** for error handling paths

## Continuous Integration

Tests run automatically on:

- Pull request creation
- Push to main branch
- Pre-commit hooks (if configured)

## Mocking Strategy

External dependencies are mocked to ensure tests are:

- Fast and reliable
- Independent of external services
- Deterministic and reproducible

Mocked dependencies include:

- Supabase client
- Rate limiter
- Logger
- Next.js request/response objects

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Use descriptive test names** - Clearly state what is being tested
3. **Arrange-Act-Assert pattern** - Structure tests consistently
4. **One assertion per test** - Keep tests focused and clear
5. **Test edge cases** - Include boundary conditions and error states
6. **Mock external dependencies** - Isolate the code under test
7. **Keep tests DRY** - Use helper functions and beforeEach hooks appropriately

## Troubleshooting

### Tests failing locally

1. Ensure all dependencies are installed: `npm install`
2. Clear Jest cache: `npx jest --clearCache`
3. Check Node version matches `.nvmrc`: `nvm use`

### Mock issues

- Verify mock paths match actual import paths
- Ensure mocks are cleared between tests: `jest.clearAllMocks()`
- Check mock implementation matches expected interface

### Coverage gaps

- Run `npm run test:coverage` to see detailed coverage report
- Focus on untested branches and error paths
- Add tests for edge cases

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure tests pass before committing
3. Update this README if adding new test patterns
4. Maintain or improve coverage percentage
