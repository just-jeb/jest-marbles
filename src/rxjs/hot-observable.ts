import { Observable } from 'rxjs/Observable';
import { HotObservable as RxJsHotObservable } from './internal/HotObservable';
import { SubscriptionLog } from './internal/SubscriptionLog';

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
