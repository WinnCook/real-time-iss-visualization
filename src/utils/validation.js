/**
 * Validation Utility Module
 * Provides parameter validation functions to prevent runtime errors
 * and ensure data integrity throughout the application.
 *
 * @module validation
 */

/**
 * Validation error class for descriptive error messages
 */
export class ValidationError extends Error {
  constructor(message, paramName, expectedType, receivedValue) {
    super(message);
    this.name = 'ValidationError';
    this.paramName = paramName;
    this.expectedType = expectedType;
    this.receivedValue = receivedValue;
  }
}

/**
 * Type validators - check if value is of expected type
 */
export const isNumber = (value) => typeof value === 'number' && !isNaN(value);
export const isString = (value) => typeof value === 'string';
export const isBoolean = (value) => typeof value === 'boolean';
export const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isArray = (value) => Array.isArray(value);
export const isFunction = (value) => typeof value === 'function';
export const isDefined = (value) => value !== undefined && value !== null;

/**
 * Validates that a value is a finite number
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated number
 * @throws {ValidationError} If value is not a finite number
 */
export function validateNumber(value, paramName = 'parameter') {
  if (!isNumber(value)) {
    throw new ValidationError(
      `${paramName} must be a valid number, received ${typeof value}: ${value}`,
      paramName,
      'number',
      value
    );
  }
  if (!isFinite(value)) {
    throw new ValidationError(
      `${paramName} must be a finite number, received: ${value}`,
      paramName,
      'finite number',
      value
    );
  }
  return value;
}

/**
 * Validates that a value is a number within a specified range
 *
 * @param {*} value - Value to validate
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated number
 * @throws {ValidationError} If value is not in range
 */
export function validateRange(value, min, max, paramName = 'parameter') {
  validateNumber(value, paramName);

  if (value < min || value > max) {
    throw new ValidationError(
      `${paramName} must be between ${min} and ${max}, received: ${value}`,
      paramName,
      `number in range [${min}, ${max}]`,
      value
    );
  }
  return value;
}

/**
 * Validates that a value is a positive number (> 0)
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated number
 * @throws {ValidationError} If value is not positive
 */
export function validatePositive(value, paramName = 'parameter') {
  validateNumber(value, paramName);

  if (value <= 0) {
    throw new ValidationError(
      `${paramName} must be positive, received: ${value}`,
      paramName,
      'positive number',
      value
    );
  }
  return value;
}

/**
 * Validates that a value is a non-negative number (>= 0)
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated number
 * @throws {ValidationError} If value is negative
 */
export function validateNonNegative(value, paramName = 'parameter') {
  validateNumber(value, paramName);

  if (value < 0) {
    throw new ValidationError(
      `${paramName} must be non-negative, received: ${value}`,
      paramName,
      'non-negative number',
      value
    );
  }
  return value;
}

/**
 * Validates that a value is a valid string
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @param {number} minLength - Optional minimum length
 * @returns {string} The validated string
 * @throws {ValidationError} If value is not a string or too short
 */
