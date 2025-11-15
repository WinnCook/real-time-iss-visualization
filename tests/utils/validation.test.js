/**
 * Test Suite for Validation Utility
 * Tests all validation functions to ensure they properly catch invalid inputs
 */

import {
    ValidationError,
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
    validateUserInput
} from '../../src/utils/validation.js';

describe('ValidationError', () => {
    test('creates error with proper structure', () => {
        const error = new ValidationError('Test error', 'testParam', 'number', 'notANumber');
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('ValidationError');
        expect(error.paramName).toBe('testParam');
        expect(error.expectedType).toBe('number');
        expect(error.receivedValue).toBe('notANumber');
    });
});

describe('validateNumber', () => {
    test('accepts valid numbers', () => {
        expect(validateNumber(42, 'test')).toBe(42);
        expect(validateNumber(0, 'test')).toBe(0);
        expect(validateNumber(-10.5, 'test')).toBe(-10.5);
    });

    test('rejects non-numbers', () => {
        expect(() => validateNumber('42', 'test')).toThrow(ValidationError);
        expect(() => validateNumber(null, 'test')).toThrow(ValidationError);
        expect(() => validateNumber(undefined, 'test')).toThrow(ValidationError);
        expect(() => validateNumber(NaN, 'test')).toThrow(ValidationError);
    });

    test('rejects Infinity', () => {
        expect(() => validateNumber(Infinity, 'test')).toThrow(ValidationError);
        expect(() => validateNumber(-Infinity, 'test')).toThrow(ValidationError);
    });
});

describe('validateRange', () => {
    test('accepts numbers within range', () => {
        expect(validateRange(5, 0, 10, 'test')).toBe(5);
        expect(validateRange(0, 0, 10, 'test')).toBe(0);
        expect(validateRange(10, 0, 10, 'test')).toBe(10);
    });

    test('rejects numbers outside range', () => {
        expect(() => validateRange(-1, 0, 10, 'test')).toThrow(ValidationError);
        expect(() => validateRange(11, 0, 10, 'test')).toThrow(ValidationError);
    });

    test('works with negative ranges', () => {
        expect(validateRange(-5, -10, 0, 'test')).toBe(-5);
        expect(() => validateRange(1, -10, 0, 'test')).toThrow(ValidationError);
    });
});

describe('validatePositive', () => {
    test('accepts positive numbers', () => {
        expect(validatePositive(1, 'test')).toBe(1);
        expect(validatePositive(0.1, 'test')).toBe(0.1);
        expect(validatePositive(1000, 'test')).toBe(1000);
    });

    test('rejects zero and negative numbers', () => {
        expect(() => validatePositive(0, 'test')).toThrow(ValidationError);
        expect(() => validatePositive(-1, 'test')).toThrow(ValidationError);
        expect(() => validatePositive(-0.1, 'test')).toThrow(ValidationError);
    });
});

describe('validateNonNegative', () => {
    test('accepts zero and positive numbers', () => {
        expect(validateNonNegative(0, 'test')).toBe(0);
        expect(validateNonNegative(1, 'test')).toBe(1);
        expect(validateNonNegative(100, 'test')).toBe(100);
    });

    test('rejects negative numbers', () => {
        expect(() => validateNonNegative(-1, 'test')).toThrow(ValidationError);
        expect(() => validateNonNegative(-0.1, 'test')).toThrow(ValidationError);
    });
});

describe('validateString', () => {
    test('accepts valid strings', () => {
        expect(validateString('hello', 'test')).toBe('hello');
        expect(validateString('', 'test')).toBe('');
    });

    test('rejects non-strings', () => {
        expect(() => validateString(42, 'test')).toThrow(ValidationError);
        expect(() => validateString(null, 'test')).toThrow(ValidationError);
        expect(() => validateString(undefined, 'test')).toThrow(ValidationError);
    });

    test('validates minimum length', () => {
        expect(validateString('hello', 'test', 3)).toBe('hello');
        expect(() => validateString('hi', 'test', 3)).toThrow(ValidationError);
    });
});

describe('validateObject', () => {
    test('accepts valid objects', () => {
        const obj = { name: 'test', value: 42 };
        expect(validateObject(obj, [], 'test')).toBe(obj);
    });

    test('validates required properties', () => {
        const obj = { name: 'test', value: 42 };
        expect(validateObject(obj, ['name', 'value'], 'test')).toBe(obj);
        expect(() => validateObject(obj, ['name', 'missing'], 'test')).toThrow(ValidationError);
    });

    test('rejects non-objects', () => {
        expect(() => validateObject(null, [], 'test')).toThrow(ValidationError);
        expect(() => validateObject([], [], 'test')).toThrow(ValidationError);
        expect(() => validateObject('not object', [], 'test')).toThrow(ValidationError);
    });
});

describe('validateArray', () => {
    test('accepts valid arrays', () => {
        const arr = [1, 2, 3];
        expect(validateArray(arr, 'test')).toBe(arr);
    });

    test('validates array length constraints', () => {
        expect(validateArray([1, 2, 3], 'test', 2, 5)).toEqual([1, 2, 3]);
        expect(() => validateArray([1], 'test', 2, 5)).toThrow(ValidationError);
        expect(() => validateArray([1, 2, 3, 4, 5, 6], 'test', 2, 5)).toThrow(ValidationError);
    });

    test('rejects non-arrays', () => {
        expect(() => validateArray('not array', 'test')).toThrow(ValidationError);
        expect(() => validateArray({ length: 3 }, 'test')).toThrow(ValidationError);
    });
});

