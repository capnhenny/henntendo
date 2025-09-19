'use client';

import { useEffect, useState } from 'react';

const SPRITE = '/surfer.gif';   // served from public/surfer.gif
const FALLBACK = '/logo.png';   // any small image in /public

export default function SurfBG() {
  const [cells, setCells] = useState(0);

  const computeCells = () => {
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue('--surf-size').trim(); // e.g. "200px"
    const size = parseFloat(raw) || 200;
    const cols = Math.max(1, Math.ceil(window.innerWidth / size) + 2);
    const rows = Math.max(1, Math.ceil(window.innerHeight / size) + 3);
    root.style.setProperty('--surf-cols', String(cols));
    return cols * rows;
  };

  useEffect(() => {
    const update = () => setCells(computeCells());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="surf-bg" aria-hidden="true">
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="surf">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SPRITE}
            alt=""
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
          />
        </div>
      ))}
    </div>
  );
}
