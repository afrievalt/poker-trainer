import { z } from 'zod';

const NOTE_LIMIT = 200;

export interface HandNoteValues {
  playerNote: string;
}

const playerNoteSchema = z
  .string()
  .trim()
  .max(NOTE_LIMIT, `Keep the note to ${NOTE_LIMIT} characters.`);

export const validatePlayerNote = (playerNote: string): true | string => {
  const result = playerNoteSchema.safeParse(playerNote);
  return result.success ? true : result.error.issues[0].message;
};
