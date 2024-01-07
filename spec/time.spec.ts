import { mapTo } from 'rxjs/operators';
import { timer } from 'rxjs';

import { hot, Scheduler, time } from '../index';

describe('', () => {
  it('Should delay the emission by provided timeout with provided scheduler', () => {
    const delay = time('-----d|');
    const provided = timer(delay, Scheduler.get()).pipe(mapTo(0));

    const expected = hot('------(d|)', { d: 0 });

    expect(provided).toBeObservable(expected);
  });

  it('Should ignore whitespace to allow vertical alignment', () => {
    const referenceDelay = time('-----d|');
    const alignedDelay = time('  -----d|');

    expect(alignedDelay).toBe(referenceDelay);
  });
});
