import { parseCards } from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { estimatePotEquity } from './potEquity';
import { scoreStartingHand } from './startingHandScore';

const SEED = 12_345;
const MULTIPLIER = 1_103_515_245;
const INCREMENT = 12_345;
const MODULUS = 2 ** 31;

// Repeatable random numbers so equity tests do not flake.
const seededRandom = (): (() => number) => {
  let state = SEED;
  return () => {
    state = (state * MULTIPLIER + INCREMENT) % MODULUS;
    return state / MODULUS;
  };
};

describe('scoreStartingHand', () => {
  test('ranks a double-suited A-2-3 hand above junk and trips', () => {
    const premium = scoreStartingHand(parseCards('AS 2S 3H KH 4D'));
    const junk = scoreStartingHand(parseCards('9C TD QS 6H JC'));
    const trips = scoreStartingHand(parseCards('7C 7D 7S 9H JC'));

    expect(premium).toBeGreaterThan(0.6);
    expect(junk).toBeLessThan(0.2);
    expect(trips).toBe(0);
  });
});

describe('estimatePotEquity', () => {
  test('a made nut low and set beats random hands most of the time', () => {
    const request = {
      board: parseCards('4D 5H 8C KC JD'),
      opponentCount: 2,
      iterations: 200,
      random: seededRandom(),
    };
    const strong = estimatePotEquity({
      ...request,
      holeCards: parseCards('AS 2S KS KH QC'),
    });
    const weak = estimatePotEquity({
      ...request,
      holeCards: parseCards('9S 9H TS TC QD'),
    });

    expect(strong).toBeGreaterThan(0.8);
    expect(weak).toBeLessThan(strong);
  });
});
