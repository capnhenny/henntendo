// app/components/GameThumb.tsx
'use client';
import { useMemo, useState } from 'react';

type Props = {
  appid: number | string;
  iconHash?: string;  // optional: legacy community fallback
  alt?: string;
  className?: string;
};

export default function GameThumb({ appid, iconHash, alt = 'Game art', className = '' }: Props) {
  const [i, setI] = useState(0);

  const sources = useMemo(() => {
    const a: string[] = [
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/capsule_184x69.jpg`,
      `https://shared.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[i]}
      alt={alt}
      className={`game-thumb ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setI((x) => (x + 1 < sources.length ? x + 1 : x))}
    />
  );
}
