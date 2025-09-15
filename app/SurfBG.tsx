"use client";

import { useEffect, useState } from "react";

/**
 * Creates a fixed, full-viewport grid of surfer tiles.
 * Each tile: size = --surf-size; gap = --surf-size (so spacing equals image size).
 * Rotation: discrete 45° steps every 3s (8 steps → 24s per full turn).
 */
export default function SurfBG() {
  const [count, setCount] = useState(0);

  function compute() {
    // Read --surf-size from :root (e.g., "96px")
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--surf-size").trim();
    const px = parseFloat(raw || "96");
    const gap = px;
    const tile = px + gap;

    const cols = Math.max(1, Math.floor((window.innerWidth + gap) / tile));
    const rows = Math.max(1, Math.floor((window.innerHeight + gap) / tile));
    document.documentElement.style.setProperty("--surf-cols", String(cols));
    setCount(cols * rows);
  }

  useEffect(() => {
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const cells = Array.from({ length: count }, (_, i) => (
    <div className="surf" key={i}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/surfer.gif" alt="" />
    </div>
  ));

  return (
    <div className="surf-bg" aria-hidden="true">
      {cells}
    </div>
  );
}
