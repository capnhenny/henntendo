// app/SurfBG.tsx
"use client";
import { useEffect, useState } from "react";

export default function SurfBG() {
  const [tiles, setTiles] = useState(0);

  function compute() {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--surf-size")
      .trim();
    const px = Number.parseFloat(raw) || 96; // fallback so NaN never breaks us
    const gap = px;
    const tile = px + gap;

    const cols = Math.max(1, Math.floor((window.innerWidth + gap) / tile));
    const rows = Math.max(1, Math.floor((window.innerHeight + gap) / tile));

    document.documentElement.style.setProperty("--surf-cols", String(cols));
    setTiles(cols * rows);
  }

  useEffect(() => {
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div className="surf-bg" aria-hidden="true">
      {Array.from({ length: tiles }).map((_, i) => (
        <div className="surf" key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/surfer.gif" alt="" />
        </div>
      ))}
    </div>
  );
}
