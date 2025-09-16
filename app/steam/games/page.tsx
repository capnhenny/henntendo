import GameIcon from '../../components/GameIcon';

type Game = {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url?: string;
};

function minutesToHours(min: number) {
  return (min / 60).toFixed(1);
}

export default async function GamesPage({ searchParams }: { searchParams?: { steamid?: string } }) {
  const steamid = searchParams?.steamid || process.env.STEAM_DEFAULT_ID || '';
  if (!steamid) return <div className="container section"><h2 className="section-title">Games</h2><p className="subtle">Set <code>STEAM_DEFAULT_ID</code> or pass <code>?steamid=…</code>.</p></div>;

  const res = await fetch(`/api/steam/games?steamid=${steamid}`, { next: { revalidate: 300 } });
  const { games = [] } = await res.json() as { games: Game[] };

  const top = games.slice().sort((a,b) => b.playtime_forever - a.playtime_forever); // or .slice(0,10)

  return (
    <div className="container section">
      <h2 className="section-title">Top Games</h2>
      <ul className="games-list">
        {top.map(g => (
          <li key={g.appid} className="game-item">
            <div className="game-main">
              <GameIcon appid={g.appid} iconHash={g.img_icon_url} alt={`${g.name} cover`} />
              <div className="game-title">
                <span className="game-name">{g.name}</span>
                <span className="game-meta">{minutesToHours(g.playtime_forever)} hrs total</span>
              </div>
            </div>

            {/* right-side action stays as-is */}
            {/* <a className="button" href={`/steam/achievements?appid=${g.appid}`}>See achievements</a> */}
          </li>
        ))}
      </ul>
    </div>
  );
}
