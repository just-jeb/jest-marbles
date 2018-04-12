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

export function observableMatcher(
  actual: TestMessage[] | SubscriptionLog[],
  expected: TestMessage[] | SubscriptionLog[]
) {
  if (actual[0] instanceof SubscriptionLog && expected[0] instanceof SubscriptionLog) {
    expect(actual).toBeSubscriptions(expected as SubscriptionLog[]);
  } else {
    expect(actual).toBeNotifications(expected as TestMessage[]);
  }
}

expect.extend({
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

    const actualMarble = actualMarbleArray.length === 1 ? actualMarbleArray[0] : actualMarbleArray;
    const expectedMarble = expectedMarbleArray.length === 1 ? expectedMarbleArray[0] : expectedMarbleArray;

    const pass = JSON.stringify(actualMarble) === JSON.stringify(expectedMarble);
    const message = pass
      ? () =>
          matcherHint('.not.toHaveSubscriptions') +
          '\n\n' +
          `Expected observable to not have the following subscription points:\n` +
          `  ${printExpected(expectedMarble)}\n` +
          `But got:\n` +
          `  ${printReceived(actualMarble)}`
      : () => {
          const diffString = diff(expectedMarble, actualMarble, {
            expand: true,
          });
          return (
            matcherHint('.toHaveSubscriptions') +
            '\n\n' +
            `Expected observable to have the following subscription points:\n` +
            `  ${printExpected(expectedMarble)}\n` +
            `But got:\n` +
            `  ${printReceived(actualMarble)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { actual, message, pass };
  },
});
