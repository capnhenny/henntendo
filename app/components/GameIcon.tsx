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

  // More robust: header -> capsule -> library -> legacy community (needs hash)
  const sources = useMemo(() => {
    const s: string[] = [
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
      `https://cdn.akamai.steamstatic.com
