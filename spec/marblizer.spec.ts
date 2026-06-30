import { TestMessages, SubscriptionLog } from '../src/rxjs/types';
import { Marblizer } from '../src/marblizer';

describe('Marblizer test', () => {
  it('Should marblize TestMessages', () => {
    // First dash is frame 0; frames are 1ms each (frameStep = 1)
    // ---(be)----c-f-----|
    const sample: TestMessages = [
      { frame: 3, notification: { kind: 'N', value: 'b' } },
      { frame: 3, notification: { kind: 'N', value: 'e' } },
      { frame: 11, notification: { kind: 'N', value: 'c' } },
      { frame: 13, notification: { kind: 'N', value: 'f' } },
      { frame: 19, notification: { kind: 'C' } },
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----c-f-----|');
  });

  it('Should marblize TestMessages with error', () => {
    const sample: TestMessages = [
      { frame: 3, notification: { kind: 'N', value: 'b' } },
      { frame: 3, notification: { kind: 'N', value: 'e' } },
      { frame: 11, notification: { kind: 'E', error: null } },
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----#');
  });

  it('Should marblize TestMessages without completion', () => {
    const sample: TestMessages = [
      { frame: 3, notification: { kind: 'N', value: 'b' } },
      { frame: 11, notification: { kind: 'N', value: 'e' } },
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---b-------e');
  });

  it('Should marblize Subscriptions without completion', () => {
    const sample: SubscriptionLog[] = [{ subscribedFrame: 2, unsubscribedFrame: Infinity }];

    const marble = Marblizer.marblizeSubscriptions(sample);
    expect(marble).toEqual(['--^']);
  });

  it('Should marblize TestMessages without emission (but with completion)', () => {
    const sample: TestMessages = [{ frame: 11, notification: { kind: 'C' } }];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('-----------|');
  });

  it('Should marblize SubscriptionLogs', () => {
    const marble = Marblizer.marblizeSubscriptions([
      { subscribedFrame: 3, unsubscribedFrame: 6 },
      { subscribedFrame: 1, unsubscribedFrame: 5 },
    ]);
    expect(marble).toEqual(['---^--!', '-^---!']);
  });
});
