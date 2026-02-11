
import { describe, it, expect } from 'vitest';
import { isValidUserData, validateAndParseUserData } from './userValidation';

describe('userValidation', () => {
    describe('isValidUserData', () => {
        it('should return true for valid user data', () => {
            const validData = {
                id: '123',
                email: 'test@example.com',
                nombre: 'Test User',
                rol: 'ingeniero',
                departamento: 'IT'
            };
            expect(isValidUserData(validData)).toBe(true);
        });

        it('should return true for minimal valid user data', () => {
            const validData = {
                id: '123',
                email: 'test@example.com'
            };
            expect(isValidUserData(validData)).toBe(true);
        });

        it('should return false for missing required fields', () => {
            const invalidData = {
                id: '123',
                // email missing
            };
            expect(isValidUserData(invalidData)).toBe(false);
        });

        it('should return false for invalid types', () => {
            const invalidData = {
                id: '123',
                email: 123 // email should be string
            };
            expect(isValidUserData(invalidData)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isValidUserData(null)).toBe(false);
        });
    });

    describe('validateAndParseUserData', () => {
        it('should return user data for valid JSON', () => {
            const json = JSON.stringify({
                id: '123',
                email: 'test@example.com'
            });
            const result = validateAndParseUserData(json);
            expect(result).toEqual({
                id: '123',
                email: 'test@example.com'
            });
        });

        it('should return null for invalid JSON', () => {
            const json = "{ invalid_json }";
            const result = validateAndParseUserData(json);
            expect(result).toBeNull();
        });

        it('should return null for valid JSON but invalid schema', () => {
            const json = JSON.stringify({
                foo: 'bar' // missing required fields
            });
            const result = validateAndParseUserData(json);
            expect(result).toBeNull();
        });

        it('should return null for null input', () => {
            const result = validateAndParseUserData(null);
            expect(result).toBeNull();
        });
    });
});
