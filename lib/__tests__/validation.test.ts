import {
  ValidationError,
  isValidEmail,
  isValidUrl,
  isValidUUID,
  isValidPhone,
  sanitizeString,
  sanitizeHtml,
  validateRequired,
  validateStringLength,
  validateNumberRange,
  validateArrayLength,
  validateEnum,
  validateDateRange,
  validateJson,
  createValidator,
  validatePagination,
  validatePasswordStrength,
  validateFile,
} from '../validation';

describe('validation utilities', () => {
  describe('ValidationError', () => {
    it('should create a validation error with message', () => {
      const error = new ValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ValidationError');
    });

    it('should include field name when provided', () => {
      const error = new ValidationError('Invalid value', 'email');
      expect(error.message).toBe('Invalid value');
      expect(error.field).toBe('email');
    });

    it('should include errors object when provided', () => {
      const errors = { email: 'Invalid', name: 'Required' };
      const error = new ValidationError('Validation failed', undefined, errors);
      expect(error.errors).toEqual(errors);
    });

    it('should be catchable as Error', () => {
      expect(() => {
        throw new ValidationError('Test');
      }).toThrow(Error);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('user..name@example.com')).toBe(true); // Simple regex allows this
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://sub.example.com/path?query=1')).toBe(true);
    });

    it('should validate URLs with ports', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com:8080/api')).toBe(true);
    });

    it('should reject invalid URL formats', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });

    it('should handle various protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(true);
      expect(isValidUrl('file:///path/to/file')).toBe(true);
      expect(isValidUrl('javascript:alert(1)')).toBe(true); // URL constructor accepts this
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isValidUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400g')).toBe(false);
    });

    it('should reject UUIDs without hyphens', () => {
      expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate international phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('+44123456789')).toBe(true);
      expect(isValidPhone('+12025551234')).toBe(true);
    });

    it('should strip formatting characters', () => {
      expect(isValidPhone('+1 (202) 555-1234')).toBe(true);
      expect(isValidPhone('+1-202-555-1234')).toBe(true);
      expect(isValidPhone('+1 202 555 1234')).toBe(true);
    });

    it('should allow numbers without + prefix', () => {
      expect(isValidPhone('12025551234')).toBe(true);
      expect(isValidPhone('2025551234')).toBe(true);
    });

    it('should reject too short numbers', () => {
      expect(isValidPhone('+123')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('+abc123')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\n\thello\t\n')).toBe('hello');
    });

    it('should limit string length to default 1000 characters', () => {
      const longString = 'a'.repeat(1500);
      const result = sanitizeString(longString);
      expect(result.length).toBe(1000);
      expect(result).toBe('a'.repeat(1000));
    });

    it('should limit string length to custom max', () => {
      const longString = 'a'.repeat(200);
      const result = sanitizeString(longString, 100);
      expect(result.length).toBe(100);
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape all dangerous characters', () => {
      expect(sanitizeHtml('&<>"\'/'))
        .toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
    });

    it('should handle normal text', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('validateRequired', () => {
    it('should validate objects with all required fields', () => {
      expect(() => {
        validateRequired({ name: 'John', email: 'john@example.com' }, ['name', 'email']);
      }).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      expect(() => {
        validateRequired({ name: 'John' }, ['name', 'email']);
      }).toThrow(ValidationError);
    });

    it('should throw for null values', () => {
      expect(() => {
        validateRequired({ name: 'John', email: null }, ['name', 'email']);
      }).toThrow(ValidationError);
    });

    it('should throw for empty strings', () => {
      expect(() => {
        validateRequired({ name: 'John', email: '' }, ['name', 'email']);
      }).toThrow(ValidationError);
    });

    it('should include all errors', () => {
      try {
        validateRequired({ name: '' }, ['name', 'email', 'age']);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.errors).toBeDefined();
        expect(Object.keys(validationError.errors!)).toHaveLength(3);
      }
    });

    it('should allow zero as a valid value', () => {
      expect(() => {
        validateRequired({ count: 0, active: false }, ['count', 'active']);
      }).not.toThrow();
    });
  });

  describe('validateStringLength', () => {
    it('should validate strings within range', () => {
      expect(() => {
        validateStringLength('hello', 1, 10);
      }).not.toThrow();
    });

    it('should validate strings at boundaries', () => {
      expect(() => {
        validateStringLength('12345', 5, 5);
      }).not.toThrow();
    });

    it('should throw for strings too short', () => {
      expect(() => {
        validateStringLength('hi', 3, 10);
      }).toThrow(ValidationError);
      expect(() => {
        validateStringLength('hi', 3, 10);
      }).toThrow(/at least 3 characters/);
    });

    it('should throw for strings too long', () => {
      expect(() => {
        validateStringLength('hello world', 1, 5);
      }).toThrow(ValidationError);
      expect(() => {
        validateStringLength('hello world', 1, 5);
      }).toThrow(/no more than 5 characters/);
    });

    it('should use custom field name in error messages', () => {
      expect(() => {
        validateStringLength('hi', 5, 10, 'username');
      }).toThrow(/username/);
    });
  });

  describe('validateNumberRange', () => {
    it('should validate numbers within range', () => {
      expect(() => {
        validateNumberRange(5, 1, 10);
      }).not.toThrow();
    });

    it('should validate numbers at boundaries', () => {
      expect(() => {
        validateNumberRange(1, 1, 10);
      }).not.toThrow();
      expect(() => {
        validateNumberRange(10, 1, 10);
      }).not.toThrow();
    });

    it('should throw for numbers too small', () => {
      expect(() => {
        validateNumberRange(0, 1, 10);
      }).toThrow(ValidationError);
      expect(() => {
        validateNumberRange(0, 1, 10);
      }).toThrow(/at least 1/);
    });

    it('should throw for numbers too large', () => {
      expect(() => {
        validateNumberRange(11, 1, 10);
      }).toThrow(ValidationError);
      expect(() => {
        validateNumberRange(11, 1, 10);
      }).toThrow(/no more than 10/);
    });

    it('should use custom field name in error messages', () => {
      expect(() => {
        validateNumberRange(0, 1, 10, 'age');
      }).toThrow(/age/);
    });

    it('should handle negative numbers', () => {
      expect(() => {
        validateNumberRange(-5, -10, 0);
      }).not.toThrow();
    });
  });

  describe('validateArrayLength', () => {
    it('should validate arrays within range', () => {
      expect(() => {
        validateArrayLength([1, 2, 3], 1, 5);
      }).not.toThrow();
    });

    it('should validate arrays at boundaries', () => {
      expect(() => {
        validateArrayLength([1, 2, 3], 3, 3);
      }).not.toThrow();
    });

    it('should throw for arrays too short', () => {
      expect(() => {
        validateArrayLength([1], 2, 5);
      }).toThrow(ValidationError);
      expect(() => {
        validateArrayLength([1], 2, 5);
      }).toThrow(/at least 2 items/);
    });

    it('should throw for arrays too long', () => {
      expect(() => {
        validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5);
      }).toThrow(ValidationError);
      expect(() => {
        validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5);
      }).toThrow(/no more than 5 items/);
    });

    it('should use custom field name in error messages', () => {
      expect(() => {
        validateArrayLength([], 1, 5, 'tags');
      }).toThrow(/tags/);
    });

    it('should handle empty arrays', () => {
      expect(() => {
        validateArrayLength([], 0, 5);
      }).not.toThrow();
    });
  });

  describe('validateEnum', () => {
    it('should validate values in enum', () => {
      expect(() => {
        validateEnum('admin', ['admin', 'user', 'guest']);
      }).not.toThrow();
    });

    it('should throw for values not in enum', () => {
      expect(() => {
        validateEnum('superuser', ['admin', 'user', 'guest']);
      }).toThrow(ValidationError);
      expect(() => {
        validateEnum('superuser', ['admin', 'user', 'guest']);
      }).toThrow(/must be one of/);
    });

    it('should be case-sensitive', () => {
      expect(() => {
        validateEnum('Admin', ['admin', 'user', 'guest']);
      }).toThrow(ValidationError);
    });

    it('should use custom field name in error messages', () => {
      expect(() => {
        validateEnum('invalid', ['valid'], 'role');
      }).toThrow(/role/);
    });

    it('should provide allowed values in error message', () => {
      try {
        validateEnum('invalid', ['admin', 'user', 'guest']);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ValidationError).message).toContain('admin');
        expect((error as ValidationError).message).toContain('user');
        expect((error as ValidationError).message).toContain('guest');
      }
    });
  });

  describe('validateDateRange', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    const past = new Date('2024-01-01T12:00:00Z');
    const future = new Date('2024-12-31T12:00:00Z');

    it('should validate dates within range', () => {
      expect(() => {
        validateDateRange(now, past, future);
      }).not.toThrow();
    });

    it('should validate with only min date', () => {
      expect(() => {
        validateDateRange(now, past);
      }).not.toThrow();
    });

    it('should validate with only max date', () => {
      expect(() => {
        validateDateRange(now, undefined, future);
      }).not.toThrow();
    });

    it('should throw for dates too early', () => {
      expect(() => {
        validateDateRange(past, now, future);
      }).toThrow(ValidationError);
      expect(() => {
        validateDateRange(past, now, future);
      }).toThrow(/must be after/);
    });

    it('should throw for dates too late', () => {
      expect(() => {
        validateDateRange(future, past, now);
      }).toThrow(ValidationError);
      expect(() => {
        validateDateRange(future, past, now);
      }).toThrow(/must be before/);
    });

    it('should use custom field name in error messages', () => {
      expect(() => {
        validateDateRange(future, past, now, 'birthDate');
      }).toThrow(/birthDate/);
    });
  });

  describe('validateJson', () => {
    it('should parse valid JSON strings', () => {
      expect(validateJson('{"key":"value"}')).toEqual({ key: 'value' });
      expect(validateJson('["a","b","c"]')).toEqual(['a', 'b', 'c']);
      expect(validateJson('123')).toBe(123);
      expect(validateJson('"string"')).toBe('string');
      expect(validateJson('true')).toBe(true);
      expect(validateJson('null')).toBe(null);
    });

    it('should handle complex nested JSON', () => {
      const json = '{"user":{"name":"John","age":30,"tags":["admin","user"]}}';
      expect(validateJson(json)).toEqual({
        user: { name: 'John', age: 30, tags: ['admin', 'user'] },
      });
    });

    it('should reject invalid JSON', () => {
      expect(() => validateJson('invalid json')).toThrow(ValidationError);
      expect(() => validateJson('{key: value}')).toThrow(ValidationError);
      expect(() => validateJson("{'key': 'value'}")).toThrow(ValidationError);
      expect(() => validateJson('{incomplete')).toThrow(ValidationError);
    });

    it('should use custom field name in error', () => {
      try {
        validateJson('invalid', 'metadata');
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('metadata');
      }
    });
  });

  describe('createValidator', () => {
    it('should create a validator function', () => {
      const validatePositive = createValidator((data: unknown) => {
        const num = Number(data);
        if (isNaN(num) || num <= 0) {
          throw new Error('Must be positive');
        }
        return num;
      });

      expect(validatePositive(5)).toBe(5);
      expect(validatePositive('10')).toBe(10);
    });

    it('should wrap validation errors', () => {
      const validator = createValidator((data: unknown) => {
        throw new Error('Validation failed');
      });

      expect(() => validator('test')).toThrow(ValidationError);
    });

    it('should preserve ValidationError instances', () => {
      const validator = createValidator((data: unknown) => {
        throw new ValidationError('Already a ValidationError');
      });

      try {
        validator('test');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Already a ValidationError');
      }
    });
  });

  describe('validatePagination', () => {
    it('should validate correct pagination parameters', () => {
      const result = validatePagination(1, 10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should calculate correct offset', () => {
      expect(validatePagination(1, 10).offset).toBe(0);
      expect(validatePagination(2, 10).offset).toBe(10);
      expect(validatePagination(3, 20).offset).toBe(40);
    });

    it('should use default values when not provided', () => {
      const result = validatePagination();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should parse string parameters', () => {
      const result = validatePagination('2', '15');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
      expect(result.offset).toBe(15);
    });

    it('should reject invalid page numbers', () => {
      expect(() => validatePagination(0, 10)).toThrow(ValidationError);
      expect(() => validatePagination(-1, 10)).toThrow(ValidationError);
      expect(() => validatePagination('abc' as any, 10)).toThrow(ValidationError);
    });

    it('should reject invalid limit values', () => {
      expect(() => validatePagination(1, 0)).toThrow(ValidationError);
      expect(() => validatePagination(1, -1)).toThrow(ValidationError);
      expect(() => validatePagination(1, 'xyz' as any)).toThrow(ValidationError);
    });

    it('should enforce maximum limit', () => {
      expect(() => validatePagination(1, 101)).toThrow(ValidationError);
    });

    it('should allow custom maximum limit', () => {
      expect(validatePagination(1, 150, 200).limit).toBe(150);
      expect(() => validatePagination(1, 250, 200)).toThrow(ValidationError);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('StrongP@ss123');
      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.feedback).toHaveLength(0);
    });

    it('should provide feedback for weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isStrong).toBe(false);
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should check for minimum length', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.feedback).toContain('Password should be at least 8 characters');
    });

    it('should check for lowercase letters', () => {
      const result = validatePasswordStrength('NOLOWER123!');
      expect(result.feedback).toContain('Password should contain lowercase letters');
    });

    it('should check for uppercase letters', () => {
      const result = validatePasswordStrength('noupper123!');
      expect(result.feedback).toContain('Password should contain uppercase letters');
    });

    it('should check for numbers', () => {
      const result = validatePasswordStrength('NoNumbers!');
      expect(result.feedback).toContain('Password should contain numbers');
    });

    it('should check for special characters', () => {
      const result = validatePasswordStrength('NoSpecial123');
      expect(result.feedback).toContain('Password should contain special characters');
    });

    it('should increase score for longer passwords', () => {
      const short = validatePasswordStrength('Pass123!');
      const long = validatePasswordStrength('VeryLongPass123!');
      expect(long.score).toBeGreaterThan(short.score);
    });
  });

  describe('validateFile', () => {
    const createMockFile = (name: string, size: number, type: string): File => {
      return {
        name,
        size,
        type,
      } as File;
    };

    it('should validate files within size limits', () => {
      const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
      expect(() => validateFile(file)).not.toThrow();
    });

    it('should use default max size of 5MB', () => {
      const file = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg');
      expect(() => validateFile(file)).not.toThrow();

      const largeFile = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg');
      expect(() => validateFile(largeFile)).toThrow(ValidationError);
    });

    it('should validate with custom max size', () => {
      const file = createMockFile('test.jpg', 2 * 1024 * 1024, 'image/jpeg');
      expect(() => validateFile(file, { maxSize: 3 * 1024 * 1024 })).not.toThrow();
      expect(() => validateFile(file, { maxSize: 1 * 1024 * 1024 })).toThrow(ValidationError);
    });

    it('should validate allowed MIME types', () => {
      const jpgFile = createMockFile('test.jpg', 1024, 'image/jpeg');
      const pdfFile = createMockFile('test.pdf', 1024, 'application/pdf');

      expect(() =>
        validateFile(jpgFile, { allowedTypes: ['image/jpeg', 'image/png'] })
      ).not.toThrow();
      expect(() =>
        validateFile(pdfFile, { allowedTypes: ['image/jpeg', 'image/png'] })
      ).toThrow(ValidationError);
    });

    it('should validate allowed file extensions', () => {
      const jpgFile = createMockFile('test.jpg', 1024, 'image/jpeg');
      const txtFile = createMockFile('test.txt', 1024, 'text/plain');

      expect(() => validateFile(jpgFile, { allowedExtensions: ['jpg', 'png'] })).not.toThrow();
      expect(() => validateFile(txtFile, { allowedExtensions: ['jpg', 'png'] })).toThrow(
        ValidationError
      );
    });

    it('should handle files without extensions', () => {
      const file = createMockFile('README', 1024, 'text/plain');
      expect(() => validateFile(file, { allowedExtensions: ['md', 'txt'] })).toThrow(
        ValidationError
      );
    });

    it('should be case-insensitive for extensions', () => {
      const file = createMockFile('test.JPG', 1024, 'image/jpeg');
      expect(() => validateFile(file, { allowedExtensions: ['jpg'] })).not.toThrow();
    });
  });
});