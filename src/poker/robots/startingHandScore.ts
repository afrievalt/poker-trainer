import type { Card, Rank } from '@poker/evaluation/cards';
import { RANK_VALUES } from '@poker/evaluation/handConstants';

// A quick 0-1 score for a five-card Big O starting hand. It rewards nut-low
// potential, the nut flush draw, big pairs, and connected cards, and
// penalizes trips and extra pairs. Tuned by feel, not solved.
const LOW_RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8'];
const LOW_CARD_SCORE = 0.06;
const MOST_LOW_CARDS_COUNTED = 4;
const ACE_DEUCE_SCORE = 0.3;
const ACE_TREY_SCORE = 0.2;
const DEUCE_TREY_SCORE = 0.1;
const SUITED_ACE_SCORE = 0.15;
const DOUBLE_SUITED_SCORE = 0.05;
const BIG_PAIR_SCORE = 0.08;
const CONNECTED_SCORE = 0.06;
const TRIPS_PENALTY = 0.25;
const EXTRA_PAIR_PENALTY = 0.08;
const CONNECTED_RUN = 4;
const RUN_WINDOW = 4;

const countBy = <Key>(keys: Key[]): Map<Key, number> => {
  const counts = new Map<Key, number>();
  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

const hasConnectedRun = (cards: Card[]): boolean => {
  const values = [...new Set(cards.map((card) => RANK_VALUES[card.rank]))];
  return values.some(
    (lowest) =>
      values.filter((value) => value >= lowest && value <= lowest + RUN_WINDOW)
        .length >= CONNECTED_RUN,
  );
};

const lowPotentialScore = (ranks: Set<Rank>): number => {
  const hasAce = ranks.has('A');
  const hasDeuce = ranks.has('2');
  const hasTrey = ranks.has('3');
  const lowCardCount = LOW_RANKS.filter((rank) => ranks.has(rank)).length;
  const nutLowScores = [
    hasAce && hasDeuce ? ACE_DEUCE_SCORE : 0,
    hasAce && hasTrey && !hasDeuce ? ACE_TREY_SCORE : 0,
    !hasAce && hasDeuce && hasTrey ? DEUCE_TREY_SCORE : 0,
  ];
  return (
    Math.max(...nutLowScores) +
    Math.min(lowCardCount, MOST_LOW_CARDS_COUNTED) * LOW_CARD_SCORE
  );
};

const suitScore = (holeCards: Card[]): number => {
  const suitCounts = countBy(holeCards.map((card) => card.suit));
  const isAceSuited = holeCards.some(
    (card) => card.rank === 'A' && (suitCounts.get(card.suit) ?? 0) > 1,
  );
  const suitedGroups = [...suitCounts.values()].filter((count) => count > 1);
  const aceSuitedScore = isAceSuited ? SUITED_ACE_SCORE : 0;
  const doubleSuitedScore = suitedGroups.length >= 2 ? DOUBLE_SUITED_SCORE : 0;
  return aceSuitedScore + doubleSuitedScore;
};

const pairingScore = (holeCards: Card[]): number => {
  const rankCounts = [...countBy(holeCards.map((card) => card.rank))];
  const pairedRanks = rankCounts
    .filter(([, count]) => count >= 2)
    .map(([rank]) => rank);
  const hasTrips = rankCounts.some(([, count]) => count >= 3);
  const scores = [
    pairedRanks.some((rank) => rank === 'A' || rank === 'K')
      ? BIG_PAIR_SCORE
      : 0,
    hasTrips ? -TRIPS_PENALTY : 0,
    pairedRanks.length >= 2 ? -EXTRA_PAIR_PENALTY : 0,
  ];
  return scores.reduce((total, score) => total + score, 0);
};

export const scoreStartingHand = (holeCards: Card[]): number => {
  const ranks = new Set(holeCards.map((card) => card.rank));
  const total =
    lowPotentialScore(ranks) +
    suitScore(holeCards) +
    pairingScore(holeCards) +
    (hasConnectedRun(holeCards) ? CONNECTED_SCORE : 0);
  return Math.min(1, Math.max(0, total));
};
