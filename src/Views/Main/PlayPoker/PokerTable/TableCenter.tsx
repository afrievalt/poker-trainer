import { CardFace } from '@components/CardFace';
import { getCardCode } from '@poker/evaluation/cards';
import { useAppSelector } from '@store/hooks';
import {
  selectKillBanner,
  selectPotLabel,
} from '@store/slices/pokerTableViewSelectors';
import React from 'react';

export const TableCenter: React.FC = () => {
  const board = useAppSelector((state) => state.pokerTable.board);
  const potLabel = useAppSelector(selectPotLabel);
  const killBanner = useAppSelector(selectKillBanner);

  return (
    <div className="poker-table-center">
      {killBanner && <div className="kill-banner">{killBanner}</div>}
      <div className="pot-label">{potLabel}</div>
      <div className="flex gap-1">
        {board.map((card) => (
          <CardFace key={getCardCode(card)} card={card} />
        ))}
      </div>
    </div>
  );
};
