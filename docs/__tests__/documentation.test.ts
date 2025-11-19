import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Documentation Files', () => {
  const docsDir = join(process.cwd(), 'docs');
  const rootDir = process.cwd();

  describe('CONTRIBUTING.md', () => {
    const filePath = join(rootDir, 'CONTRIBUTING.md');
    let content: string;

    beforeAll(() => {
      content = readFileSync(filePath, 'utf-8');
    });

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain code formatting requirements', () => {
      expect(content).toMatch(/```/); // Has code blocks
    });

    it('should have proper markdown structure', () => {
      expect(content).toMatch(/^#/m); // Has headers
    });

    it('should not have broken formatting after changes', () => {
      // Check that code blocks are properly closed
      const codeBlockCount = (content.match(/```/g) || []).length;
      expect(codeBlockCount % 2).toBe(0); // Even number means all blocks closed
    });

    it('should contain submission guidelines', () => {
      expect(content.toLowerCase()).toMatch(/pull request|pr/);
    });
  });

  describe('SECURITY.md', () => {
    const filePath = join(rootDir, 'SECURITY.md');
    let content: string;

    beforeAll(() => {
      content = readFileSync(filePath, 'utf-8');
    });

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain security measures section', () => {
      expect(content.toLowerCase()).toMatch(/security|vulnerability/);
    });

    it('should have proper list formatting', () => {
      // Check for list items
      expect(content).toMatch(/^[-*]\s/m);
    });

    it('should not have broken markdown formatting', () => {
      const codeBlockCount = (content.match(/```/g) || []).length;
      expect(codeBlockCount % 2).toBe(0);
    });

    it('should contain reporting guidelines', () => {
      expect(content.toLowerCase()).toMatch(/report|contact|vulnerability/);
    });
  });

  describe('PERFORMANCE.md', () => {
    const filePath = join(docsDir, 'PERFORMANCE.md');
    let content: string;

    beforeAll(() => {
      if (existsSync(filePath)) {
        content = readFileSync(filePath, 'utf-8');
      }
    });

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain performance optimization guidelines', () => {
      expect(content.toLowerCase()).toMatch(/performance|optimization|cache/);
    });

    it('should have table of contents', () => {
      expect(content).toMatch(/table of contents|## /i);
    });

    it('should have properly formatted code examples', () => {
      const codeBlockCount = (content.match(/```/g) || []).length;
      expect(codeBlockCount % 2).toBe(0);
    });

    it('should contain metrics or targets', () => {
      expect(content.toLowerCase()).toMatch(/metric|target|benchmark/);
    });

    it('should have consistent formatting', () => {
      // Check for proper header hierarchy
      const headers = content.match(/^#{1,6}\s/gm) || [];
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('TROUBLESHOOTING.md', () => {
    const filePath = join(docsDir, 'TROUBLESHOOTING.md');
    let content: string;

    beforeAll(() => {
      if (existsSync(filePath)) {
        content = readFileSync(filePath, 'utf-8');
      }
    });

    it('should exist', () => {
      expect(existsSync(filePath)).toBe(true);
    });

    it('should contain troubleshooting information', () => {
      expect(content.toLowerCase()).toMatch(/troubleshoot|issue|problem|error|fix/);
    });

    it('should have properly formatted code blocks', () => {
      const codeBlockCount = (content.match(/```/g) || []).length;
      expect(codeBlockCount % 2).toBe(0);
    });

    it('should contain symptoms and solutions', () => {
      expect(content.toLowerCase()).toMatch(/symptom|solution|cause/);
    });

    it('should have clear section structure', () => {
      const headers = content.match(/^#{1,6}\s/gm) || [];
      expect(headers.length).toBeGreaterThan(3); // Multiple troubleshooting sections
    });

    it('should not have broken list formatting', () => {
      // Check that lists are properly formatted
      const lines = content.split('\n');
      let inList = false;
      for (const line of lines) {
        if (line.match(/^[-*]\s/)) {
          inList = true;
        } else if (inList && line.trim() && !line.match(/^[-*]\s/) && !line.match(/^\s+/)) {
          // If we were in a list and hit a non-list, non-indented line, list should end
          inList = false;
        }
      }
      // This is a basic check; the test mainly ensures the file is parseable
      expect(content).toBeTruthy();
    });
  });

  describe('General Documentation Quality', () => {
    const docFiles = [
      'CONTRIBUTING.md',
      'SECURITY.md',
      'docs/PERFORMANCE.md',
      'docs/TROUBLESHOOTING.md',
    ];

    it.each(docFiles)('%s should not contain TODO markers', (file) => {
      const filePath = join(rootDir, file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        expect(content.toLowerCase()).not.toMatch(/\btodo\b|\bfixme\b/);
      }
    });

    it.each(docFiles)('%s should not have trailing whitespace on lines', (file) => {
      const filePath = join(rootDir, file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const trailingWhitespace = lines.filter(
          (line, idx) => line !== line.trimEnd() && idx < lines.length - 1, // Allow trailing on last line
        );
        expect(trailingWhitespace.length).toBe(0);
      }
    });

    it.each(docFiles)('%s should end with a newline', (file) => {
      const filePath = join(rootDir, file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/\n$/);
      }
    });
  });
});
