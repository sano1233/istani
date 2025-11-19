import { describe, it, expect } from 'vitest';
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

describe('ValidationError', () => {
  it('should create validation error with message', () => {
    const error = new ValidationError('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ValidationError');
  });

  it('should store field and errors', () => {
    const errors = { email: 'Invalid email', name: 'Required' };
    const error = new ValidationError('Validation failed', 'user', errors);
    expect(error.field).toBe('user');
    expect(error.errors).toEqual(errors);
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('user_123@test-domain.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    expect(isValidUrl('https://sub.example.com:8080')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('invalid')).toBe(false);
    expect(isValidUrl('//example.com')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
  });
});

describe('isValidUUID', () => {
  it('should validate correct UUIDs', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(isValidUUID('invalid')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate correct phone numbers', () => {
    expect(isValidPhone('+1234567890')).toBe(true);
    expect(isValidPhone('+12345678901234')).toBe(true);
    expect(isValidPhone('+1 (234) 567-8901')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('invalid')).toBe(false);
    expect(isValidPhone('+123456789012345678')).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('\t test \n')).toBe('test');
  });

  it('should enforce max length', () => {
    const longString = 'a'.repeat(2000);
    expect(sanitizeString(longString).length).toBe(1000);
    expect(sanitizeString(longString, 100).length).toBe(100);
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
    expect(sanitizeHtml('Test & <div>content</div>')).toBe(
      'Test &amp; &lt;div&gt;content&lt;&#x2F;div&gt;'
    );
  });

  it('should handle quotes and apostrophes', () => {
    expect(sanitizeHtml('Test "quotes" and \'apostrophes\'')).toBe(
      'Test &quot;quotes&quot; and &#x27;apostrophes&#x27;'
    );
  });
});

describe('validateRequired', () => {
  it('should pass when all required fields are present', () => {
    const data = { name: 'John', email: 'john@example.com', age: 30 };
    expect(() => validateRequired(data, ['name', 'email'])).not.toThrow();
  });

  it('should throw when required fields are missing', () => {
    const data = { name: 'John' };
    expect(() => validateRequired(data, ['name', 'email'])).toThrow(ValidationError);
  });

  it('should throw when required fields are null or empty', () => {
    const data1 = { name: null, email: '' };
    expect(() => validateRequired(data1, ['name', 'email'])).toThrow(ValidationError);
  });

  it('should provide detailed error messages', () => {
    const data = { name: 'John' };
    try {
      validateRequired(data, ['name', 'email', 'age']);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toHaveProperty('email');
      expect((error as ValidationError).errors).toHaveProperty('age');
    }
  });
});

describe('validateStringLength', () => {
  it('should pass for valid string lengths', () => {
    expect(() => validateStringLength('hello', 1, 10)).not.toThrow();
    expect(() => validateStringLength('test', 4, 4)).not.toThrow();
  });

  it('should throw when string is too short', () => {
    expect(() => validateStringLength('hi', 5, 10)).toThrow(ValidationError);
    expect(() => validateStringLength('hi', 5, 10)).toThrow('at least 5 characters');
  });

  it('should throw when string is too long', () => {
    expect(() => validateStringLength('hello world', 1, 5)).toThrow(ValidationError);
    expect(() => validateStringLength('hello world', 1, 5)).toThrow('no more than 5 characters');
  });

  it('should use custom field name in error messages', () => {
    expect(() => validateStringLength('hi', 5, 10, 'username')).toThrow('username');
  });
});

describe('validateNumberRange', () => {
  it('should pass for numbers in range', () => {
    expect(() => validateNumberRange(5, 1, 10)).not.toThrow();
    expect(() => validateNumberRange(1, 1, 10)).not.toThrow();
    expect(() => validateNumberRange(10, 1, 10)).not.toThrow();
  });

  it('should throw when number is below minimum', () => {
    expect(() => validateNumberRange(0, 1, 10)).toThrow(ValidationError);
    expect(() => validateNumberRange(0, 1, 10)).toThrow('at least 1');
  });

  it('should throw when number is above maximum', () => {
    expect(() => validateNumberRange(15, 1, 10)).toThrow(ValidationError);
    expect(() => validateNumberRange(15, 1, 10)).toThrow('no more than 10');
  });

  it('should use custom field name in error messages', () => {
    expect(() => validateNumberRange(0, 1, 10, 'age')).toThrow('age');
  });
});

describe('validateArrayLength', () => {
  it('should pass for arrays of valid length', () => {
    expect(() => validateArrayLength([1, 2, 3], 1, 5)).not.toThrow();
    expect(() => validateArrayLength([1], 1, 5)).not.toThrow();
    expect(() => validateArrayLength([1, 2, 3, 4, 5], 1, 5)).not.toThrow();
  });

  it('should throw when array is too short', () => {
    expect(() => validateArrayLength([], 1, 5)).toThrow(ValidationError);
    expect(() => validateArrayLength([], 1, 5)).toThrow('at least 1 items');
  });

  it('should throw when array is too long', () => {
    expect(() => validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5)).toThrow(ValidationError);
    expect(() => validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5)).toThrow('no more than 5 items');
  });
});

