import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import '../jest/custom-matchers';

export type MessageOrSubscription = TestMessage[] | SubscriptionLog[];

function expectedIsSubscriptionLogArray(
  actual: MessageOrSubscription,
  expected: MessageOrSubscription
): expected is SubscriptionLog[] {
  return (
    (actual.length === 0 && expected.length === 0) || (expected.length !== 0 && expected[0] instanceof SubscriptionLog)
  );
}

function actualIsSubscriptionsAndExpectedIsEmpty(
  actual: MessageOrSubscription,
  expected: MessageOrSubscription
): actual is SubscriptionLog[] {
  return expected.length === 0 && actual.length !== 0 && actual[0] instanceof SubscriptionLog;
}

export function assertDeepEqual(actual: MessageOrSubscription, expected: MessageOrSubscription) {
  if (!expected) return;
  if (actualIsSubscriptionsAndExpectedIsEmpty(actual, expected)) {
    expect(actual).toHaveEmptySubscriptions();
  } else if (expectedIsSubscriptionLogArray(actual, expected)) {
    expect(actual).toBeSubscriptions(expected);
  } else {
    expect(actual).toBeNotifications(expected);
  }
}
