import { ColdObservable } from './src/rxjs/cold-observable';
import { HotObservable } from './src/rxjs/hot-observable';
import { Scheduler } from './src/rxjs/scheduler';
import { stripAlignmentChars } from './src/rxjs/strip-alignment-chars';
import { assertDeepEqual } from './src/rxjs/assert-deep-equal';
import { Observable, Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

export type ObservableWithSubscriptions = ColdObservable<any> | HotObservable<any>;

export { Scheduler } from './src/rxjs/scheduler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R extends void | Promise<void>> {
      toBeObservable(observable: ObservableWithSubscriptions): R;

      toHaveSubscriptions(marbles: string | string[]): R;

      toHaveNoSubscriptions(): R;

      toBeMarble(marble: string): R;

      toSatisfyOnFlush(func: () => void): R;
    }
  }
}

declare module 'expect' {
  interface Matchers<R extends void | Promise<void>> {
    toBeObservable(observable: ObservableWithSubscriptions): R;
    toHaveSubscriptions(marbles: string | string[]): R;
    toHaveNoSubscriptions(): R;
    toBeMarble(marble: string): R;
    toSatisfyOnFlush(func: () => void): R;
  }
}

export function hot<T = unknown>(marbles: string, values?: Record<string, T>, error?: any): HotObservable<T> {
  return new HotObservable<T>(stripAlignmentChars(marbles), values, error);
}

export function cold<T = unknown>(marbles: string, values?: Record<string, T>, error?: any): ColdObservable<T> {
  return new ColdObservable<T>(stripAlignmentChars(marbles), values, error);
}

export function time(marbles: string): number {
  return Scheduler.get().createTime(stripAlignmentChars(marbles));
}

export function schedule(work: () => void, delay: number): Subscription {
  return Scheduler.get().schedule(work, delay);
}

/**
 * Symbol used to tag flushTest objects that should be asserted as NOT equal.
 * We tag the object directly so the mark survives independent of array index.
 */
const NEGATED = Symbol('jest-marbles-negated');

const dummyPass = {
  message: () => '',
  pass: true,
};

const dummyFail = {
  message: () => '',
  pass: false,
};

expect.extend({
  toHaveSubscriptions(actual: ObservableWithSubscriptions, marbles: string | string[]) {
    const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(stripAlignmentChars) : stripAlignmentChars(marbles);
    if (this.isNot) {
      const flushTests: any[] = Scheduler.get()['flushTests'];
      // Register the flush test first, then tag the object that was just added.
      Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);
      flushTests[flushTests.length - 1][NEGATED] = true;
      return dummyFail;
    }
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);
    return dummyPass;
  },

  toHaveNoSubscriptions(actual: ObservableWithSubscriptions) {
    if (this.isNot) {
      throw new Error('toHaveNoSubscriptions cannot be negated — use toHaveSubscriptions instead');
    }
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe([]);
    return dummyPass;
  },

  toBeObservable(actual: Observable<unknown>, expected: ObservableWithSubscriptions) {
    if (this.isNot) {
      const flushTests: any[] = Scheduler.get()['flushTests'];
      Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
      flushTests[flushTests.length - 1][NEGATED] = true;
      return dummyFail;
    }
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
    return dummyPass;
  },

  toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
    if (this.isNot) {
      const flushTests: any[] = Scheduler.get()['flushTests'];
      Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));
      flushTests[flushTests.length - 1][NEGATED] = true;
      return dummyFail;
    }
    Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));
    return dummyPass;
  },

  toSatisfyOnFlush(actual: ObservableWithSubscriptions, func: () => void) {
    if (this.isNot) {
      throw new Error('toSatisfyOnFlush cannot be negated');
    }
    Scheduler.get().expectObservable(actual);
    // tslint:disable:no-string-literal
    const flushTests = Scheduler.get()['flushTests'];
    flushTests[flushTests.length - 1].ready = true;
    onFlush.push(func);
    return dummyPass;
  },
});

let onFlush: (() => void)[] = [];

beforeEach(() => {
  Scheduler.init();
  onFlush = [];
});

afterEach(() => {
  const scheduler = Scheduler.get();
  const flushTests: any[] = scheduler['flushTests'];
  const hasNegated = flushTests.some((t) => t[NEGATED]);

  if (hasNegated) {
    // Replace assertDeepEqual with a wrapper that inverts the check for negated tests.
    // The wrapper is called once per ready flushTest, in the same order as flushTests.
    // We use a WeakSet of tagged test objects so we can look up the tag by object identity.
    const negatedSet = new WeakSet<object>(flushTests.filter((t) => t[NEGATED]));
    // Track which flushTest object is currently being processed.
    // We walk through flushTests in order and match each assertDeepEqual call to its test.
    const readyTests = flushTests.filter((t) => t.ready);
    let callIndex = 0;

    (scheduler as any).assertDeepEqual = (actual: any, expected: any) => {
      const test = readyTests[callIndex++];
      if (test && negatedSet.has(test)) {
        // Negated assertion: succeed if actual ≠ expected, fail if they're equal.
        let threw = false;
        try {
          assertDeepEqual(actual, expected);
        } catch {
          threw = true;
        }
        if (!threw) {
          throw new Error(
            'Expected observables to differ, but they matched.\n' +
              `  Received: ${JSON.stringify(actual)}\n` +
              `  Not expected: ${JSON.stringify(expected)}`
          );
        }
        // They differ → .not passes → do nothing (swallow the would-be failure).
      } else {
        assertDeepEqual(actual, expected);
      }
    };
  }

  scheduler.run(() => {
    TestScheduler.frameTimeFactor = 10;
  });

  while (onFlush.length > 0) {
    onFlush.shift()?.();
  }
  Scheduler.reset();
});
