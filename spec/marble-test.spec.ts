import { debounceTime } from 'rxjs';
import { cold, marbleTest } from '../index';

describe('marbleTest', () => {
  it(
    'runs jest-marbles assertions inside a real run() context',
    marbleTest(() => {
      const src = cold('a 250ms b|');
      expect(src.pipe(debounceTime(250))).toBeObservable(cold('250ms a 1ms (b|)'));
    })
  );

  it.skip(
    'composes with jest modifiers',
    marbleTest(() => {
      expect(cold('--a|')).toBeObservable(cold('--a|'));
    })
  );
});
