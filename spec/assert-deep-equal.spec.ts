const jestExpect = expect;

import {assertDeepEqual} from '../src/rxjs/assert-deep-equal';
import {SubscriptionLog} from 'rxjs/internal/testing/SubscriptionLog';
import {Notification} from 'rxjs';

const matchersMock = {toBeSubscriptions: jest.fn(), toBeNotifications: jest.fn(), toHaveEmptySubscriptions: jest.fn()};
const expectMock = jest.fn(() => matchersMock);
(global as any).expect = expectMock;

describe('assertDeepEqual test', () => {
  beforeEach(() => {
    matchersMock.toBeNotifications.mockClear();
    matchersMock.toBeSubscriptions.mockClear();
    matchersMock.toHaveEmptySubscriptions.mockClear();
  });

  it('Should call subscriptions matcher if received arrays of subscriptions', () => {
    assertDeepEqual([
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)
    ], [
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)
    ]);
    jestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('Should call subscriptions matcher if actual is empty array and expected is array of subscriptions', () => {
    assertDeepEqual([], [
      new SubscriptionLog(30, 60),
      new SubscriptionLog(10, 50)]);
    jestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('Should call notifications matcher if received arrays of notifications', () => {
    assertDeepEqual([
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ], [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ]);
    jestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('Should call notifications matcher when the actual is empty array and expected is array of notifications', () => {
    assertDeepEqual([], [
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ]);
    jestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('Should call notifications matcher when expected is empty array and actual is array of notifications', () => {
    assertDeepEqual([
      {frame: 30, notification: new Notification('N', 'b')},
      {frame: 110, notification: new Notification('N', 'e')}
    ], []);
    jestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('Should call empty subscriptions matcher if expected array is empty and actual array is array of subscriptions', () => {
    assertDeepEqual([
      new SubscriptionLog(30, 60)
    ], []);
    jestExpect(matchersMock.toHaveEmptySubscriptions).toHaveBeenCalledTimes(1);
  });
});


