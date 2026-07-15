import { delay, merge, Subject, switchMap, timer } from 'rxjs';
import { concat, mapTo } from 'rxjs/operators';
import { cold, hot, schedule, Scheduler, time } from '../index';

describe('toBeObservable matcher test', () => {
  it('Should concatenate two cold observables into single cold observable', () => {
    const a$ = cold('-a-|', { a: 0 });
    const b$ = cold('-b-|', { b: 1 });
    const expected = cold('-a--b-|', { a: 0, b: 1 });

    expect(a$.pipe(concat(b$))).toBeObservable(expected);
  });

  it('Should work for value objects', () => {
    const valueObject = { foo: 'bar' };
    const a$ = cold('-a-|', { a: valueObject });
    const expected = cold('-a-|', { a: valueObject });

    expect(a$).toBeObservable(expected);
  });

  it('should work for multi-character literals', () => {
    const falses$ = cold('--a-----b-----|');
    const trues$ = cold('-----a-----b--|');
    const expected = cold('--f--t--f--t--|', { t: true, f: false });
    const mapped = merge(falses$.pipe(mapTo(false)), trues$.pipe(mapTo(true)));

    expect(mapped).toBeObservable(expected);
  });

  it('should work for mixed literals', () => {
    const falses$ = cold('--a-----a-----|', { a: false });
    const trues$ = cold('-----b-----b--|', { b: true });
    const characters$ = cold('-------------c-|');
    const expected = cold('--f--t--f--t-c-|', { t: true, f: false, c: 'c' });
    const mapped = merge(falses$, trues$, characters$);

    expect(mapped).toBeObservable(expected);
  });

  it('Should work with undefined values', () => {
    const values$ = cold('u|', { u: undefined });
    const expected = cold('u|', { u: undefined });

    expect(values$).toBeObservable(expected);
  });

  it('Should merge two hot observables and start emitting from the subscription point', () => {
    const e1 = hot('----a--^--b-------c--|');
    const e2 = hot('---d-^--e---------f-----|');
    const expected = cold('---(be)----c-f-----|');

    expect(merge(e1, e2)).toBeObservable(expected);
  });

  it('Should delay the emission by provided timeout with provided scheduler', () => {
    const delay = time('-----d|');
    const provided = timer(delay, Scheduler.get()).pipe(mapTo(0));
    const expected = hot('------(d|)', { d: 0 });

    expect(provided).toBeObservable(expected);
  });

  it('Should ignore whitespace to allow vertical alignment', () => {
    const hotInput = hot('  ---^--a|');
    const coldInput = cold('   ---a|');
    const expected = cold('    ---a|');

    expect(hotInput).toBeObservable(expected);
    expect(coldInput).toBeObservable(expected);
  });

  it('Should work with asymmetric matchers', () => {
    const e$ = hot('-a', { a: { someprop: 'hey', x: { y: 1, z: 2 }, blah: '3' } });
    expect(e$).toBeObservable(
      cold('-b', {
        b: expect.objectContaining({
          x: expect.objectContaining({
            y: 1,
          }),
          blah: '3',
        }),
      })
    );
  });

  it('Should work with schedules', () => {
    const source = new Subject<string>();

    schedule(() => source.next('a'), 1);
    schedule(() => source.next('b'), 2);
    // With 1ms frames: schedule(fn, 1) fires at 1ms (frame 1), schedule(fn, 2) at 2ms (frame 2)
    const expected = cold('-ab');

    expect(source).toBeObservable(expected);
  });

  it('Should work with delays', () => {
    const source = cold('a');
    // delay(20) shifts by 20ms; with 1ms frames the expected marble uses time-progression syntax
    const expected = cold('20ms a');

    expect(source.pipe(delay(20))).toBeObservable(expected);
  });

  it('Should pass if the two objects have the same properties but in different order', () => {
    const e$ = hot('-a', { a: { someprop: 'hey', b: 1 } });
    expect(e$).toBeObservable(cold('-b', { b: { b: 1, someprop: 'hey' } }));
  });

  it('Should work with cold observables created during assertion execution', () => {
    const source = cold('a').pipe(switchMap(() => cold('--a')));
    const expected = cold('--a');

    expect(source).toBeObservable(expected);
  });

  it('should not throw for merged cold observables producing adjacent grouped emissions (#406)', () => {
    const values = { a: 1, b: 2, c: 3, d: 4 };
    const base = merge(cold('-ac', values), cold('-bd', values));

    expect(base).toBeObservable(cold('-(ab)(cd)', values));
  });

  describe('.not negation', () => {
    it('Should pass when observables differ (different marble strings)', () => {
      expect(cold('-a|')).not.toBeObservable(cold('-b|'));
    });

    it('Should pass when observables differ (different timing)', () => {
      expect(cold('-a|')).not.toBeObservable(cold('--a|'));
    });

    it('Should pass on different errors', () => {
      expect(cold('#', {}, 'A')).not.toBeObservable(cold('#', {}, 'B'));
    });

    it('Should pass when hot observable differs from cold', () => {
      expect(hot('-a-|')).not.toBeObservable(cold('--a|'));
    });
  });
});
