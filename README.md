# jest-marbles
[![npm version](https://badge.fury.io/js/jest-marbles.svg)](https://badge.fury.io/js/jest-marbles) [![Build Status](https://travis-ci.org/just-jeb/jest-marbles.svg?branch=master)](https://travis-ci.org/just-jeb/jest-marbles) ![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


A set of helper functions and Jest matchers for RxJs marble testing.
This library will help you to test your reactive code in easy and clear way.

# Features
 - Typescript
 - Marblized error messages

# Prerequisites
 - Jest
 - RxJs
 - Familiarity with [marbles syntax](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md)

# Not supported (but planning to)
 - Time progression syntax

# Usage

For RxJs 7:
```sh
npm i jest-marbles@latest -D
```

For RxJs 6:
```sh
npm i jest-marbles@2 -D
```

For RxJs 5:
```sh
npm i jest-marbles@1 -D
```

In the test file:

```js
import {cold, hot, time} from 'jest-marbles';
```

Inside the test:

```js
expect(stream).toBeObservable(expected);
expect(stream).toBeMarble(marbleString);
expect(stream).toHaveSubscriptions(marbleString);
expect(stream).toHaveSubscriptions(marbleStringsArray);
expect(stream).toHaveNoSubscriptions();
expect(stream).toSatisfyOnFlush(() => {
  expect(someMock).toHaveBeenCalled();
})
```

# Examples

## toBeObservable
Verifies that the resulting stream emits certain values at certain time frames
```js
    it('Should merge two hot observables and start emitting from the subscription point', () => {
        const e1 = hot('----a--^--b-------c--|', {a: 0});
        const e2 = hot('  ---d-^--e---------f-----|', {a: 0});
        const expected = cold('---(be)----c-f-----|', {a: 0});

        expect(e1.pipe(merge(e2))).toBeObservable(expected);
    });
```
Sample output when the test fails (if change the expected result to `'-d--(be)----c-f-----|'`):
```
Expected notifications to be:
  "-d--(be)----c-f-----|"
But got:
  "---(be)----c-f-----|"
```

## toBeMarble
Same as `toBeObservable` but receives marble string instead
```js
    it('Should concatenate two cold observables into single cold observable', () => {
        const a = cold('-a-|');
        const b = cold('-b-|');
        const expected = '-a--b-|';
        expect(a.pipe(concat(b))).toBeMarble(expected);
    });
```

## toHaveSubscriptions
Verifies that the observable was subscribed in the provided time frames.
Useful, for example, when you want to verify that particular `switchMap` worked as expected:
```js
  it('Should figure out single subscription points', () => {
    const x = cold('        --a---b---c--|');
    const xsubs = '   ------^-------!';
    const y = cold('                ---d--e---f---|');
    const ysubs = '   --------------^-------------!';
    const e1 = hot('  ------x-------y------|', { x, y });
    const expected = cold('--------a---b----d--e---f---|');

    expect(e1.pipe(switchAll())).toBeObservable(expected);
    expect(x).toHaveSubscriptions(xsubs);
    expect(y).toHaveSubscriptions(ysubs);
  });
```
The matcher can also accept multiple subscription marbles:
```js
  it('Should figure out multiple subscription points', () => {
    const x = cold('                    --a---b---c--|');

    const y = cold('                ----x---x|', {x});
    const ySubscription1 = '        ----^---!';
    //                                     '--a---b---c--|'
    const ySubscription2 = '        --------^------------!';
    const expectedY = cold('        ------a---a---b---c--|');

    const z = cold('                   -x|', {x});
    //                                 '--a---b---c--|'
    const zSubscription = '            -^------------!';
    const expectedZ = cold('           ---a---b---c--|');

    expect(y.pipe(switchAll())).toBeObservable(expectedY);
    expect(z.pipe(switchAll())).toBeObservable(expectedZ);

    expect(x).toHaveSubscriptions([ySubscription1, ySubscription2, zSubscription]);
  });
```
Sample output when the test fails (if change `ySubscription1` to `'-----------------^---!'`):
```
Expected observable to have the following subscription points:
  ["-----------------^---!", "--------^------------!", "-^------------!"]
But got:
  ["-^------------!", "----^---!", "--------^------------!"]
```

## toHaveNoSubscriptions
Verifies that the observable was not subscribed during the test.
Especially useful when you want to verify that certain chain was not called due to an error:
```js
  it('Should verify that switchMap was not performed due to an error', () => {
    const x = cold('--a---b---c--|');
    const y = cold('---#-x--', {x});
    const result = y.pipe(switchAll());
    expect(result).toBeMarble('---#');
    expect(x).toHaveNoSubscriptions();
  });
```
Sample output when the test fails (if remove error and change the expected marble to `'------a---b---c--|'`):
```
Expected observable to have no subscription points
But got:
  ["----^------------!"]
```

## toSatisfyOnFlush
Allows you to assert on certain side effects/conditions that should be satisfied when the observable has been flushed (finished)
```js
  it('should verify mock has been called', () => {
      const mock = jest.fn();
      const stream$ = cold('blah|').pipe(tap(mock));
      expect(stream$).toSatisfyOnFlush(() => {
          expect(mock).toHaveBeenCalledTimes(4);
      });
  })
```




