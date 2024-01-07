import { describe, expect, it } from '@jest/globals';
import { cold } from '../index';

describe('', () => {
  it('Should have typing for expect imported from globals', () => {
    const a$ = cold('a', { a: 3 });

    expect(a$).toBeObservable(a$);
  });
});
