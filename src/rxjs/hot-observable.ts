import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog } from '../rxjs/types';

import { Scheduler } from './scheduler';

export class HotObservable extends Observable<any> {
  source: ReturnType<TestScheduler['createHotObservable']>;
  constructor(public marbles: string, public values?: Record<string, any>, public error?: any) {
    super();

    this.source = Scheduler.get().createHotObservable(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
