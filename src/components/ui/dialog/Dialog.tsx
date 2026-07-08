import { createContext, useContext } from 'react';
import { Modal as RNModal, type ReactNode } from 'react-native';

interface DialogContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const DialogContext = createContext<DialogContextValue>({ isOpen: false, onClose: () => {} });

export function useDialogContext() {
  return useContext(DialogContext);
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Dialog({ isOpen, onClose, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ isOpen, onClose }}>
      <RNModal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
        {children}
      </RNModal>
    </DialogContext.Provider>
  );
}
