import { RANKS, SUITS } from '@poker/evaluation/cards';
import { z } from 'zod';

import type { HandRecord } from './trackingTypes';

// Firebase drops empty arrays and nulls, and early saves had no id or
// time, so stored hands are rebuilt with defaults.
const cardSchema = z.object({ rank: z.enum(RANKS), suit: z.enum(SUITS) });
const positionSchema = z.enum([
  'smallBlind',
  'bigBlind',
  'early',
  'middle',
  'late',
]);

const decisionSchema = z.object({
  handNumber: z.number(),
  street: z.enum(['preflop', 'flop', 'turn', 'river']),
  position: positionSchema,
  decision: z.enum(['fold', 'check', 'call', 'bet', 'raise']),
  amountToCall: z.number(),
  potTotal: z.number(),
  handStrength: z.number(),
  playersInHand: z.number(),
  isKillHand: z.boolean(),
});

const storedHandSchema = z.object({
  handId: z.string().optional(),
  playedAt: z.number().optional(),
  savedAt: z.number().default(0),
  handNumber: z.number(),
  isDealtIn: z.boolean(),
  position: positionSchema.nullable().default(null),
  holeCards: z.array(cardSchema).default([]),
  board: z.array(cardSchema).default([]),
  netResult: z.number(),
  sawFlop: z.boolean(),
  wentToShowdown: z.boolean(),
  wonAtShowdown: z.boolean(),
  wonMoney: z.boolean().default(false),
  didScoop: z.boolean(),
  isKillHand: z.boolean(),
  isHeroKiller: z.boolean(),
  voluntarilyPutMoneyIn: z.boolean(),
  raisedPreflop: z.boolean(),
  postflopAggressiveActions: z.number(),
  postflopCalls: z.number(),
  historyLines: z.array(z.string()).default([]),
  decisions: z.array(decisionSchema).default([]),
  robotNotes: z.array(z.object({ message: z.string() })).default([]),
  playerNote: z.string().default(''),
  isStarred: z.boolean().default(false),
});

// Returns a clean hand record, or null when the stored data is unusable.
export const parseStoredHand = (
  storageKey: string,
  storedValue: unknown,
): HandRecord | null => {
  const result = storedHandSchema.safeParse(storedValue);
  if (!result.success) {
    return null;
  }
  const { handId, playedAt, savedAt, ...hand } = result.data;
  return {
    ...hand,
    handId: handId ?? storageKey,
    playedAt: playedAt ?? savedAt,
  };
};

const playerMarkScore = (hand: HandRecord): number =>
  Number(hand.playerNote.length > 0) + Number(hand.isStarred);

// A later save can carry a note or a star the other copy is missing.
const preferHand = (current: HandRecord, candidate: HandRecord): HandRecord => {
  const candidateScore = playerMarkScore(candidate);
  const currentScore = playerMarkScore(current);
  if (candidateScore !== currentScore) {
    return candidateScore > currentScore ? candidate : current;
  }
  return candidate.playedAt >= current.playedAt ? candidate : current;
};

export const parseStoredHands = (
  storedHands: Record<string, unknown> | null,
): HandRecord[] => {
  const handsById = new Map<string, HandRecord>();
  for (const [storageKey, storedValue] of Object.entries(storedHands ?? {})) {
    const hand = parseStoredHand(storageKey, storedValue);
    if (!hand) {
      continue;
    }
    const current = handsById.get(hand.handId);
    handsById.set(hand.handId, current ? preferHand(current, hand) : hand);
  }
  return [...handsById.values()].toSorted(
    (left, right) => left.playedAt - right.playedAt,
  );
};
