import { createContext, useContext, useState, type PropsWithChildren } from 'react';

interface DrawerContextValue {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function DrawerProvider({ children }: PropsWithChildren) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function openDrawer() {
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

function useDrawer(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}

export { DrawerProvider, useDrawer };
