import { Observable } from 'rxjs';
import { TestMessages } from './types';
import { TestScheduler } from 'rxjs/testing';

import { assertDeepEqual } from './assert-deep-equal';

export class Scheduler {
  private static instance: TestScheduler | null;
  private static onFlushCallbacks: (() => void)[] = [];

  public static init(): void {
    this.instance = new TestScheduler(assertDeepEqual);
    this.onFlushCallbacks = [];
  }

  public static get(): TestScheduler {
    if (this.instance) {
      return this.instance;
    }
    throw new Error('Scheduler is not initialized');
  }

  public static reset(): void {
    this.instance = null;
    this.onFlushCallbacks = [];
  }

  public static onFlush(callback: () => void): void {
    this.onFlushCallbacks.push(callback);
  }

  public static flush(): void {
    this.get().run(() => {});
    while (this.onFlushCallbacks.length > 0) {
      this.onFlushCallbacks.shift()?.();
    }
    this.reset();
  }

  public static materializeInnerObservable(observable: Observable<any>, outerFrame: number): TestMessages {
    const scheduler = Scheduler.get();
    // @ts-expect-error to avoid code duplication
    return scheduler.materializeInnerObservable(observable, outerFrame);
  }
}
