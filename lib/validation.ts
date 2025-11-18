/**
 * Input Validation Utilities
 * Provides reusable validation functions for API inputs
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * UUID validation
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Phone number validation (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate required fields
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
): void {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors[String(field)] = `${String(field)} is required`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', undefined, errors);
  }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  min: number,
  max: number,
  fieldName = 'Field',
): void {
  if (value.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`);
  }
  if (value.length > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max} characters`);
  }
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName = 'Value',
): void {
  if (value < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }
  if (value > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max}`);
  }
}

/**
 * Validate array length
 */
export function validateArrayLength(
  array: any[],
  min: number,
  max: number,
  fieldName = 'Array',
): void {
  if (array.length < min) {
    throw new ValidationError(`${fieldName} must have at least ${min} items`);
  }
  if (array.length > max) {
    throw new ValidationError(`${fieldName} must have no more than ${max} items`);
  }
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: T[],
  fieldName = 'Value',
): asserts value is T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName,
    );
  }
}

/**
 * Validate date range
 */
export function validateDateRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  fieldName = 'Date',
): void {
  if (minDate && date < minDate) {
    throw new ValidationError(`${fieldName} must be after ${minDate.toISOString()}`);
  }
  if (maxDate && date > maxDate) {
    throw new ValidationError(`${fieldName} must be before ${maxDate.toISOString()}`);
  }
}

/**
 * Validate JSON structure
 */
export function validateJson(value: string, fieldName = 'JSON'): any {
  try {
    return JSON.parse(value);
  } catch {
    throw new ValidationError(`${fieldName} is not valid JSON`);
  }
}

/**
 * Create a validator function
 */
export function createValidator<T>(validationFn: (data: unknown) => T): (data: unknown) => T {
  return (data: unknown): T => {
    try {
      return validationFn(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Validation failed');
    }
  };
}

/**
 * Pagination validation
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function validatePagination(
  page?: string | number,
  limit?: string | number,
  maxLimit = 100,
): PaginationParams {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page || 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit || 20;

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Page must be a positive integer');
  }

  if (isNaN(limitNum) || limitNum < 1) {
    throw new ValidationError('Limit must be a positive integer');
  }

  if (limitNum > maxLimit) {
    throw new ValidationError(`Limit cannot exceed ${maxLimit}`);
  }

  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  isStrong: boolean;
  score: number;
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters');

  return {
    isStrong: score >= 4,
    score,
    feedback,
  };
}

/**
 * File upload validation
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

export function validateFile(file: File, options: FileValidationOptions = {}): void {
  const { maxSize = 5 * 1024 * 1024, allowedTypes, allowedExtensions } = options;

  if (file.size > maxSize) {
    throw new ValidationError(`File size must not exceed ${maxSize / 1024 / 1024}MB`);
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new ValidationError(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new ValidationError(`File extension must be one of: ${allowedExtensions.join(', ')}`);
    }
  }
}
