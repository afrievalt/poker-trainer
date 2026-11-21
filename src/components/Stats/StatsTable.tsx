import { useAppSelector } from '@store/hooks';
import {
  selectAllTimeStatLines,
  selectSessionStatLines,
} from '@store/slices/handHistorySelectors';
import React from 'react';

interface StatsTableProps {
  isAllTime?: boolean;
}

export const StatsTable: React.FC<StatsTableProps> = ({
  isAllTime = false,
}) => {
  const statLines = useAppSelector(
    isAllTime ? selectAllTimeStatLines : selectSessionStatLines,
  );

  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
      {statLines.map(({ label, value }) => (
        <React.Fragment key={label}>
          <dt className="text-gray-700">{label}</dt>
          <dd className="text-right font-semibold text-gray-900">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
};
