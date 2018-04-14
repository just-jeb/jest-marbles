const jestExpect = expect;

jest.mock('jest-diff');
jest.mock('jest-matcher-utils');

import {Marblizer} from '../src/marblizer';
import {observableMatcher} from '../src/matcher';
import {SubscriptionLog} from 'rxjs/testing/SubscriptionLog';
import {Notification} from 'rxjs';

const subscriptionsMock = jest.fn();
Marblizer.marblizeSubscriptions = subscriptionsMock;
subscriptionsMock.mockReturnValueOnce([]).mockReturnValueOnce(['foo','bar']);

const matchersMock = {toBeSubscriptions: jest.fn(), toBeNotifications: jest.fn()};
const expectMock = jest.fn(() => matchersMock);
global.expect = expectMock;
// expectMock.mockReturnValue(customTestMatchers);

describe('observableMatcher test', ()=>{
  beforeEach(() => {
    matchersMock.toBeNotifications.mockClear();
    matchersMock.toBeSubscriptions.mockClear();
  });

  it('Should call subscriptions matcher if received arrays of subscriptions', () => {
    observableMatcher([
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)
    ],[
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)
    ])
    jestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('Should call subscriptions matcher if actual is empty array and expected is array of subscriptions', () => {
    observableMatcher([],[
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)])
    jestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('Should call subscriptions matcher if expected is empty array and actual is array of subscriptions', () => {
    observableMatcher([
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)],[])
    jestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('Should call notifications matcher if received arrays of notifications', () => {
    observableMatcher([
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ],[
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ]);
    jestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('Should call notifications matcher when the actual is empty array and expected is array of notifications', () => {
    observableMatcher([],[
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ]);
    jestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('Should call notifications matcher when expected is empty array and actual is array of notifications', () => {
    observableMatcher([
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ],[]);
    jestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });
});

describe('custom test matchers test', () => {
  // TODO: implement
});
