import { formatMoney } from '@poker/display/money';

import type { HandRecord } from './trackingTypes';

export interface StatLine {
  label: string;
  value: string;
}

const PERCENT = 100;
const NO_DATA = '—';
const RATIO_DIGITS = 1;

const percentOf = (count: number, total: number): string =>
  total === 0 ? NO_DATA : `${Math.round((count / total) * PERCENT)}%`;

const countOf = (
  hands: HandRecord[],
  isMatch: (hand: HandRecord) => boolean,
): number => hands.filter(isMatch).length;

const sumOf = (hands: HandRecord[], amountOf: (hand: HandRecord) => number) =>
  hands.map(amountOf).reduce((total, amount) => total + amount, 0);

export const formatSignedMoney = (amount: number): string =>
  amount < 0 ? `-${formatMoney(-amount)}` : `+${formatMoney(amount)}`;

const netOf = (hands: HandRecord[]): string =>
  formatSignedMoney(sumOf(hands, (hand) => hand.netResult));

const describePlayingStyle = (hands: HandRecord[]): StatLine[] => {
  const flopHands = hands.filter((hand) => hand.sawFlop);
  const showdownHands = hands.filter((hand) => hand.wentToShowdown);
  const showdownWins = countOf(showdownHands, (hand) => hand.wonAtShowdown);
  const playedHands = countOf(hands, (hand) => hand.voluntarilyPutMoneyIn);
  const raisedHands = countOf(hands, (hand) => hand.raisedPreflop);
  return [
    { label: 'Played (VPIP)', value: percentOf(playedHands, hands.length) },
    {
      label: 'Raised preflop (PFR)',
      value: percentOf(raisedHands, hands.length),
    },
    { label: 'Saw the flop', value: percentOf(flopHands.length, hands.length) },
    {
      label: 'Showdown (of flops seen)',
      value: percentOf(showdownHands.length, flopHands.length),
    },
    {
      label: 'Won at showdown',
      value: percentOf(showdownWins, showdownHands.length),
    },
  ];
};

const describeResults = (hands: HandRecord[]): StatLine[] => {
  const killHands = hands.filter((hand) => hand.isKillHand);
  const normalHands = hands.filter((hand) => !hand.isKillHand);
  const aggressiveActions = sumOf(
    hands,
    (hand) => hand.postflopAggressiveActions,
  );
  const calls = sumOf(hands, (hand) => hand.postflopCalls);
  const scoops = countOf(hands, (hand) => hand.didScoop);
  const potsWon = countOf(hands, (hand) => hand.wonMoney);
  const aggression =
    calls === 0 ? NO_DATA : (aggressiveActions / calls).toFixed(RATIO_DIGITS);
  return [
    { label: 'Hands dealt', value: `${hands.length}` },
    { label: 'Net result', value: netOf(hands) },
    { label: 'Aggression (bets+raises ÷ calls)', value: aggression },
    {
      label: 'Scoops (of pots won)',
      value: `${scoops} (${percentOf(scoops, potsWon)})`,
    },
    { label: `Kill pots (${killHands.length})`, value: netOf(killHands) },
    { label: `Normal pots (${normalHands.length})`, value: netOf(normalHands) },
  ];
};

export const describeSessionStats = (allHands: HandRecord[]): StatLine[] => {
  const hands = allHands.filter((hand) => hand.isDealtIn);
  return [...describeResults(hands), ...describePlayingStyle(hands)];
};
