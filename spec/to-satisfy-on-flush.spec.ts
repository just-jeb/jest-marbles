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
});
