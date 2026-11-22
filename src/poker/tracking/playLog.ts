import { describeActionHistory } from '@poker/display/actionLog';
import { getSeat } from '@poker/engine/seatOrder';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import type { Card } from '@poker/evaluation/cards';
import { formatCards } from '@poker/evaluation/cardText';
import type { SeatStrength } from '@poker/robots/seatStrength';

import type {
  DecisionLog,
  HandDealtLog,
  HandFinishedLog,
  SeatLog,
} from './playLogTypes';
import { positionOf } from './tablePosition';

const STRENGTH_DIGITS = 1000;

const roundStrength = (handStrength: number): number =>
  Math.round(handStrength * STRENGTH_DIGITS) / STRENGTH_DIGITS;

interface DecisionLogRequest {
  table: TableState;
  seatPosition: number;
  decision: Decision;
  measured: SeatStrength;
  sessionId: string;
}

export const buildDecisionLog = ({
  decision,
  measured,
  seatPosition,
  sessionId,
  table,
}: DecisionLogRequest): DecisionLog => {
  const seat = getSeat(table, seatPosition);
  return {
    kind: 'decision',
    sessionId,
    handNumber: table.handNumber,
    actionIndex: table.actionHistory.length,
    seatPosition,
    playerName: seat.playerName,
    isHero: seat.isHero,
    robotStyle: seat.robotStyle,
    street: measured.street,
    position: positionOf(table, seatPosition),
    decision,
    amountToCall: measured.amountToCall,
    potTotal: measured.potTotal,
    raisesThisStreet: table.raisesThisStreet,
    playersInHand: measured.playersInHand,
    handStrength: roundStrength(measured.handStrength),
    opponentsSimulated: measured.opponentsSimulated,
    isKillHand: table.killSeat !== null,
    holeCards: formatCards(seat.holeCards),
    board: formatCards(table.board),
  };
};

export const buildHandDealtLog = (
  table: TableState,
  deck: Card[],
  sessionId: string,
): HandDealtLog => ({
  kind: 'handDealt',
  sessionId,
  handNumber: table.handNumber,
  buttonSeat: table.buttonSeat,
  killSeat: table.killSeat,
  deck: formatCards(deck),
});

const seatLog = (table: TableState): SeatLog[] =>
  table.seats.map((seat) => ({
    seatPosition: seat.seatPosition,
    playerName: seat.playerName,
    isHero: seat.isHero,
    robotStyle: seat.robotStyle,
    isDealtIn: seat.isDealtIn,
    hasFolded: seat.hasFolded,
    stack: seat.stack,
    handContribution: seat.handContribution,
    holeCards: formatCards(seat.holeCards),
  }));

export const buildHandFinishedLog = (
  table: TableState,
  sessionId: string,
  playedAt: number,
): HandFinishedLog => ({
  kind: 'handFinished',
  sessionId,
  handNumber: table.handNumber,
  playedAt,
  board: formatCards(table.board),
  potTotal: table.lastResult?.potTotal ?? 0,
  rake: table.lastResult?.rake ?? 0,
  seats: seatLog(table),
  historyLines: describeActionHistory(table),
});
