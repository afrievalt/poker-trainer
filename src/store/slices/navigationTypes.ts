export const TRAINER_MODES = [
  'BestPossible',
  'BigO',
  'Omaha',
  'OddsOmaha',
  'OddsBigO',
] as const;

export type TrainerMode = (typeof TRAINER_MODES)[number];

export type Screen = 'PlayPoker' | 'SessionReview' | TrainerMode;

export const isTrainerMode = (screen: Screen): screen is TrainerMode =>
  (TRAINER_MODES as readonly Screen[]).includes(screen);
