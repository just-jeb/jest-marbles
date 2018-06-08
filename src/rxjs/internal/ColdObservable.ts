import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Scheduler } from 'rxjs/Scheduler';
import { TestMessage } from './TestMessage';
import { SubscriptionLog } from './SubscriptionLog';
import { SubscriptionLoggable } from './SubscriptionLoggable';
import { applyMixins } from 'rxjs/util/applyMixins';
import { Subscriber } from 'rxjs/Subscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ColdObservable<T> extends Observable<T> implements SubscriptionLoggable {
  public subscriptions: SubscriptionLog[] = [];
  scheduler: Scheduler;
  logSubscribedFrame!: () => number;
  logUnsubscribedFrame!: (index: number) => void;

  constructor(public messages: TestMessage[], scheduler: Scheduler) {
    super(function(this: Observable<T>, subscriber: Subscriber<any>) {
      const observable: ColdObservable<T> = this as any;
      const index = observable.logSubscribedFrame();
      subscriber.add(
        new Subscription(() => {
          observable.logUnsubscribedFrame(index);
        })
      );
      observable.scheduleMessages(subscriber);
      return subscriber;
    });
    this.scheduler = scheduler;
  }

  scheduleMessages(subscriber: Subscriber<any>) {
    const messagesLength = this.messages.length;
    for (let i = 0; i < messagesLength; i++) {
      const message = this.messages[i];
      subscriber.add(
        // tslint:disable:no-shadowed-variable
        this.scheduler.schedule(state => state && state.message.notification.observe(state.subscriber), message.frame, {
          message,
          subscriber,
        })
      );
    }
  }
}
applyMixins(ColdObservable, [SubscriptionLoggable]);
