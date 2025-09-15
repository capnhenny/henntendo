export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");
  if (!steamid) {
    return new Response(JSON.stringify({ error: "steamid required" }), { status: 400 });
  }
  const key = process.env.STEAM_API_KEY!;
  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${key}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1`;

  const r = await fetch(url, { next: { revalidate: 300 } });
  const data = await r.json();
  return new Response(JSON.stringify(data.response ?? {}), { headers: { "content-type": "application/json" } });
}
