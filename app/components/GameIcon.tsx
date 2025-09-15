'use client';

import { useState } from 'react';

type Props = {
  appid: string | number;
  size?: number;
  className?: string;
  alt?: string;
};

const CDNS = [
  'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps',
  'https://cdn.akamai.steamstatic.com/steam/apps',
];

export default function GameIcon({ appid, size = 36, className = '', alt = 'Game cover' }: Props) {
  const [idx, setIdx] = useState(0);
  const src = `${CDNS[idx]}/${appid}/header.jpg`;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={`game-icon ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => (i === 0 ? 1 : i))}
    />
  );
}
