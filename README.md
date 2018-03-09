# jest-marbles 
[![npm version](https://badge.fury.io/js/jest-marbles.svg)](https://badge.fury.io/js/jest-marbles) [![Build Status](https://travis-ci.org/meltedspark/jest-marbles.svg?branch=master)](https://travis-ci.org/meltedspark/jest-marbles) ![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


A set of helper functions and jest matchers for RxJs marble testing.

# Usage

```sh
npm i jest-marbles -D
```

In the test file:

```js
import {cold, hot, time} from 'jest-marbles';
```

## toBeObservable

```js
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

```js
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

```js
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


