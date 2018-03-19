import { TestMessage } from 'rxjs/testing/TestMessage';

const frameStep = 10;

export class Marblizer {
  public marblize(messages: TestMessage[]): string {
    let openGroup = false;
    let previousMessage = { frame: -frameStep };
    let marble = '';
    let previousFrame = 0;
    for (const message of messages) {
      //Same notification group
      if (previousMessage.frame === message.frame) {
        if (!openGroup) {
          const lastChar = marble.charAt(marble.length - 1);
          marble = marble.slice(0, -1) + '(' + lastChar;
          openGroup = true;
          previousFrame += frameStep;
        }
      } else {
        //Different notifications groups
        if (openGroup) {
          //Close the group if open
          marble += ')';
          previousFrame += frameStep;
          openGroup = false;
        }
      }
      let nextChar;
      switch (message.notification.kind) {
        case 'N':
          nextChar = message.notification.value;
          break;
        case 'C':
          nextChar = '|';
          break;
        case 'E':
          nextChar = '#';
          break;
        default:
          throw Error('Unsupported notification kind');
      }
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
}
