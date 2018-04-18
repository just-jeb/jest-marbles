import {Marblizer} from "../src/marblizer";
import {customTestMatchers} from "../src/jest/custom-matchers";
import {SubscriptionLog} from 'rxjs/testing/SubscriptionLog';
import {Notification} from 'rxjs';

jest.mock('jest-diff');
jest.mock('jest-matcher-utils');

const marblizeSubscriptionsMock = jest.fn(), marblizeMock = jest.fn();
Marblizer.marblizeSubscriptions = marblizeSubscriptionsMock;
Marblizer.marblize = marblizeMock;


describe('toBeSubscriptions test', () => {
  const actual = [new SubscriptionLog(30, 60), new SubscriptionLog(10, 50)], expected = [new SubscriptionLog(30, 60)];
  beforeEach(() => {
    marblizeSubscriptionsMock.mockClear();
  });
  it('Should call marblizeSubscriptions for both expected and actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    customTestMatchers.toBeSubscriptions(actual, expected)
    expect(marblizeSubscriptionsMock).toHaveBeenCalledTimes(2);
    expect(marblizeSubscriptionsMock).toHaveBeenCalledWith(actual);
    expect(marblizeSubscriptionsMock).toHaveBeenCalledWith(expected);
  });

  it('Should fail if the array of expected subscriptions has different length than the array of actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!']).mockReturnValueOnce(['--^--!', '--^--!']);
    const result = customTestMatchers.toBeSubscriptions(actual, expected);
    expect(result.pass).toBeFalsy();
  });

  it('Should pass if the expected subscriptions is the same set as the actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!', '^--!']).mockReturnValueOnce(['^--!', '--^--!']);
    const result = customTestMatchers.toBeSubscriptions(actual, expected);
    expect(result.pass).toBeTruthy();
  });

  it('Should fail if the expected subscriptions do not equal to the actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!', '--^---!']).mockReturnValueOnce(['--^--!', '--^--!']);
    const result = customTestMatchers.toBeSubscriptions(actual, expected);
    expect(result.pass).toBeFalsy();
  });
});

describe('toBeNotifications test', () => {
  const actual = [
    {frame: 30, notification: new Notification('N', 'b')},
    {frame: 110, notification: new Notification('N', 'e')}
  ], expected = [
    {frame: 30, notification: new Notification('N', 'b')}
  ];
  beforeEach(() => {
    marblizeMock.mockClear();
  });
  it('Should call marblize for both expected and actual subscriptions', () => {
    marblizeMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    customTestMatchers.toBeNotifications(actual, expected)
    expect(marblizeMock).toHaveBeenCalledTimes(2);
    expect(marblizeMock).toHaveBeenCalledWith(actual);
    expect(marblizeMock).toHaveBeenCalledWith(expected);
  });

  it('Should pass if the expected notifications equal to the actual notifications', () => {
    marblizeMock.mockReturnValueOnce('---a---b|').mockReturnValueOnce('---a---b|');
    const result = customTestMatchers.toBeNotifications(actual, expected);
    expect(result.pass).toBeTruthy();
  });

  it('Should fail if the expected notifications do not equal to the actual notifications', () => {
    marblizeMock.mockReturnValueOnce('---a---b|').mockReturnValueOnce('---a----b|');
    const result = customTestMatchers.toBeNotifications(actual, expected);
    expect(result.pass).toBeFalsy();
  });
});
