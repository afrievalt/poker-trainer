import React, { useState } from 'react';

import { MenuDropdown } from './MenuDropdown';
import { MENU_ICON_PATHS } from './menuItems';

export const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const iconPath = MENU_ICON_PATHS[isOpen ? 'open' : 'closed'];

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d={iconPath} />
        </svg>
      </button>
      {isOpen && <MenuDropdown onClose={handleClose} />}
    </div>
  );
};
