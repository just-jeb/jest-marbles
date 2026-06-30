# jest-marbles
[![npm version](https://badge.fury.io/js/jest-marbles.svg)](https://badge.fury.io/js/jest-marbles) ![Build Status](https://github.com/just-jeb/jest-marbles/actions/workflows/build.yml/badge.svg?branch=master) ![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)



A set of helper functions and Jest matchers for RxJs marble testing.
This library will help you to test your reactive code in easy and clear way.

# Features
 - Typescript
 - Marblized error messages

# Prerequisites
 - Jest
 - RxJs
 - Familiarity with [marbles syntax](https://rxjs.dev/guide/testing/marble-testing#marble-syntax)

# v4 migration (run mode)

v4 runs rxjs's `TestScheduler` in **run mode**:

- **Frames are 1ms each (was 10).** `time('--|')` now returns `2`, not `20`.
  Re-baseline any hard-coded frame numbers.
- **Marble diagrams are unchanged** — `cold('--a--b|')` vs `cold('--a--b|')`
  still passes; both sides shift by the same factor.
- **`TestScheduler.frameTimeFactor` is no longer honored.** Express durations
  with time-progression syntax: `cold('a 250ms b|')`.
- **Time operators use real virtual time.** For example, `debounceTime(250)` on
  `cold('a 250ms b|')` yields `cold('250ms a 1ms (b|)')` — `a` debounces out
  at 250ms and `b` flushes on completion 1ms later.
- **New `marbleTest`** for tests that need `animate()`, virtualized
  `setTimeout`/`Date.now`, or imperative time control:

```js
it('drives animationFrames', marbleTest(() => {
  animate('--x--x');
  expect(source$).toBeObservable(cold('--a--(b|)'));
}));
```

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
import { cold, hot, time, schedule, marbleTest, animate } from 'jest-marbles';
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

## schedule
Allows you to schedule task on specified frame
```js
  it('should verify subject values', () => {
    const source = new Subject();
    const expected = cold('ab');

    schedule(() => source.next('a'), 1);
    schedule(() => source.next('b'), 2);

    expect(source).toBeObservable(expected);
  });
```

## time-progression syntax
Use `Nms`, `Ns`, or `Nm` inside a marble string to express large durations without drawing every frame:
```js
  it('debounces emissions', marbleTest(() => {
    const src = cold('a 250ms b|');
    expect(src.pipe(debounceTime(250))).toBeObservable(cold('250ms a 1ms (b|)'));
  }));
```

## marbleTest
Wraps a test body in a real `TestScheduler.run()` context. Use this when you need `animate()`, virtualized `setTimeout`/`Date.now`, or imperative time control. Pass the return value directly to `it`:
```js
  it(
    'runs assertions inside a real run() context',
    marbleTest(() => {
      const src = cold('a 250ms b|');
      expect(src.pipe(debounceTime(250))).toBeObservable(cold('250ms a 1ms (b|)'));
    })
  );
```

## animate
Only valid inside `marbleTest`. Drives `animationFrames`-based timing by scheduling virtual animation-frame ticks at the positions marked in the marble string:
```js
  it(
    'drives animationFrames-based timing',
    marbleTest(() => {
      animate('--x--x');
      const src = animationFrames().pipe(
        map(({ elapsed }) => elapsed),
        take(2)
      );
      expect(src).toBeObservable(cold('--a--(b|)', { a: 2, b: 5 }));
    })
  );
```




