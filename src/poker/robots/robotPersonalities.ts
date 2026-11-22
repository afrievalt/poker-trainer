import type { RobotPersonality, RobotStyle } from './robotTypes';

export const ROBOT_PERSONALITIES: Record<RobotStyle, RobotPersonality> = {
  rock: {
    label: 'Rock',
    looseness: 0.1,
    aggression: 0.22,
    bluffFrequency: 0.01,
    stubbornness: 0.25,
  },
  tightAggressive: {
    label: 'Tight-aggressive',
    looseness: 0.28,
    aggression: 0.62,
    bluffFrequency: 0.05,
    stubbornness: 0.35,
  },
  callingStation: {
    label: 'Calling station',
    looseness: 0.8,
    aggression: 0.08,
    bluffFrequency: 0.01,
    stubbornness: 0.9,
  },
  maniac: {
    label: 'Maniac',
    looseness: 0.72,
    aggression: 0.72,
    bluffFrequency: 0.14,
    stubbornness: 0.45,
  },
  regular: {
    label: 'Regular',
    looseness: 0.38,
    aggression: 0.35,
    bluffFrequency: 0.03,
    stubbornness: 0.45,
  },
} as const;

// Robot styles by seat; seat 0 is the hero. Personas (Iteration 7) replace this.
export const ROBOT_LINEUP: readonly RobotStyle[] = [
  'regular',
  'callingStation',
  'rock',
  'tightAggressive',
  'maniac',
  'regular',
  'callingStation',
  'rock',
] as const;

export const robotStyleForSeat = (seatPosition: number): RobotStyle =>
  ROBOT_LINEUP[(seatPosition - 1) % ROBOT_LINEUP.length];
