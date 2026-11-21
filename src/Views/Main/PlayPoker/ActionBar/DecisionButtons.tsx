import { useAppSelector } from '@store/hooks';
import { selectHeroDecisionButtons } from '@store/slices/pokerTableViewSelectors';
import React, { useState } from 'react';

import { DecisionButton } from './DecisionButton';

export const DecisionButtons: React.FC = () => {
  const decisionButtons = useAppSelector(selectHeroDecisionButtons);
  const [blockedMessage, setBlockedMessage] = useState('');

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        {decisionButtons.map((button) => (
          <DecisionButton
            key={button.decision}
            decision={button.decision}
            label={button.label}
            isAvailable={button.isAvailable}
            blockedReason={button.blockedReason}
            onBlockedClick={setBlockedMessage}
          />
        ))}
      </div>
      <p className="min-h-5 text-sm text-amber-200">{blockedMessage}</p>
    </div>
  );
};