describe('validateEnum', () => {
  it('should pass for valid enum values', () => {
    const colors = ['red', 'green', 'blue'];
    expect(() => validateEnum('red', colors)).not.toThrow();
    expect(() => validateEnum('blue', colors)).not.toThrow();
  });

  it('should throw for invalid enum values', () => {
    const colors = ['red', 'green', 'blue'];
    expect(() => validateEnum('yellow', colors)).toThrow(ValidationError);
    expect(() => validateEnum('yellow', colors)).toThrow('red, green, blue');
  });

  it('should use custom field name in error messages', () => {
    const status = ['active', 'inactive'];
    expect(() => validateEnum('pending', status, 'userStatus')).toThrow('userStatus');
  });
});

describe('validateDateRange', () => {
  it('should pass for dates within range', () => {
    const date = new Date('2025-06-01');
    const minDate = new Date('2025-01-01');
    const maxDate = new Date('2025-12-31');
    expect(() => validateDateRange(date, minDate, maxDate)).not.toThrow();
  });

  it('should throw when date is before minimum', () => {
    const date = new Date('2024-12-31');
    const minDate = new Date('2025-01-01');
    expect(() => validateDateRange(date, minDate)).toThrow(ValidationError);
  });

  it('should throw when date is after maximum', () => {
    const date = new Date('2026-01-01');
    const maxDate = new Date('2025-12-31');
    expect(() => validateDateRange(date, undefined, maxDate)).toThrow(ValidationError);
  });

  it('should work with only min or max constraint', () => {
    const date = new Date('2025-06-01');
    expect(() => validateDateRange(date, new Date('2025-01-01'))).not.toThrow();
    expect(() => validateDateRange(date, undefined, new Date('2025-12-31'))).not.toThrow();
  });
});

describe('validateJson', () => {
  it('should parse valid JSON', () => {
    expect(validateJson('{}')).toEqual({});
    expect(validateJson('{"name":"John"}')).toEqual({ name: 'John' });
    expect(validateJson('[1,2,3]')).toEqual([1, 2, 3]);
    expect(validateJson('"string"')).toBe('string');
    expect(validateJson('123')).toBe(123);
  });

  it('should throw for invalid JSON', () => {
    expect(() => validateJson('invalid')).toThrow(ValidationError);
    expect(() => validateJson('{invalid}')).toThrow(ValidationError);
    expect(() => validateJson("{'key': 'value'}")).toThrow(ValidationError);
  });

  it('should use custom field name in error messages', () => {
    expect(() => validateJson('invalid', 'config')).toThrow('config');
  });
});

