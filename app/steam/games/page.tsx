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

export default async function GamesPage({
  searchParams,
}: {
  searchParams?: { steamid?: string };
}) {
  const steamid = searchParams?.steamid || process.env.STEAM_DEFAULT_ID || "";
 
  {/* TEMP TEST: remove after verifying */}
<div className="card" style={{ marginBottom: 12 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <GameIcon appid={570} alt="Dota 2 icon" />
    <GameThumb appid={570} alt="Dota 2 header" />
  </div>
  <div className="subtle">Hardcoded test (appid 570 = Dota 2)</div>
</div>

  // drop this near the top, inside the component but before any early returns
const DebugBanner = () => (
  <div className="card" style={{
    marginBottom: 12,
    padding: 12,
    border: "2px dashed #fbbf24",
    background: "rgba(251,191,36,0.08)"
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
      <strong>DEBUG: Dota 2 hardcoded</strong>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <GameIcon appid={570} alt="Dota 2 icon" />
        {/* Force show the wide thumb even on mobile */}
        <img
          src="https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg"
          alt="Dota 2 header"
          style={{
            width: 200,
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            display: "block"
          }}
        />
      </div>
    </div>
    <div className="subtle">If this banner is visible, you’re on the correct page and CSS isn’t hiding the image.</div>
  </div>
);

  if (!steamid) {
    return (
      <div className="container section">
        <h2 className="section-title">Games</h2>
      return (
  <div className="container section">
    <h2 className="section-title">Games</h2>
    <DebugBanner />  {/* ← should always be visible */}
    {/* …rest of your list… */}
        <p className="subtle">
          Set <code>STEAM_DEFAULT_ID</code> or pass <code>?steamid=…</code>.
        </p>
      </div>
    );
  }

  const res = await fetch(`/api/steam/games?steamid=${encodeURIComponent(steamid)}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Failed to load games: ${res.status}`);
  const data = await res.json();
  const games = (data?.games ?? []) as Game[];

  const sorted = games.slice().sort((a, b) => b.playtime_forever - a.playtime_forever);

  return (
    <div className="container section">
      <h2 className="section-title">Games</h2>  
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

            {/* NEW: wide header/capsule image on the right */}
            <div className="game-right">
              <GameThumb appid={g.appid} iconHash={g.img_icon_url} alt={`${g.name} art`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
