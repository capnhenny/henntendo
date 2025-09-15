export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");
  if (!steamid) {
    return new Response(JSON.stringify({ error: "steamid required" }), { status: 400 });
  }
  const key = process.env.STEAM_API_KEY!;
  const base = "https://api.steampowered.com/IPlayerService";

  const [lvlRes, badgesRes] = await Promise.all([
    fetch(`${base}/GetSteamLevel/v1/?key=${key}&steamid=${steamid}`, { next: { revalidate: 300 } }),
    fetch(`${base}/GetBadges/v1/?key=${key}&steamid=${steamid}`, { next: { revalidate: 300 } }),
  ]);

  const level = (await lvlRes.json())?.response?.player_level ?? null;
  const badges = (await badgesRes.json())?.response?.badges ?? [];

  return new Response(JSON.stringify({ level, badges }), { headers: { "content-type": "application/json" } });
}
