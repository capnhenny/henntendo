'use client';
import { useMemo, useState } from 'react';

type Props = {
  appid: number | string;
  /** Optional hash from Steam API (img_icon_url) for legacy community images */
  iconHash?: string;
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
  const [idx, setIdx] = useState(0);

  // Ordered fallbacks: store header.jpg (two CDNs) → legacy community icon (two CDNs)
  const sources = useMemo(() => {
    const a: string[] = [
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
    ];
    if (iconHash) {
      a.push(
        `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`,
        `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`
      );
    }
    return a;
  }, [appid, iconHash]);

  return (
    <img
      src={sources[idx]}
      width={size}
      height={size}
      alt={alt}
      className={`game-icon ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => (i + 1 < sources.length ? i + 1 : i))}
    />
  );
}
