import type { BettingStreet, Decision } from '@poker/engine/tableTypes';

import type { RobotStyle } from './robotTypes';

const PERCENT = 100;
const SCORE_DIGITS = 2;
const MULTIWAY_PLAYERS = 4;
const WEAK_RELATIVE_SHARE = 0.8;
const EARLY_RAISE_SCORE = 0.45;
const ROCK_RELATIVE_SHARE = 1.4;
const AGGRESSIVE_DECISIONS: readonly Decision[] = ['bet', 'raise'];
const ACTION_PHRASE: Record<'bet' | 'raise', string> = {
  bet: 'bet',
  raise: 'raised',
};

export interface RobotLine {
  playerName: string;
  robotStyle: RobotStyle;
  decision: Decision;
  street: BettingStreet;
  isEarlyPosition: boolean;
  handStrength: number;
  playersInHand: number;
}

const isAggressive = (decision: Decision): boolean =>
  AGGRESSIVE_DECISIONS.includes(decision);

const percent = (fraction: number): string =>
  `${Math.round(fraction * PERCENT)}%`;

const actionPhrase = (line: RobotLine): string => {
  const verb = ACTION_PHRASE[line.decision === 'raise' ? 'raise' : 'bet'];
  const street = line.street === 'preflop' ? 'preflop' : `the ${line.street}`;
  return `${verb} ${street}`;
};

const earlyRaiseNote = (line: RobotLine): string | null => {
  const isEarlyRaise =
    line.street === 'preflop' &&
    line.decision === 'raise' &&
    line.isEarlyPosition &&
    line.handStrength < EARLY_RAISE_SCORE;
  if (!isEarlyRaise) {
    return null;
  }
  const score = line.handStrength.toFixed(SCORE_DIGITS);
  return `${line.playerName} raised from early position with a weak starting hand (score ${score}). Players in this game usually fold there.`;
};

const stationBetNote = (line: RobotLine): string | null => {
  if (line.robotStyle !== 'callingStation' || !isAggressive(line.decision)) {
    return null;
  }
  return `${line.playerName}, a calling station, ${actionPhrase(line)}. A calling station usually calls or folds.`;
};

const multiwayBetNote = (line: RobotLine): string | null => {
  const relativeShare = line.handStrength * line.playersInHand;
  const isThinMultiway =
    line.street !== 'preflop' &&
    isAggressive(line.decision) &&
    line.playersInHand >= MULTIWAY_PLAYERS &&
    relativeShare < WEAK_RELATIVE_SHARE;
  if (!isThinMultiway) {
    return null;
  }
  const opponents = line.playersInHand - 1;
  return `${line.playerName} ${actionPhrase(line)} into ${opponents} opponents with about ${percent(line.handStrength)} of the pot. Players in this game usually check or call.`;
};

const rockBetNote = (line: RobotLine): string | null => {
  const relativeShare = line.handStrength * line.playersInHand;
  const isThinRockBet =
    line.robotStyle === 'rock' &&
    line.street !== 'preflop' &&
    isAggressive(line.decision) &&
    relativeShare < ROCK_RELATIVE_SHARE;
  if (!isThinRockBet) {
    return null;
  }
  return `${line.playerName}, a rock, ${actionPhrase(line)} with about ${percent(line.handStrength)} of the pot. A rock usually waits for a stronger hand.`;
};

// A sentence when this action is unlike a person in a fixed-limit Big O game.
export const unlikelyRobotNote = (line: RobotLine): string | null =>
  [
    earlyRaiseNote(line),
    stationBetNote(line),
    multiwayBetNote(line),
    rockBetNote(line),
  ].find((note) => note !== null) ?? null;
