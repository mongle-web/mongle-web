export interface RequestLock {
  current: boolean;
}

export async function runWithRequestLock(lock: RequestLock, action: () => Promise<void>) {
  if (lock.current) {
    return false;
  }

  lock.current = true;

  try {
    await action();
    return true;
  } finally {
    lock.current = false;
  }
}
