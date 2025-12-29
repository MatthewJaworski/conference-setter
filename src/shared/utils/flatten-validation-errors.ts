import { ValidationError } from 'class-validator';

/**
 * Flattens class-validator ValidationError array into an array of error message strings.
 * Handles nested validation errors recursively.
 */
export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children && error.children.length > 0) {
      messages.push(...flattenValidationErrors(error.children));
    }
  }

  return messages;
}
