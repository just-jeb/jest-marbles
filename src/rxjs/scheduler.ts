import { Observable } from 'rxjs';
import { TestMessages } from './types';
import { TestScheduler } from 'rxjs/testing';

import { assertDeepEqual } from './assert-deep-equal';

export class Scheduler {
  public static instance: TestScheduler | null;

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

  public static materializeInnerObservable(observable: Observable<any>, outerFrame: number): TestMessages {
    const scheduler = Scheduler.get();
    // @ts-ignore
    return scheduler.materializeInnerObservable(observable, outerFrame);
  }
}
