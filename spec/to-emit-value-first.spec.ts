import { cold, Scheduler } from '../index';

describe('toEmitValueFirst matcher test', () => {
  describe('positive cases', () => {
    it('Should pass if observable completes', () => {
      const a$ = cold('a-|');

      expect(a$).toEmitValueFirst('a');
    });

    it('Should pass if observable not completes', () => {
      const a$ = cold('a---');

      expect(a$).toEmitValueFirst('a');
    });

    it('Should pass if value emits later', () => {
      const a$ = cold('---a---');

      expect(a$).toEmitValueFirst('a');
    });

    it('Should pass if multiple value emits later', () => {
      const a$ = cold('---a--b---');

      expect(a$).toEmitValueFirst('a');
    });
  });

  describe('negative cases', () => {
    it('Should fail if other value emits', () => {
      const a$ = cold('---b---');

      expect(a$).toEmitValueFirst('a');
    });

    it('Should fail if no values emitted', () => {
      const a$ = cold('---');

      expect(a$).toEmitValueFirst('a');
    });

    it('Should fail if no values emitted and completed', () => {
      const a$ = cold('---|');

      expect(a$).toEmitValueFirst('a');
    });

    afterEach(() => {
      expect(() => Scheduler.flush()).toThrowErrorMatchingSnapshot();
      Scheduler.init();
    });
  });
});
