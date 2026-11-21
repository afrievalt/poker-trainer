import { describe, expect, test } from 'vitest';

import { DEFAULT_GAME_STRUCTURE, GAME_STRUCTURES } from './gameStructures';
import { gameStructureSchema } from './gameStructureSchema';

describe('gameStructures', () => {
  test('Bobs BigO is the default structure', () => {
    expect(GAME_STRUCTURES).toHaveLength(1);
    expect(DEFAULT_GAME_STRUCTURE.title).toBe('Bobs BigO');
    expect(DEFAULT_GAME_STRUCTURE.startingStack).toBe(97);
    expect(DEFAULT_GAME_STRUCTURE.kill.betSizes.flop).toBe(6);
  });

  test('rejects a structure with a missing kill rule', () => {
    const { kill: _kill, ...withoutKill } = DEFAULT_GAME_STRUCTURE;
    expect(gameStructureSchema.safeParse(withoutKill).success).toBe(false);
  });
});
