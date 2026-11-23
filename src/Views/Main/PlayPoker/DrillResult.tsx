import { useAppSelector } from '@store/hooks';
import { selectDrillResultMessage } from '@store/slices/drillSelectors';
import React from 'react';

export const DrillResult: React.FC = () => {
  const resultMessage = useAppSelector(selectDrillResultMessage);

  return (
    <p
      className={
        resultMessage.length === 0
          ? 'hidden'
          : 'rounded-md bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-950'
      }
    >
      {resultMessage}
    </p>
  );
};
