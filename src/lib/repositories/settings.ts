import { cloudCall } from '@lib/data-source';
import * as local from './local/settings';
import * as remote from './remote/settings';

export async function getSetting(key: string): Promise<string | null> {
  return cloudCall(() => local.getSetting(key), () => remote.getSetting(key));
}

export async function setSetting(key: string, value: string): Promise<void> {
  return cloudCall(() => local.setSetting(key, value), () => remote.setSetting(key, value));
}
