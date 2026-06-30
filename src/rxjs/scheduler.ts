import { Observable } from 'rxjs';
import { TestMessages } from './types';
import { TestScheduler } from 'rxjs/testing';

import { assertDeepEqual } from './assert-deep-equal';

const NEGATED = Symbol('jest-marbles-negated');

export class Scheduler {
  public static instance: TestScheduler | null;

  private static onFlush: (() => void)[] = [];
  private static currentAnimate: ((marbles: string) => void) | null = null;
  private static prevFrameTimeFactor = 0;

  public static init(): void {
    const scheduler = new TestScheduler(assertDeepEqual);
    (scheduler as any).runMode = true;
    scheduler.maxFrames = Infinity;
    Scheduler.instance = scheduler;
    Scheduler.onFlush = [];
    Scheduler.currentAnimate = null;
    Scheduler.prevFrameTimeFactor = TestScheduler.frameTimeFactor;
    TestScheduler.frameTimeFactor = 1;
  }

  public static get(): TestScheduler {
    if (Scheduler.instance) {
      return Scheduler.instance;
    }
    throw new Error('Scheduler is not initialized');
  }

  public static reset(): void {
    Scheduler.instance = null;
    Scheduler.currentAnimate = null;
  }

  private static flushTests(): any[] {
    return (Scheduler.get() as any)['flushTests'];
  }

  public static markLastNegated(): void {
    const tests = Scheduler.flushTests();
    tests[tests.length - 1][NEGATED] = true;
  }

  public static markLastReady(): void {
    const tests = Scheduler.flushTests();
    tests[tests.length - 1].ready = true;
  }

  public static queueOnFlush(fn: () => void): void {
    Scheduler.onFlush.push(fn);
  }

  private static installNegationAwareAssert(): void {
    const scheduler = Scheduler.get();
    const flushTests = Scheduler.flushTests();
    const hasNegated = flushTests.some((t) => t[NEGATED]);
    if (!hasNegated) {
      return;
    }
    const negatedSet = new WeakSet<object>(flushTests.filter((t) => t[NEGATED]));
    const readyTests = flushTests.filter((t) => t.ready);
    let callIndex = 0;

    (scheduler as any).assertDeepEqual = (actual: any, expected: any) => {
      const test = readyTests[callIndex++];
      if (test && negatedSet.has(test)) {
        let threw = false;
        try {
          assertDeepEqual(actual, expected);
        } catch {
          threw = true;
        }
        if (!threw) {
          throw new Error(
            'Expected observables to differ, but they matched.\n' +
              `  Received: ${JSON.stringify(actual)}\n` +
              `  Not expected: ${JSON.stringify(expected)}`
          );
        }
      } else {
        assertDeepEqual(actual, expected);
      }
    };
  }

  public static teardown(): void {
    const scheduler = Scheduler.get();
    Scheduler.installNegationAwareAssert();
    scheduler.run(() => {
      /* run() forces frameTimeFactor = 1 internally; no override needed */
    });
    while (Scheduler.onFlush.length > 0) {
      Scheduler.onFlush.shift()?.();
    }
    TestScheduler.frameTimeFactor = Scheduler.prevFrameTimeFactor;
    Scheduler.reset();
  }

  public static materializeInnerObservable(observable: Observable<any>, outerFrame: number): TestMessages {
    const scheduler = Scheduler.get();
    // @ts-expect-error to avoid code duplication
    return scheduler.materializeInnerObservable(observable, outerFrame);
  }
}
