import { Scheduler } from 'rxjs/Scheduler';
import { SubscriptionLog } from './SubscriptionLog';

export abstract class SubscriptionLoggable {
  public subscriptions: SubscriptionLog[] = [];
  abstract scheduler: Scheduler;

  logSubscribedFrame(): number {
    this.subscriptions.push(new SubscriptionLog(this.scheduler.now()));
    return this.subscriptions.length - 1;
  }

  logUnsubscribedFrame(index: number) {
    const subscriptionLogs = this.subscriptions;
    const oldSubscriptionLog = subscriptionLogs[index];
    subscriptionLogs[index] = new SubscriptionLog(oldSubscriptionLog.subscribedFrame, this.scheduler.now());
  }
}
