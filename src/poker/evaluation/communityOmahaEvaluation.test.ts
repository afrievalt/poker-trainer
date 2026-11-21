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

  test('Given Ah 2d 4c 5c 7d', () => {
    const community = parseCards('Ah 2d 4c 5c 7d');
    const result = getBestPossibleOmahaHiLoFromCommunity(community);

    expect(result.high.category).toBe('Straight');
    expect(result.high.straightHigh).toBe(8);
    expect(result.low).toEqual([1, 2, 3, 4, 5]); // wheel with A,2 + hole cards
  });

  test('Straight high selection validation for Ah 2d 4c 5c 7d', () => {
    // This test demonstrates that the straight high selection works correctly
    // When user selects "Straight" and "8" for the high card, it should be correct
    // since the actual best hand is a straight with high card 8
    const community = parseCards('Ah 2d 4c 5c 7d');
    const result = getBestPossibleOmahaHiLoFromCommunity(community);

    // Verify the actual result
    expect(result.high.category).toBe('Straight');
    expect(result.high.straightHigh).toBe(8);

    // Simulate user selection: Straight with high card 8
    const userSelectedCategory = 'Straight';
    const userSelectedStraightHigh = '8'; // corresponds to value 8

    // Check if user's guess would be correct
    const isCategoryCorrect = userSelectedCategory === result.high.category;
    const straightHighMap: Record<number, string> = {
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: 'T',
      11: 'J',
      12: 'Q',
      13: 'K',
      14: 'A',
    };
    const actualStraightHigh = straightHighMap[result.high.straightHigh!];
    const isStraightHighCorrect =
      userSelectedStraightHigh === actualStraightHigh;

    expect(isCategoryCorrect).toBe(true);
    expect(isStraightHighCorrect).toBe(true);
  });
});
