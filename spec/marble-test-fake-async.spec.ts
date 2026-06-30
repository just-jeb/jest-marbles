import { delay, of } from 'rxjs';
import { cold, marbleTest } from '../index';

describe('marbleTest fake async', () => {
  it(
    'virtualizes delay() (which uses the default async scheduler)',
    marbleTest(() => {
      // of('x') emits synchronously at frame 0; delay(5) shifts to frame 5 in virtual time
      expect(of('x').pipe(delay(5))).toBeObservable(cold('5ms (x|)'));
    })
  );
});
