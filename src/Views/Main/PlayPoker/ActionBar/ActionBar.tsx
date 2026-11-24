import { StarHandButton } from '@components/StarHandButton';
import { useAppSelector } from '@store/hooks';
import { selectLastDealtHandId } from '@store/slices/handHistorySelectors';
import {
  selectCanReplayHand,
  selectIsHandReplaying,
} from '@store/slices/handReplaySelectors';
import { selectActionBarMode } from '@store/slices/pokerTableViewSelectors';
import type { ActionBarMode } from '@store/slices/pokerTableViewSelectors';
import { selectIsRebuyOffered } from '@store/slices/rebuySelectors';
import React from 'react';

import { DealButton } from './DealButton';
import { DecisionButtons } from './DecisionButtons';
import { PracticeHandButton } from './PracticeHandButton';
import { RebuyForm } from './RebuyForm';
import { ReplayHandButton } from './ReplayHandButton';
import { ReplayingMessage } from './ReplayingMessage';
import { ShowHandsCheckbox } from './ShowHandsCheckbox';
import { SkippingMessage } from './SkippingMessage';
import { WaitingMessage } from './WaitingMessage';

const ACTION_BAR_PANELS: Record<ActionBarMode, React.FC> = {
  dealFirst: DealButton,
  handOver: DealButton,
  heroTurn: DecisionButtons,
  waiting: WaitingMessage,
  heroBroke: RebuyForm,
  skipping: SkippingMessage,
  replaying: ReplayingMessage,
} as const;

export const ActionBar: React.FC = () => {
  const actionBarMode = useAppSelector(selectActionBarMode);
  const canReplayHand = useAppSelector(selectCanReplayHand);
  const isRebuyOffered = useAppSelector(selectIsRebuyOffered);
  const isReplaying = useAppSelector(selectIsHandReplaying);
  const lastDealtHandId = useAppSelector(selectLastDealtHandId);
  const isReplayOffered = canReplayHand || isReplaying;
  const Panel = ACTION_BAR_PANELS[actionBarMode];

  return (
    <div className="flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-lg bg-gray-900 p-4">
      {canReplayHand && <ReplayHandButton />}
      {isReplayOffered && <ShowHandsCheckbox />}
      <PracticeHandButton />
      <StarHandButton handId={lastDealtHandId} />
      {isRebuyOffered && <RebuyForm />}
      <Panel />
    </div>
  );
};
