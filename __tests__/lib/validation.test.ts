/**
 * Unit tests for lib/validation.ts
 * Tests all validation functions with comprehensive edge cases
 */

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
} from '@/lib/validation';

describe('ValidationError', () => {
  it('should create error with message', () => {
    const error = new ValidationError('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test error');
  });

  it('should create error with field and errors', () => {
    const errors = { email: 'Invalid email', name: 'Required' };
    const error = new ValidationError('Validation failed', 'email', errors);
    expect(error.field).toBe('email');
    expect(error.errors).toEqual(errors);
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('://invalid')).toBe(false);
  });
});

describe('isValidUUID', () => {
  it('should validate correct UUIDs', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false);
    expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
    expect(isValidUUID('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate correct phone numbers', () => {
    expect(isValidPhone('+14155552671')).toBe(true);
    expect(isValidPhone('+442071838750')).toBe(true);
    expect(isValidPhone('+1 415 555 2671')).toBe(true);
    expect(isValidPhone('+1 (415) 555-2671')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('invalid')).toBe(false);
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('+1')).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('should trim and limit string length', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('a'.repeat(1500), 1000)).toHaveLength(1000);
    expect(sanitizeString('test', 10)).toBe('test');
  });

  it('should handle empty strings', () => {
    expect(sanitizeString('')).toBe('');
    expect(sanitizeString('   ')).toBe('');
  });
});

describe('sanitizeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
    );
    expect(sanitizeHtml('<div>Test & Demo</div>')).toBe(
      '&lt;div&gt;Test &amp; Demo&lt;&#x2F;div&gt;',
    );
    expect(sanitizeHtml("It's a test")).toBe('It&#x27;s a test');
  });

  it('should handle empty strings', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});

