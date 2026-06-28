import { cold, hot } from '../index';
import { switchAll } from 'rxjs/operators';

describe('toHaveSubscriptions matcher', () => {
  it('Should figure out single subscription points', () => {
    const x = cold('--a---b---c--|');
    const xsubs = '------^-------!';
    const y = cold('---d--e---f---|');
    const ysubs = '--------------^-------------!';
    const e1 = hot('------x-------y------|', { x, y });
    const expected = cold('--------a---b----d--e---f---|');

    expect(e1.pipe(switchAll())).toBeObservable(expected);
    expect(x).toHaveSubscriptions(xsubs);
    expect(y).toHaveSubscriptions(ysubs);
  });

  it('Should figure out multiple subscription points', () => {
    const x = cold('--a---b---c--|');

    const y = cold('----x---x|', { x });
    const ySubscription1 = '----^---!';
    //                                     '--a---b---c--|'
    const ySubscription2 = '--------^------------!';
    const expectedY = cold('------a---a---b---c--|');

    const z = cold('-x|', { x });
    //                                 '--a---b---c--|'
    const zSubscription = '-^------------!';
    const expectedZ = cold('---a---b---c--|');

    expect(y.pipe(switchAll())).toBeObservable(expectedY);
    expect(z.pipe(switchAll())).toBeObservable(expectedZ);

    expect(x).toHaveSubscriptions([ySubscription1, ySubscription2, zSubscription]);
  });

  it('Should verify that switchMap was not performed due to an error', () => {
    const x = cold('--a---b---c--|');
    const y = cold('---#-x--', { x });
    const result = y.pipe(switchAll());
    expect(result).toBeMarble('---#');
    expect(x).toHaveNoSubscriptions();
  });

  it('Should ignore whitespace to allow vertical alignment', () => {
    const x = hot('          -----a|');
    const expected = '       -----a|';
    const xSubscription = '  ^-----!';

    expect(x).toBeMarble(expected);
    expect(x).toHaveSubscriptions(xSubscription);
    expect(x).toHaveSubscriptions([xSubscription]);
  });

  describe('.not negation', () => {
    it('Should pass when observable has different subscription points than asserted', () => {
      const x = cold('--a---b---c--|');
      const y = cold('----x|', { x });
      const wrongSub = '----^--------!';

      expect(y.pipe(switchAll())).toBeMarble('------a---b---c--|');
      // x is subscribed at frame 4 (when y emits x), not matching wrongSub
      expect(x).not.toHaveSubscriptions(wrongSub);
    });

    it('toHaveNoSubscriptions should throw when negated', () => {
      const x = cold('--a|');
      expect(() => {
        expect(x).not.toHaveNoSubscriptions();
      }).toThrow('toHaveNoSubscriptions cannot be negated');
    });
  });
});
