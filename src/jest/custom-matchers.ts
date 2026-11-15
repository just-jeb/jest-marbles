import { TestMessages, SubscriptionLog } from '../rxjs/types';
import { Marblizer } from '../marblizer';

function kindsAndValues(messages: TestMessages) {
  return messages.map(({ notification }) => ({
    kind: notification.kind,
    value: notification.kind === 'N' ? notification.value : undefined,
    error: notification.kind === 'E' ? notification.error : undefined,
  }));
}

function canMarblize(...messages: TestMessages[]) {
  return messages.every(isMessagesMarblizable);
}

function isMessagesMarblizable(messages: TestMessages): boolean {
  return messages.every(
    ({ notification }) =>
      notification.kind === 'C' ||
      (notification.kind === 'E' && notification.error === 'error') ||
      (notification.kind === 'N' && isCharacter(notification.value))
  );
}

function isCharacter(value: any): boolean {
  return (
    (typeof value === 'string' && value.length === 1) || (value !== undefined && JSON.stringify(value).length === 1)
  );
}

export const customTestMatchers: jest.ExpectExtendMap = {
  toBeNotifications(actual: TestMessages, expected: TestMessages) {
    let actualMarble: string | TestMessages = actual;
    let expectedMarble: string | TestMessages = expected;
    let pass: boolean;
    if (canMarblize(actual, expected)) {
      const actualString = Marblizer.marblize(actual);
      const expectedString = Marblizer.marblize(expected);
      // Comparing marble strings keeps the frame tolerance users rely on (an emission that lands inside
      // a preceding group's span, see #406). The string is lossy about values, though: 1 and '1', or a
      // '|' value and a completion, render the same. So the kinds and values are compared as well.
      const marblesMatch = this.equals(actualString, expectedString);
      pass = marblesMatch && this.equals(kindsAndValues(actual), kindsAndValues(expected));
      // Identical strings would hide a value-only mismatch in the failure message; show the
      // notifications themselves in that case.
      if (pass || !marblesMatch) {
        actualMarble = actualString;
        expectedMarble = expectedString;
      }
    } else {
      pass = this.equals(actual, expected);
    }

    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toBeNotifications') +
          '\n\n' +
          `Expected notifications to not be:\n` +
          `  ${this.utils.printExpected(expectedMarble)}\n` +
          `But got:\n` +
          `  ${this.utils.printReceived(actualMarble)}`
      : () => {
          const diffString = this.utils.diff(expectedMarble, actualMarble, {
            expand: true,
          });
          return (
            this.utils.matcherHint('.toBeNotifications') +
            '\n\n' +
            `Expected notifications to be:\n` +
            `  ${this.utils.printExpected(expectedMarble)}\n` +
            `But got:\n` +
            `  ${this.utils.printReceived(actualMarble)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { message, pass };
  },

  toBeSubscriptions(actual: SubscriptionLog[], expected: SubscriptionLog[]) {
    const actualMarbleArray = Marblizer.marblizeSubscriptions(actual);
    const expectedMarbleArray = Marblizer.marblizeSubscriptions(expected);

    const pass = subscriptionsPass(actualMarbleArray, expectedMarbleArray);
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveSubscriptions') +
          '\n\n' +
          `Expected observable to not have the following subscription points:\n` +
          `  ${this.utils.printExpected(expectedMarbleArray)}\n` +
          `But got:\n` +
          `  ${this.utils.printReceived(actualMarbleArray)}`
      : () => {
          const diffString = this.utils.diff(expectedMarbleArray, actualMarbleArray, {
            expand: true,
          });
          return (
            this.utils.matcherHint('.toHaveSubscriptions') +
            '\n\n' +
            `Expected observable to have the following subscription points:\n` +
            `  ${this.utils.printExpected(expectedMarbleArray)}\n` +
            `But got:\n` +
            `  ${this.utils.printReceived(actualMarbleArray)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { message, pass };
  },

  toHaveEmptySubscriptions(actual: SubscriptionLog[] | undefined) {
    const pass = !(actual && actual.length > 0);
    let marbles: string[];
    if (actual && actual.length > 0) {
      marbles = Marblizer.marblizeSubscriptions(actual);
    }
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveNoSubscriptions') +
          '\n\n' +
          `Expected observable to have at least one subscription point, but got nothing` +
          this.utils.printReceived('')
      : () =>
          this.utils.matcherHint('.toHaveNoSubscriptions') +
          '\n\n' +
          `Expected observable to have no subscription points\n` +
          `But got:\n` +
          `  ${this.utils.printReceived(marbles)}\n\n`;
    return { message, pass };
  },
};

function subscriptionsPass(actualMarbleArray: string[], expectedMarbleArray: string[]): boolean {
  if (actualMarbleArray.length !== expectedMarbleArray.length) {
    return false;
  }
  // Multiset comparison: each expected entry can match at most one actual entry.
  const remaining = [...expectedMarbleArray];
  for (const actualMarble of actualMarbleArray) {
    const index = remaining.indexOf(actualMarble);
    if (index === -1) {
      return false;
    }
    remaining.splice(index, 1);
  }
  return true;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R extends void | Promise<void>> {
      toBeNotifications(notifications: TestMessages): R;

      toBeSubscriptions(subscriptions: SubscriptionLog[]): R;

      toHaveEmptySubscriptions(): R;
    }
  }
}

expect.extend(customTestMatchers);
