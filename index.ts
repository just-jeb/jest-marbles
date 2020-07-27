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

export const ptest = new Proxy(test, {
  apply: (target, thisArg, [testName, fn, timeout]: Parameters<Global.ItBase>) => {
    target(testName, () => {
      Scheduler.run((helpers) => {
        Scheduler.helpers = helpers;
        fn();
      });
    }, timeout);
  },
  // get: (target, p) => {

  // }
});

// export const ptest: Global.It = Object.assign(
//   (testName: Global.TestName, fn: Global.TestFn, timeout?: number): void => {
//     test(testName, () => {
//       Scheduler.run((helpers) => {
//         Scheduler.helpers = helpers;
//         fn();
//       });
//     }, timeout);
//   },
//   /**
//    * Only runs this test in the current file.
//    */
//   {
//     only: test.only,
//     /**
//      * Skips running this test in the current file.
//      */
//     skip: test.skip,
//     /**
//      * Sketch out which tests to write in the future.
//      */
//     todo: test.todo,

//     each: test.each
//   }
// );

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
