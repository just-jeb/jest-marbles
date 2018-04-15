import { TestMessage } from 'rxjs/testing/TestMessage';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import '../jest/custom-matchers';

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

export function assertDeepEqual(actual: MessageOrSubscription, expected: MessageOrSubscription) {
  if (expectedIsSubscriptionLogArray(actual, expected)) {
    expect(actual).toBeSubscriptions(expected);
  } else {
    expect(actual).toBeNotifications(expected);
  }
}
