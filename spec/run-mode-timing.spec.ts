import { debounceTime } from 'rxjs';
import { cold, time } from '../index';

describe('run-mode timing', () => {
  it('time() counts 1ms per frame char', () => {
    expect(time('-----|')).toBe(5);
  });

  it('parses time-progression syntax', () => {
    const src = cold('a 250ms b|');
    const expected = cold('a 250ms b|');
    expect(src).toBeObservable(expected);
  });

  it('virtualizes debounceTime against real durations', () => {
    const src = cold('a 250ms b|');
    // debounceTime(250) emits 'a' at 250ms (debounce fires), then 'b' at 252ms (source
    // completes at 251ms flushing the buffered value, but after the +1ms debounce reset)
    expect(src.pipe(debounceTime(250))).toBeObservable(cold('250ms a 1ms (b|)'));
  });
});
