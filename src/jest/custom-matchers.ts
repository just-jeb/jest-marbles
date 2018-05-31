import { Marblizer } from '../marblizer';
import diff from 'jest-diff';
import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils';
import { TestMessage } from 'rxjs/testing/TestMessage';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import chalk from 'chalk';

function haveValueObjects(actual: TestMessage[], expected: TestMessage[]) {
  return (
    actual.some(m => m.notification.value instanceof Object) ||
    expected.some(m => m.notification.value instanceof Object)
  );
}

export const customTestMatchers = {
  toBeNotifications(actual: TestMessage[], expected: TestMessage[]) {
    let actualMarble: string | TestMessage[];
    let expectedMarble: string | TestMessage[];

    if (haveValueObjects(actual, expected)) {
      actualMarble = actual;
      expectedMarble = expected;
    } else {
      actualMarble = Marblizer.marblize(actual);
      expectedMarble = Marblizer.marblize(expected);
    }

    const diffString = diff(expectedMarble, actualMarble, {
      expand: true,
    });

    const pass =
      actualMarble === expectedMarble || diffString === chalk.dim('Compared values have no visual difference.');

    const message = pass
      ? () =>
          matcherHint('.not.toBeNotifications') +
          '\n\n' +
          `Expected notifications to not be:\n` +
          `  ${printExpected(expectedMarble)}\n` +
          `But got:\n` +
          `  ${printReceived(actualMarble)}`
      : () => {
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
    interface Matchers<R> {
      toBeNotifications(notifications: TestMessage[]): void;

      toBeSubscriptions(subscriptions: SubscriptionLog[]): void;

      toHaveEmptySubscriptions(): void;
    }
  }
}

expect.extend(customTestMatchers);
