import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { Decision } from '@poker/engine/tableTypes';
import { useAppDispatch } from '@store/hooks';
import { playerActed } from '@store/slices/pokerTableSlice';
import React from 'react';

const DECISION_COLORS: Record<Decision, string> = {
  fold: 'bg-red-700 hover:bg-red-600 text-white',
  check: 'bg-sky-700 hover:bg-sky-600 text-white',
  call: 'bg-sky-700 hover:bg-sky-600 text-white',
  bet: 'bg-emerald-700 hover:bg-emerald-600 text-white',
  raise: 'bg-emerald-700 hover:bg-emerald-600 text-white',
} as const;

const BLOCKED_COLORS = 'bg-gray-700 text-gray-400 cursor-not-allowed';

interface DecisionButtonProps {
  decision: Decision;
  label: string;
  isAvailable?: boolean;
  blockedReason?: string;
  onBlockedClick: (blockedReason: string) => void;
}

// Unavailable buttons stay in place, look disabled, and explain why.
export const DecisionButton: React.FC<DecisionButtonProps> = ({
  decision,
  label,
  isAvailable = true,
  blockedReason = '',
  onBlockedClick,
}) => {
  const dispatch = useAppDispatch();
  const colorClassName = isAvailable
    ? DECISION_COLORS[decision]
    : BLOCKED_COLORS;

  const handleClick = () =>
    isAvailable
      ? dispatch(playerActed({ seatPosition: HERO_SEAT_POSITION, decision }))
      : onBlockedClick(blockedReason);

  return (
    <button
      onClick={handleClick}
      aria-disabled={!isAvailable}
      className={`w-40 rounded-md px-4 py-3 font-bold ${colorClassName}`}
    >
      {label}
    </button>
  );
};
