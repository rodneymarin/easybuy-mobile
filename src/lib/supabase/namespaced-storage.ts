import { baseStorage } from './storage';

const NAMESPACE = 'easybuy.';

function namespaced(key: string): string {
  return `${NAMESPACE}${key}`;
}

export const namespacedStorage = {
  getItem: async (key: string) => baseStorage.getItem(namespaced(key)),
  setItem: async (key: string, value: string) => baseStorage.setItem(namespaced(key), value),
  removeItem: async (key: string) => baseStorage.removeItem(namespaced(key)),
};
