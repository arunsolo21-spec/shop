/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }

  return { valid: true };
};

/**
 * Validate Indian phone number
 */
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.replace(/\D/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid 10-digit Indian phone number' };
  }

  return { valid: true };
};

/**
 * Validate Indian pincode
 */
export const validatePincode = (pincode: string): { valid: boolean; error?: string } => {
  if (!pincode || pincode.trim().length === 0) {
    return { valid: false, error: 'Pincode is required' };
  }

  const pincodeRegex = /^\d{6}$/;

  if (!pincodeRegex.test(pincode)) {
    return { valid: false, error: 'Please enter a valid 6-digit pincode' };
  }

  return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string = 'Field'): { valid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Number'
): { valid: boolean; error?: string } => {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true };
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Please select an image file' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Validate form data
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => { valid: boolean; error?: string };
}

export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRule[]
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const rule of rules) {
    const value = data[rule.field];

    if (rule.required) {
      const required = validateRequired(value, rule.field);
      if (!required.valid) {
        errors[rule.field] = required.error!;
        continue;
      }
    }

    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[rule.field] = `${rule.field} must be at least ${rule.minLength} characters`;
      continue;
    }

    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[rule.field] = `${rule.field} must be at most ${rule.maxLength} characters`;
      continue;
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[rule.field] = `${rule.field} format is invalid`;
      continue;
    }

    if (rule.custom) {
      const custom = rule.custom(value);
      if (!custom.valid) {
        errors[rule.field] = custom.error!;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize string input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validate address fields
 */
export const validateAddress = (address: {
  name: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const name = validateRequired(address.name, 'Name');
  if (!name.valid) errors.name = name.error!;

  const phone = validatePhone(address.phone);
  if (!phone.valid) errors.phone = phone.error!;

  const street = validateRequired(address.street, 'Street');
  if (!street.valid) errors.street = street.error!;

  const city = validateRequired(address.city, 'City');
  if (!city.valid) errors.city = city.error!;

  const zip = validatePincode(address.zip);
  if (!zip.valid) errors.zip = zip.error!;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};