import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");
  const count = Number(searchParams.get("count") || 10);

  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing STEAM_API_KEY" }, { status: 500 });
  if (!steamid) return NextResponse.json({ error: "Missing steamid" }, { status: 400 });

  const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${steamid}&count=${count}`;
  const r = await fetch(url, { next: { revalidate: 60 } });
  const j = await r.json();

  // Normalize a bit
  const games = (j?.response?.games ?? []).map((g: any) => ({
    appid: g.appid,
    name: g.name,
    playtime_2weeks: g.playtime_2weeks ?? 0,
    playtime_forever: g.playtime_forever ?? 0,
  }));

  return NextResponse.json({ games, total_count: j?.response?.total_count ?? games.length });
}
