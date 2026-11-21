import { useFirebaseAuth } from '@hooks/useFirebaseAuth';
import React from 'react';

import { ACCOUNT_ACTIONS } from './menuItems';

interface AccountMenuButtonProps {
  onClose: () => void;
}

export const AccountMenuButton: React.FC<AccountMenuButtonProps> = ({
  onClose,
}) => {
  const { user } = useFirebaseAuth();
  const accountAction = ACCOUNT_ACTIONS[user ? 'signedIn' : 'signedOut'];

  const handleClick = () => {
    accountAction
      .run()
      .then(onClose)
      .catch((error: unknown) => {
        console.error(`Failed to ${accountAction.label}`, error);
      });
  };

  return (
    <button
      onClick={handleClick}
      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${accountAction.colorClassName}`}
    >
      {accountAction.label}
    </button>
  );
};
