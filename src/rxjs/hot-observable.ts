import { Observable } from 'rxjs';
import { HotObservable as RxJsHotObservable } from 'rxjs/internal/testing/HotObservable';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';

import { Scheduler } from './scheduler';

export class HotObservable extends Observable<any> {
  source: RxJsHotObservable<any>;
  constructor(public marbles: string, public values?: any[], public error?: any) {
    super();

    this.source = Scheduler.get().createHotObservable(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
