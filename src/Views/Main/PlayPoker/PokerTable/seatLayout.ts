import type { CSSProperties } from 'react';

// Seats sit on an ellipse; the hero is at the bottom and seats go clockwise.
const CENTER_PERCENT = 50;
const HORIZONTAL_RADIUS_PERCENT = 45;
const VERTICAL_RADIUS_PERCENT = 40;
const BET_RADIUS_SCALE = 0.6;
const HERO_ANGLE_DEGREES = 90;
const FULL_CIRCLE_DEGREES = 360;
const HALF_CIRCLE_DEGREES = 180;

const pointOnTable = (
  seatPosition: number,
  seatCount: number,
  radiusScale: number,
): CSSProperties => {
  const degrees =
    HERO_ANGLE_DEGREES + (seatPosition * FULL_CIRCLE_DEGREES) / seatCount;
  const radians = (degrees * Math.PI) / HALF_CIRCLE_DEGREES;
  const left =
    CENTER_PERCENT +
    HORIZONTAL_RADIUS_PERCENT * radiusScale * Math.cos(radians);
  const top =
    CENTER_PERCENT + VERTICAL_RADIUS_PERCENT * radiusScale * Math.sin(radians);
  return { left: `${left}%`, top: `${top}%` };
};

export const seatPlacement = (
  seatPosition: number,
  seatCount: number,
): CSSProperties => pointOnTable(seatPosition, seatCount, 1);

export const betPlacement = (
  seatPosition: number,
  seatCount: number,
): CSSProperties => pointOnTable(seatPosition, seatCount, BET_RADIUS_SCALE);
