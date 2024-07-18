import { cold, Scheduler } from '../index';

describe('toEmitValueLast matcher test', () => {
  describe('positive cases', () => {
    it('Should pass if observable completes', () => {
      const a$ = cold('b-|');

      expect(a$).toEmitValueLast('b');
    });

    it('Should pass if value emits later', () => {
      const a$ = cold('---b---|');

      expect(a$).toEmitValueLast('b');
    });

    it('Should pass if multiple value emits later', () => {
      const a$ = cold('---a--b---|');

      expect(a$).toEmitValueLast('b');
    });
  });

  describe('negative cases', () => {
    it('Should fail if other value emits', () => {
      const a$ = cold('---a---|');

      expect(a$).toEmitValueLast('b');
    });

    it('Should fail if observable never completes', () => {
      const a$ = cold('---b---');

      expect(a$).toEmitValueLast('b');
    });

    it('Should fail if no values emitted', () => {
      const a$ = cold('---');

      expect(a$).toEmitValueLast('a');
    });

    it('Should fail if no values emitted and completed', () => {
      const a$ = cold('---|');

      expect(a$).toEmitValueLast('a');
    });

    afterEach(() => {
      expect(() => Scheduler.flush()).toThrowErrorMatchingSnapshot();
      Scheduler.init();
    });
  });
});
