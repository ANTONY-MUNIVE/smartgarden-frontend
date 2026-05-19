import { createContext, useContext, useMemo, useState } from 'react';

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const value = useMemo(() => ({
    mobileSidebarOpen,
    openMobileSidebar: () => setMobileSidebarOpen(true),
    closeMobileSidebar: () => setMobileSidebarOpen(false),
    toggleMobileSidebar: () => setMobileSidebarOpen((value) => !value),
  }), [mobileSidebarOpen]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}