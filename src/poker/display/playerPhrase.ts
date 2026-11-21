import type { Seat } from '@poker/engine/tableTypes';

// Phrases are written for robots ("Robot 3 calls"); the hero reads "You call".
const HERO_VERBS: Record<string, string> = {
  posts: 'post',
  folds: 'fold',
  checks: 'check',
  calls: 'call',
  bets: 'bet',
  raises: 'raise',
  shows: 'show',
  wins: 'win',
  owes: 'owe',
} as const;

const VERB_PATTERN = new RegExp(
  `\\b(${Object.keys(HERO_VERBS).join('|')})\\b`,
  'g',
);

export const describePlayer = (seat: Seat, phrase: string): string => {
  const heroPhrase = phrase.replaceAll(
    VERB_PATTERN,
    (verb) => HERO_VERBS[verb],
  );
  return `${seat.playerName} ${seat.isHero ? heroPhrase : phrase}`;
};
