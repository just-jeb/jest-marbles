import { Observable } from 'rxjs';
import { ColdObservable as RxColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { SubscriptionLog } from '../rxjs/types';

import { Scheduler } from './scheduler';

export class ColdObservable<T = unknown> extends Observable<T> {
  source: RxColdObservable<T>;
  constructor(
    public marbles: string,
    public values?: Record<string, T>,
    public error?: any
  ) {
    super();

    this.source = Scheduler.get().createColdObservable<T>(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
