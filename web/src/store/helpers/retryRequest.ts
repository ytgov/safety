import { AxiosError } from "axios";

function isRetryable(err: unknown): boolean {
  if (!(err instanceof AxiosError)) return false;

  // Retry on network errors (no response received)
  if (err.code === "ERR_NETWORK") return true;

  // Retry on timeout
  if (err.code === "ECONNABORTED") return true;

  // Retry on server errors that are likely transient
  const status = err.response?.status;
  if (status && [502, 503, 504].includes(status)) return true;

  return false;
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !isRetryable(err)) throw err;
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error("Retry failed");
}
