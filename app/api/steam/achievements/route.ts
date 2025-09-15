export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");
  const appid = searchParams.get("appid");
  if (!steamid || !appid) {
    return new Response(JSON.stringify({ error: "steamid and appid required" }), { status: 400 });
  }
  const key = process.env.STEAM_API_KEY!;
  const url =
    `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/` +
    `?key=${key}&steamid=${steamid}&appid=${appid}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    return new Response(JSON.stringify({ error: `steam error ${r.status}` }), { status: 502 });
  }
  const data = await r.json();
  return new Response(JSON.stringify(data.playerstats ?? {}), { headers: { "content-type": "application/json" } });
}
