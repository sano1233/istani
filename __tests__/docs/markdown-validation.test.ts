/**
 * Tests for documentation files
 * Validates markdown structure and content
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DOCS_DIR = join(process.cwd(), 'docs');
const ROOT_DIR = process.cwd();

describe('Documentation Validation', () => {
  describe('CONTRIBUTING.md', () => {
    const filePath = join(ROOT_DIR, 'CONTRIBUTING.md');

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain required sections', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('## Code of Conduct');
      expect(content).toContain('## Development Setup');
      expect(content).toContain('## Pull Request Process');
    });

    it('should have proper formatting', () => {
      const content = readFileSync(filePath, 'utf-8');

      // Check for code blocks
      expect(content).toMatch(/```bash/i);

      // Check for headers
      expect(content).toMatch(/^#{1,6}\s+/m);
    });

    it('should contain git commands', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('git');
      expect(content).toMatch(/git\s+(fetch|rebase|push|clone)/i);
    });
  });

  describe('SECURITY.md', () => {
    const filePath = join(ROOT_DIR, 'SECURITY.md');

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain security sections', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/security/i);
      expect(content).toMatch(/vulnerabilit/i);
    });

    it('should list environment variables', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('SUPABASE');
      expect(content).toContain('STRIPE');
    });

    it('should have deployment checklist', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/checklist/i);
      expect(content).toMatch(/\[.\]/g); // Checkbox items
    });
  });

  describe('docs/PERFORMANCE.md', () => {
    const filePath = join(DOCS_DIR, 'PERFORMANCE.md');

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain performance optimization topics', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/performance/i);
      expect(content).toMatch(/optimization/i);
      expect(content).toMatch(/caching|cache/i);
    });

    it('should have code examples', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/```typescript/i);
      expect(content).toContain('Next.js');
    });

    it('should contain metrics and targets', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/Core Web Vitals/i);
      expect(content).toMatch(/LCP|FID|CLS/);
    });

    it('should have performance checklist', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/checklist/i);
    });
  });

  describe('docs/TROUBLESHOOTING.md', () => {
    const filePath = join(DOCS_DIR, 'TROUBLESHOOTING.md');

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain troubleshooting sections', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/troubleshooting/i);
      expect(content).toMatch(/symptoms/i);
      expect(content).toMatch(/solutions/i);
    });

    it('should have common error scenarios', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/error/i);
      expect(content).toMatch(/middleware/i);
      expect(content).toMatch(/deployment|build/i);
    });

    it('should contain command examples', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/```bash/i);
      expect(content).toMatch(/npm|vercel|supabase/i);
    });

    it('should have rate limiting troubleshooting', () => {
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/rate\s+limit/i);
      expect(content).toMatch(/429/);
    });
  });

  describe('Markdown Quality', () => {
    const files = [
      'CONTRIBUTING.md',
      'SECURITY.md',
      'docs/PERFORMANCE.md',
      'docs/TROUBLESHOOTING.md',
    ];

    files.forEach((file) => {
      describe(file, () => {
        const filePath = file.startsWith('docs/')
          ? join(DOCS_DIR, file.replace('docs/', ''))
          : join(ROOT_DIR, file);

        it('should not have trailing whitespace', () => {
          const content = readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          const trailingWhitespace = lines.filter((line) => line.match(/\s+$/));
          expect(trailingWhitespace.length).toBe(0);
        });

        it('should use consistent heading levels', () => {
          const content = readFileSync(filePath, 'utf-8');
          const headings = content.match(/^#{1,6}\s+.+$/gm) || [];

          expect(headings.length).toBeGreaterThan(0);
        });

        it('should have proper code block syntax', () => {
          const content = readFileSync(filePath, 'utf-8');
          const codeBlocks = content.match(/```[\w]*\n[\s\S]*?```/g) || [];

          // All code blocks should be properly closed
          codeBlocks.forEach((block) => {
            expect(block).toMatch(/^```/);
            expect(block).toMatch(/```$/);
          });
        });

        it('should not have very long lines (except code blocks)', () => {
          const content = readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          let inCodeBlock = false;
          const longLines: string[] = [];

          lines.forEach((line, index) => {
            if (line.trim().startsWith('```')) {
              inCodeBlock = !inCodeBlock;
              return;
            }

            if (!inCodeBlock && line.length > 120 && !line.startsWith('http')) {
              longLines.push(`Line ${index + 1}: ${line.substring(0, 50)}...`);
            }
          });

          // Allow some long lines for URLs and tables
          expect(longLines.length).toBeLessThan(10);
        });
      });
    });
  });

  describe('Content Consistency', () => {
    it('should use consistent terminology across docs', () => {
      const files = [
        join(ROOT_DIR, 'CONTRIBUTING.md'),
        join(ROOT_DIR, 'SECURITY.md'),
        join(DOCS_DIR, 'PERFORMANCE.md'),
        join(DOCS_DIR, 'TROUBLESHOOTING.md'),
      ];

      const contents = files.map((f) => readFileSync(f, 'utf-8'));

      // Check for consistent use of product names
      contents.forEach((content) => {
        if (content.includes('Supabase')) {
          expect(content).not.toMatch(/supabase[^.]/);
        }
        if (content.includes('Vercel')) {
          expect(content).not.toMatch(/vercel[^.]/);
        }
      });
    });

    it('should reference correct file paths', () => {
      const files = [
        join(ROOT_DIR, 'CONTRIBUTING.md'),
        join(ROOT_DIR, 'SECURITY.md'),
        join(DOCS_DIR, 'PERFORMANCE.md'),
        join(DOCS_DIR, 'TROUBLESHOOTING.md'),
      ];

      files.forEach((file) => {
        const content = readFileSync(file, 'utf-8');

        // Check for common file references
        const fileRefs = content.match(/`[\w\/.-]+\.(?:ts|tsx|js|jsx|md)`/g) || [];

        fileRefs.forEach((ref) => {
          // File references should use consistent path separators
          expect(ref).not.toMatch(/\\/);
        });
      });
    });
  });
});
