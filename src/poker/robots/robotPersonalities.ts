import type { RobotPersonality, RobotStyle } from './robotTypes';

export const ROBOT_PERSONALITIES: Record<RobotStyle, RobotPersonality> = {
  rock: {
    label: 'Rock',
    looseness: 0.1,
    aggression: 0.3,
    bluffFrequency: 0.02,
    stubbornness: 0.2,
  },
  tightAggressive: {
    label: 'Tight-aggressive',
    looseness: 0.3,
    aggression: 0.8,
    bluffFrequency: 0.1,
    stubbornness: 0.3,
  },
  callingStation: {
    label: 'Calling station',
    looseness: 0.85,
    aggression: 0.1,
    bluffFrequency: 0.02,
    stubbornness: 0.9,
  },
  maniac: {
    label: 'Maniac',
    looseness: 0.9,
    aggression: 0.95,
    bluffFrequency: 0.35,
    stubbornness: 0.6,
  },
  regular: {
    label: 'Regular',
    looseness: 0.45,
    aggression: 0.5,
    bluffFrequency: 0.08,
    stubbornness: 0.5,
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
