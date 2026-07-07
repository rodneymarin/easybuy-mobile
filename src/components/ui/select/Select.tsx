import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface SelectContextValue {
  value: string | null;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select sub-components must be used within <Select>');
  return ctx;
}

interface SelectProps {
  value: string | null;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export default function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, open, close }}>
      {children}
    </SelectContext.Provider>
  );
}

export { useSelectContext };
