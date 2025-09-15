// app/layout.tsx
import type { Metadata } from "next";
import "./styles.css";

import SurfBG from "./SurfBG";
import { VT323, Oxanium } from "next/font/google";

// Body font (CRT-ish)
const bodyFont = VT323({ subsets: ["latin"], weight: "400" });

// Display font for headings & special text (exposed as a CSS var)
const displayFont = Oxanium({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Henntendo",
  description: "My very own game-focused easter eggs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Apply body font + expose display font variable */}
      <body className={`theme-arcade ${bodyFont.className} ${displayFont.variable}`}>
        <SurfBG />
        {children}
        {/* Footer lives on every page */}
        <footer className="site-footer">
          <a href="https://okhenn.com" target="_blank" rel="noopener noreferrer" aria-label="okhenn.com">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="footer-logo" />
          </a>
        </footer>
      </body>
    </html>
  );
}
