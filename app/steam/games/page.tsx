import GameIcon from '../../components/GameIcon';

type Game = {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url?: string;    // hash from your API
};

async function getGames(steamid: string) {
  // Server component fetch to your own API; relative path is fine here
  const res = await fetch(
    `/api/steam/games?steamid=${encodeURIComponent(steamid)}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`Failed to load games: ${res.status}`);
  const data = await res.json();
  return (data?.games ?? []) as Game[];
}

function minutesToHours(min: number) {
  return (min / 60).toFixed(1);
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams?: { steamid?: string };
}) {
  const steamid = searchParams?.steamid || process.env.STEAM_DEFAULT_ID || '';

  if (!steamid) {
    return (
      <div className="container section">
        <h2 className="section-title">Games</h2>
        <p className="subtle">
          No <code>steamid</code> provided. Add <code>?steamid=YOUR_ID</code> to the URL
          or set <code>STEAM_DEFAULT_ID</code> in Vercel Environment Variables.
        </p>
      </div>
    );
  }

  const games = await getGames(steamid);
  const sorted = games.slice().sort((a, b) => b.playtime_forever - a.playtime_forever);

  return (
    <div className="container section">
      <h2 className="section-title">Games</h2>
      <ul className="games-list">
        {sorted.map((g) => (
          <li key={g.appid} className="game-item">
            <div className="game-main">
              <GameIcon appid={g.appid} iconHash={g.img_icon_url} />
              <div className="game-title">
                <span className="game-name">{g.name}</span>
                <span className="game-meta">{minutesToHours(g.playtime_forever)} hrs total</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
