import { getDataSource } from './data-source';
import { isAuthError, reportAuthError } from '@lib/auth';

export async function cloudCall<T>(localFn: () => Promise<T>, remoteFn: () => Promise<T>): Promise<T> {
  if (getDataSource() === 'local') return localFn();
  try {
    return await remoteFn();
  } catch (error) {
    if (isAuthError(error)) {
      setTimeout(() => reportAuthError(), 0);
    }
    throw error;
  }
}
