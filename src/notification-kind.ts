import { MarblesGlossary } from './marbles-glossary';
export const ValueLiteral = {};

export type NotificationKind = 'N' | 'C' | 'E';

export const NotificationKindChars: { [key in NotificationKind]: any } = {
  ['N']: ValueLiteral,
  ['C']: MarblesGlossary.Completion,
  ['E']: MarblesGlossary.Error,
};
