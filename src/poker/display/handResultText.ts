import { formatMoney } from '@poker/display/money';
import { getSeat, playersInHand } from '@poker/engine/seatOrder';
import type { PotAward, TableState } from '@poker/engine/tableTypes';
import { getHandBestPossible } from '@poker/evaluation/bestHandPossible';
import { formatCards } from '@poker/evaluation/cardText';
import { evaluateHighHand } from '@poker/evaluation/handEvaluation';

import { describePlayer } from './playerPhrase';

const SHOWDOWN_PLAYER_COUNT = 2;

const describeShare = (table: TableState, award: PotAward): string => {
  const seat = getSeat(table, award.seatPosition);
  const shareTexts: Record<PotAward['share'], () => string> = {
    uncontested: () => 'uncontested',
    low: () => 'low',
    high: () => {
      const best = getHandBestPossible(table.board, seat.holeCards);
      return `high, ${evaluateHighHand(best.bestHighHand)}`;
    },
  };
  return describePlayer(
    seat,
    `wins ${formatMoney(award.amount)} (${shareTexts[award.share]()})`,
  );
};

const describeShowdownHands = (table: TableState): string[] => {
  const contenders = playersInHand(table);
  if (contenders.length < SHOWDOWN_PLAYER_COUNT) {
    return [];
  }
  return [
    `— Showdown: ${formatCards(table.board)} —`,
    ...contenders.map((seat) =>
      describePlayer(seat, `shows ${formatCards(seat.holeCards)}`),
    ),
  ];
};

export const describeHandResult = (table: TableState): string[] => {
  const { lastResult, street, structure } = table;
  if (!lastResult || street !== 'complete') {
    return [];
  }
  const { kill } = structure;
  const killPhrase = `scooped ${formatMoney(lastResult.potTotal)} and owes a ${formatMoney(kill.bringIn)} kill`;
  const killLines =
    lastResult.scooperSeat === null
      ? []
      : [describePlayer(getSeat(table, lastResult.scooperSeat), killPhrase)];
  const rakeLines =
    lastResult.rake > 0 ? [`Rake ${formatMoney(lastResult.rake)}`] : [];
  return [
    ...describeShowdownHands(table),
    ...rakeLines,
    ...lastResult.awards.map((award) => describeShare(table, award)),
    ...killLines,
  ];
};
