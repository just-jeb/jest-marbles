import { Observable } from 'rxjs';
import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { TestScheduler, RunHelpers } from 'rxjs/internal/testing/TestScheduler';

import { assertDeepEqual } from './assert-deep-equal';

export class Scheduler {
  public static instance: TestScheduler | null;
  public static helpers: RunHelpers;

  public static init(): void {
    Scheduler.instance = new TestScheduler(assertDeepEqual);
  }

  public static get(): TestScheduler {
    if (Scheduler.instance) {
      return Scheduler.instance;
    }
    throw new Error('Scheduler is not initialized');
  }

  public static reset(): void {
    Scheduler.instance = null;
  }

  public static run<T>(callback: (helpers: RunHelpers) => T): T {
    return Scheduler.instance!.run(callback);
  }
}