describe('createValidator', () => {
  it('should create a validator function', () => {
    const validator = createValidator((data: unknown) => {
      if (typeof data !== 'string') throw new Error('Must be string');
      return data.toUpperCase();
    });

    expect(validator('hello')).toBe('HELLO');
  });

  it('should wrap errors in ValidationError', () => {
    const validator = createValidator(() => {
      throw new Error('Custom error');
    });

    expect(() => validator('test')).toThrow(ValidationError);
  });

  it('should preserve ValidationError instances', () => {
    const validator = createValidator(() => {
      throw new ValidationError('Already ValidationError');
    });

    try {
      validator('test');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('Already ValidationError');
    }
  });
});

describe('validatePagination', () => {
  it('should return valid pagination with defaults', () => {
    const result = validatePagination();
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('should handle numeric inputs', () => {
    const result = validatePagination(3, 15);
    expect(result).toEqual({ page: 3, limit: 15, offset: 30 });
  });

  it('should handle string inputs', () => {
    const result = validatePagination('2', '25');
    expect(result).toEqual({ page: 2, limit: 25, offset: 25 });
  });

  it('should enforce maxLimit', () => {
    expect(() => validatePagination(1, 150, 100)).toThrow(ValidationError);
    expect(() => validatePagination(1, 100, 100)).not.toThrow();
  });

  it('should throw for invalid page numbers', () => {
    expect(() => validatePagination(0)).toThrow('positive integer');
    expect(() => validatePagination(-1)).toThrow('positive integer');
    expect(() => validatePagination('invalid')).toThrow('positive integer');
  });

  it('should calculate offset correctly', () => {
    expect(validatePagination(1, 10).offset).toBe(0);
    expect(validatePagination(2, 10).offset).toBe(10);
    expect(validatePagination(5, 20).offset).toBe(80);
  });
});

describe('validatePasswordStrength', () => {
  it('should validate strong passwords', () => {
    const result = validatePasswordStrength('MyP@ssw0rd123');
    expect(result.isStrong).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.feedback).toHaveLength(0);
  });

  it('should detect weak passwords', () => {
    const result = validatePasswordStrength('weak');
    expect(result.isStrong).toBe(false);
    expect(result.score).toBeLessThan(4);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('should provide helpful feedback', () => {
    const result = validatePasswordStrength('password');
    expect(result.feedback).toContain('Password should contain uppercase letters');
    expect(result.feedback).toContain('Password should contain numbers');
    expect(result.feedback).toContain('Password should contain special characters');
  });

  it('should check minimum length', () => {
    const result = validatePasswordStrength('short');
    expect(result.feedback).toContain('Password should be at least 8 characters');
  });
});

describe('validateFile', () => {
  class MockFile {
    constructor(
      public name: string,
      public size: number,
      public type: string
    ) {}
  }

  it('should pass for valid files', () => {
    const file = new MockFile('test.jpg', 1024 * 1024, 'image/jpeg') as unknown as File;
    expect(() => validateFile(file)).not.toThrow();
  });

  it('should throw when file exceeds max size', () => {
    const file = new MockFile('large.jpg', 10 * 1024 * 1024, 'image/jpeg') as unknown as File;
    expect(() => validateFile(file, { maxSize: 5 * 1024 * 1024 })).toThrow(ValidationError);
  });

  it('should enforce allowed MIME types', () => {
    const file = new MockFile('doc.pdf', 1024, 'application/pdf') as unknown as File;
    expect(() =>
      validateFile(file, { allowedTypes: ['image/jpeg', 'image/png'] })
    ).toThrow(ValidationError);
  });

  it('should enforce allowed extensions', () => {
    const file = new MockFile('doc.pdf', 1024, 'application/pdf') as unknown as File;
    expect(() => validateFile(file, { allowedExtensions: ['jpg', 'png'] })).toThrow(
      ValidationError
    );
  });

  it('should pass when all criteria are met', () => {
    const file = new MockFile('photo.jpg', 2 * 1024 * 1024, 'image/jpeg') as unknown as File;
    expect(() =>
      validateFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png'],
        allowedExtensions: ['jpg', 'png'],
      })
    ).not.toThrow();
  });
});