import { Observable } from 'rxjs';
import { HotObservable as RxHotObservable } from 'rxjs/internal/testing/HotObservable';
import { SubscriptionLog } from '../rxjs/types';

import { Scheduler } from './scheduler';

export class HotObservable<T = unknown> extends Observable<T> {
  source: RxHotObservable<T>;
  constructor(
    public marbles: string,
    public values?: Record<string, T>,
    public error?: any
  ) {
    super();

    this.source = Scheduler.get().createHotObservable<T>(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
