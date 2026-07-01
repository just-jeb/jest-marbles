import { animationFrames } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { animate, cold, marbleTest } from '../index';

describe('animate', () => {
  it('throws when used outside marbleTest', () => {
    expect(() => animate('--x')).toThrow('animate() can only be used inside marbleTest()');
  });

  it(
    'drives animationFrames-based timing inside marbleTest',
    marbleTest(() => {
      animate('--x--x');
      const src = animationFrames().pipe(
        map(({ elapsed }) => elapsed),
        take(2)
      );
      expect(src).toBeObservable(cold('--a--(b|)', { a: 2, b: 5 }));
    })
  );
});
