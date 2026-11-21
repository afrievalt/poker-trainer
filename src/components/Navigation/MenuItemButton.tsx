import { useAppDispatch } from '@store/hooks';
import { menuItemChosen } from '@store/slices/navigationSlice';
import type { Screen } from '@store/slices/navigationTypes';
import React from 'react';

interface MenuItemButtonProps {
  screen: Screen;
  label: string;
  onClose: () => void;
}

export const MenuItemButton: React.FC<MenuItemButtonProps> = ({
  screen,
  label,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(menuItemChosen(screen));
    onClose();
  };

  return (
    <button
      onClick={handleClick}
      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
    >
      {label}
    </button>
  );
};
