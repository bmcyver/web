import { randomBytes as random } from 'crypto';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomHex(length: number): string {
  return random(length).toString('hex');
}
