// app/components/SurfBG.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type Tile = { id: number; start: number; speed: number; phase: number };

export default function SurfBG() {
  const [dims, setDims] = useState({ cols: 1, rows: 1 });

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // approximate the CSS: clamp(144px, 20vw, 320px)
      const size = Math.max(144, Math.min(320, Math.round(w * 0.20)));
      const cols = Math.max(1, Math.ceil(w / size) + 2);
      const rows = Math.max(1, Math.ceil(h / size) + 2);

      // keep CSS vars in sync for your grid layout
      document.documentElement.style.setProperty('--surf-size', `${size}px`);
      document.documentElement.style.setProperty('--surf-cols', String(cols));
      setDims({ cols, rows });
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const tiles = useMemo<Tile[]>(() => {
    const total = dims.cols * dims.rows;
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      start: Math.floor(Math.random() * 360), // starting angle
      speed: 18 + Math.random() * 16,         // 18–34s per rotation
      phase: -Math.random() * 12,             // negative = desync start
    }));
  }, [dims.cols, dims.rows]);

  return (
    <div className="surf-bg" aria-hidden="true">
      {tiles.map((t) => (
        <div
          key={t.id}
          className="surf"
          style={{ transform: `rotate(${t.start}deg)` }} // initial angle
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="surfer"
            src="/surfer.gif"
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              animationDuration: `${t.speed}s`,
              animationDelay: `${t.phase}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
