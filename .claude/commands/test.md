---
name: test
description: Create comprehensive tests for the specified code
---

Please create comprehensive tests for: $ARGUMENTS

## Test Requirements

### Framework and Tools
- Use Jest as the test runner
- Use React Testing Library for React component tests
- Use @testing-library/user-event for user interactions
- Mock external dependencies appropriately

### Test Structure
```typescript
// Place tests in __tests__ directory next to the file being tested
// File naming: ComponentName.test.tsx or functionName.test.ts

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  // Group related tests
  describe('when mounted', () => {
    it('should render correctly', () => {
      // Test implementation
    });
  });
});
```

### Coverage Requirements

#### 1. Unit Tests
- Test all exported functions
- Test all component props combinations
- Test computed values and derived state
- Test utility functions
- Aim for 80%+ code coverage

#### 2. Integration Tests
- Test API integrations
- Test database operations
- Test authentication flows
- Test form submissions

#### 3. User Interaction Tests
```typescript
it('should handle user clicks', async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

#### 4. Edge Cases
- Empty states
- Loading states
- Error states
- Invalid inputs
- Boundary conditions
- Null/undefined values
- Network failures

### Mocking Guidelines

#### Mock External APIs
```typescript
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn()
}));
```

#### Mock Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/test-path'
}));
```

#### Mock Supabase
```typescript
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    },
    from: jest.fn()
  })
}));
```

### Assertions

#### DOM Assertions
```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(input).toHaveValue('value');
```

#### Async Assertions
```typescript
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});

await screen.findByText(/async content/i);
```

#### Function Mocks
```typescript
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(expectedArg);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

### Example Test Suite

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './page';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn()
    }
  }))
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendered', () => {
    it('should display login form', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('when submitting form', () => {
    it('should call sign in with correct credentials', async () => {
      const user = userEvent.setup();
      const mockSignIn = jest.fn().mockResolvedValue({ error: null });

      jest.mocked(createClient).mockReturnValue({
        auth: { signInWithPassword: mockSignIn }
      } as any);

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should show error message on failed login', async () => {
      const user = userEvent.setup();
      const mockSignIn = jest.fn().mockResolvedValue({
        error: { message: 'Invalid credentials' }
      });

      jest.mocked(createClient).mockReturnValue({
        auth: { signInWithPassword: mockSignIn }
      } as any);

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // HTML5 validation should prevent submission
      expect(screen.getByLabelText(/email/i)).toBeInvalid();
    });

    it('should disable button while loading', async () => {
      const user = userEvent.setup();
      const mockSignIn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      jest.mocked(createClient).mockReturnValue({
        auth: { signInWithPassword: mockSignIn }
      } as any);

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password');

      const button = screen.getByRole('button', { name: /sign in/i });
      await user.click(button);

      expect(button).toBeDisabled();
    });
  });
});
```

### Quality Checklist

- [ ] All major functionality tested
- [ ] Happy path tested
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] User interactions tested
- [ ] Async operations tested with proper waiting
- [ ] Mocks properly implemented
- [ ] Tests are isolated (no interdependencies)
- [ ] Cleanup in afterEach hooks
- [ ] Descriptive test names
- [ ] Comments for complex test logic
- [ ] High code coverage (80%+)

Create tests following these guidelines for the specified code.
