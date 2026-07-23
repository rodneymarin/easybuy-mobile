import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { View } from 'react-native';

interface DropdownMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  triggerRef: React.RefObject<View | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu sub-components must be used within <DropdownMenu>');
  return ctx;
}

interface DropdownMenuProps {
  children: ReactNode;
}

export default function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<View>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, open, close, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export { useDropdownMenuContext };
