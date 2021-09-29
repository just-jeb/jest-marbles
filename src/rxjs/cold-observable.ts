import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog } from '../rxjs/types';

import { Scheduler } from './scheduler';

export class ColdObservable extends Observable<any> {
  source: ReturnType<TestScheduler['createColdObservable']>;
  constructor(public marbles: string, public values?: Record<string, any>, public error?: any) {
    super();

    this.source = Scheduler.get().createColdObservable(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
