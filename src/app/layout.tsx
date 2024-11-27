import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Suspense } from "react";
import PlausibleProvider from "next-plausible";
import WikiStateContextProvider from "./contexts/WikiStateContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export const metadata: Metadata = {
  title: "Raging Echoes League Planner",
  description: "Plan your OSRS Raging Echoes league start and share it with friends!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "Old School RuneScape",
    "OSRS",
    "Raging Echoes League",
    "OSRS League Planner",
    "League Start Strategy",
    "Seasonal League",
    "OSRS guides",
    "OSRS planning tools",
    "Old School RuneScape Seasonal Leagues"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} bg-black`}>
      <body>
        <PlausibleProvider domain="ragingechoes.com">
          <TooltipProvider>
            <WikiStateContextProvider>
              {children}
            </WikiStateContextProvider>
          </TooltipProvider>
        </PlausibleProvider>
      </body>
    </html>
  );
}
