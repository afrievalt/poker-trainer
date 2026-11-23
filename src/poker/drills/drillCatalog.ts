import type { Decision } from '@poker/engine/tableTypes';

import type { DrillPlan } from './drillTypes';
import { parseCardCodes } from './parseCardCodes';

export const LATE_ACE_TWO_DRILL: DrillPlan = {
  title: 'Late position, ace-two',
  heroCards: parseCardCodes('AS 2S 3H KD QC'),
  board: parseCardCodes('4D 5H 8C KC JD'),
  targetStreet: 'preflop',
  recommended: 'raise',
  explanation:
    'A double-suited ace-two-three is a raise from late position. It has the nut low draw and a suited ace.',
  shouldOpenTable: false,
};

export const describeDrillResult = (
  decision: Decision,
  recommended: Decision | null,
  explanation: string,
): string => {
  if (recommended === null) {
    return `You chose to ${decision}. ${explanation}`;
  }
  if (decision === recommended) {
    return `You chose to ${decision}. That matches this drill. ${explanation}`;
  }
  return `You chose to ${decision}. This drill plays a ${recommended}. ${explanation}`;
};
