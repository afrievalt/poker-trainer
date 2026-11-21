import { useAppSelector } from '@store/hooks';
import { selectActionBarMode } from '@store/slices/pokerTableViewSelectors';
import type { ActionBarMode } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

import { DealButton } from './DealButton';
import { DecisionButtons } from './DecisionButtons';
import { RebuyForm } from './RebuyForm';
import { SkippingMessage } from './SkippingMessage';
import { WaitingMessage } from './WaitingMessage';

const ACTION_BAR_PANELS: Record<ActionBarMode, React.FC> = {
  dealFirst: DealButton,
  handOver: DealButton,
  heroTurn: DecisionButtons,
  waiting: WaitingMessage,
  heroBroke: RebuyForm,
  skipping: SkippingMessage,
} as const;

export const ActionBar: React.FC = () => {
  const actionBarMode = useAppSelector(selectActionBarMode);
  const Panel = ACTION_BAR_PANELS[actionBarMode];

  return (
    <div className="flex min-h-20 items-center justify-center rounded-lg bg-gray-900 p-4">
      <Panel />
    </div>
  );
};
