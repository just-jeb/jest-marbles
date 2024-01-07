import { TestMessages, SubscriptionLog } from '../rxjs/types';
import { Marblizer } from '../marblizer';

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
    if (canMarblize(actual, expected)) {
      actualMarble = Marblizer.marblize(actual);
      expectedMarble = Marblizer.marblize(expected);
    }
    const pass = this.equals(actualMarble, expectedMarble);

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
