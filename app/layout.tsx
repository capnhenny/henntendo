// app/layout.tsx
import type { Metadata } from "next";
import "./styles.css";

import { VT323, Oxanium, Bebas_Neue } from "next/font/google";
import SurfBG from "./components/SurfBG"; // adjust path if your component lives elsewhere

const bodyFont    = VT323({ subsets: ["latin"], weight: "400" });
const displayFont = Oxanium({ subsets: ["latin"], weight: ["400","700"], variable: "--font-display" });
const bebasFont   = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });

export const metadata: Metadata = {
  title: "Henntendo",
  description: "My very own game-focused easter eggs",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* body font + expose CSS variables for display + bebas */}
      <body className={`theme-arcade ${bodyFont.className} ${displayFont.variable} ${bebasFont.variable}`}>
        <SurfBG />
        {children}

        {/* tiny footer logo linking to okhenn.com */}
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
