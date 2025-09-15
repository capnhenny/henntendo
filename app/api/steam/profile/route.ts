export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");
  if (!steamid) {
    return new Response(JSON.stringify({ error: "steamid required" }), { status: 400 });
  }
  const key = process.env.STEAM_API_KEY!;
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamid}`;

  const r = await fetch(url, { next: { revalidate: 300 } });
  const data = await r.json();
  const player = data?.response?.players?.[0] ?? {};
  return new Response(JSON.stringify(player), { headers: { "content-type": "application/json" } });
}
