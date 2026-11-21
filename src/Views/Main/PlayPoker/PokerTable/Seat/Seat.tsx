import React from 'react';

import { seatPlacement } from '../seatLayout';

import { SeatCards } from './SeatCards';
import { useSeatCount, useSeatView } from './useSeatView';

interface SeatProps {
  seatPosition: number;
}

export const Seat: React.FC<SeatProps> = ({ seatPosition }) => {
  const seatView = useSeatView(seatPosition);
  const placement = seatPlacement(seatPosition, useSeatCount());

  return (
    <div className="poker-seat" style={placement}>
      <SeatCards seatPosition={seatPosition} />
      <div className={`seat-plate seat-plate--${seatView.status}`}>
        <div>{seatView.playerName}</div>
        <div className="seat-style">{seatView.styleLabel}</div>
        <div className="seat-stack">{seatView.stackLabel}</div>
        <div className="seat-badge">{seatView.badgeLabel}</div>
        {seatView.isButton && <span className="dealer-button">D</span>}
      </div>
    </div>
  );
};