export function validateString(value, paramName = 'parameter', minLength = 0) {
  if (!isString(value)) {
    throw new ValidationError(
      `${paramName} must be a string, received ${typeof value}: ${value}`,
      paramName,
      'string',
      value
    );
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${paramName} must be at least ${minLength} characters, received: "${value}"`,
      paramName,
      `string with length >= ${minLength}`,
      value
    );
  }

  return value;
}

/**
 * Validates that a value is a valid object with required properties
 *
 * @param {*} value - Value to validate
 * @param {string[]} requiredProps - Array of required property names
 * @param {string} paramName - Parameter name for error messages
 * @returns {Object} The validated object
 * @throws {ValidationError} If value is not an object or missing properties
 */
export function validateObject(value, requiredProps = [], paramName = 'parameter') {
  if (!isObject(value)) {
    throw new ValidationError(
      `${paramName} must be an object, received ${typeof value}: ${value}`,
      paramName,
      'object',
      value
    );
  }

  for (const prop of requiredProps) {
    if (!(prop in value)) {
      throw new ValidationError(
        `${paramName} is missing required property: ${prop}`,
        paramName,
        `object with property '${prop}'`,
        value
      );
    }
  }

  return value;
}

/**
 * Validates that a value is a valid array with optional length constraints
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @param {number} minLength - Optional minimum array length
 * @param {number} maxLength - Optional maximum array length
 * @returns {Array} The validated array
 * @throws {ValidationError} If value is not an array or wrong length
 */
export function validateArray(value, paramName = 'parameter', minLength = 0, maxLength = Infinity) {
  if (!isArray(value)) {
    throw new ValidationError(
      `${paramName} must be an array, received ${typeof value}`,
      paramName,
      'array',
      value
    );
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${paramName} must have at least ${minLength} elements, received ${value.length}`,
      paramName,
      `array with length >= ${minLength}`,
      value
    );
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${paramName} must have at most ${maxLength} elements, received ${value.length}`,
      paramName,
      `array with length <= ${maxLength}`,
      value
    );
  }

  return value;
}

/**
 * Validates geographic coordinates (latitude/longitude)
 *
 * @param {*} lat - Latitude value
 * @param {*} lon - Longitude value
 * @returns {{lat: number, lon: number}} Validated coordinates
 * @throws {ValidationError} If coordinates are invalid
 */
export function validateCoordinates(lat, lon) {
  validateRange(lat, -90, 90, 'latitude');
  validateRange(lon, -180, 180, 'longitude');

  return { lat, lon };
}

/**
 * Validates ISS API response structure
 *
 * @param {*} response - API response to validate
 * @returns {Object} Validated response
 * @throws {ValidationError} If response structure is invalid
 */
export function validateISSResponse(response) {
  validateObject(response, ['message', 'iss_position', 'timestamp'], 'ISS API response');

  if (response.message !== 'success') {
    throw new ValidationError(
      `ISS API response indicates failure: ${response.message}`,
      'response.message',
      '"success"',
      response.message
    );
  }

  validateObject(response.iss_position, ['latitude', 'longitude'], 'response.iss_position');

  // Parse and validate coordinates
  const lat = parseFloat(response.iss_position.latitude);
  const lon = parseFloat(response.iss_position.longitude);
  validateCoordinates(lat, lon);

  // Validate timestamp
  validateNumber(response.timestamp, 'response.timestamp');

  return response;
}

/**
 * Validates orbital parameters for Keplerian calculations
 *
 * @param {Object} params - Orbital parameters
 * @param {number} params.semiMajorAxis - Semi-major axis in AU
 * @param {number} params.orbitalPeriod - Orbital period in days
 * @param {number} params.time - Time since epoch in milliseconds
 * @returns {Object} Validated parameters
 * @throws {ValidationError} If parameters are invalid
 */
export function validateOrbitalParams(params) {
  validateObject(params, ['semiMajorAxis', 'orbitalPeriod', 'time'], 'orbital parameters');

  validatePositive(params.semiMajorAxis, 'params.semiMajorAxis');
  validatePositive(params.orbitalPeriod, 'params.orbitalPeriod');
  validateNumber(params.time, 'params.time');

  return params;
}

/**
 * Validates a 3D position object
 *
 * @param {*} position - Position object to validate
 * @returns {{x: number, y: number, z: number}} Validated position
 * @throws {ValidationError} If position is invalid
 */
export function validatePosition3D(position) {
  validateObject(position, ['x', 'y', 'z'], 'position');

  validateNumber(position.x, 'position.x');
  validateNumber(position.y, 'position.y');
  validateNumber(position.z, 'position.z');

  return position;
}

/**
 * Validates time management parameters
 *
 * @param {Object} params - Time parameters
 * @param {number} params.timeSpeed - Time speed multiplier
 * @param {number} params.deltaTime - Delta time in milliseconds
 * @returns {Object} Validated parameters
 * @throws {ValidationError} If parameters are invalid
 */
export function validateTimeParams(params) {
  validateObject(params, ['timeSpeed', 'deltaTime'], 'time parameters');

  validatePositive(params.timeSpeed, 'params.timeSpeed');
  validateNonNegative(params.deltaTime, 'params.deltaTime');

  // Sanity check: deltaTime shouldn't be absurdly large (> 1 second in real time)
  if (params.deltaTime > 1000) {
    console.warn(`Unusually large deltaTime: ${params.deltaTime}ms`);
  }

  return params;
}

/**
 * Validates user input from sliders/controls
 *
 * @param {*} value - Input value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} controlName - Name of the control for error messages
 * @returns {number} Validated and sanitized value
 */
export function validateUserInput(value, min, max, controlName = 'control') {
  // Handle string inputs (from HTML inputs)
  if (isString(value)) {
    value = parseFloat(value);
  }

  // Validate as number
  validateNumber(value, controlName);

  // Clamp to range instead of throwing error for better UX
  if (value < min) {
    console.warn(`${controlName} value ${value} clamped to minimum ${min}`);
    return min;
  }
  if (value > max) {
    console.warn(`${controlName} value ${value} clamped to maximum ${max}`);
    return max;
  }

  return value;
}

/**
 * Validates a schema object against a value
 * General-purpose validator that checks multiple properties
 *
 * @param {*} value - Value to validate
 * @param {Object} schema - Validation schema
 * @param {string} schema.type - Expected type ('number', 'string', 'object', 'array')
 * @param {boolean} schema.required - Whether value is required
 * @param {number} schema.min - Minimum value (for numbers)
 * @param {number} schema.max - Maximum value (for numbers)
 * @param {string[]} schema.properties - Required properties (for objects)
 * @param {string} paramName - Parameter name for error messages
 * @returns {*} Validated value
 * @throws {ValidationError} If validation fails
 */
export function validateSchema(value, schema, paramName = 'parameter') {
  // Check if required
  if (schema.required && !isDefined(value)) {
    throw new ValidationError(
      `${paramName} is required`,
      paramName,
      'defined value',
      value
    );
  }

  // If not required and undefined, return undefined
  if (!schema.required && !isDefined(value)) {
    return value;
  }

  // Validate type
  switch (schema.type) {
    case 'number':
      validateNumber(value, paramName);
      if (schema.min !== undefined && schema.max !== undefined) {
        validateRange(value, schema.min, schema.max, paramName);
      } else if (schema.min !== undefined) {
        validateNonNegative(value - schema.min, `${paramName} (offset by min)`);
      }
      break;

    case 'string':
      validateString(value, paramName, schema.minLength);
      break;

    case 'object':
      validateObject(value, schema.properties || [], paramName);
      break;

    case 'array':
      validateArray(value, paramName, schema.minLength, schema.maxLength);
      break;

    case 'boolean':
      if (!isBoolean(value)) {
        throw new ValidationError(
          `${paramName} must be a boolean, received ${typeof value}`,
          paramName,
          'boolean',
          value
        );
      }
      break;

    default:
      throw new ValidationError(
        `Unknown schema type: ${schema.type}`,
        'schema.type',
        'valid type',
        schema.type
      );
  }

  return value;
}

/**
 * Safe wrapper for functions that adds automatic error handling
 * Returns a wrapped function that validates inputs and catches errors
 *
 * @param {Function} fn - Function to wrap
 * @param {Object[]} paramSchemas - Array of parameter validation schemas
 * @param {string} functionName - Function name for error messages
 * @returns {Function} Wrapped function with validation
 */
export function safeFunction(fn, paramSchemas = [], functionName = 'function') {
  return function(...args) {
    try {
      // Validate each parameter
      for (let i = 0; i < paramSchemas.length; i++) {
        if (paramSchemas[i]) {
          validateSchema(args[i], paramSchemas[i], `${functionName} parameter ${i}`);
        }
      }

      // Execute function
      return fn(...args);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Validation error in ${functionName}:`, error.message);
        throw error;
      } else {
        console.error(`Error in ${functionName}:`, error);
        throw error;
      }
    }
  };
}

export default {
  ValidationError,
  // Type checkers
  isNumber,
  isString,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDefined,
  // Validators
  validateNumber,
  validateRange,
  validatePositive,
  validateNonNegative,
  validateString,
  validateObject,
  validateArray,
  validateCoordinates,
  validateISSResponse,
  validateOrbitalParams,
  validatePosition3D,
  validateTimeParams,
  validateUserInput,
  validateSchema,
  safeFunction
};
