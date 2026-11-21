import { summarizeGameStructure } from '@poker/config/gameStructureSummary';
import { useAppSelector } from '@store/hooks';
import React, { useMemo } from 'react';

export const GameRules: React.FC = () => {
  const structure = useAppSelector((state) => state.pokerTable.structure);
  const ruleLines = useMemo(
    () => summarizeGameStructure(structure),
    [structure],
  );

  return (
    <section className="rounded-lg bg-white p-3 shadow">
      <h2 className="mb-2 font-bold text-gray-900">Game rules</h2>
      <ul className="list-disc pl-5 text-sm text-gray-800">
        {ruleLines.map((ruleLine) => (
          <li key={ruleLine}>{ruleLine}</li>
        ))}
      </ul>
    </section>
  );
};
