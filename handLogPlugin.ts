import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

const HAND_LOG_PATH = path.resolve('logs/hands.jsonl');

const writeLogLine = (body: string): void => {
  const line = body.trim();
  if (line.length === 0) {
    return;
  }
  fs.mkdirSync(path.dirname(HAND_LOG_PATH), { recursive: true });
  fs.appendFileSync(HAND_LOG_PATH, `${line}\n`);
};

// Accepts one JSON play-log entry and appends it to logs/hands.jsonl.
export const handLogPlugin = (): Plugin => ({
  name: 'hand-log',
  configureServer(server) {
    server.middlewares.use('/api/hand-log', (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end();
        return;
      }
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => {
        chunks.push(Buffer.from(chunk));
      });
      request.on('end', () => {
        writeLogLine(Buffer.concat(chunks).toString('utf8'));
        response.statusCode = 204;
        response.end();
      });
    });
  },
});
