import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import { startHand } from '@poker/engine/handStart';
import { applyDecision } from '@poker/engine/playerActions';
import { createTable } from '@poker/engine/tableSetup';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import { createDeck, getCardCode } from '@poker/evaluation/cards';
import type { Card } from '@poker/evaluation/cards';

const HOLE_CARD_COUNT = 5;
const DEALT_PLAYER_COUNT = 8;

export const parseCards = (codes: string): Card[] =>
  codes
    .split(' ')
    .filter(Boolean)
    .map((code) => {
      const [rank, suit] = [...code];
      return { rank, suit } as Card;
    });

// Builds a deck in deal order (eight hands, then the board).
// A missing or null hand gets any unused cards.
export const stackDeck = (
  chosenHands: (string | null)[],
  boardCodes: string,
): Card[] => {
  const holeCardsInDealOrder = Array.from(
    { length: DEALT_PLAYER_COUNT },
    (_unused, dealOrder) => chosenHands[dealOrder] ?? null,
  );
  const chosenCodes = [...holeCardsInDealOrder, boardCodes]
    .filter((codes): codes is string => codes !== null)
    .flatMap((codes) => codes.split(' ').filter(Boolean));
  const unusedCards = createDeck().filter(
    (card) => !chosenCodes.includes(getCardCode(card)),
  );
  const hands = holeCardsInDealOrder.flatMap((codes) =>
    codes === null ? unusedCards.splice(0, HOLE_CARD_COUNT) : parseCards(codes),
  );
  return [...hands, ...parseCards(boardCodes), ...unusedCards];
};

export const createStartedTable = (deck: Card[]): TableState => {
  const table = createTable(DEFAULT_GAME_STRUCTURE);
  startHand(table, deck);
  return table;
};

// Plays each decision for whichever seat is to act.
export const playDecisions = (
  table: TableState,
  decisions: Decision[],
): void => {
  for (const decision of decisions) {
    if (table.actingSeat === null) {
      throw new Error(`No one is left to ${decision}`);
    }
    applyDecision(table, table.actingSeat, decision);
  }
};

export const stackOf = (table: TableState, seatPosition: number): number =>
  table.seats[seatPosition].stack;
