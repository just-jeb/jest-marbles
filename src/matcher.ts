import { TestMessage } from 'rxjs/testing/TestMessage';
import { Marblizer } from './marblizer';
import diff from 'jest-diff';
import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNotifications(notifications: TestMessage[]): void;

      toBeSubscriptions(subscriptions: SubscriptionLog[]): void;
    }
  }
}

export type MessageOrSubscription = TestMessage[] | SubscriptionLog[];

function expectedIsSubscriptionLogArray(
  actual: MessageOrSubscription,
  expected: MessageOrSubscription
): expected is SubscriptionLog[] {
  return (
    (actual.length === 0 && expected.length === 0) ||
    (actual.length !== 0 && actual[0] instanceof SubscriptionLog) ||
    (expected.length !== 0 && expected[0] instanceof SubscriptionLog)
  );
}

export function observableMatcher(actual: MessageOrSubscription, expected: MessageOrSubscription) {
  if (expectedIsSubscriptionLogArray(actual, expected)) {
    expect(actual).toBeSubscriptions(expected);
  } else {
    expect(actual).toBeNotifications(expected);
  }
}

export const customTestMatchers = {
  toBeNotifications(actual: TestMessage[], expected: TestMessage[]) {
    const actualMarble = Marblizer.marblize(actual);
    const expectedMarble = Marblizer.marblize(expected);

    const pass = actualMarble === expectedMarble;

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
};

expect.extend(customTestMatchers);

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
