import React from 'react';

import { AccountMenuButton } from './AccountMenuButton';
import { MenuItemButton } from './MenuItemButton';
import { MENU_ITEMS } from './menuItems';

interface MenuDropdownProps {
  onClose: () => void;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({ onClose }) => {
  return (
    <div className="ring-opacity-5 absolute right-0 z-50 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black">
      <div className="border-b border-gray-100 py-1">
        {MENU_ITEMS.map((menuItem) => (
          <MenuItemButton
            key={menuItem.screen}
            screen={menuItem.screen}
            label={menuItem.label}
            onClose={onClose}
          />
        ))}
      </div>
      <div className="py-1">
        <AccountMenuButton onClose={onClose} />
      </div>
    </div>
  );
};
