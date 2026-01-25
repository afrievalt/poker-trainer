import { useFirebaseAuth } from '@hooks/useFirebaseAuth';
import { useHiLoActions } from '@hooks/useHiLoActions';
import type { User } from 'firebase/auth';
import React, { useState } from 'react';

import {
  signInWithGoogle,
  signOutFromFirebase,
} from '../../utils/firebaseAuth';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HamburgerMenuProps {}

const MenuDropdown: React.FC<{
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onSetMode: (mode: 'BestPossible' | 'BigO' | 'Omaha') => void;
  onClose: () => void;
}> = ({ user, onSignIn, onSignOut, onSetMode, onClose }) => {
  const handleModeClick = (mode: 'BestPossible' | 'BigO' | 'Omaha') => {
    onSetMode(mode);
    onClose();
  };

  return (
    <div className="ring-opacity-5 absolute right-0 z-50 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black">
      <div className="border-b border-gray-100 py-1">
        <button
          onClick={() => handleModeClick('BestPossible')}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Best Possible
        </button>
        <button
          onClick={() => handleModeClick('BigO')}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Pick Best Hand - BigO
        </button>
        <button
          onClick={() => handleModeClick('Omaha')}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Pick Best Hand - Omaha
        </button>
      </div>

      <div className="py-1">
        {user ? (
          <button
            onClick={onSignOut}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={onSignIn}
            className="block w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-50"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
};

export const HamburgerMenu: React.FC<HamburgerMenuProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useFirebaseAuth();
  const { onSetMode } = useHiLoActions();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to sign in', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromFirebase();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <MenuDropdown
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSetMode={onSetMode}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
