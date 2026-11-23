import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import { startHand } from '@poker/engine/handStart';
import { getSeat } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { createTable } from '@poker/engine/tableSetup';
import { getCardCode } from '@poker/evaluation/cards';
import { describe, expect, test } from 'vitest';

import { LATE_ACE_TWO_DRILL } from './drillCatalog';
import { buildDrillDeck } from './drillDeck';

const BOARD_CARD_COUNT = 5;

describe('buildDrillDeck', () => {
  test('puts the chosen cards on the hero and the board, with the hero last', () => {
    const table = createTable(DEFAULT_GAME_STRUCTURE);
    table.buttonSeat = 4;
    const deck = buildDrillDeck(
      table,
      LATE_ACE_TWO_DRILL.heroCards,
      LATE_ACE_TWO_DRILL.board,
    );
    table.buttonSeat = HERO_SEAT_POSITION;
    startHand(table, deck);
    const hero = getSeat(table, HERO_SEAT_POSITION);

    expect(hero.holeCards.map(getCardCode)).toEqual([
      'AS',
      '2S',
      '3H',
      'KD',
      'QC',
    ]);
    expect(table.deck.slice(0, BOARD_CARD_COUNT).map(getCardCode)).toEqual([
      '4D',
      '5H',
      '8C',
      'KC',
      'JD',
    ]);
    expect(table.buttonSeat).not.toBe(HERO_SEAT_POSITION);
    expect(hero.isDealtIn).toBe(true);
  });
});
