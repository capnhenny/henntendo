"use client";
import { useEffect, useState } from "react";

type Badge = { badgeid: number; level?: number; appid?: number; completed?: number };
type Game = { appid: number; name: string; playtime_2weeks?: number; playtime_forever?: number };


const DEFAULT_INPUT = "laserhenn";

export default function Page() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [steamid, setSteamid] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function resolveIfNeeded(value: string) {
    const trimmed = value.trim();
    const profilesMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
    if (profilesMatch) return profilesMatch[1];
    const vanityUrlMatch = trimmed.match(/steamcommunity\.com\/id\/([^\/?#]+)/i);
    const candidate = vanityUrlMatch ? vanityUrlMatch[1] : trimmed;
    if (/^\d{17}$/.test(candidate)) return candidate;
    const r = await fetch(`/api/steam/resolve?vanity=${encodeURIComponent(candidate)}`);
    const data = await r.json();
    if (data.success !== 1 || !data.steamid) throw new Error("Could not resolve vanity URL");
    return data.steamid as string;
  }

  async function loadAll() {
    try {
      setErr(null); setLoading(true); setAchievements([]);
      const id = await resolveIfNeeded(input);
      setSteamid(id);
        const [p, l, g] = await Promise.all([
          fetch(`/api/steam/profile?steamid=${id}`).then(r => r.json()),
          fetch(`/api/steam/level?steamid=${id}`).then(r => r.json()),
          fetch(`/api/steam/games?steamid=${id}`).then(r => r.json()),
        ]);
        
        setProfile(p);
        setLevel(l.level ?? null);
        setBadges(l.badges ?? []);
        
        const top10: Game[] = (g.games ?? [])
          .sort((a: Game, b: Game) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
          .slice(0, 10);
        
        setGames(top10);

    } catch (e:any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadAchievements(appid: number) {
    setAchievements([]);
    const r = await fetch(`/api/steam/achievements?steamid=${steamid}&appid=${appid}`);
    const data = await r.json();
    const list = (data.achievements ?? []).map((a:any)=>({ name:a.name, achieved:a.achieved, unlocktime:a.unlocktime }));
    setAchievements(list);
  }

  useEffect(()=>{ loadAll(); },[]);

  return (
    <main className="container">
      <h1 className="h1 title-font">who's that steam player <img src="/shadow.png" alt="" className="h1-icon" />
      </h1>
      <p className="subtle">
        Search by Steam Name, SteamID, or full profile URL below:
      </p>

      <div className="controls">
        <input
          className="input"
          placeholder="Steam vanity / SteamID64 / profile URL"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") loadAll(); }}
        />
        <button className="button" onClick={loadAll} disabled={loading}>
          {loading ? "Loading..." : "Show"}
        </button>
      </div>

      {err && <p className="subtle" style={{ color:"#ff6b6b" }}>{err}</p>}

      {/* Profile row: left = profile panel, right = level panel */}
      {profile && (
        <section className="dashboard">
          <div className="panel panel--profile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatarfull} alt="avatar" className="avatar" />
            <div>
              <div className="profile-name">{profile.personaname}</div>
              <div className="subtle">{profile.realname ?? ""}</div>
            </div>
          </div>
          <div className="panel panel--level">
            <div className="level-pill">Level&nbsp;<strong>{level ?? "—"}</strong></div>
          </div>
        </section>
      )}

      {/* Row: Badges (left) and Games (right) */}
      <section className="grid-2 section">
        <div className="panel">
          
            <h2 className="section-title title-font" style={{ fontSize: 16 }}>
              Top 10 Games (all-time playtime)
            </h2>
            
            <div className="games-list">
              {games.map((g) => {
                const hrsAll = Math.round((g.playtime_forever ?? 0) / 60);
                return (
                  <div key={g.appid} className="card game-item">
                    <div className="game-title">
                      <span>{g.name}</span>
                      <span className="game-meta">{hrsAll} hrs total</span>
                    </div>
                    <button className="button" onClick={() => loadAchievements(g.appid)}>
                      See achievements
                    </button>
                  </div>
                );
              })}
            </div>

        <div className="panel">
            <h2 className="section-title title-font" style={{ fontSize: 16 }}>
              Recently Played (last 2 weeks)
            </h2>
          {!!games.length ? (
            <div className="games-list">
              {games.map((g)=>(
                <div key={g.appid} className="card game-item">
                  <span>{g.name}</span>
                  <button className="button" onClick={()=>loadAchievements(g.appid)}>See achievements</button>
                </div>
              ))}
            </div>
          ) : <div className="subtle">No public games.</div>}
        </div>
      </section>

      {!!achievements.length && (
        <section className="section panel">
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>Achievements</h2>
          <ul className="badges-grid">
            {achievements.map((a,i)=>(
              <li key={i} className="card">
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div>{a.achieved ? "Unlocked" : "Locked"}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
