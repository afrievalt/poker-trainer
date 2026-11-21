import { formatMoney } from '@poker/display/money';
import { isInHand, playersInHand } from '@poker/engine/seatOrder';
import type { Seat, TableState } from '@poker/engine/tableTypes';
import type { Card } from '@poker/evaluation/cards';
import { ROBOT_PERSONALITIES } from '@poker/robots/robotPersonalities';

export type SeatStatus =
  | 'acting'
  | 'folded'
  | 'sittingOut'
  | 'winner'
  | 'waiting';

export interface SeatView {
  playerName: string;
  styleLabel: string;
  stackLabel: string;
  badgeLabel: string;
  status: SeatStatus;
  isHero: boolean;
  isButton: boolean;
  isFaceUp: boolean;
  holeCards: Card[];
  betLabel: string;
}

const SHOWDOWN_PLAYER_COUNT = 2;
const NO_CARDS: Card[] = [];

const winningsOf = (table: TableState, seatPosition: number): number =>
  (table.lastResult?.awards ?? [])
    .filter((award) => award.seatPosition === seatPosition)
    .reduce((total, award) => total + award.amount, 0);

const statusOf = (table: TableState, seat: Seat, winnings: number) => {
  const statusChecks: [SeatStatus, boolean][] = [
    ['sittingOut', !seat.isDealtIn],
    ['winner', table.street === 'complete' && winnings > 0],
    ['acting', table.actingSeat === seat.seatPosition],
    ['folded', seat.hasFolded],
  ];
  return statusChecks.find(([, isMatch]) => isMatch)?.[0] ?? 'waiting';
};

const badgeOf = (table: TableState, seat: Seat, winnings: number): string => {
  const badgeChecks: [string, boolean][] = [
    [
      `Wins ${formatMoney(winnings)}`,
      table.street === 'complete' && winnings > 0,
    ],
    ['Kill', table.killSeat === seat.seatPosition],
    ['Folded', seat.isDealtIn && seat.hasFolded],
    ['Sitting out', !seat.isDealtIn && table.street !== 'waiting'],
  ];
  return badgeChecks.find(([, isMatch]) => isMatch)?.[0] ?? '';
};

export const describeSeat = (table: TableState, seat: Seat): SeatView => {
  const winnings = winningsOf(table, seat.seatPosition);
  const isShowdown =
    table.street === 'complete' &&
    playersInHand(table).length >= SHOWDOWN_PLAYER_COUNT;
  const isCardsShown = seat.isHero || isInHand(seat);
  const isBetShown = seat.streetContribution > 0 && table.street !== 'complete';
  return {
    playerName: seat.playerName,
    styleLabel: seat.robotStyle
      ? ROBOT_PERSONALITIES[seat.robotStyle].label
      : '',
    stackLabel: `${formatMoney(seat.stack)}`,
    badgeLabel: badgeOf(table, seat, winnings),
    status: statusOf(table, seat, winnings),
    isHero: seat.isHero,
    isButton: table.handNumber > 0 && table.buttonSeat === seat.seatPosition,
    isFaceUp: seat.isHero || (isShowdown && isInHand(seat)),
    holeCards: isCardsShown ? seat.holeCards : NO_CARDS,
    betLabel: isBetShown ? `${formatMoney(seat.streetContribution)}` : '',
  };
};
