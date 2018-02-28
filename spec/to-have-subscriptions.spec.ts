import {cold, hot} from '../index';
import {switchAll} from 'rxjs/operators';

describe('toHaveSubscriptions matcher', () => {

    it('Should figure out subscription points', () => {
        const x = cold(        '--a---b---c--|');
        const xsubs =    '------^-------!';
        const y = cold(                '---d--e---f---|');
        const ysubs =    '--------------^-------------!';
        const e1 = hot(  '------x-------y------|', { x, y });
        const expected = cold('--------a---b----d--e---f---|');

        expect(e1.pipe(switchAll())).toBeObservable(expected);
        expect(x).toHaveSubscriptions(xsubs);
        expect(y).toHaveSubscriptions(ysubs);
    });
});
