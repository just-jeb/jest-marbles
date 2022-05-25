import { diff } from 'jest-diff';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { TestMessages, SubscriptionLog } from '../rxjs/types';
import { Marblizer } from '../marblizer';

// Hack from https://github.com/timkindberg/jest-when/commit/5a8cc93cf3f0b8f71c45d68a0c98c632eba1c35e
/**
 * A hack to capture a reference to the `equals` jasmineUtil
 */
// tslint:disable-next-line:no-empty
let equals: (a: unknown, b: unknown) => boolean = () => false;
expect.extend({
  // @ts-ignore
  __capture_equals__() {
    // @ts-ignore
    // tslint:disable-next-line:no-invalid-this
    equals = this.equals;
    return { pass: true };
  },
});
// @ts-ignore
expect(1).__capture_equals__();
const JEST_MATCHERS_OBJECT = Symbol.for('$$jest-matchers-object');
delete global[JEST_MATCHERS_OBJECT].matchers.__capture_equals__;
/**
 * End hack
 */

function canMarblize(...messages: TestMessages[]) {
  return messages.every(message => message.filter(({ notification: { kind } }) => kind === 'N').every(isCharacter));
}

function isCharacter({ notification }: TestMessages[0]): boolean {
  const value = (notification as any).value;
  return (
    (typeof value === 'string' && value.length === 1) || (value !== undefined && JSON.stringify(value).length === 1)
  );
}

export const customTestMatchers = {
  toBeNotifications(this: unknown, actual: TestMessages, expected: TestMessages) {
    let actualMarble: string | TestMessages = actual;
    let expectedMarble: string | TestMessages = expected;
    if (canMarblize(actual, expected)) {
      actualMarble = Marblizer.marblize(actual);
      expectedMarble = Marblizer.marblize(expected);
    }

    const pass = equals(actualMarble, expectedMarble);

    const message = pass
      ? () =>
          matcherHint('.not.toBeNotifications') +
          '\n\n' +
          `Expected notifications to not be:\n` +
          `  ${printExpected(expectedMarble)}\n` +
          `But got:\n` +
          `  ${printReceived(actualMarble)}`
      : () => {
          const diffString = diff(expectedMarble, actualMarble, {
            expand: true,
          });
          return (
            matcherHint('.toBeNotifications') +
            '\n\n' +
            `Expected notifications to be:\n` +
            `  ${printExpected(expectedMarble)}\n` +
            `But got:\n` +
            `  ${printReceived(actualMarble)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { actual, message, pass };
  },

  toBeSubscriptions(actual: SubscriptionLog[], expected: SubscriptionLog[]) {
    const actualMarbleArray = Marblizer.marblizeSubscriptions(actual);
    const expectedMarbleArray = Marblizer.marblizeSubscriptions(expected);

    const pass = subscriptionsPass(actualMarbleArray, expectedMarbleArray);
    const message = pass
      ? () =>
          matcherHint('.not.toHaveSubscriptions') +
          '\n\n' +
          `Expected observable to not have the following subscription points:\n` +
          `  ${printExpected(expectedMarbleArray)}\n` +
          `But got:\n` +
          `  ${printReceived(actualMarbleArray)}`
      : () => {
          const diffString = diff(expectedMarbleArray, actualMarbleArray, {
            expand: true,
          });
          return (
            matcherHint('.toHaveSubscriptions') +
            '\n\n' +
            `Expected observable to have the following subscription points:\n` +
            `  ${printExpected(expectedMarbleArray)}\n` +
            `But got:\n` +
            `  ${printReceived(actualMarbleArray)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { actual, message, pass };
  },

  toHaveEmptySubscriptions(actual: SubscriptionLog[] | undefined) {
    const pass = !(actual && actual.length > 0);
    let marbles: string[];
    if (actual && actual.length > 0) {
      marbles = Marblizer.marblizeSubscriptions(actual);
    }
    const message = pass
      ? () =>
          matcherHint('.not.toHaveNoSubscriptions') +
          '\n\n' +
          `Expected observable to have at least one subscription point, but got nothing` +
          printReceived('')
      : () =>
          matcherHint('.toHaveNoSubscriptions') +
          '\n\n' +
          `Expected observable to have no subscription points\n` +
          `But got:\n` +
          `  ${printReceived(marbles)}\n\n`;
    return { actual, message, pass };
  },
};

function subscriptionsPass(actualMarbleArray: string[], expectedMarbleArray: string[]): boolean {
  if (actualMarbleArray.length !== expectedMarbleArray.length) {
    return false;
  }
  let pass = true;
  for (const actualMarble of actualMarbleArray) {
    if (!expectedMarbleArray.includes(actualMarble)) {
      pass = false;
      break;
    }
  }
  return pass;
}

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeNotifications(notifications: TestMessages): void;

      toBeSubscriptions(subscriptions: SubscriptionLog[]): void;

      toHaveEmptySubscriptions(): void;
    }
  }
}

expect.extend(customTestMatchers);
