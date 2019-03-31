import { MarblesGlossary } from './marbles-glossary';
import { NotificationKind } from 'rxjs/internal/Notification';
export const ValueLiteral = {};

export const NotificationKindChars: { [key in NotificationKind]: any } = {
  [NotificationKind.NEXT]: ValueLiteral,
  [NotificationKind.COMPLETE]: MarblesGlossary.Completion,
  [NotificationKind.ERROR]: MarblesGlossary.Error,
};
