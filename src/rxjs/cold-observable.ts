import { Observable } from 'rxjs';
import { ColdObservable as RxJsColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';

import { Scheduler } from './scheduler';

export class ColdObservable extends Observable<any> {
  source: RxJsColdObservable<any>;
  constructor(public marbles: string, public values?: any[], public error?: any, runMode?: boolean) {
    super();

    this.source = runMode
      ? Scheduler.helpers.cold(marbles, values, error)
      : Scheduler.get().createColdObservable(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
