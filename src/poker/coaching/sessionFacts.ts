import type { HandRecord } from '@poker/tracking/trackingTypes';

// Rates and totals the leak rules look at, worked out once.
export interface SessionFacts {
  hands: HandRecord[];
  playedHands: HandRecord[];
  flopHands: HandRecord[];
  showdownHands: HandRecord[];
  killHands: HandRecord[];
  normalHands: HandRecord[];
  playedRate: number;
  raisedShareOfPlayed: number;
  showdownRate: number;
  showdownWinRate: number;
  postflopCalls: number;
  aggression: number;
  killNetPerHand: number;
  normalNetPerHand: number;
}

const rate = (count: number, total: number): number =>
  total === 0 ? 0 : count / total;

const sumOf = (hands: HandRecord[], amountOf: (hand: HandRecord) => number) =>
  hands.map(amountOf).reduce((total, amount) => total + amount, 0);

const netPerHand = (hands: HandRecord[]): number =>
  rate(
    sumOf(hands, (hand) => hand.netResult),
    hands.length,
  );

export const gatherSessionFacts = (allHands: HandRecord[]): SessionFacts => {
  const hands = allHands.filter((hand) => hand.isDealtIn);
  const playedHands = hands.filter((hand) => hand.voluntarilyPutMoneyIn);
  const flopHands = hands.filter((hand) => hand.sawFlop);
  const showdownHands = hands.filter((hand) => hand.wentToShowdown);
  const killHands = hands.filter((hand) => hand.isKillHand);
  const normalHands = hands.filter((hand) => !hand.isKillHand);
  const postflopCalls = sumOf(hands, (hand) => hand.postflopCalls);
  const aggressiveActions = sumOf(
    hands,
    (hand) => hand.postflopAggressiveActions,
  );
  return {
    hands,
    playedHands,
    flopHands,
    showdownHands,
    killHands,
    normalHands,
    playedRate: rate(playedHands.length, hands.length),
    raisedShareOfPlayed: rate(
      playedHands.filter((hand) => hand.raisedPreflop).length,
      playedHands.length,
    ),
    showdownRate: rate(showdownHands.length, flopHands.length),
    showdownWinRate: rate(
      showdownHands.filter((hand) => hand.wonAtShowdown).length,
      showdownHands.length,
    ),
    postflopCalls,
    aggression: rate(aggressiveActions, postflopCalls),
    killNetPerHand: netPerHand(killHands),
    normalNetPerHand: netPerHand(normalHands),
  };
};
