export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vanity = searchParams.get("vanity");
  if (!vanity) {
    return new Response(JSON.stringify({ error: "vanity required" }), { status: 400 });
  }
  const key = process.env.STEAM_API_KEY!;
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${encodeURIComponent(vanity)}`;

  const r = await fetch(url, { next: { revalidate: 300 } });
  const data = await r.json();
  return new Response(JSON.stringify(data.response ?? {}), {
    headers: { "content-type": "application/json" },
  });
}
