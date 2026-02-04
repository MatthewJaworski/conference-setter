import { ValidationError } from 'class-validator';
import { flattenValidationErrors } from './flatten-validation-errors';

describe('flattenValidationErrors', () => {
  it('should return empty array for empty input', () => {
    expect(flattenValidationErrors([])).toEqual([]);
  });

  it('should extract constraints from single error', () => {
    const errors: ValidationError[] = [
      {
        property: 'email',
        constraints: {
          isEmail: 'email must be a valid email',
        },
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toEqual(['email must be a valid email']);
  });

  it('should extract multiple constraints from single error', () => {
    const errors: ValidationError[] = [
      {
        property: 'password',
        constraints: {
          minLength: 'password must be at least 8 characters',
          matches: 'password must contain a number',
        },
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toHaveLength(2);
    expect(result).toContain('password must be at least 8 characters');
    expect(result).toContain('password must contain a number');
  });

  it('should extract constraints from multiple errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'email',
        constraints: {
          isEmail: 'email must be a valid email',
        },
      },
      {
        property: 'name',
        constraints: {
          isNotEmpty: 'name should not be empty',
        },
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toHaveLength(2);
    expect(result).toContain('email must be a valid email');
    expect(result).toContain('name should not be empty');
  });

  it('should handle nested validation errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'address',
        children: [
          {
            property: 'street',
            constraints: {
              isNotEmpty: 'street should not be empty',
            },
          },
          {
            property: 'city',
            constraints: {
              isNotEmpty: 'city should not be empty',
            },
          },
        ],
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toHaveLength(2);
    expect(result).toContain('street should not be empty');
    expect(result).toContain('city should not be empty');
  });

  it('should handle deeply nested validation errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'user',
        children: [
          {
            property: 'address',
            children: [
              {
                property: 'zipCode',
                constraints: {
                  isPostalCode: 'zipCode must be a valid postal code',
                },
              },
            ],
          },
        ],
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toEqual(['zipCode must be a valid postal code']);
  });

  it('should handle mixed errors with constraints and children', () => {
    const errors: ValidationError[] = [
      {
        property: 'user',
        constraints: {
          isNotEmpty: 'user should not be empty',
        },
        children: [
          {
            property: 'email',
            constraints: {
              isEmail: 'email must be a valid email',
            },
          },
        ],
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toHaveLength(2);
    expect(result).toContain('user should not be empty');
    expect(result).toContain('email must be a valid email');
  });

  it('should handle error without constraints or children', () => {
    const errors: ValidationError[] = [
      {
        property: 'field',
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toEqual([]);
  });

  it('should handle error with empty children array', () => {
    const errors: ValidationError[] = [
      {
        property: 'field',
        constraints: {
          isNotEmpty: 'field should not be empty',
        },
        children: [],
      },
    ];

    const result = flattenValidationErrors(errors);

    expect(result).toEqual(['field should not be empty']);
  });
});
