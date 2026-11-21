export type RobotStyle =
  | 'rock'
  | 'tightAggressive'
  | 'callingStation'
  | 'maniac'
  | 'regular';

// Every trait runs from 0 (none) to 1 (extreme).
export interface RobotPersonality {
  label: string;
  looseness: number;
  aggression: number;
  bluffFrequency: number;
  stubbornness: number;
}
