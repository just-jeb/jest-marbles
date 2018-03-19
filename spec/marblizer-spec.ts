import {Marblizer} from '../src/marblizer';
import {TestMessage} from 'rxjs/testing/TestMessage';
import {Notification} from 'rxjs';

describe('Marblizer test', () => {
  let marblizer = new Marblizer();
  it('Should work', () => {
    //First dash is frame 0
    //---(be)----c-f-----|
    const sample: TestMessage[] = [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 30, notification: new Notification('N', 'e')},
      {frame: 110, notification: new Notification('N', 'c')},
      {frame: 130, notification: new Notification('N', 'f')},
      {frame: 190, notification: new Notification('C')}
    ];

    const marble = marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----c-f-----|');
  })
});
