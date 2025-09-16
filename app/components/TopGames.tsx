import GameIcon from './GameIcon';

type Game = { appid: number; name: string; playtime_forever: number; img_icon_url?: string; };

async function getGames(steamid: string) {
  const res = await fetch(`/api/steam/games?steamid=${encodeURIComponent(steamid)}`, { next: { revalidate: 300 } });
  if (!res.ok) return [] as Game[];
  const data = await res.json();
  return (data?.games ?? []) as Game[];
}

export default async function TopGames({ steamid, limit = 10 }:{ steamid: string; limit?: number }) {
  const games = await getGames(steamid);
  const top = games.slice().sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, limit);
  const toHrs = (m: number) => (m / 60).toFixed(1);

  return (
    <section className="section">
      <h2 className="section-title">Top {limit} Games (all-time playtime)</h2>
      <ul className="games-list">
        {top.map(g => (
          <li key={g.appid} className="game-item">
            <div className="game-main">
              <GameIcon appid={g.appid} iconHash={g.img_icon_url} alt={`${g.name} cover`} />
              <div className="game-title">
                <span className="game-name">{g.name}</span>
                <span className="game-meta">{toHrs(g.playtime_forever)} hrs total</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
