export const dynamic = "force-dynamic";

// app/steam/games/page.tsx
import GameIcon from "../../components/GameIcon";
import GameThumb from "../../components/GameThumb";

type Game = {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url?: string;    // hash for legacy community fallback
};

const toHrs = (m: number) => (m / 60).toFixed(1);

// Always-visible banner with a hardcoded Dota 2 image (proves images load)
function DebugBanner() {
  return (
    <div
      className="card"
      style={{
        marginBottom: 12,
        padding: 12,
        border: "2px dashed #fbbf24",
        background: "rgba(251,191,36,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <strong>DEBUG: Dota 2 hardcoded</strong>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GameIcon appid={570} alt="Dota 2 icon" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg"
            alt="Dota 2 header"
            style={{
              width: 200,
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "block",
            }}
          />
        </div>
      </div>
      <div className="subtle">
        If this banner is visible, you’re on the correct page and images aren’t being hidden by CSS.
      </div>
    </div>
  );
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams?: { steamid?: string };
}) {
  const steamid = searchParams?.steamid || process.env.STEAM_DEFAULT_ID || "";

  // If no steamid, still render the debug banner so you can see the test
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

  // Fetch games
  const res = await fetch(`/api/steam/games?steamid=${encodeURIComponent(steamid)}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Failed to load games: ${res.status}`);

  const data = (await res.json()) as { games?: Game[] };
  const games = data.games ?? [];
  const sorted = games.slice().sort((a, b) => b.playtime_forever - a.playtime_forever);

  return (
    <div className="container section">
      <h2 className="section-title">Games</h2>

      {/* Always show the debug banner above the real list */}
      <DebugBanner />

      <ul className="games-list">
        {sorted.map((g) => (
          <li key={g.appid} className="game-item">
            <div className="game-main">
              <GameIcon appid={g.appid} iconHash={g.img_icon_url} alt={`${g.name} icon`} />
              <div className="game-title">
                <span className="game-name">{g.name}</span>
                <span className="game-meta">{toHrs(g.playtime_forever)} hrs total</span>
              </div>
            </div>

            {/* Wide header/capsule image on the right */}
            <div className="game-right">
              <GameThumb appid={g.appid} iconHash={g.img_icon_url} alt={`${g.name} art`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
