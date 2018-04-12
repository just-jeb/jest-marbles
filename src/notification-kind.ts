import { MarblesGlossary } from './marbles-glossary';

export enum NotificationKind {
  Value = 'N',
  Completion = 'C',
  Error = 'E',
}

export const NotificationKindChars = {
  [NotificationKind.Value]: undefined,
  [NotificationKind.Completion]: MarblesGlossary.Completion,
  [NotificationKind.Error]: MarblesGlossary.Error,
};
