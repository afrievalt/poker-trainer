import type { Card } from '@trainer/cards';
import { HIGH_HAND_RANKS } from '@trainer/handConstants';
import type { HighHandLabel } from '@trainer/handConstants';

import { evaluateHighHand, getHighHandDetails } from './handEvaluation';

const getTwoCardCombos = (cards: Card[]): Card[][] => {
  const combos: Card[][] = [];
  for (let first = 0; first < cards.length - 1; first += 1) {
    for (let second = first + 1; second < cards.length; second += 1) {
      combos.push([cards[first], cards[second]]);
    }
  }
  return combos;
};

const getThreeCardCombos = (cards: Card[]): Card[][] => {
  const combos: Card[][] = [];
  for (let first = 0; first < cards.length - 2; first += 1) {
    for (let second = first + 1; second < cards.length - 1; second += 1) {
      for (let third = second + 1; third < cards.length; third += 1) {
        combos.push([cards[first], cards[second], cards[third]]);
      }
    }
  }
  return combos;
};

const getOmahaHands = (community: Card[], hole: Card[]): Card[][] => {
  const holeCombos = getTwoCardCombos(hole);
  const boardCombos = getThreeCardCombos(community);
  return holeCombos.flatMap((handCards) =>
    boardCombos.map((boardCards) => [...handCards, ...boardCards]),
  );
};

export const getPossibleOmahaCategories = (
  community: Card[],
  hole: Card[],
): HighHandLabel[] => {
  const categories = new Set<HighHandLabel>();
  getOmahaHands(community, hole).forEach((hand) => {
    categories.add(evaluateHighHand(hand));
  });
  return [...categories];
};

export const getBestOmahaCategory = (
  community: Card[],
  hole: Card[],
): HighHandLabel => {
  const categories = getPossibleOmahaCategories(community, hole);
  let best = categories[0];
  for (const current of categories) {
    if (HIGH_HAND_RANKS[current] > HIGH_HAND_RANKS[best]) {
      best = current;
    }
  }
  return best;
};

export const getBestOmahaHighDetails = (
  community: Card[],
  hole: Card[],
): ReturnType<typeof getHighHandDetails> => {
  let best = getHighHandDetails(getOmahaHands(community, hole)[0]);
  getOmahaHands(community, hole).forEach((hand) => {
    const details = getHighHandDetails(hand);
    const bestRank = HIGH_HAND_RANKS[best.category];
    const currentRank = HIGH_HAND_RANKS[details.category];
    if (currentRank > bestRank) {
      best = details;
      return;
    }
    if (
      currentRank === bestRank &&
      details.straightHigh &&
      best.straightHigh &&
      details.straightHigh > best.straightHigh
    ) {
      best = details;
    }
  });
  return best;
};
