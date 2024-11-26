"use client";
import { createContext, useContext, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";


type WikiStateProps = {
  isWikiActive: boolean;
  setIsWikiActive: (active: boolean) => void;
}

const WikiStateContext = createContext({} as WikiStateProps);


export default function WikiStateContextProvider({ children }: React.PropsWithChildren) {
  const [isWikiActive, setIsWikiActive] = useState(false);

  useHotkeys('ctrl', x => !x.repeat && setIsWikiActive(!isWikiActive));

  return <WikiStateContext.Provider value={{ isWikiActive, setIsWikiActive }}>
    {children}
  </WikiStateContext.Provider>
}

export function useWiki() {
  const context = useContext(WikiStateContext);
  return context!;
}