type AuthErrorListener = () => void;
let _listeners = new Set<AuthErrorListener>();

export function subscribeToAuthError(listener: AuthErrorListener): () => void {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

export function reportAuthError(): void {
  _listeners.forEach((fn) => fn());
}

export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as Record<string, unknown>;
  const code = err.code;
  if (code === 'PGRST303') return true;
  if (code === 'PGRST301') return true;
  if (code === 401 || code === 403) return true;
  if (typeof err.message === 'string') {
    if (err.message.includes('JWT')) return true;
    if (err.message.toLowerCase().includes('expired')) return true;
  }
  if (err.name === 'AuthError' || err.name === 'AuthSessionMissingError') return true;
  return false;
}
