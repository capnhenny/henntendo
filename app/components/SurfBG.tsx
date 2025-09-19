'use client';

import { useEffect, useMemo, useState } from 'react';

/** Put your monkey PNGs in /public/monkeys:
 *  /monkeys/monkey-1.png ... monkey-6.png (names can differ)
 *  The component will cycle through whatever paths you list here.
 */
const SPRITES = [
  '/monkeys/monkey-1.png',
  '/monkeys/monkey-2.png',
  '/monkeys/monkey-3.png',
  '/monkeys/monkey-4.png',
  '/monkeys/monkey-5.png',
  '/monkeys/monkey-6.png',
];

// Fallback if a file is missing (use any small PNG you have, e.g. logo)
const FALLBACK = '/logo.png';

export default function SurfBG() {
  const [cells, setCells] = useState(0);

  // read --surf-size from CSS and compute how many tiles we need
  const computeCells = () => {
    const root = document.documentElement;
    const varVal = getComputedStyle(root).getPropertyValue('--surf-size').trim();
    // clamp() returns like "144px" at runtime; parse the first number
    const size = Number(varVal.replace(/[^0-9.]/g, '')) || 200;
    const cols = Math.max(1, Math.ceil(window.innerWidth / size) + 2);  // pad
    const rows = Math.max(1, Math.ceil(window.innerHeight / size) + 3); // pad
    root.style.setProperty('--surf-cols', String(cols));
    return cols * rows;
  };

  useEffect(() => {
    const update = () => setCells(computeCells());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const sprites = useMemo(() => (SPRITES.length ? SPRITES : [FALLBACK]), []);

  return (
    <div className="surf-bg" aria-hidden="true">
      {Array.from({ length: cells }).map((_, i) => {
        const src = sprites[i % sprites.length];
        return (
          <div key={i} className="surf">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              onError={(e) => {
                // hide broken imgs gracefully
                (e.currentTarget as HTMLImageElement).src = FALLBACK;
              }}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
