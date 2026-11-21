import React from 'react';

import { useSeatCount, useSeatView } from './Seat/useSeatView';
import { betPlacement } from './seatLayout';

interface BetChipProps {
  seatPosition: number;
}

export const BetChip: React.FC<BetChipProps> = ({ seatPosition }) => {
  const { betLabel } = useSeatView(seatPosition);
  const placement = betPlacement(seatPosition, useSeatCount());

  return (
    betLabel && (
      <div className="bet-chip" style={placement}>
        {betLabel}
      </div>
    )
  );
};
