import { gameStructureSchema } from './gameStructureSchema';
import type { GameStructure } from './gameStructureTypes';

// Edit this list to add or change game structures.
const GAME_STRUCTURE_CONFIG = [
  {
    title: 'Bobs BigO',
    seatCount: 9,
    isButtonSittingOut: true,
    variant: 'BigO',
    bettingType: 'fixedLimit',
    startingStack: 97,
    smallestChip: 0.5,
    rakeSteps: [
      { potAtLeast: 20, amount: 1 },
      { potAtLeast: 40, amount: 1 },
    ],
    isRebuyAnyAmount: true,
    blinds: { small: 1, big: 2 },
    betSizes: { preflop: 2, flop: 4, turn: 8, river: 8 },
    raisesPerStreet: 3,
    isCapLiftedHeadsUp: true,
    kill: {
      trigger: 'scoop',
      minimumPot: 50,
      bringIn: 6,
      isPostedByWinner: true,
      isRepeatable: true,
      betSizes: { preflop: 6, flop: 6, turn: 12, river: 12 },
    },
  },
] as const satisfies readonly GameStructure[];

export const GAME_STRUCTURES: readonly GameStructure[] = gameStructureSchema
  .array()
  .parse(GAME_STRUCTURE_CONFIG);

export const DEFAULT_GAME_STRUCTURE: GameStructure = GAME_STRUCTURE_CONFIG[0];
