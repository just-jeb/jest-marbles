import { ColdObservable } from './src/rxjs/cold-observable';
import { HotObservable } from './src/rxjs/hot-observable';
import { Scheduler } from './src/rxjs/scheduler';
import { stripAlignmentChars } from './src/rxjs/strip-alignment-chars';
import type { Global } from '@jest/types';

export type ObservableWithSubscriptions = ColdObservable | HotObservable;

export { Scheduler } from './src/rxjs/scheduler';

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeObservable(observable: ObservableWithSubscriptions): void;

      ptoBeObservable(observable: ObservableWithSubscriptions): void;

      toHaveSubscriptions(marbles: string | string[]): void;

      toHaveNoSubscriptions(): void;

      toBeMarble(marble: string): void;

      toSatisfyOnFlush(func: () => void): void;
    }
  }
}

export function hot(marbles: string, values?: any, error?: any): HotObservable {
  return new HotObservable(stripAlignmentChars(marbles), values, error);
}

export function cold(marbles: string, values?: any, error?: any): ColdObservable {
  return new ColdObservable(stripAlignmentChars(marbles), values, error);
}

export function time(marbles: string): number {
  return Scheduler.get().createTime(stripAlignmentChars(marbles));
}

export function phot(marbles: string, values?: any, error?: any) {
  return Scheduler.helpers.hot(stripAlignmentChars(marbles), values, error);
}

export function pcold(marbles: string, values?: any, error?: any) {
  return new ColdObservable(stripAlignmentChars(marbles), values, error, true);
}



const scheduledFunctionRunner = (fn?: (...args: any[]) => any) => (...args: any[]) => {
  Scheduler.run((helpers) => {
    Scheduler.helpers = helpers;
    fn?.(...args);
  });
};

const testHandler: ProxyHandler<jest.It> = {
  apply: (target, thisArg, [testName, fn, timeout]: Parameters<jest.It>) => {
    target(testName, scheduledFunctionRunner(fn), timeout);
  },
  get: (target, p) => {
    const handler = p === 'each' ? eachHandler : testHandler;
    return new Proxy(target[p], handler);
  }
};

const eachHandler: ProxyHandler<jest.Each> =  {
  apply: (target, thisArg, [first, second]): ReturnType<jest.Each> => {
    // second element exists only in case of template function
    return (testName, fn, timeout) => {
      console.log('Args to each', first, second);
      const testRunner = second ? target(first, second) : target(first);
      testRunner(testName, scheduledFunctionRunner(fn), timeout);
    };
  }
};

export const ptest = new Proxy(test, testHandler);

const dummyResult = {
  message: () => '',
  pass: true
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
    console.log(expected);
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
    return dummyResult;
  },

  ptoBeObservable(actual, expected: ObservableWithSubscriptions) {
    Scheduler.helpers.expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
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
    onFlush.push(func);
    return dummyResult;
  }
});

let onFlush: (() => void)[] = [];

beforeEach(() => {
  Scheduler.init();
  onFlush = [];

});
afterEach(() => {
  Scheduler.get().flush();
  Scheduler.helpers?.flush();
  while (onFlush.length > 0) {
    // @ts-ignore
    onFlush.shift()();
  }
  Scheduler.reset();
});
