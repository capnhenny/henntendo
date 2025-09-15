// app/layout.tsx
import type { Metadata } from "next";
import "./styles.css";

import { VT323, Press_Start_2P } from "next/font/google";
import SurfBG from "./SurfBG";

const bodyFont = VT323({ subsets: ["latin"], weight: "400" });
const titleFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Henntendo",
  description: "My very own game-focused easter eggs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`theme-arcade ${bodyFont.className} title-font-enabled ${titleFont.className}`}>
        <SurfBG /> {/* fixed, tiled surfers behind content */}
        {children}
      </body>
    </html>
  );
}
