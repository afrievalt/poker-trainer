import { useAppSelector } from '@store/hooks';
import { selectActionLogLines } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

export const ActionLog: React.FC = () => {
  const logLines = useAppSelector(selectActionLogLines);

  return (
    <section className="rounded-lg bg-white p-3 shadow">
      <h2 className="mb-2 font-bold text-gray-900">Hand history</h2>
      <div className="action-log-scroller">
        <ol className="text-sm text-gray-800">
          {logLines.map((logLine, lineNumber) => (
            <li key={`${lineNumber}-${logLine}`}>{logLine}</li>
          ))}
        </ol>
      </div>
    </section>
  );
};
