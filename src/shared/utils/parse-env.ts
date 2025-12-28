/**
 * Given a configuration string, parse it as meaningful text.
 * This function trims the input and returns it if it is not empty.
 * If the input is missing, an empty string or only whitespace then `undefined` is returned.
 * Optionally the `fallback` argument can be specified to be returned instead of `undefined`.
 *
 * @param input - The input to parse as a string.
 * @param fallback - The value to return if the input fails to parse as meaningful text, defaults to `undefined`.
 * @returns The trimmed input text, or the fallback value when the input is empty or whitespace.
 */
export function optionalString(input: string | undefined): string | undefined;
export function optionalString(input: string | undefined, fallback: string): string;
export function optionalString(input: string | undefined, fallback?: string): string | undefined {
  if (!input) return fallback;
  const trimmed = input.trim();
  return trimmed || fallback;
}

/**
 * Given a configuration string, parse it as a boolean value.
 * Returns undefined if the input is not representing 'true' or 'false'.
 * @param flag - The input to parse as a boolean.
 */
export function optionalFlag(flag: string | undefined): boolean | undefined;
/**
 * Given a configuration string, parse it as a boolean value.
 * Returns the fallback value if the input is not representing 'true' or 'false'.
 * @param flag - The input to parse as a boolean.
 * @param fallback - The fallback value to return when the input is inconclusive.
 */
export function optionalFlag(flag: string | undefined, fallback: boolean): boolean;
export function optionalFlag(flag: string | undefined, fallback?: boolean): boolean | undefined {
  switch (flag?.trim()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return fallback;
  }
}
