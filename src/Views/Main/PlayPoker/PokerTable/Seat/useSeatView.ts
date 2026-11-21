import type { SeatView } from '@poker/display/seatView';
import { useAppSelector } from '@store/hooks';
import { selectSeatView } from '@store/slices/pokerTableViewSelectors';
import { shallowEqual } from 'react-redux';

export const useSeatView = (seatPosition: number): SeatView =>
  useAppSelector((state) => selectSeatView(state, seatPosition), shallowEqual);

export const useSeatCount = (): number =>
  useAppSelector((state) => state.pokerTable.seats.length);
