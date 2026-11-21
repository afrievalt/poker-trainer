import { useAppSelector } from '@store/hooks';
import { selectSeatPositions } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

import { BetChip } from './BetChip';
import { Seat } from './Seat/Seat';
import { TableCenter } from './TableCenter';

export const PokerTable: React.FC = () => {
  const seatPositions = useAppSelector(selectSeatPositions);

  return (
    <div className="poker-table">
      <div className="poker-felt" />
      <TableCenter />
      {seatPositions.map((seatPosition) => (
        <BetChip key={`bet-${seatPosition}`} seatPosition={seatPosition} />
      ))}
      {seatPositions.map((seatPosition) => (
        <Seat key={`seat-${seatPosition}`} seatPosition={seatPosition} />
      ))}
    </div>
  );
};
