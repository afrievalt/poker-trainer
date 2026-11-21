const CENT_DIGITS = 2;

// "$2" for whole dollars, "$2.50" otherwise.
export const formatMoney = (amount: number): string =>
  `$${Number.isInteger(amount) ? amount : amount.toFixed(CENT_DIGITS)}`;
