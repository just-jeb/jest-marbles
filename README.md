# jest-marbles

A set of jest matchers for marble testing integrated with RxJs test scheduler.

#Usage

```
npm i jest-marbles -D
```

In the test file:

```
import {cold, hot, time} from 'jest-marbles';
```

## toBeObservable

```
describe('Test', () => {
    it('Should merge two hot observables and start emitting from the subscription point', () => {
        const e1 = hot('----a--^--b-------c--|', {a: 0});
        const e2 = hot(  '---d-^--e---------f-----|', {a: 0});
        const expected = cold('---(be)----c-f-----|', {a: 0});

        expect(e1.pipe(merge(e2))).toBeObservable(expected);
    });
}
```

## toBeMarble

```
describe('Test', () => {
    it('Should concatenate two cold observables into single cold observable', () => {
        const a$ = cold('-a-|');
        const b$ = cold('-b-|');
        const expected = '-a--b-|';
        expect(a$.pipe(concat(b$))).toBeMarble(expected);
    });
}
```

## toHaveSubscriptions

```
describe('Test', () => {
    it('Should figure out subscription points', () => {
        const x = cold(        '--a---b---c--|');
        const xsubs =    '------^-------!';
        const y = cold(                '---d--e---f---|');
        const ysubs =    '--------------^-------------!';
        const e1 = hot(  '------x-------y------|', { x, y });
        const expected = cold('--------a---b----d--e---f---|');

        expect(e1.pipe(switchAll())).toBeObservable(expected);
        expect(x).toHaveSubscriptions(xsubs);
        expect(y).toHaveSubscriptions(ysubs);
    });
}
```


