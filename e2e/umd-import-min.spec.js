const {cold, hot, time} = require('../umd/jest-marbles.min');

/**
 * Created by Evgeny Barabanov on 05/03/2018.
 */
describe('Imports test', () => {

  it('All the function should exist', () => {
    const c = cold('a|');
    const h = hot('a|');
    const t = time('a|');
    expect(c).not.toBeNull();
    expect(h).not.toBeNull();
    expect(t).not.toBeNull();
  });

  it('Should work with value objects', () => {
    const c = cold('--a-|', {a: {prop: "blah"}});
    expect(c).toBeObservable(cold('--a-|', {a: {prop: "blah"}}));
  });

});
