import {Marblizer} from '../src/marblizer';
import {TestMessage} from 'rxjs/testing/TestMessage';
import {Notification} from 'rxjs';
import {SubscriptionLog} from 'rxjs/testing/SubscriptionLog';

describe('Marblizer test', () => {
  // TODO: test error
  // TODO: test without completion
  // TODO: test without emission (but with completion)

  it('Should marblize TestMessages', () => {
    // First dash is frame 0
    // ---(be)----c-f-----|
    const sample: TestMessage[] = [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 30, notification: new Notification('N', 'e')},
      {frame: 110, notification: new Notification('N', 'c')},
      {frame: 130, notification: new Notification('N', 'f')},
      {frame: 190, notification: new Notification('C')}
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----c-f-----|');
  });

  it('Should marblize SubscriptionLogs', () => {
    const marble = Marblizer.marblizeSubscriptions([new SubscriptionLog(30, 60), new SubscriptionLog(10, 50)]);
    expect(marble).toEqual(['---^--!', '-^---!']);
  });


});
