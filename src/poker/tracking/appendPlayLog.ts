import type { PlayLogEntry } from './playLogTypes';

// Dev server appends each entry as one line of logs/hands.jsonl.
export const appendPlayLog = (entry: PlayLogEntry): void => {
  if (!import.meta.env.DEV) {
    return;
  }
  fetch('/api/hand-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch((error: unknown) => {
    console.error('Failed to write the play log', error);
  });
};
