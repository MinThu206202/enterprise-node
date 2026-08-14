const MAX_ATTEMPTS = 5;

const BASE_DELAY_MS = 1_000;

export function getNextRetryAt(attempts: number): Date {
  const delay = BASE_DELAY_MS * Math.pow(2, attempts);

  return new Date(Date.now() + delay);
}

export function shouldRetry(attempts: number): boolean {
  return attempts < MAX_ATTEMPTS;
}

export function getMaxAttempts(): number {
  return MAX_ATTEMPTS;
}
