import { useAppSelector } from '@store/hooks';
import { selectHandTitle } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

import { ActionBar } from './ActionBar/ActionBar';
import { ActionLog } from './ActionLog/ActionLog';
import { GameRules } from './ActionLog/GameRules';
import { StatsPanel } from './ActionLog/StatsPanel';
import { PokerTable } from './PokerTable/PokerTable';

export const PlayPoker: React.FC = () => {
  const handTitle = useAppSelector(selectHandTitle);

  return (
    <div className="play-poker-layout">
      <main className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{handTitle}</h1>
        <PokerTable />
        <ActionBar />
      </main>
      <aside className="flex flex-col gap-3">
        <ActionLog />
        <StatsPanel />
        <GameRules />
      </aside>
    </div>
  );
};
