import { cold, marbleTest } from '../index';

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
});
