import { SetMetadata } from '@nestjs/common';

/**
 * Marks the controller or route as public, meaning it does not require authentication.
 * @constructor
 */
export function Public() {
  return SetMetadata('isPublic', true);
}
