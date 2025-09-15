import type { Metadata } from "next";
import "./styles.css"; // ✅ global styles

export const metadata: Metadata = {
  title: "Henntendo",
  description: "My very own game-focused easter eggs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
