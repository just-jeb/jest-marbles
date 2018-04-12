import { TestMessage } from 'rxjs/testing/TestMessage';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { MarblesGlossary } from './marbles-glossary';
import { NotificationKindChars } from './notification-kind';

const frameStep = 10;

export class Marblizer {
  public static marblize(messages: TestMessage[]): string {
    let openGroup = false;
    let previousMessage = { frame: -frameStep };
    let marble = '';
    let previousFrame = 0;
    for (const message of messages) {
      // Same notification group
      if (previousMessage.frame === message.frame) {
        if (!openGroup) {
          const lastChar = marble.charAt(marble.length - 1);
          marble = marble.slice(0, -1) + MarblesGlossary.GroupStart + lastChar;
          openGroup = true;
          previousFrame += frameStep;
        }
      } else {
        // Different notifications groups
        if (openGroup) {
          // Close the group if open
          marble += MarblesGlossary.GroupEnd;
          previousFrame += frameStep;
          openGroup = false;
        }
      }
      const nextChar = NotificationKindChars[message.notification.kind] || message.notification.value;
      if (nextChar === undefined) throw Error('Unsupported notification kind');

      const frames = (message.frame - previousFrame) / frameStep;
      if (frames > 0) {
        marble += '-'.repeat(frames);
        previousFrame = message.frame;
      }
      marble += nextChar;
      previousFrame += frameStep;

      previousMessage = message;
    }

    return marble;
  }

  public static marblizeSubscriptions(logs: SubscriptionLog[]): string[] {
    return logs.map(
      log =>
        MarblesGlossary.TimeFrame.repeat(log.subscribedFrame / frameStep) +
        MarblesGlossary.Subscription +
        MarblesGlossary.TimeFrame.repeat((log.unsubscribedFrame - log.subscribedFrame) / frameStep - 1) +
        MarblesGlossary.Unsubscription
    );
  }
}
