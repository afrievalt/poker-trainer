import { nextSeatAfter, seatsFromButton } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { TableState } from '@poker/engine/tableTypes';
import { createDeck, getCardCode } from '@poker/evaluation/cards';
import type { Card } from '@poker/evaluation/cards';

const HOLE_CARD_COUNT = 5;

const hasChipsForDrill = (seat: { stack: number; isHero: boolean }): boolean =>
  seat.stack > 0 || !seat.isHero;

// Hero cards and the board are fixed. Everyone else gets the leftover cards.
// The button is the seat after the hero, so the hero acts late before the flop.
export const buildDrillDeck = (
  table: TableState,
  heroCards: Card[],
  board: Card[],
): Card[] => {
  const prepared = { ...table, buttonSeat: HERO_SEAT_POSITION };
  const button = nextSeatAfter(prepared, HERO_SEAT_POSITION, hasChipsForDrill);
  const buttonSeat = button?.seatPosition ?? HERO_SEAT_POSITION;
  const dealt = seatsFromButton({ ...prepared, buttonSeat }).filter(
    (seat) =>
      hasChipsForDrill(seat) &&
      !(table.structure.isButtonSittingOut && seat.seatPosition === buttonSeat),
  );
  const used = new Set([...heroCards, ...board].map(getCardCode));
  const unused = createDeck().filter((card) => !used.has(getCardCode(card)));
  const hands = dealt.flatMap((seat) =>
    seat.seatPosition === HERO_SEAT_POSITION
      ? heroCards
      : unused.splice(0, HOLE_CARD_COUNT),
  );
  return [...hands, ...board, ...unused];
};
