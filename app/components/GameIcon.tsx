'use client';
import { useMemo, useState } from 'react';

type Props = {
  appid: number | string;
  iconHash?: string;           // from your API: img_icon_url
  size?: number;
  className?: string;
  alt?: string;
};

export default function GameIcon({
  appid,
  iconHash,
  size = 36,
  className = '',
  alt = 'Game cover',
}: Props) {
  const [i, setI] = useState(0);

  // Try store header.jpg first (two CDNs). If missing, fall back to legacy community icon (needs hash).
  const sources = useMemo(() => {
    const s: string[] = [
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
    ];
    if (iconHash) {
      s.push(
        `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`,
        `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`,
      );
    }
    return s;
  }, [appid, iconHash]);

  return (
    <img
      src={sources[i]}
      width={size}
      height={size}
      alt={alt}
      className={`game-icon ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setI((x) => (x + 1 < sources.length ? x + 1 : x))}
    />
  );
}
