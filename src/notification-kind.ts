import { MarblesGlossary } from './marbles-glossary';

export enum NotificationKind {
  Value = 'N',
  Completion = 'C',
  Error = 'E',
}

export const ValueLiteral = {};

export const NotificationKindChars = {
  [NotificationKind.Value]: ValueLiteral,
  [NotificationKind.Completion]: MarblesGlossary.Completion,
  [NotificationKind.Error]: MarblesGlossary.Error,
};
