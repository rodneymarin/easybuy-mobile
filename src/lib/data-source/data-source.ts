import { storage } from '@lib/supabase';
import { resetDatabase } from '@lib/database';

const DATA_SOURCE_KEY = 'data_source';

export type DataSourceType = 'local' | 'cloud';

let _dataSource: DataSourceType = 'local';
let _refreshVersion = 0;
const _listeners = new Set<() => void>();

export async function initDataSource(): Promise<DataSourceType> {
  try {
    const saved = await storage.getItem(DATA_SOURCE_KEY);
    if (saved === 'local' || saved === 'cloud') {
      _dataSource = saved;
    } else {
      _dataSource = 'local';
      await storage.setItem(DATA_SOURCE_KEY, 'local');
    }
  } catch {
    _dataSource = 'local';
  }
  return _dataSource;
}

export function getDataSource(): DataSourceType {
  return _dataSource;
}

export async function setDataSource(source: DataSourceType): Promise<void> {
  if (source === _dataSource) return;
  _dataSource = source;
  await storage.setItem(DATA_SOURCE_KEY, source);
  _refreshVersion++;
  _listeners.forEach((fn) => fn());
}

export function getRefreshVersion(): number {
  return _refreshVersion;
}

export function bumpRefreshVersion(): void {
  _refreshVersion++;
  _listeners.forEach((fn) => fn());
}

export async function resetLocalData(): Promise<void> {
  if (_dataSource !== 'local') return;
  await resetDatabase();
  _refreshVersion++;
  _listeners.forEach((fn) => fn());
}

export function subscribeToDataSourceChange(listener: () => void): () => void {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}
