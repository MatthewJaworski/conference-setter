import { ApiBearerAuth, ApiOAuth2 } from '@nestjs/swagger';

const oauth = ApiOAuth2([]);
const bearer = ApiBearerAuth('bearer');

/**
 * Marks the controller or route in swagger to require authentication.
 * @constructor
 */
export function EnableSwaggerAuth(): ClassDecorator & MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    oauth(target, propertyKey, descriptor);
    bearer(target, propertyKey, descriptor);
  }) as ClassDecorator & MethodDecorator;
}
