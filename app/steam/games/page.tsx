export const dynamic = "force-dynamic";

type Game = {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url?: string;
};

const toHrs = (m: number) => (m / 60).toFixed(1);

export default async function GamesPage({
  searchParams,
}: {
  searchParams?: { steamid?: string };
}) {
  const steamid = searchParams?.steamid || process.env.STEAM_DEFAULT_ID || "";

  // ——— ALWAYS-VISIBLE DEBUG BANNER (no imports, no classes) ———
  const DebugBanner = () => (
    <div
      style={{
        margin: "12px 0",
        padding: 12,
        border: "3px dashed #fbbf24",
        background: "rgba(251,191,36,0.12)",
        borderRadius: 12,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>DEBUG: Dota 2 (appid 570)</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* small “icon” using the header, cropped by inline styles */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg"
          alt="Dota 2 icon"
          width={36}
          height={36}
          style={{
            width: 36,
            height: 36,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "#000",
            display: "block",
          }}
        />
        {/* wide header image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg"
          alt="Dota 2 header"
          style={{
            width: 220,
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            display: "block",
          }}
        />
      </div>
      <div style={{ opacity: 0.8, marginTop: 6, fontSize: 14 }}>
        If you can see both images above, routing and rendering are correct.
      </div>
    </div>
  );

  // Show banner even if no steamid
  if (!steamid) {
    return (
      <div className="container section">
        <h2 className="section-title">Games</h2>
        <DebugBanner />
        <p className="subtle">
          No <code>steamid</code> provided. Add <code>?steamid=YOUR_ID</code> to the URL
          or set <code>STEAM_DEFAULT_ID</code> in your environment.
        </p>
      </div>
    );
  }

  // Fetch real data for the list (still keeping banner)
  const res = await fetch(`/api/steam/games?steamid=${encodeURIComponent(steamid)}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return (
      <div className="container section">
        <h2 className="section-title">Games</h2>
        <DebugBanner />
        <p className="subtle">Failed to load games: {res.status}</p>
      </div>
    );
  }

  const data = (await res.json()) as { games?: Game[] };
  const games = (data.games ?? []).slice().sort((a, b) => b.playtime_forever - a.playtime_forever);

  return (
    <div className="container section">
      <h2 className="section-title">Games</h2>

      {/* Unmissable debug banner above list */}
      <DebugBanner />

      <ul className="games-list">
        {games.map((g) => (
          <li key={g.appid} className="game-item">
            <div className="game-main">
              {/* left “icon” = header cropped square */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                alt={`${g.name} icon`}
                width={36}
                height={36}
                style={{
                  width: 36,
                  height: 36,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#000",
                  display: "block",
                }}
              />
              <div className="game-title">
                <span className="game-name">{g.name}</span>
                <span className="game-meta">{toHrs(g.playtime_forever)} hrs total</span>
              </div>
            </div>

            {/* right wide image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
              alt={`${g.name} header`}
              style={{
                width: 160,
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                display: "block",
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
