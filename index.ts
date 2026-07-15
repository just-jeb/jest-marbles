import { ColdObservable } from './src/rxjs/cold-observable';
import { HotObservable } from './src/rxjs/hot-observable';
import { Scheduler } from './src/rxjs/scheduler';
import { stripAlignmentChars } from './src/rxjs/strip-alignment-chars';
import { Observable, Subscription } from 'rxjs';

export type ObservableWithSubscriptions = ColdObservable<any> | HotObservable<any>;

export { Scheduler } from './src/rxjs/scheduler';
export { marbleTest } from './src/marble-test';
export { animate } from './src/animate';

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
      Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);
      Scheduler.markLastNegated();
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
      Scheduler.expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
      Scheduler.markObservableNegated(actual);
      return dummyFail;
    }
    Scheduler.expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
    return dummyPass;
  },

  toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
    if (this.isNot) {
      Scheduler.expectObservable(actual).toBe(stripAlignmentChars(marbles));
      Scheduler.markObservableNegated(actual);
      return dummyFail;
    }
    Scheduler.expectObservable(actual).toBe(stripAlignmentChars(marbles));
    return dummyPass;
  },

  toSatisfyOnFlush(actual: ObservableWithSubscriptions, func: () => void) {
    if (this.isNot) {
      throw new Error('toSatisfyOnFlush cannot be negated');
    }
    Scheduler.expectObservable(actual);
    Scheduler.markObservableReady(actual);
    Scheduler.queueOnFlush(func);
    return dummyPass;
  },
});

beforeEach(() => {
  Scheduler.init();
});

afterEach(() => {
  Scheduler.teardown();
});
