import { RunHelpers } from 'rxjs/internal/testing/TestScheduler';
import { Scheduler } from './rxjs/scheduler';

export function marbleTest(fn: () => void): () => void {
  return () => {
    try {
      Scheduler.get().run((helpers: RunHelpers) => {
        Scheduler.captureAnimate(helpers.animate);
        fn();
        Scheduler.installNegationAwareAssert();
      });
    } finally {
      Scheduler.clearFlushTests();
    }
  };
}
