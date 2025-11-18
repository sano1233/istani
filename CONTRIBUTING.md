# Contributing to ISTANI Fitness Platform

Thank you for considering contributing to ISTANI! We welcome contributions from the community.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/sano1233/istani/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

### Suggesting Enhancements

1. Check existing [Issues](https://github.com/sano1233/istani/issues) and [Discussions](https://github.com/sano1233/istani/discussions)
2. Create a new issue with:
   - Clear title and description
   - Use case and benefits
   - Possible implementation approach

### Pull Requests

#### Before You Start

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/istani.git
cd istani

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

#### Making Changes

1. **Code Style**
   - Follow existing code patterns
   - Use TypeScript for new files
   - Run `npm run lint` before committing
   - Run `npm run typecheck` to ensure type safety

2. **Commit Messages**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add new workout tracking feature
     fix: resolve login authentication issue
     docs: update API documentation
     style: format code according to standards
     refactor: reorganize database helpers
     test: add tests for validation utilities
     chore: update dependencies
     ```

3. **Code Quality**
   - Write self-documenting code
   - Add comments for complex logic
   - Follow DRY (Don't Repeat Yourself) principle
   - Keep functions small and focused

4. **Testing**
   - Test your changes thoroughly
   - Ensure existing functionality still works
   - Add tests for new features
   - Test across different browsers/devices

#### Submitting a Pull Request

1. Update your branch with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push your changes:
   ```bash
   git push origin your-branch-name
   ```

3. Create a Pull Request with:
   - Clear title describing the change
   - Description of what and why
   - Link to related issues
   - Screenshots/videos if UI changes
   - Testing steps

4. Wait for review and address feedback

## Development Guidelines

### Project Structure

```
istani/
├── app/                 # Next.js app directory
│   ├── (auth)/         # Authentication routes
│   ├── api/            # API routes
│   └── ...             # Other routes
├── components/         # React components
├── lib/               # Utility libraries
│   ├── api-wrapper.ts # API route wrapper
│   ├── validation.ts  # Input validation
│   ├── rate-limit.ts  # Rate limiting
│   ├── logger.ts      # Logging utilities
│   └── ...
├── types/             # TypeScript types
└── docs/              # Documentation
```

### Coding Standards

#### TypeScript

```typescript
// Use explicit types
function processData(data: UserData): ProcessedResult {
  // implementation
}

// Use interfaces for object shapes
interface UserProfile {
  id: string;
  email: string;
  name: string;
}

// Use enums for constants
enum OrderStatus {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}
```

#### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

#### API Routes

```typescript
// Use the API wrapper for consistency
import { createApiHandler, apiResponse } from '@/lib/api-wrapper';

export const GET = createApiHandler(
  async (context) => {
    // Implementation
    return apiResponse({ data: 'result' });
  },
  {
    requireAuth: true,
    rateLimit: 'standard',
  },
);
```

#### Database Operations

```typescript
// Use database helpers
import { dbQuery, dbInsert } from '@/lib/db-helpers';

const { data, error } = await dbQuery('users', {
  select: 'id, name, email',
  limit: 10,
});
```

### Performance Considerations

- Use Next.js Image component for images
- Implement code splitting for large components
- Memoize expensive calculations
- Optimize database queries
- Add appropriate caching headers

### Security Considerations

- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting for API routes
- Follow principle of least privilege
- Never commit sensitive data

### Accessibility

- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain sufficient color contrast

## Pull Request Review Process

1. **Automated Checks**
   - Linting passes
   - Type checking passes
   - Build succeeds
   - No security vulnerabilities

2. **Code Review**
   - Code quality and style
   - Performance implications
   - Security considerations
   - Documentation updates

3. **Testing**
   - Feature works as expected
   - No regression in existing features
   - Edge cases handled

4. **Merge**
   - PR approved by maintainer
   - All checks pass
   - Conflicts resolved
   - Merged to main

## Release Process

1. Changes merged to `main`
2. Automated tests run
3. Deployed to Vercel preview
4. Manual testing in preview
5. Deployed to production

## Getting Help

- **Documentation**: Check [docs/](docs/) directory
- **Issues**: Browse or create [GitHub Issues](https://github.com/sano1233/istani/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/sano1233/istani/discussions)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to ISTANI! Your efforts help make fitness accessible to everyone.
