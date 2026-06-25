const { cold, hot, time } = require('../dist/index.js');
require('jest-marbles'); // register matchers against the running jest instance

describe('CJS import', () => {
  it('exposes the public functions', () => {
    expect(cold('a|')).not.toBeNull();
    expect(hot('a|')).not.toBeNull();
    expect(time('a|')).not.toBeNull();
  });

  it('works with value objects', () => {
    expect(cold('--a-|', { a: { prop: 'blah' } })).toBeObservable(cold('--a-|', { a: { prop: 'blah' } }));
  });
});
