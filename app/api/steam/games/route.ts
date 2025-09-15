// app/api/steam/games/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");
  const key = process.env.STEAM_API_KEY;

  if (!key)   return NextResponse.json({ error: "Missing STEAM_API_KEY" }, { status: 500 });
  if (!steamid) return NextResponse.json({ error: "Missing steamid" }, { status: 400 });

  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${key}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1`;

  const r = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
  const j = await r.json();

  const games = (j?.response?.games ?? []).map((g: any) => ({
    appid: g.appid,
    name: g.name,
    playtime_forever: g.playtime_forever ?? 0, // minutes
  }));

  return NextResponse.json({ games, game_count: j?.response?.game_count ?? games.length });
}
