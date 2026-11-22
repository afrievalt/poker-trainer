import { describe, expect, test } from 'vitest';

import { unlikelyRobotNote } from './unlikelyRobotNote';
import type { RobotLine } from './unlikelyRobotNote';

const line = (overrides: Partial<RobotLine>): RobotLine => ({
  playerName: 'Robot 4',
  robotStyle: 'regular',
  decision: 'bet',
  street: 'flop',
  isEarlyPosition: false,
  handStrength: 0.1,
  playersInHand: 5,
  ...overrides,
});

describe('unlikelyRobotNote', () => {
  test('flags a thin bet into several opponents', () => {
    const note = unlikelyRobotNote(line({}));

    expect(note).toContain('into 4 opponents');
    expect(note).toContain('usually check or call');
  });

  test('lets a strong hand bet for value', () => {
    expect(
      unlikelyRobotNote(line({ handStrength: 0.5, playersInHand: 2 })),
    ).toBeNull();
  });

  test('flags a calling station who bets', () => {
    const note = unlikelyRobotNote(
      line({
        robotStyle: 'callingStation',
        playersInHand: 2,
        handStrength: 0.6,
      }),
    );

    expect(note).toContain('calling station');
    expect(note).toContain('bet the flop');
  });

  test('flags an early raise with a weak starting hand', () => {
    const note = unlikelyRobotNote(
      line({
        decision: 'raise',
        street: 'preflop',
        isEarlyPosition: true,
        handStrength: 0.2,
        playersInHand: 6,
      }),
    );

    expect(note).toContain('early position');
    expect(note).toContain('0.20');
  });

  test('flags a rock betting a modest hand', () => {
    const note = unlikelyRobotNote(
      line({
        playerName: 'Robot 8',
        robotStyle: 'rock',
        street: 'turn',
        handStrength: 0.3,
        playersInHand: 2,
      }),
    );

    expect(note).toContain('A rock usually waits');
  });
});
