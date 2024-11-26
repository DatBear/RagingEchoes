"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { isHotkeyPressed, useHotkeys } from "react-hotkeys-hook";


type WikiStateProps = {
  isWikiActive: boolean;
  setIsWikiActive: (active: boolean) => void;
}

const WikiStateContext = createContext({} as WikiStateProps);

export default function WikiStateContextProvider({ children }: React.PropsWithChildren) {
  const [isWikiActive, setIsWikiActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsWikiActive(isHotkeyPressed('shift'));
    }, 50);
    return () => clearInterval(interval);
  }, [isWikiActive, setIsWikiActive]);

  return <WikiStateContext.Provider value={{ isWikiActive, setIsWikiActive }}>
    {children}
  </WikiStateContext.Provider>
}

export function useWiki() {
  const context = useContext(WikiStateContext);
  return context;
}