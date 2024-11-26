import { Observable } from 'rxjs';
import { TestMessages } from './rxjs/types';
import { COMPLETE_NOTIFICATION, errorNotification, nextNotification } from './rxjs/notification-factories';
import { assertDeepEqual } from './rxjs/assert-deep-equal';
import { Scheduler } from './rxjs/scheduler';

export function toEmitValue(observable: Observable<unknown>, expectedValue: unknown): void {
  const actual: TestMessages = [];
  const expected: TestMessages = [];
  const flushTest = { actual, expected, ready: false };

  Scheduler.get().schedule(() => {
    observable.subscribe({
      next: (value) => {
        actual.push({ frame: Scheduler.get().frame, notification: nextNotification(value) });
        expected.push({ frame: Scheduler.get().frame, notification: nextNotification(expectedValue) });
        flushTest.ready = true;
      },
      error: (error) => {
        actual.push({ frame: Scheduler.get().frame, notification: errorNotification(error) });
        expected.push({ frame: Scheduler.get().frame, notification: nextNotification(expectedValue) });
        flushTest.ready = true;
      },
      complete: () => {
        actual.push({ frame: Scheduler.get().frame, notification: COMPLETE_NOTIFICATION });
        if (!expected.length) {
          expected.push({ frame: Scheduler.get().frame, notification: nextNotification(expectedValue) });
        }
        expected.push({ frame: Scheduler.get().frame, notification: COMPLETE_NOTIFICATION });
        flushTest.ready = true;
      },
    });
  }, 0);

  Scheduler.get()['flushTests'].push(flushTest);

  Scheduler.onFlush(() => {
    expected.push({ frame: 0, notification: nextNotification(expectedValue) });
    expected.push({ frame: 0, notification: COMPLETE_NOTIFICATION });
    if (!flushTest.ready) {
      assertDeepEqual(actual, expected);
    }
  });
}
