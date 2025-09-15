// /pages/api/steam/badges.ts
import type { NextApiRequest, NextApiResponse } from "next";

const BASE = "https://api.steampowered.com";
const KEY = process.env.STEAM_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { steamid } = req.query; // your 64-bit SteamID
    const url = `${BASE}/IPlayerService/GetBadges/v1/?key=${KEY}&steamid=${steamid}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Steam API ${r.status}`);
    const data = await r.json();
    res.status(200).json(data.response); // badges[], player_xp, etc.
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
}
