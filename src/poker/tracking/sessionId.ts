import { generateUUID } from '@utils/uuid';

// Identifies this page load, so hand ids and log lines stay unique.
export const SESSION_ID = generateUUID();
