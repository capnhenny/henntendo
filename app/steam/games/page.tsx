import GameIcon from "../../components/GameIcon";

type Game = { appid: number; name: string; playtime_forever: number; img_icon_url?: string; };
const toHrs = (m:number) => (m/60).toFixed(1);

export default async function GamesPage({ searchParams }:{ searchParams?: { steamid?: string }}) {
  const steamid = searchParams?.steamid || process.env.STEAM_DEFAULT_ID || "";
  if (!steamid) return <div className="container section"><h2 className="section-title">Games</h2><p className="subtle">Add <code>STEAM_DEFAULT_ID</code> in Vercel.</p></div>;

  const res = await fetch(`/api/steam/games?steamid=${encodeURIComponent(steamid)}`, { next: { revalidate: 300 }});
  const data = await res.json();
  const games = (data?.games ?? []) as Game[];
  const sorted = games.slice().sort((a,b) => b.playtime_forever - a.playtime_forever);

  return (
    <div className="container section">
      <h2 className="section-title">Games</h2>
      <ul className="games-list">
        {sorted.map(g => (
          <li key={g.appid} className="game-item">
            <div className="game-main">
              <GameIcon appid={g.appid} iconHash={g.img_icon_url} />
              <div className="game-title">
                <span className="game-name">{g.name}</span>
                <span className="game-meta">{toHrs(g.playtime_forever)} hrs total</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
