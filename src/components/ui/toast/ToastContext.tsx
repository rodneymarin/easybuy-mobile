import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import ToastView from './ToastView';

interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const queueRef = useRef<ToastItem[]>([]);
  const isVisibleRef = useRef(false);

  const showNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      setCurrentToast(null);
      isVisibleRef.current = false;
      return;
    }
    const next = queueRef.current.shift()!;
    setCurrentToast(next);
  }, []);

  const show = useCallback((config: ToastConfig) => {
    const item: ToastItem = {
      id: nextId++,
      message: config.message,
      type: config.type ?? 'info',
      duration: config.duration ?? 3000,
    };

    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setCurrentToast(item);
    } else {
      queueRef.current.push(item);
    }
  }, []);

  function handleDismiss() {
    isVisibleRef.current = false;
    setCurrentToast(null);
    setTimeout(() => {
      showNext();
    }, 100);
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {currentToast !== null && (
        <ToastView key={currentToast.id} message={currentToast.message} type={currentToast.type} duration={currentToast.duration} onDismiss={handleDismiss} />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
