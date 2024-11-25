import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Suspense } from "react";
import PlausibleProvider from "next-plausible";

export const metadata: Metadata = {
  title: "Raging Echoes League Planner",
  description: "Plan your Raging Echoes league start and share it with friends!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} bg-black`}>
      <body>
        <PlausibleProvider domain="ragingechoes.com">
          {children}
        </PlausibleProvider>
      </body>
    </html>
  );
}
