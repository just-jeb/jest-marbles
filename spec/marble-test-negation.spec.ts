import { cold, marbleTest, Scheduler } from '../index';

describe('marbleTest negation', () => {
  it(
    'passes when observables differ under .not',
    marbleTest(() => {
      expect(cold('--a|')).not.toBeObservable(cold('--b|'));
    })
  );

  it('fails when observables match under .not', () => {
    const run = marbleTest(() => {
      expect(cold('--a|')).not.toBeObservable(cold('--a|'));
    });
    expect(run).toThrow(/Expected observables to differ/);
  });

  it('throws exactly once — no residual assertion leaks into teardown', () => {
    const run = marbleTest(() => {
      expect(cold('--a|')).not.toBeObservable(cold('--a|'));
    });
    expect(run).toThrow(/Expected observables to differ/);
    // The global afterEach flushes via Scheduler.get().run(() => {}); it must be a no-op now.
    expect(() => Scheduler.get().run(() => {})).not.toThrow();
  });
});
