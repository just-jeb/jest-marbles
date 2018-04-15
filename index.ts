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

expect.extend({
    toHaveSubscriptions(actual: ObservableWithSubscriptions, marbles: string | string[]) {
        Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(marbles);

        return {
            message: () => `expected ${actual} to have following subscriptions: ${marbles}`,
            pass:    true
        };
    },

    toBeObservable(actual: ObservableWithSubscriptions, expected: ObservableWithSubscriptions) {
        Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);

        return {
            message: () => `expected ${actual} to be the following observable: ${expected}`,
            pass:    true
        };
    },

    toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
        Scheduler.get().expectObservable(actual).toBe(marbles);
        return {
            message: () => `expected ${actual} to be the following marble: ${marbles}`,
            pass:    true
        };
    }
});


beforeEach(() => Scheduler.init());
afterEach(() => {
    Scheduler.get().flush();
    Scheduler.reset();
});
