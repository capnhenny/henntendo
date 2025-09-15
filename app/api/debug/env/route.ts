export async function GET() {
  const ok = Boolean(process.env.STEAM_API_KEY && process.env.STEAM_API_KEY!.length > 10);
  return new Response(JSON.stringify({ hasKey: ok }), { headers: { "content-type": "application/json" } });
}
