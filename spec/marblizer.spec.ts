import {Marblizer} from '../src/marblizer';
import {TestMessage} from '../src/rxjs/internal/TestMessage';
import {Notification} from 'rxjs';
import {SubscriptionLog} from '../src/rxjs/internal/SubscriptionLog';

describe('Marblizer test', () => {
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

  it('Should marblize TestMessages with error', () => {
    const sample: TestMessage[] = [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 30, notification: new Notification('N', 'e')},
      {frame: 110, notification: new Notification('E')}
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----#');
  });

  it('Should marblize TestMessages without completion', () => {
    const sample: TestMessage[] = [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---b-------e');
  });

  it('Should marblize TestMessages without emission (but with completion)', () => {
    const sample: TestMessage[] = [
      {frame: 110, notification: new Notification('C')}
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('-----------|');
  });

  it('Should throw exception if there was any unsupported notification kind', () => {
    const sample: TestMessage[] = [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('A', 'e')}
    ];
    expect(() => Marblizer.marblize(sample)).toThrow('Unsupported notification kind');
  });

  it('Should marblize SubscriptionLogs', () => {
    const marble = Marblizer.marblizeSubscriptions([new SubscriptionLog(30, 60), new SubscriptionLog(10, 50)]);
    expect(marble).toEqual(['---^--!', '-^---!']);
  });


});
