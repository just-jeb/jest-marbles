const {pcold, phot, ptest} = require('../umd/jest-marbles');

/**
 * Created by Evgeny Barabanov on 05/03/2018.
 */
describe('Imports test', () => {
    ptest('All the function should exist', () => {
        const c = pcold('a|');
        const h = phot('a|');
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
