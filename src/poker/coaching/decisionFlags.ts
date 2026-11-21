import { formatMoney } from '@poker/display/money';
import { POSITION_NAMES } from '@poker/tracking/reviewText';
import type { HeroDecisionRecord } from '@poker/tracking/trackingTypes';

import type { DecisionFlag } from './coachingTypes';

// Thresholds are deliberately simple rules of thumb for Big O.
const WEAK_START_SCORE = 0.2;
const WEAK_START_SCORE_IN_KILL = 0.3;
const BAD_CALL_FACTOR = 0.75;
const GOOD_PRICE_FACTOR = 1.5;
const LEAST_SHARE_TO_DEFEND = 0.15;
const STRONG_RELATIVE_SHARE = 1.8;
const WEAK_RELATIVE_SHARE = 0.5;
const MULTIWAY_PLAYERS = 3;
const PERCENT = 100;
const SCORE_DIGITS = 2;

const percent = (fraction: number): string =>
  `${Math.round(fraction * PERCENT)}%`;

const neededShare = (record: HeroDecisionRecord): number =>
  record.amountToCall / (record.potTotal + record.amountToCall);

const isPuttingMoneyIn = (record: HeroDecisionRecord): boolean =>
  record.decision === 'call' ||
  record.decision === 'bet' ||
  record.decision === 'raise';

const flagPreflop = (record: HeroDecisionRecord): DecisionFlag | null => {
  const weakScore = record.isKillHand
    ? WEAK_START_SCORE_IN_KILL
    : WEAK_START_SCORE;
  if (!isPuttingMoneyIn(record) || record.handStrength >= weakScore) {
    return null;
  }
  const killNote = record.isKillHand ? ' in a kill pot' : '';
  return {
    kind: 'weakStartingHand',
    message: `Played a weak starting hand (score ${record.handStrength.toFixed(SCORE_DIGITS)}) from ${POSITION_NAMES[record.position].toLowerCase()} position${killNote}.`,
  };
};

const flagPostflop = (record: HeroDecisionRecord): DecisionFlag | null => {
  const { amountToCall, decision, handStrength, playersInHand } = record;
  const needed = neededShare(record);
  const relativeShare = handStrength * playersInHand;
  const priceText = `needed ${percent(needed)}, had about ${percent(handStrength)}`;
  const flagChecks: [boolean, DecisionFlag][] = [
    [
      decision === 'call' && handStrength < needed * BAD_CALL_FACTOR,
      {
        kind: 'calledWithoutOdds',
        message: `Called ${formatMoney(amountToCall)} without the odds: ${priceText} of the pot.`,
      },
    ],
    [
      decision === 'fold' &&
        handStrength > needed * GOOD_PRICE_FACTOR &&
        handStrength > LEAST_SHARE_TO_DEFEND,
      {
        kind: 'foldedWithOdds',
        message: `Folded getting a good price: ${priceText} of the pot.`,
      },
    ],
    [
      decision === 'check' && relativeShare >= STRONG_RELATIVE_SHARE,
      {
        kind: 'missedValue',
        message: `Checked a strong hand (about ${percent(handStrength)} of the pot against ${playersInHand - 1} opponents). Bet for value.`,
      },
    ],
    [
      (decision === 'bet' || decision === 'raise') &&
        playersInHand >= MULTIWAY_PLAYERS &&
        relativeShare < WEAK_RELATIVE_SHARE,
      {
        kind: 'multiwayBluff',
        message: `Bet a weak hand into ${playersInHand - 1} opponents (about ${percent(handStrength)} of the pot).`,
      },
    ],
  ];
  return flagChecks.find(([isMatch]) => isMatch)?.[1] ?? null;
};

export const flagDecision = (
  record: HeroDecisionRecord,
): DecisionFlag | null =>
  record.street === 'preflop' ? flagPreflop(record) : flagPostflop(record);
