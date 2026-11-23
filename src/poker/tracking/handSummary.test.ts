import { describeDecisionButtons } from '@poker/display/decisionButtons';
import { getLegalDecisions } from '@poker/engine/bettingRules';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { Decision } from '@poker/engine/tableTypes';
import {
  createStartedTable,
  playDecisions,
  stackDeck,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { summarizeHand } from './handSummary';
import { describeSessionStats } from './sessionStats';

const BOARD = '4D 5H 8C KC JD';
const ROBOTS_FOLD_TO_HERO: Decision[] = Array(5).fill('fold');

// The hero (dealt last) limps with the nut low against the big blind's set.
const dealHeroAgainstBigBlind = () =>
  createStartedTable(
    stackDeck(
      [null, 'KS KH 9D 9C TS', null, null, null, null, null, 'AS 2S 3H KD QC'],
      BOARD,
    ),
  );

const heroButtons = (table: ReturnType<typeof dealHeroAgainstBigBlind>) =>
  describeDecisionButtons(table, getLegalDecisions(table, HERO_SEAT_POSITION));

describe('summarizeHand', () => {
  test('records the hero result, position, and playing facts', () => {
    const table = dealHeroAgainstBigBlind();
    playDecisions(table, [...ROBOTS_FOLD_TO_HERO, 'call', 'fold', 'check']);
    playDecisions(table, Array(6).fill('check'));
    const summary = summarizeHand(table);

    expect(summary).toMatchObject({
      position: 'late',
      netResult: 0.5,
      voluntarilyPutMoneyIn: true,
      raisedPreflop: false,
      sawFlop: true,
      wentToShowdown: true,
      wonAtShowdown: true,
      didScoop: false,
    });
    expect(summary.historyLines.at(-1)).toBe('You win $2.50 (low)');
  });

  test('session stats count only hands the hero was dealt', () => {
    const table = dealHeroAgainstBigBlind();
    playDecisions(table, [...ROBOTS_FOLD_TO_HERO, 'call', 'fold', 'check']);
    playDecisions(table, Array(6).fill('check'));
    const hand = {
      ...summarizeHand(table),
      handId: 'test-1',
      playedAt: 0,
      decisions: [],
      robotNotes: [],
      playerNote: '',
    };
    const satOut = { ...hand, isDealtIn: false };
    const stats = describeSessionStats([hand, satOut]);

    expect(stats).toContainEqual({ label: 'Hands dealt', value: '1' });
    expect(stats).toContainEqual({ label: 'Net result', value: '+$0.50' });
    expect(stats).toContainEqual({ label: 'Played (VPIP)', value: '100%' });
  });
});

describe('describeDecisionButtons', () => {
  test('facing a bet shows Fold, Call, and Raise', () => {
    const table = dealHeroAgainstBigBlind();
    playDecisions(table, ROBOTS_FOLD_TO_HERO);

    expect(heroButtons(table).map(({ label }) => label)).toEqual([
      'Fold',
      'Call $2',
      'Raise to $4',
    ]);
  });

  test('with no bet, Fold stays in place but explains that checking is free', () => {
    const table = dealHeroAgainstBigBlind();
    playDecisions(table, [...ROBOTS_FOLD_TO_HERO, 'call', 'fold', 'check']);
    playDecisions(table, ['check']);
    const [fold, check, bet] = heroButtons(table);

    expect(fold).toMatchObject({ label: 'Fold', isAvailable: false });
    expect(fold.blockedReason).toMatch(/checking is free/i);
    expect(check).toMatchObject({ label: 'Check', isAvailable: true });
    expect(bet).toMatchObject({ label: 'Bet $4', isAvailable: true });
  });
});
