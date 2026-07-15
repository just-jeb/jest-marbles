import { cold } from '../index';
import { tap } from 'rxjs/operators';

describe('toSatisfyOnFlush', () => {
  it('should verify mock has been called', () => {
    const mock = jest.fn();
    const stream$ = cold('blah|').pipe(tap(mock));
    expect(stream$).toSatisfyOnFlush(() => {
      expect(mock).toHaveBeenCalledTimes(4);
    });
  });

  it('should throw when negated', () => {
    const stream$ = cold('a|');
    expect(() => {
      expect(stream$).not.toSatisfyOnFlush(() => {
        // intentionally empty
      });
    }).toThrow('toSatisfyOnFlush cannot be negated');
  });

  it('does not double-subscribe when toBeObservable also targets the same observable (#395)', () => {
    const mock = jest.fn();
    const coldObservable = cold('blah|');
    const stream$ = coldObservable.pipe(tap(mock));

    expect(stream$).toBeObservable(coldObservable);
    expect(stream$).toSatisfyOnFlush(() => {
      expect(mock).toHaveBeenCalledTimes(4);
    });
  });

  it('marks the correct flush-test by reference when another observable is interleaved (#395)', () => {
    const flushMock = jest.fn();
    const a$ = cold('--a|');
    const b$ = cold('--b|');

    // a$ is cached first via toSatisfyOnFlush (no assertion set yet on its flush-test).
    expect(a$).toSatisfyOnFlush(flushMock);
    // b$ pushes a second, unrelated flush-test entry in between.
    expect(b$).toBeObservable(cold('--b|'));
    // Reuses a$'s cached flush-test (cache hit, no new push) and negates it against a
    // deliberately mismatching marble. If negation-marking were positional (last pushed),
    // it would incorrectly negate b$'s entry instead of a$'s, causing this assertion to
    // throw (as "expect to differ" logic would apply to b$'s matching entry instead) and
    // leaving a$'s genuinely-mismatching entry to fail a plain equality check. Correct,
    // reference-based marking means this passes cleanly: a$ vs '--z|' are recognized as
    // differing, as expected under `.not`.
    expect(a$).not.toBeObservable(cold('--z|'));
  });
});
