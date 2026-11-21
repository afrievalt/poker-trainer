import type { Seat, TableState } from './tableTypes';

// Seats in clockwise order, starting with the seat after startSeat.
export const seatsAfter = (table: TableState, startSeat: number): Seat[] => {
  const { seats } = table;
  const startIndex = seats.findIndex((seat) => seat.seatPosition === startSeat);
  return [...seats.slice(startIndex + 1), ...seats.slice(0, startIndex + 1)];
};

export const isInHand = (seat: Seat): boolean =>
  seat.isDealtIn && !seat.hasFolded;

export const canAct = (seat: Seat): boolean => isInHand(seat) && seat.stack > 0;

export const nextSeatAfter = (
  table: TableState,
  startSeat: number,
  isMatch: (seat: Seat) => boolean,
): Seat | undefined => seatsAfter(table, startSeat).find(isMatch);

export const getSeat = (table: TableState, seatPosition: number): Seat => {
  const seat = table.seats.find(
    (candidate) => candidate.seatPosition === seatPosition,
  );
  if (!seat) {
    throw new Error(`No seat at position ${seatPosition}`);
  }
  return seat;
};

export const playersInHand = (table: TableState): Seat[] =>
  table.seats.filter(isInHand);

// Clockwise from the seat after the button; used for odd chips and dealing.
export const seatsFromButton = (table: TableState): Seat[] =>
  seatsAfter(table, table.buttonSeat);

export const requireSeatAfter = (
  table: TableState,
  startSeat: number,
  isMatch: (seat: Seat) => boolean,
): Seat => {
  const seat = nextSeatAfter(table, startSeat, isMatch);
  if (!seat) {
    throw new Error(`No matching seat after position ${startSeat}`);
  }
  return seat;
};
