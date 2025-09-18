'use client';
import { useMemo, useState } from 'react';

type Props = {
  appid: number | string;
  iconHash?: string;   // from your API: img_icon_url (optional)
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

  // Canonical hosts + many fallbacks:
  // 1) store header (wide) → 2) store capsule → 3) library portrait → 4) legacy community (needs hash)
  const sources = useMemo(() => {
    const S = String(appid);
    const list: string[] = [
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${S}/header.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${S}/header.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${S}/capsule_231x87.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${S}/capsule_231x87.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${S}/library_600x900.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${S}/library_600x900.jpg`,
    ];
    if (iconHash) {
      list.push(
        `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${S}/${iconHash}.jpg`,
        `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${S}/${iconHash}.jpg`
      );
    }
    return list;
  }, [appid, iconHash]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[i]}
      width={size}
      height={size}
      alt={alt}
      className={`game-icon ${className}`}
      loading="lazy"
      decoding="async"
      onError={() => setI((x) => (x + 1 < sources.length ? x + 1 : x))}
    />
  );
}
