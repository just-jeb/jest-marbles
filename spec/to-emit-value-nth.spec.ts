import { cold, Scheduler } from '../index';

describe('toEmitValueNth matcher test', () => {
  describe('positive cases', () => {
    it('Should pass if observable completes', () => {
      const a$ = cold('a-b-|');

      expect(a$).toEmitValueNth('b', 1);
    });

    it('Should pass if observable never completes', () => {
      const a$ = cold('a-b-');

      expect(a$).toEmitValueNth('b', 1);
    });
  });

  describe('negative cases', () => {
    it('Should fail if other value emits', () => {
      const a$ = cold('a-b-|');

      expect(a$).toEmitValueNth('a', 1);
    });

    it('Should fail if no values emitted', () => {
      const a$ = cold('---');

      expect(a$).toEmitValueNth('a', 1);
    });

    it('Should fail if no values emitted and completed', () => {
      const a$ = cold('---|');

      expect(a$).toEmitValueNth('a', 1);
    });

    afterEach(() => {
      expect(() => Scheduler.flush()).toThrowErrorMatchingSnapshot();
      Scheduler.init();
    });
  });
});
