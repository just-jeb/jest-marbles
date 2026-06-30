import { RunHelpers } from 'rxjs/internal/testing/TestScheduler';
import { Scheduler } from './rxjs/scheduler';

export function marbleTest(fn: () => void): () => void {
  return () => {
    Scheduler.get().run((helpers: RunHelpers) => {
      Scheduler.captureAnimate(helpers.animate);
      fn();
      Scheduler.installNegationAwareAssert();
    });
  };
}
