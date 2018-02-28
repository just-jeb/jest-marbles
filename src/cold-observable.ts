import { Observable } from 'rxjs/Observable'
import { ColdObservable as RxJsColdObservable } from 'rxjs/testing/ColdObservable'
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog'

import { Scheduler } from './scheduler'

export class ColdObservable extends Observable<any> {
  source: RxJsColdObservable<any>
  constructor(public marbles: string, public values?: any[], public error?: any) {
    super()

    this.source = Scheduler.get().createColdObservable(marbles, values, error)
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions
  }
}
