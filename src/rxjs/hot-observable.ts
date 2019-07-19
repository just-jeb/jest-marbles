import { Observable } from 'rxjs';
import { HotObservable as RxJsHotObservable } from 'rxjs/internal/testing/HotObservable';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';

import { Scheduler } from './scheduler';

export class HotObservable<T = string> extends Observable<any> {
  source: RxJsHotObservable<any>;
  constructor(
    public marbles: string,
    public values?: {
      [marble: string]: T;
    },
    public error?: any
  ) {
    super();

    this.source = Scheduler.get().createHotObservable(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
