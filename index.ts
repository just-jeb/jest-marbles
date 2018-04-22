import {ColdObservable} from './src/rxjs/cold-observable';
import {HotObservable} from './src/rxjs/hot-observable';
import {Scheduler} from './src/rxjs/scheduler';

export type ObservableWithSubscriptions = ColdObservable | HotObservable;

export {Scheduler} from './src/rxjs/scheduler';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeObservable(observable: ObservableWithSubscriptions): void;

      toHaveSubscriptions(marbles: string | string[]): void;

      toHaveNoSubscriptions(): void;

      toBeMarble(marble: string): void;
    }
  }
}

export function hot(marbles: string, values?: any, error?: any): HotObservable {
  return new HotObservable(marbles, values, error);
}

export function cold(marbles: string, values?: any, error?: any): ColdObservable {
  return new ColdObservable(marbles, values, error);
}

export function time(marbles: string): number {
  return Scheduler.get().createTime(marbles);
}

const dummyResult = {
  message: () => '',
  pass: true
};

expect.extend({

  toHaveSubscriptions(actual: ObservableWithSubscriptions, marbles: string | string[]) {
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(marbles);
    return dummyResult;
  },

  toHaveNoSubscriptions(actual: ObservableWithSubscriptions) {
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe([]);
    return dummyResult;
  },

  toBeObservable(actual: ObservableWithSubscriptions, expected: ObservableWithSubscriptions) {
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
    return dummyResult;
  },

  toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
    Scheduler.get().expectObservable(actual).toBe(marbles);
    return dummyResult;
  }
});


beforeEach(() => Scheduler.init());
afterEach(() => {
  Scheduler.get().flush();
  Scheduler.reset();
});
