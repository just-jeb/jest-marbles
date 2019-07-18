import { MarblesGlossary } from './marbles-glossary';
import { Notification } from 'rxjs';
export const ValueLiteral = {};

export type NotificationKind = Notification<any>['kind'];

export const NotificationKindChars: { [key in NotificationKind]: any } = {
  N: ValueLiteral,
  C: MarblesGlossary.Completion,
  E: MarblesGlossary.Error,
};
