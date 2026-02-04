import { optionalString, optionalFlag } from './parse-env';

describe('optionalString', () => {
  describe('without fallback', () => {
    it('should return undefined for undefined input', () => {
      expect(optionalString(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(optionalString('')).toBeUndefined();
    });

    it('should return undefined for whitespace only string', () => {
      expect(optionalString('   ')).toBeUndefined();
    });

    it('should return trimmed string for valid input', () => {
      expect(optionalString('hello')).toBe('hello');
    });

    it('should trim whitespace from valid input', () => {
      expect(optionalString('  hello  ')).toBe('hello');
    });

    it('should return string with internal spaces', () => {
      expect(optionalString('  hello world  ')).toBe('hello world');
    });
  });

  describe('with fallback', () => {
    it('should return fallback for undefined input', () => {
      expect(optionalString(undefined, 'default')).toBe('default');
    });

    it('should return fallback for empty string', () => {
      expect(optionalString('', 'default')).toBe('default');
    });

    it('should return fallback for whitespace only string', () => {
      expect(optionalString('   ', 'default')).toBe('default');
    });

    it('should return trimmed string when input is valid', () => {
      expect(optionalString('hello', 'default')).toBe('hello');
    });

    it('should trim whitespace from valid input with fallback', () => {
      expect(optionalString('  hello  ', 'default')).toBe('hello');
    });
  });
});

describe('optionalFlag', () => {
  describe('without fallback', () => {
    it('should return undefined for undefined input', () => {
      expect(optionalFlag(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(optionalFlag('')).toBeUndefined();
    });

    it('should return undefined for invalid string', () => {
      expect(optionalFlag('invalid')).toBeUndefined();
    });

    it('should return undefined for numeric string', () => {
      expect(optionalFlag('1')).toBeUndefined();
    });

    it('should return true for "true"', () => {
      expect(optionalFlag('true')).toBe(true);
    });

    it('should return false for "false"', () => {
      expect(optionalFlag('false')).toBe(false);
    });

    it('should handle "true" with whitespace', () => {
      expect(optionalFlag('  true  ')).toBe(true);
    });

    it('should handle "false" with whitespace', () => {
      expect(optionalFlag('  false  ')).toBe(false);
    });

    it('should return undefined for "TRUE" (case sensitive)', () => {
      expect(optionalFlag('TRUE')).toBeUndefined();
    });

    it('should return undefined for "FALSE" (case sensitive)', () => {
      expect(optionalFlag('FALSE')).toBeUndefined();
    });
  });

  describe('with fallback', () => {
    it('should return fallback for undefined input', () => {
      expect(optionalFlag(undefined, true)).toBe(true);
      expect(optionalFlag(undefined, false)).toBe(false);
    });

    it('should return fallback for empty string', () => {
      expect(optionalFlag('', true)).toBe(true);
      expect(optionalFlag('', false)).toBe(false);
    });

    it('should return fallback for invalid string', () => {
      expect(optionalFlag('invalid', true)).toBe(true);
      expect(optionalFlag('invalid', false)).toBe(false);
    });

    it('should return true for "true" ignoring fallback', () => {
      expect(optionalFlag('true', false)).toBe(true);
    });

    it('should return false for "false" ignoring fallback', () => {
      expect(optionalFlag('false', true)).toBe(false);
    });
  });
});
