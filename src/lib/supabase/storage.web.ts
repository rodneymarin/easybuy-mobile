const webStorage = typeof window !== 'undefined' ? window.localStorage : null;

const storage = {
  getItem: async (key: string) => webStorage?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => webStorage?.setItem(key, value),
  removeItem: async (key: string) => webStorage?.removeItem(key),
};

export { storage };
