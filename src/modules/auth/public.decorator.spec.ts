import { Public } from '@/modules/auth/public.decorator';
import { Reflector } from '@nestjs/core';

test('@Public() is a ReflectableDecorator', () => {
  expect(Public().KEY).toEqual(expect.any(String));
});

describe('Reflector.getAllAndOverride(Public(), [...])', () => {
  class Controller {
    @Public()
    marked() {}
    unmarked() {}
  }
  const controller = new Controller();
  const reflector = new Reflector();

  test('A method marked with @Public() is reported as public', () => {
    expect(
      reflector.getAllAndOverride<boolean>(Public(), [Controller, controller.marked]),
    ).toBeTruthy();
  });

  test('A method not marked with @Public() is not reported as public', () => {
    expect(
      reflector.getAllAndOverride<boolean>(Public(), [Controller, controller.unmarked]),
    ).not.toBeTruthy();
  });
});
