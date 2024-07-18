import { ColdObservable } from './src/rxjs/cold-observable';
import { HotObservable } from './src/rxjs/hot-observable';
import { Scheduler } from './src/rxjs/scheduler';
import { stripAlignmentChars } from './src/rxjs/strip-alignment-chars';
import { Observable, skip, Subscription, take, takeLast } from 'rxjs';
import { toEmitValue } from './src/to-emit-value';

export type ObservableWithSubscriptions = ColdObservable | HotObservable;

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

      toEmitValueFirst(value: unknown): R;

      toEmitValueLast(value: unknown): R;

      toEmitValueNth(value: unknown, index: number): R;
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
    toEmitValueFirst(value: unknown): R;
    toEmitValueLast(value: unknown): R;
    toEmitValueNth(value: unknown, index: number): R;
  }
}

export function hot(marbles: string, values?: object, error?: object): HotObservable {
  return new HotObservable(stripAlignmentChars(marbles), values, error);
}

export function cold(marbles: string, values?: object, error?: object): ColdObservable {
  return new ColdObservable(stripAlignmentChars(marbles), values, error);
}

export function time(marbles: string): number {
  return Scheduler.get().createTime(stripAlignmentChars(marbles));
}

export function schedule(work: () => void, delay: number): Subscription {
  return Scheduler.get().schedule(work, delay);
}

const dummyResult = {
  message: () => '',
  pass: true,
};

expect.extend({
  toHaveSubscriptions(actual: ObservableWithSubscriptions, marbles: string | string[]) {
    const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(stripAlignmentChars) : stripAlignmentChars(marbles);
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);
    return dummyResult;
  },

  toHaveNoSubscriptions(actual: ObservableWithSubscriptions) {
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe([]);
    return dummyResult;
  },

  toBeObservable(actual, expected: ObservableWithSubscriptions) {
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
    return dummyResult;
  },

  toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
    Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));
    return dummyResult;
  },

  toSatisfyOnFlush(actual: ObservableWithSubscriptions, func: () => void) {
    Scheduler.get().expectObservable(actual);
    // tslint:disable:no-string-literal
    const flushTests = Scheduler.get()['flushTests'];
    flushTests[flushTests.length - 1].ready = true;
    Scheduler.onFlush(func);
    return dummyResult;
  },

  toEmitValueFirst(observable: Observable<unknown>, expectedValue: unknown) {
    toEmitValue(observable.pipe(take(1)), expectedValue);

    return dummyResult;
  },

  toEmitValueLast(observable: Observable<unknown>, expectedValue: unknown) {
    toEmitValue(observable.pipe(takeLast(1)), expectedValue);

    return dummyResult;
  },

  toEmitValueNth(observable: Observable<unknown>, expectedValue: unknown, index: number) {
    toEmitValue(observable.pipe(skip(index), take(1)), expectedValue);

    return dummyResult;
  },
});

beforeEach(() => {
  Scheduler.init();
});
afterEach(() => {
  Scheduler.flush();
  Scheduler.reset();
});
