"use client";
import { useEffect, useState } from "react";

type Badge = { badgeid: number; level?: number; appid?: number; completed?: number };
type Game = { appid: number; name: string; playtime_forever?: number };

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
        fetch(`/api/steam/profile?steamid=${id}`).then(r=>r.json()),
        fetch(`/api/steam/level?steamid=${id}`).then(r=>r.json()),
        fetch(`/api/steam/games?steamid=${id}`).then(r=>r.json()),
      ]);
      setProfile(p);
      setLevel(l.level ?? null);
      setBadges(l.badges ?? []);
      const list: Game[] = (g.games ?? []).sort((a,b)=> (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
      setGames(list.slice(0, 50));
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
      <h1 className="h1 title-font">Steam Showcase</h1>
      <p className="subtle">Paste a Steam vanity (e.g. <code>laserhenn</code>), SteamID64 (17 digits), or full profile URL.</p>

      <div className="controls">
        <input className="input" placeholder="Steam vanity / SteamID64 / profile URL"
          value={input} onChange={e=>setInput(e.target.value)} />
        <button className="button" onClick={loadAll} disabled={loading}>{loading ? "Loading..." : "Show"}</button>
      </div>

      {err && <p className="subtle" style={{ color:"#ff6b6b" }}>{err}</p>}

      {/* Profile row: left = profile panel, right = level panel */}
      {profile && (
        <section className="dashboard">
          <div className="panel panel--profile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatarfull} alt="avatar" className="avatar" />
            <div>
              <div className="title-font" style={{ fontSize: 22 }}>{profile.personaname}</div>
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
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>Badges</h2>
          {!!badges.length ? (
            <ul className="badges-grid">
              {badges.slice(0, 20).map((b,i)=>(
                <li key={i} className="card">
                  <div>Badge ID: {b.badgeid}</div>
                  {"level" in b && <div>Level: {b.level}</div>}
                  {"appid" in b && b.appid && <div>Game AppID: {b.appid}</div>}
                </li>
              ))}
            </ul>
          ) : <div className="subtle">No badges found.</div>}
        </div>

        <div className="panel">
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>Top Games (by playtime)</h2>
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
