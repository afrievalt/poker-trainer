import type { Card } from '@trainer/cards';
import { describe, expect, test } from 'vitest';

import { getBestPossibleOmahaHiLoFromCommunity } from './communityOmahaEvaluation';

const parseCard = (code: string): Card => {
  const [rank, suit] = [...code];
  if (!rank || !suit) {
    throw new Error(`Invalid card code: ${code}`);
  }
  return {
    rank: rank.toUpperCase() as Card['rank'],
    suit: suit.toUpperCase() as Card['suit'],
  };
};

const parseCards = (codes: string): Card[] =>
  codes.split(' ').map((code) => parseCard(code.trim()));

const formatLow = (ranks: number[] | null): string => {
  if (!ranks) {
    return 'no low';
  }
  if (ranks.join(',') === '1,2,3,4,5') {
    return 'wheel';
  }
  return `${ranks[ranks.length - 1]}-low`;
};

describe('community-only Omaha hi/lo evaluation', () => {
  test('Given Jh 2s 6d 6c Ad', () => {
    const community = parseCards('Jh 2s 6d 6c Ad');
    const result = getBestPossibleOmahaHiLoFromCommunity(community);

    expect(result.high.category).toBe('Four of a Kind');
    expect(formatLow(result.low)).toBe('6-low');
  });

  test('Given Jh 2s 7h Qd 9h', () => {
    const community = parseCards('Jh 2s 7h Qd 9h');
    const result = getBestPossibleOmahaHiLoFromCommunity(community);

    expect(result.high.category).toBe('Straight Flush');
    expect(result.high.straightHigh).toBe(11);
    expect(result.low).toBeNull();
  });
});
