import type { Card } from '@trainer/cards';
import { RANK_VALUES } from '@trainer/handConstants';
import type { HighHandLabel } from '@trainer/handConstants';

const getRankCounts = (hand: Card[]): number[] => {
  const counts = new Map<number, number>();
  hand.forEach((card) => {
    const value = RANK_VALUES[card.rank];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.values()].sort((a, b) => b - a);
};

const getSortedRankValues = (hand: Card[]): number[] =>
  hand.map((card) => RANK_VALUES[card.rank]).sort((a, b) => a - b);

const getStraightHighValue = (values: number[]): number | undefined => {
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length !== 5) {
    return undefined;
  }
  const max = uniqueValues[uniqueValues.length - 1];
  const min = uniqueValues[0];
  const isRegularStraight =
    max - min === 4 &&
    uniqueValues.every((value, index) => value === min + index);
  if (isRegularStraight) {
    return max;
  }
  const isWheelStraight =
    uniqueValues[0] === 2 &&
    uniqueValues[1] === 3 &&
    uniqueValues[2] === 4 &&
    uniqueValues[3] === 5 &&
    uniqueValues[4] === 14;
  return isWheelStraight ? 5 : undefined;
};

const isFlush = (hand: Card[]): boolean => {
  const [first, ...rest] = hand;
  return rest.every((card) => card.suit === first.suit);
};

export const evaluateHighHand = (hand: Card[]): HighHandLabel => {
  const values = getSortedRankValues(hand);
  const straightHigh = getStraightHighValue(values);
  const flush = isFlush(hand);
  const counts = getRankCounts(hand);
  const hasFour = counts[0] === 4;
  const hasThree = counts[0] === 3;
  const hasPair = counts[1] === 2;
  const hasTwoPair = counts[0] === 2 && counts[1] === 2;
  const hasFullHouse = hasThree && hasPair;

  const categoryChecks: Array<[HighHandLabel, boolean]> = [
    ['Straight Flush', Boolean(straightHigh && flush)],
    ['Four of a Kind', hasFour],
    ['Full House', hasFullHouse],
    ['Flush', flush],
    ['Straight', Boolean(straightHigh)],
    ['Three of a Kind', hasThree],
    ['Two Pair', hasTwoPair],
    ['One Pair', counts[0] === 2],
  ];

  const matched = categoryChecks.find(([, matches]) => matches);
  return matched ? matched[0] : 'High Card';
};

export interface HighHandDetails {
  category: HighHandLabel;
  straightHigh: number | null;
}

export const getHighHandDetails = (hand: Card[]): HighHandDetails => {
  const values = getSortedRankValues(hand);
  return {
    category: evaluateHighHand(hand),
    straightHigh: getStraightHighValue(values) ?? null,
  };
};
