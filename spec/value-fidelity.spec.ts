import { cold, hot } from '../index';
import { of, merge, take } from 'rxjs';

describe('notifications that marblize to the same string (#729)', () => {
  it('distinguishes a number from a string with the same character', () => {
    expect(of(1)).not.toBeObservable(cold('(a|)', { a: '1' }));
    expect(of(1)).toBeObservable(cold('(a|)', { a: 1 }));
  });

  it('distinguishes a "|" value from a completion', () => {
    expect(cold('a', { a: '|' })).not.toBeObservable(cold('|'));
  });

  it('distinguishes a "-" value from an empty frame', () => {
    expect(cold('a|', { a: '-' })).not.toBeObservable(cold('-|'));
  });

  it('distinguishes a number from a string inside a group', () => {
    expect(of(1, 2, 3)).not.toBeObservable(cold('(123|)'));
    expect(of(1, 2, 3)).toBeObservable(cold('(abc|)', { a: 1, b: 2, c: 3 }));
  });

  it('keeps the frame tolerance for emissions inside a group span (#406) but still checks values', () => {
    const values = { a: 1, b: 2, c: 3, d: 4 };
    const base = merge(cold('-ac', values), cold('-bd', values));
    expect(base).toBeObservable(cold('-(ab)(cd)', values));
    expect(merge(cold('-ac', values), cold('-bd', values))).not.toBeObservable(
      cold('-(ab)(cd)', { ...values, c: '3' })
    );
  });

  it('compares the default error and completion as before', () => {
    expect(cold('a#')).toBeObservable(cold('a#'));
    expect(cold('a#')).not.toBeObservable(cold('a|'));
  });

  it('still matches equal values', () => {
    expect(of('a')).toBeObservable(cold('(a|)'));
    expect(cold('a|', { a: '-' })).toBeObservable(cold('a|', { a: '-' }));
  });
});

describe('duplicate subscription logs (#729)', () => {
  it('does not let one expected entry match two actual entries', () => {
    const src = cold('--a-------|');
    expect(merge(src, src)).toBeObservable(cold('--(aa)----|'));
    expect(src).not.toHaveSubscriptions(['^---------!', '--^-------!']);
  });

  it('matches identical duplicates', () => {
    const src = cold('--a-------|');
    expect(merge(src, src)).toBeObservable(cold('--(aa)----|'));
    expect(src).toHaveSubscriptions(['^---------!', '^---------!']);
  });

  it('counts subscriptions that never unsubscribe', () => {
    const src = hot('--a--');
    expect(merge(src, src)).toBeObservable(cold('--(aa)'));
    expect(src).toHaveSubscriptions(['^', '^']);
  });

  it('does not let one never-ending expected entry match two actual entries', () => {
    const src = hot('--a--');
    const other = cold('--b|');
    expect(merge(src, src.pipe(take(1)), other)).toBeObservable(cold('--(aab)'));
    expect(src).not.toHaveSubscriptions(['^', '^']);
  });
});
