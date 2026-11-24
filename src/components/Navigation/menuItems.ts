import type { Screen } from '@store/slices/navigationTypes';
import { signInWithGoogle, signOutFromFirebase } from '@utils/firebaseAuth';

export interface MenuItem {
  screen: Screen;
  label: string;
}

export const MENU_ITEMS = [
  { screen: 'PlayPoker', label: 'Play Poker' },
  { screen: 'SessionReview', label: 'Analyze' },
  { screen: 'BestPossible', label: 'Best Possible' },
  { screen: 'BigO', label: 'Pick Best Hand - BigO' },
  { screen: 'Omaha', label: 'Pick Best Hand - Omaha' },
  { screen: 'OddsOmaha', label: 'Odds - Omaha' },
  { screen: 'OddsBigO', label: 'Odds - Big O' },
] as const satisfies readonly MenuItem[];

export type AccountStatus = 'signedIn' | 'signedOut';

export interface AccountAction {
  label: string;
  colorClassName: string;
  run: () => Promise<void>;
}

export const ACCOUNT_ACTIONS: Record<AccountStatus, AccountAction> = {
  signedIn: {
    label: 'Sign out',
    colorClassName: 'text-red-600',
    run: signOutFromFirebase,
  },
  signedOut: {
    label: 'Sign in with Google',
    colorClassName: 'text-indigo-600',
    run: signInWithGoogle,
  },
} as const;

export const MENU_ICON_PATHS: Record<'open' | 'closed', string> = {
  open: 'M6 18L18 6M6 6l12 12',
  closed: 'M4 6h16M4 12h16M4 18h16',
} as const;
