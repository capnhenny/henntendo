"use client";

import { useEffect, useMemo, useState } from "react";

type Tile = {
  start: number;     // initial rotation in deg
  dur: number;       // seconds per full spin
  reverse: boolean;  // spin direction
  delay: number;     // negative delay to de-sync
};

export default function SurfBG() {
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);

  // Read the computed pixel value of --surf-size and calculate grid
  useEffect(() => {
    const recalc = () => {
      const root = document.documentElement;
      const raw = getComputedStyle(root).getPropertyValue("--surf-size").trim();
      // raw can be like "192px"; fallback to 200 if parsing fails
      const size = parseFloat(raw) || 200;

      const c = Math.ceil(window.innerWidth / size) + 2;  // a little overflow
      const r = Math.ceil(window.innerHeight / size) + 2;
      setCols(c);
      setRows(r);

      // Let CSS grid know columns count
      root.style.setProperty("--surf-cols", String(c));
    };

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // Build tiles with randomized starting orientation & speed
  const tiles = useMemo<Tile[]>(() => {
    const total = cols * rows;
    return Array.from({ length: total }, () => {
      const dur = 18 + Math.random() * 18;      // 18–36s
      const start = Math.floor(Math.random() * 360); // 0–359°
      const reverse = Math.random() < 0.5;
      const delay = -Math.random() * dur;       // start mid-rotation
      return { start, dur, reverse, delay };
    });
  }, [cols, rows]);

  return (
    <div className="surf-bg" aria-hidden="true">
      {tiles.map((t, i) => (
        <div
          key={i}
          className="surf"
          style={
            {
              // parent sets initial orientation
              // @ts-expect-error CSS var inline
              "--start": `${t.start}deg`,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/surfer.gif"
            alt=""
            className="surfer"
            style={{
              animationDuration: `${t.dur}s`,
              animationDelay: `${t.delay}s`,
              animationDirection: t.reverse ? "reverse" : "normal",
            }}
          />
        </div>
      ))}
    </div>
  );
}
