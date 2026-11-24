import { formatMoney } from '@poker/display/money';
import type { Decision } from '@poker/engine/tableTypes';
import { formatCards } from '@poker/evaluation/cardText';

import { formatSignedMoney } from './sessionStats';
import type {
  HandRecord,
  HeroDecisionRecord,
  TablePosition,
} from './trackingTypes';

const PERCENT = 100;
const SCORE_DIGITS = 2;

export const POSITION_NAMES: Record<TablePosition, string> = {
  smallBlind: 'Small blind',
  bigBlind: 'Big blind',
  early: 'Early',
  middle: 'Middle',
  late: 'Late',
} as const;

const DECISION_NAMES: Record<Decision, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
} as const;

const STREET_NAMES: Record<HeroDecisionRecord['street'], string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
} as const;

export interface HandListItem {
  handId: string;
  title: string;
  resultText: string;
  tagsText: string;
  isStarred: boolean;
}

const describeStrength = (record: HeroDecisionRecord): string =>
  record.street === 'preflop'
    ? `hand score ${record.handStrength.toFixed(SCORE_DIGITS)}`
    : `pot share ${Math.round(record.handStrength * PERCENT)}%`;

const describePrice = (record: HeroDecisionRecord): string => {
  if (record.amountToCall === 0) {
    return 'no bet to call';
  }
  const potOdds = record.amountToCall / (record.potTotal + record.amountToCall);
  return `${formatMoney(record.amountToCall)} to call, needs ${Math.round(potOdds * PERCENT)}%`;
};

export const describeDecision = (record: HeroDecisionRecord): string =>
  [
    STREET_NAMES[record.street],
    DECISION_NAMES[record.decision],
    describePrice(record),
    describeStrength(record),
    `${record.playersInHand} players`,
  ].join(' · ');

const formatPlayedDate = (playedAt: number): string =>
  playedAt === 0
    ? ''
    : new Date(playedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

export const describeHandListItem = (hand: HandRecord): HandListItem => {
  const tags = [
    hand.isStarred ? '★' : '',
    formatPlayedDate(hand.playedAt),
    hand.position ? POSITION_NAMES[hand.position] : '',
    hand.isKillHand ? 'Kill' : '',
    hand.wentToShowdown ? 'Showdown' : '',
    hand.didScoop ? 'Scoop' : '',
  ].filter(Boolean);
  return {
    handId: hand.handId,
    title: `#${hand.handNumber} ${formatCards(hand.holeCards)}`,
    resultText: formatSignedMoney(hand.netResult),
    tagsText: tags.join(' · '),
    isStarred: hand.isStarred,
  };
};
