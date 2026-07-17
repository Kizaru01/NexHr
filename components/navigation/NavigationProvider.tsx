"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TABLET_MEDIA_QUERY = "(min-width: 768px)";

type NavigationContextValue = {
  isMobileDrawerOpen: boolean;
  isSidebarExpanded: boolean;
  setMobileDrawerOpen: (isOpen: boolean) => void;
  closeMobileDrawer: () => void;
  toggleSidebar: () => void;
};

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

export default function NavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(TABLET_MEDIA_QUERY);
    const closeDrawerOnTablet = () => {
      if (mediaQuery.matches) {
        setMobileDrawerOpen(false);
      }
    };

    closeDrawerOnTablet();
    mediaQuery.addEventListener("change", closeDrawerOnTablet);

    return () => {
      mediaQuery.removeEventListener("change", closeDrawerOnTablet);
    };
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((isExpanded) => !isExpanded);
  }, []);

  const contextValue = useMemo(
    () => ({
      isMobileDrawerOpen,
      isSidebarExpanded,
      setMobileDrawerOpen,
      closeMobileDrawer,
      toggleSidebar,
    }),
    [closeMobileDrawer, isMobileDrawerOpen, isSidebarExpanded, toggleSidebar]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const navigation = useContext(NavigationContext);

  if (!navigation) {
    throw new Error("useNavigation must be used within NavigationProvider.");
  }

  return navigation;
}
