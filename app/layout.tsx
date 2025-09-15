import type { Metadata } from "next";
import "./styles.css";

import { VT323, Press_Start_2P } from "next/font/google";
const bodyFont = VT323({ subsets: ["latin"], weight: "400" });
const titleFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Henntendo",
  description: "My very own game-focused easter eggs",
  icons: {
    icon: [
      { url: "/favicon.ico" },                // if you added public/favicon.ico
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* body gets CRT font; headings will use .title-font class */}
      <body className={`theme-arcade ${bodyFont.className} title-font-enabled ${titleFont.className}`}>
        {children}
      </body>
    </html>
  );
}
