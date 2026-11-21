import { formatMoney } from '@poker/display/money';
import { getSeat } from '@poker/engine/seatOrder';
import type {
  ActionRecord,
  BettingStreet,
  TableState,
} from '@poker/engine/tableTypes';
import { formatCards } from '@poker/evaluation/cardText';

import { describeHandResult } from './handResultText';
import { describePlayer } from './playerPhrase';

const ACTION_PHRASES: Record<
  ActionRecord['decision'],
  (record: ActionRecord) => string
> = {
  smallBlind: (record) => `posts small blind ${formatMoney(record.amount)}`,
  bigBlind: (record) => `posts big blind ${formatMoney(record.amount)}`,
  kill: (record) => `posts the kill (${formatMoney(record.streetTotal)})`,
  fold: () => 'folds',
  check: () => 'checks',
  call: (record) => `calls ${formatMoney(record.amount)}`,
  bet: (record) => `bets ${formatMoney(record.amount)}`,
  raise: (record) => `raises to ${formatMoney(record.streetTotal)}`,
} as const;

const BOARD_SIZE_BY_STREET: Record<BettingStreet, number> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
} as const;

const STREET_TITLES: Record<BettingStreet, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
} as const;

const streetHeader = (table: TableState, street: BettingStreet): string => {
  const boardCards = table.board.slice(0, BOARD_SIZE_BY_STREET[street]);
  const boardText = boardCards.length > 0 ? `: ${formatCards(boardCards)}` : '';
  return `— ${STREET_TITLES[street]}${boardText} —`;
};

export const describeActionHistory = (table: TableState): string[] => {
  const lines: string[] = [];
  let previousStreet: BettingStreet | null = null;
  for (const record of table.actionHistory) {
    if (record.street !== previousStreet) {
      lines.push(streetHeader(table, record.street));
      previousStreet = record.street;
    }
    const seat = getSeat(table, record.seatPosition);
    lines.push(describePlayer(seat, ACTION_PHRASES[record.decision](record)));
  }
  return [...lines, ...describeHandResult(table)];
};
