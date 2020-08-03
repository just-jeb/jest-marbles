const {pcold, phot, ptest} = require('../umd/jest-marbles');

/**
 * Created by Evgeny Barabanov on 05/03/2018.
 */
describe('Imports test', () => {
    ptest.only.each([['a|', 'a|'], ['b|', 'b|']])('All the function should exist: %s ::: %s', (a, b) => {
        console.log(a, b)
        const c = pcold(a);
        const h = phot(b);
      //  const t = time('a|');
        expect(c).not.toBeNull();
        expect(h).not.toBeNull();
      //  expect(t).not.toBeNull();
    });

    ptest('Should work with value objects', () => {
      const c = pcold('--a-|', {a: {prop: "blah"}});
      expect(c).ptoBeObservable(pcold('--a-|', {a: {prop: "blah"}}));
    });

});
