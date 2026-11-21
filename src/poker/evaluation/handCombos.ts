import type { Card } from './cards';

export const getTwoCardCombos = (cards: Card[]): Card[][] => {
  const combos: Card[][] = [];
  for (let first = 0; first < cards.length - 1; first += 1) {
    for (let second = first + 1; second < cards.length; second += 1) {
      combos.push([cards[first], cards[second]]);
    }
  }
  return combos;
};

export const getThreeCardCombos = (cards: Card[]): Card[][] => {
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
