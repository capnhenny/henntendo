// app/components/GameThumb.tsx
'use client';
import { useMemo, useState } from 'react';

type Props = {
  appid: number | string;
  iconHash?: string;  // optional legacy community fallback
  alt?: string;
  className?: string;
};

export default function GameThumb({ appid, iconHash, alt = 'Game art', className = '' }: Props) {
  const [i, setI] = useState(0);

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
      alt={alt}
      className={`game-thumb ${className}`}
      loading="lazy"
      decoding="async"
      onError={() => setI((x) => (x + 1 < sources.length ? x + 1 : x))}
    />
  );
}
