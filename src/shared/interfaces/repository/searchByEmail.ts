export interface SearchByEmail<T> {
  getByEmailAsync(email: string): Promise<T | null>;
}
