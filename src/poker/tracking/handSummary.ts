import { describeActionHistory } from '@poker/display/actionLog';
import { getSeat, isInHand, playersInHand } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { ActionRecord, TableState } from '@poker/engine/tableTypes';

import { positionOf } from './tablePosition';
import type { HandSummary } from './trackingTypes';

const VOLUNTARY_DECISIONS: readonly ActionRecord['decision'][] = [
  'call',
  'bet',
  'raise',
] as const;
const AGGRESSIVE_DECISIONS: readonly ActionRecord['decision'][] = [
  'bet',
  'raise',
] as const;
const FLOP_CARD_COUNT = 3;
const SHOWDOWN_PLAYER_COUNT = 2;

const countWhere = (
  records: ActionRecord[],
  isMatch: (record: ActionRecord) => boolean,
): number => records.filter(isMatch).length;

interface HeroMoney {
  winnings: number;
  netResult: number;
}

const heroMoneyOf = (table: TableState): HeroMoney => {
  const hero = getSeat(table, HERO_SEAT_POSITION);
  const awards = table.lastResult?.awards ?? [];
  const winnings = awards
    .filter((award) => award.seatPosition === HERO_SEAT_POSITION)
    .reduce((total, award) => total + award.amount, 0);
  const returned =
    table.lastResult?.returnedTo === HERO_SEAT_POSITION
      ? table.lastResult.returnedAmount
      : 0;
  return { winnings, netResult: winnings + returned - hero.handContribution };
};

interface HeroActionFacts {
  foldedPreflop: boolean;
  voluntarilyPutMoneyIn: boolean;
  raisedPreflop: boolean;
  postflopAggressiveActions: number;
  postflopCalls: number;
}

const heroActionFacts = (table: TableState): HeroActionFacts => {
  const heroActions = table.actionHistory.filter(
    (record) => record.seatPosition === HERO_SEAT_POSITION,
  );
  const preflopActions = heroActions.filter(
    (record) => record.street === 'preflop',
  );
  const postflopActions = heroActions.filter(
    (record) => record.street !== 'preflop',
  );
  return {
    foldedPreflop: preflopActions.some((record) => record.decision === 'fold'),
    voluntarilyPutMoneyIn: preflopActions.some((record) =>
      VOLUNTARY_DECISIONS.includes(record.decision),
    ),
    raisedPreflop: preflopActions.some((record) => record.decision === 'raise'),
    postflopAggressiveActions: countWhere(postflopActions, (record) =>
      AGGRESSIVE_DECISIONS.includes(record.decision),
    ),
    postflopCalls: countWhere(
      postflopActions,
      (record) => record.decision === 'call',
    ),
  };
};

export const summarizeHand = (table: TableState): HandSummary => {
  const hero = getSeat(table, HERO_SEAT_POSITION);
  const { foldedPreflop, ...actionFacts } = heroActionFacts(table);
  const { netResult, winnings } = heroMoneyOf(table);
  const awards = table.lastResult?.awards ?? [];
  const isShowdown = playersInHand(table).length >= SHOWDOWN_PLAYER_COUNT;
  const wentToShowdown = isShowdown && isInHand(hero);
  return {
    handNumber: table.handNumber,
    isDealtIn: hero.isDealtIn,
    position: hero.isDealtIn ? positionOf(table, HERO_SEAT_POSITION) : null,
    holeCards: hero.holeCards,
    board: table.board,
    netResult,
    sawFlop:
      hero.isDealtIn && !foldedPreflop && table.board.length >= FLOP_CARD_COUNT,
    wentToShowdown,
    wonAtShowdown: wentToShowdown && winnings > 0,
    wonMoney: winnings > 0,
    didScoop:
      awards.length > 0 &&
      awards.every((award) => award.seatPosition === HERO_SEAT_POSITION),
    isKillHand: table.killSeat !== null,
    isHeroKiller: table.killSeat === HERO_SEAT_POSITION,
    ...actionFacts,
    historyLines: describeActionHistory(table),
  };
};
