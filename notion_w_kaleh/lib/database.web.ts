/**
 * Web Mock for NK Database
 * Prevents native module crashes when running on Expo Web
 */

import * as schema from './schema';

export const db: any = null;

export async function initDatabase(): Promise<void> {
  return;
}

export { schema };
