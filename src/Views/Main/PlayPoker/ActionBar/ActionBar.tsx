import { useAppSelector } from '@store/hooks';
import {
  selectCanReplayHand,
  selectIsHandReplaying,
} from '@store/slices/handReplaySelectors';
import { selectActionBarMode } from '@store/slices/pokerTableViewSelectors';
import type { ActionBarMode } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

import { DealButton } from './DealButton';
import { DecisionButtons } from './DecisionButtons';
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
  const isReplaying = useAppSelector(selectIsHandReplaying);
  const isReplayOffered = canReplayHand || isReplaying;
  const Panel = ACTION_BAR_PANELS[actionBarMode];

  return (
    <div className="flex min-h-20 items-center justify-center gap-3 rounded-lg bg-gray-900 p-4">
      {canReplayHand && <ReplayHandButton />}
      {isReplayOffered && <ShowHandsCheckbox />}
      <Panel />
    </div>
  );
};
