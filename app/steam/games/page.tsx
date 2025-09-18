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
  if (!steamid) {
    return (
      <div className="container section">
        <h2 className="section-title">Games</h2>
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
