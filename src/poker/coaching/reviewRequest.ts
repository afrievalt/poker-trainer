import type { BettingStreet } from '@poker/engine/tableTypes';
import { formatCards } from '@poker/evaluation/cardText';
import { describeDecision, POSITION_NAMES } from '@poker/tracking/reviewText';
import type { HandRecord } from '@poker/tracking/trackingTypes';

import { flagsForHand } from './coachingPlan';

const BOARD_COUNT: Record<BettingStreet, number> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
} as const;

const SHOWDOWN_PREFIX = '— Showdown';

const boardAtStreet = (hand: HandRecord, street: BettingStreet): string => {
  const cards = hand.board.slice(0, BOARD_COUNT[street]);
  return cards.length === 0 ? 'no board yet' : formatCards(cards);
};

const splitHistory = (
  lines: string[],
): { action: string[]; hindsight: string[] } => {
  const showdownStart = lines.findIndex((line) =>
    line.startsWith(SHOWDOWN_PREFIX),
  );
  if (showdownStart === -1) {
    return { action: lines, hindsight: [] };
  }
  return {
    action: lines.slice(0, showdownStart),
    hindsight: lines.slice(showdownStart),
  };
};

const decisionLines = (hand: HandRecord): string[] =>
  hand.decisions.map(
    (decision) =>
      `- ${describeDecision(decision)}. Board: ${boardAtStreet(hand, decision.street)}.`,
  );

const instruction = [
  'Review this fixed-limit Big O (five-card Omaha high-low) hand.',
  'Grade the hero only from "At the time".',
  'Use "Hindsight" to say how the hand finished, not to judge a decision with cards the hero had not seen.',
  'Reply in one short paragraph: the street that mattered, what the hero did, one better action, and why.',
  'Use Big O terms: nut low, danglers, kill pot, multiway pots, and capped betting.',
  'If the play was fine, say so.',
  "Compare your reply with the hero's own note.",
].join(' ');

// Text an outside review can grade without seeing hidden cards too early.
export const buildReviewRequest = (hand: HandRecord): string => {
  const history = splitHistory(hand.historyLines);
  const decisions = decisionLines(hand);
  const flags = flagsForHand(hand).map((flag) => `- ${flag.message}`);
  const note =
    hand.playerNote.length > 0
      ? hand.playerNote
      : 'The hero did not write a note.';
  const cards =
    hand.holeCards.length > 0 ? formatCards(hand.holeCards) : 'not recorded';
  const place = hand.position ? POSITION_NAMES[hand.position] : 'not dealt in';
  const kill = hand.isKillHand ? 'Kill pot.' : 'No kill.';
  return [
    instruction,
    '',
    "Hero's own note:",
    note,
    '',
    'At the time:',
    `Hand #${hand.handNumber}. ${place}. ${kill} Hero cards: ${cards}.`,
    'Decisions:',
    ...(decisions.length > 0
      ? decisions
      : ['- No hero decision was recorded.']),
    'Action:',
    ...(history.action.length > 0 ? history.action : ['- No action recorded.']),
    'Automatic flags:',
    ...(flags.length > 0 ? flags : ['- None.']),
    '',
    'Hindsight:',
    `Final board: ${hand.board.length > 0 ? formatCards(hand.board) : 'none'}.`,
    ...(history.hindsight.length > 0
      ? history.hindsight
      : ['No showdown was recorded.']),
  ].join('\n');
};
