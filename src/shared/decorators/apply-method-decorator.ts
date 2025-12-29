/**
 * Apply a method decorator manually.
 * Helpful when applying a decorator from another type of decorator.
 *
 * @param decorator - The decorator to apply
 * @param target - The target object/class to apply the decorator to.
 * @param methodKey - The property key holding the method, commonly the method name.
 */
export function applyMethodDecorator(
  decorator: MethodDecorator,
  target: object,
  methodKey: string | symbol,
): void {
  const descriptor = Reflect.getOwnPropertyDescriptor(target, methodKey);
  if (!descriptor) {
    throw new TypeError(
      `Attempt to apply method decorator, but the property '${methodKey.toString()}' has no descriptor`,
    );
  }
  const result = decorator(target, methodKey, descriptor) ?? descriptor;
  Reflect.defineProperty(target, methodKey, result);
}

/** Make a class decorator applicable to properties, methods and parameters. */
export function applyToClass(
  decorator: ClassDecorator,
): PropertyDecorator & MethodDecorator & ParameterDecorator {
  return (target: object) => {
    decorator(target.constructor);
  };
}
