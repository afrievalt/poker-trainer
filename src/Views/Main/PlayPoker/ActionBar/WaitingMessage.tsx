import { useAppSelector } from '@store/hooks';
import { selectWaitingMessage } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

export const WaitingMessage: React.FC = () => {
  const waitingMessage = useAppSelector(selectWaitingMessage);

  return <p className="text-lg text-gray-200 italic">{waitingMessage}</p>;
};