describe('validateCoordinates', () => {
    test('accepts valid coordinates', () => {
        expect(validateCoordinates(0, 0)).toEqual({ lat: 0, lon: 0 });
        expect(validateCoordinates(45.5, -120.3)).toEqual({ lat: 45.5, lon: -120.3 });
        expect(validateCoordinates(90, 180)).toEqual({ lat: 90, lon: 180 });
        expect(validateCoordinates(-90, -180)).toEqual({ lat: -90, lon: -180 });
    });

    test('rejects invalid latitudes', () => {
        expect(() => validateCoordinates(91, 0)).toThrow(ValidationError);
        expect(() => validateCoordinates(-91, 0)).toThrow(ValidationError);
    });

    test('rejects invalid longitudes', () => {
        expect(() => validateCoordinates(0, 181)).toThrow(ValidationError);
        expect(() => validateCoordinates(0, -181)).toThrow(ValidationError);
    });
});

describe('validateISSResponse', () => {
    test('accepts valid ISS API response', () => {
        const response = {
            message: 'success',
            timestamp: 1638360000,
            iss_position: {
                latitude: '12.3456',
                longitude: '-78.9012'
            }
        };
        expect(validateISSResponse(response)).toBe(response);
    });

    test('rejects response with missing fields', () => {
        const invalid1 = { message: 'success' };
        expect(() => validateISSResponse(invalid1)).toThrow(ValidationError);

        const invalid2 = {
            message: 'success',
            timestamp: 1638360000
        };
        expect(() => validateISSResponse(invalid2)).toThrow(ValidationError);
    });

    test('rejects response with failure message', () => {
        const response = {
            message: 'failure',
            timestamp: 1638360000,
            iss_position: {
                latitude: '12.3456',
                longitude: '-78.9012'
            }
        };
        expect(() => validateISSResponse(response)).toThrow(ValidationError);
    });

    test('rejects response with invalid coordinates', () => {
        const response = {
            message: 'success',
            timestamp: 1638360000,
            iss_position: {
                latitude: '100',
                longitude: '0'
            }
        };
        expect(() => validateISSResponse(response)).toThrow(ValidationError);
    });
});

describe('validateOrbitalParams', () => {
    test('accepts valid orbital parameters', () => {
        const params = {
            semiMajorAxis: 1.0,
            orbitalPeriod: 365.25,
            time: 1000000
        };
        expect(validateOrbitalParams(params)).toBe(params);
    });

    test('rejects missing required fields', () => {
        const invalid = {
            semiMajorAxis: 1.0,
            orbitalPeriod: 365.25
        };
        expect(() => validateOrbitalParams(invalid)).toThrow(ValidationError);
    });

    test('rejects invalid values', () => {
        const invalid1 = {
            semiMajorAxis: -1.0,
            orbitalPeriod: 365.25,
            time: 1000000
        };
        expect(() => validateOrbitalParams(invalid1)).toThrow(ValidationError);

        const invalid2 = {
            semiMajorAxis: 1.0,
            orbitalPeriod: 0,
            time: 1000000
        };
        expect(() => validateOrbitalParams(invalid2)).toThrow(ValidationError);
    });
});

describe('validatePosition3D', () => {
    test('accepts valid 3D positions', () => {
        const pos = { x: 10, y: 20, z: 30 };
        expect(validatePosition3D(pos)).toBe(pos);
    });

    test('rejects missing coordinates', () => {
        const invalid = { x: 10, y: 20 };
        expect(() => validatePosition3D(invalid)).toThrow(ValidationError);
    });

    test('rejects non-numeric coordinates', () => {
        const invalid = { x: '10', y: 20, z: 30 };
        expect(() => validatePosition3D(invalid)).toThrow(ValidationError);
    });
});

describe('validateTimeParams', () => {
    test('accepts valid time parameters', () => {
        const params = {
            timeSpeed: 100,
            deltaTime: 16.67
        };
        expect(validateTimeParams(params)).toBe(params);
    });

    test('rejects invalid timeSpeed', () => {
        const invalid = {
            timeSpeed: -1,
            deltaTime: 16.67
        };
        expect(() => validateTimeParams(invalid)).toThrow(ValidationError);
    });

    test('rejects negative deltaTime', () => {
        const invalid = {
            timeSpeed: 100,
            deltaTime: -10
        };
        expect(() => validateTimeParams(invalid)).toThrow(ValidationError);
    });

    test('warns about large deltaTime', () => {
        const originalWarn = console.warn;
        let warnCalled = false;
        console.warn = (msg) => {
            warnCalled = true;
            expect(msg).toContain('Unusually large deltaTime');
        };

        const params = {
            timeSpeed: 100,
            deltaTime: 2000
        };
        validateTimeParams(params);
        expect(warnCalled).toBe(true);
        console.warn = originalWarn;
    });
});

describe('validateUserInput', () => {
    test('accepts valid numeric input', () => {
        expect(validateUserInput(50, 0, 100, 'test')).toBe(50);
        expect(validateUserInput('50', 0, 100, 'test')).toBe(50);
    });

    test('clamps values to range instead of throwing', () => {
        const originalWarn = console.warn;
        let warnCount = 0;
        console.warn = () => { warnCount++; };

        expect(validateUserInput(-10, 0, 100, 'test')).toBe(0);
        expect(validateUserInput(150, 0, 100, 'test')).toBe(100);

        expect(warnCount).toBe(2);
        console.warn = originalWarn;
    });

    test('handles string inputs', () => {
        expect(validateUserInput('75.5', 0, 100, 'test')).toBe(75.5);
    });

    test('rejects invalid inputs', () => {
        expect(() => validateUserInput('not a number', 0, 100, 'test')).toThrow(ValidationError);
        expect(() => validateUserInput(NaN, 0, 100, 'test')).toThrow(ValidationError);
    });
});
