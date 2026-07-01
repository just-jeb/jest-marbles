import { delay, of, timestamp } from 'rxjs';
import { cold, marbleTest } from '../index';

describe('marbleTest fake async', () => {
  it(
    'virtualizes delay() (which uses the default async scheduler)',
    marbleTest(() => {
      // of('x') emits synchronously at frame 0; delay(5) shifts to frame 5 in virtual time
      expect(of('x').pipe(delay(5))).toBeObservable(cold('5ms (x|)'));
    })
  );

  it(
    'virtualizes the RxJS clock (Date.now equivalent) for the system under test',
    marbleTest(() => {
      // timestamp() reads dateTimestampProvider.now(), which TestScheduler.run() virtualizes.
      // After a 5ms delay, the virtual clock reads 5 — so timestamp is 5.
      // NOTE: raw setTimeout / Date.now() are NOT virtualized (only RxJS scheduler-based
      // operators use the patched providers). This test confirms the RxJS clock path.
      const source = of('x').pipe(delay(5), timestamp());
      expect(source).toBeObservable(cold('5ms (a|)', { a: { value: 'x', timestamp: 5 } }));
    })
  );
});