describe('validateRequired', () => {
  it('should pass with all required fields present', () => {
    const data = { name: 'John', email: 'john@example.com', age: 30 };
    expect(() => validateRequired(data, ['name', 'email'])).not.toThrow();
  });

  it('should throw ValidationError for missing fields', () => {
    const data = { name: 'John' };
    expect(() => validateRequired(data, ['name', 'email'])).toThrow(ValidationError);
  });

  it('should throw for null, undefined, or empty string values', () => {
    expect(() => validateRequired({ name: null }, ['name'])).toThrow(ValidationError);
    expect(() => validateRequired({ name: undefined }, ['name'])).toThrow(ValidationError);
    expect(() => validateRequired({ name: '' }, ['name'])).toThrow(ValidationError);
  });

  it('should include errors for all missing fields', () => {
    const data = {};
    try {
      validateRequired(data, ['name', 'email', 'age']);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toHaveProperty('name');
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

  it('should throw for strings too short', () => {
    expect(() => validateStringLength('hi', 5, 10)).toThrow(ValidationError);
    expect(() => validateStringLength('hi', 5, 10)).toThrow('must be at least 5 characters');
  });

  it('should throw for strings too long', () => {
    expect(() => validateStringLength('hello world', 1, 5)).toThrow(ValidationError);
    expect(() => validateStringLength('hello world', 1, 5)).toThrow(
      'must be no more than 5 characters',
    );
  });

  it('should include custom field name in error message', () => {
    expect(() => validateStringLength('hi', 5, 10, 'Username')).toThrow('Username');
  });
});

describe('validateNumberRange', () => {
  it('should pass for valid number ranges', () => {
    expect(() => validateNumberRange(5, 1, 10)).not.toThrow();
    expect(() => validateNumberRange(1, 1, 10)).not.toThrow();
    expect(() => validateNumberRange(10, 1, 10)).not.toThrow();
  });

  it('should throw for numbers too small', () => {
    expect(() => validateNumberRange(0, 1, 10)).toThrow(ValidationError);
    expect(() => validateNumberRange(0, 1, 10)).toThrow('must be at least 1');
  });

  it('should throw for numbers too large', () => {
    expect(() => validateNumberRange(15, 1, 10)).toThrow(ValidationError);
    expect(() => validateNumberRange(15, 1, 10)).toThrow('must be no more than 10');
  });

  it('should include custom field name in error message', () => {
    expect(() => validateNumberRange(0, 1, 10, 'Age')).toThrow('Age');
  });
});

describe('validateArrayLength', () => {
  it('should pass for valid array lengths', () => {
    expect(() => validateArrayLength([1, 2, 3], 1, 5)).not.toThrow();
    expect(() => validateArrayLength([1], 1, 5)).not.toThrow();
    expect(() => validateArrayLength([1, 2, 3, 4, 5], 1, 5)).not.toThrow();
  });

  it('should throw for arrays too short', () => {
    expect(() => validateArrayLength([], 1, 5)).toThrow(ValidationError);
    expect(() => validateArrayLength([], 1, 5)).toThrow('must have at least 1 items');
  });

  it('should throw for arrays too long', () => {
    expect(() => validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5)).toThrow(ValidationError);
    expect(() => validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5)).toThrow(
      'must have no more than 5 items',
    );
  });
});

describe('validateEnum', () => {
  it('should pass for valid enum values', () => {
    expect(() => validateEnum('admin', ['admin', 'user', 'guest'])).not.toThrow();
    expect(() => validateEnum('user', ['admin', 'user', 'guest'])).not.toThrow();
  });

  it('should throw for invalid enum values', () => {
    expect(() => validateEnum('invalid', ['admin', 'user', 'guest'])).toThrow(ValidationError);
    expect(() => validateEnum('invalid', ['admin', 'user', 'guest'])).toThrow(
      'must be one of: admin, user, guest',
    );
  });

  it('should include custom field name in error message', () => {
    expect(() => validateEnum('invalid', ['admin', 'user'], 'Role')).toThrow('Role');
  });
});

describe('validateDateRange', () => {
  const now = new Date('2025-01-01');
  const past = new Date('2024-01-01');
  const future = new Date('2026-01-01');

  it('should pass for valid date ranges', () => {
    expect(() => validateDateRange(now, past, future)).not.toThrow();
    expect(() => validateDateRange(now, past)).not.toThrow();
    expect(() => validateDateRange(now, undefined, future)).not.toThrow();
  });

  it('should throw for dates before minimum', () => {
    expect(() => validateDateRange(past, now, future)).toThrow(ValidationError);
    expect(() => validateDateRange(past, now, future)).toThrow('must be after');
  });

  it('should throw for dates after maximum', () => {
    expect(() => validateDateRange(future, past, now)).toThrow(ValidationError);
    expect(() => validateDateRange(future, past, now)).toThrow('must be before');
  });
});

describe('validateJson', () => {
  it('should parse and return valid JSON', () => {
    expect(validateJson('{"key":"value"}')).toEqual({ key: 'value' });
    expect(validateJson('[1,2,3]')).toEqual([1, 2, 3]);
    expect(validateJson('null')).toBeNull();
    expect(validateJson('true')).toBe(true);
  });

  it('should throw ValidationError for invalid JSON', () => {
    expect(() => validateJson('invalid json')).toThrow(ValidationError);
    expect(() => validateJson('{key: "value"}')).toThrow(ValidationError);
    expect(() => validateJson("{'key': 'value'}")).toThrow(ValidationError);
  });

  it('should include custom field name in error message', () => {
    expect(() => validateJson('invalid', 'Config')).toThrow('Config');
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

  it('should wrap ValidationError correctly', () => {
    const validator = createValidator((data: unknown) => {
      throw new ValidationError('Invalid data');
    });
    expect(() => validator('test')).toThrow(ValidationError);
  });

  it('should wrap other errors in ValidationError', () => {
    const validator = createValidator(() => {
      throw new Error('Some error');
    });
    expect(() => validator('test')).toThrow(ValidationError);
    expect(() => validator('test')).toThrow('Validation failed');
  });
});

describe('validatePagination', () => {
  it('should return valid pagination params for default values', () => {
    const result = validatePagination();
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('should parse string values correctly', () => {
    const result = validatePagination('2', '50');
    expect(result).toEqual({ page: 2, limit: 50, offset: 50 });
  });

  it('should handle number values directly', () => {
    const result = validatePagination(3, 25);
    expect(result).toEqual({ page: 3, limit: 25, offset: 50 });
  });

  it('should throw for invalid page numbers', () => {
    expect(() => validatePagination('0', '10')).toThrow(ValidationError);
    expect(() => validatePagination('-1', '10')).toThrow('Page must be a positive integer');
    expect(() => validatePagination('invalid', '10')).toThrow(ValidationError);
  });

  it('should throw for invalid limit numbers', () => {
    expect(() => validatePagination('1', '0')).toThrow(ValidationError);
    expect(() => validatePagination('1', '-5')).toThrow('Limit must be a positive integer');
    expect(() => validatePagination('1', 'invalid')).toThrow(ValidationError);
  });

  it('should enforce maxLimit', () => {
    expect(() => validatePagination('1', '150', 100)).toThrow(ValidationError);
    expect(() => validatePagination('1', '150', 100)).toThrow('Limit cannot exceed 100');
  });

  it('should allow custom maxLimit', () => {
    const result = validatePagination('1', '150', 200);
    expect(result.limit).toBe(150);
  });

  it('should calculate offset correctly', () => {
    expect(validatePagination('1', '10').offset).toBe(0);
    expect(validatePagination('2', '10').offset).toBe(10);
    expect(validatePagination('5', '20').offset).toBe(80);
  });
});

describe('validatePasswordStrength', () => {
  it('should return strong for good passwords', () => {
    const result = validatePasswordStrength('MyP@ssw0rd123');
    expect(result.isStrong).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.feedback).toHaveLength(0);
  });

  it('should return weak for short passwords', () => {
    const result = validatePasswordStrength('Pass1!');
    expect(result.isStrong).toBe(false);
    expect(result.feedback).toContain('Password should be at least 8 characters');
  });

  it('should check for lowercase letters', () => {
    const result = validatePasswordStrength('PASSWORD123!');
    expect(result.feedback).toContain('Password should contain lowercase letters');
  });

  it('should check for uppercase letters', () => {
    const result = validatePasswordStrength('password123!');
    expect(result.feedback).toContain('Password should contain uppercase letters');
  });

  it('should check for numbers', () => {
    const result = validatePasswordStrength('Password!');
    expect(result.feedback).toContain('Password should contain numbers');
  });

  it('should check for special characters', () => {
    const result = validatePasswordStrength('Password123');
    expect(result.feedback).toContain('Password should contain special characters');
  });

  it('should give extra score for length >= 12', () => {
    const short = validatePasswordStrength('MyP@ss0rd');
    const long = validatePasswordStrength('MyP@ssw0rd123');
    expect(long.score).toBeGreaterThan(short.score);
  });

  it('should handle empty password', () => {
    const result = validatePasswordStrength('');
    expect(result.isStrong).toBe(false);
    expect(result.score).toBe(0);
  });
});

describe('validateFile', () => {
  const createMockFile = (size: number, type: string, name: string): File => {
    return {
      size,
      type,
      name,
    } as File;
  };

  it('should pass for valid files', () => {
    const file = createMockFile(1024 * 1024, 'image/png', 'test.png');
    expect(() => validateFile(file)).not.toThrow();
  });

  it('should throw for files exceeding max size', () => {
    const file = createMockFile(10 * 1024 * 1024, 'image/png', 'test.png');
    expect(() => validateFile(file)).toThrow(ValidationError);
    expect(() => validateFile(file)).toThrow('File size must not exceed');
  });

  it('should validate allowed MIME types', () => {
    const file = createMockFile(1024, 'text/plain', 'test.txt');
    expect(() => validateFile(file, { allowedTypes: ['image/png', 'image/jpeg'] })).toThrow(
      ValidationError,
    );
    expect(() => validateFile(file, { allowedTypes: ['image/png', 'image/jpeg'] })).toThrow(
      'File type must be one of',
    );
  });

  it('should validate allowed extensions', () => {
    const file = createMockFile(1024, 'text/plain', 'test.txt');
    expect(() => validateFile(file, { allowedExtensions: ['png', 'jpg'] })).toThrow(
      ValidationError,
    );
    expect(() => validateFile(file, { allowedExtensions: ['png', 'jpg'] })).toThrow(
      'File extension must be one of',
    );
  });

  it('should handle files without extension', () => {
    const file = createMockFile(1024, 'text/plain', 'testfile');
    expect(() => validateFile(file, { allowedExtensions: ['txt'] })).toThrow(ValidationError);
  });

  it('should be case-insensitive for extensions', () => {
    const file = createMockFile(1024, 'image/png', 'test.PNG');
    expect(() => validateFile(file, { allowedExtensions: ['png'] })).not.toThrow();
  });

  it('should use custom max size', () => {
    const file = createMockFile(2 * 1024 * 1024, 'image/png', 'test.png');
    expect(() => validateFile(file, { maxSize: 1024 * 1024 })).toThrow(ValidationError);
  });
});
