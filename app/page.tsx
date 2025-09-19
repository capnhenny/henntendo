"use client";

import { useEffect, useState } from "react";

type Badge = { badgeid: number; level?: number; appid?: number; completed?: number };
type Game  = { appid: number; name: string; playtime_forever?: number; img_icon_url?: string };

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
      setErr(null);
      setLoading(true);
      setAchievements([]);

      const id = await resolveIfNeeded(input);
      setSteamid(id);

      const [p, l, g] = await Promise.all([
        fetch(`/api/steam/profile?steamid=${id}`).then((r) => r.json()),
        fetch(`/api/steam/level?steamid=${id}`).then((r) => r.json()),
        fetch(`/api/steam/games?steamid=${id}`).then((r) => r.json()),
      ]);

      setProfile(p);
      setLevel(l.level ?? null);
      setBadges(l.badges ?? []);

      const top10: Game[] = (g.games ?? [])
        .sort((a: Game, b: Game) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
        .slice(0, 10);

      setGames(top10);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadAchievements(appid: number) {
    if (!steamid) return;
    setAchievements([]);
    const r = await fetch(`/api/steam/achievements?steamid=${steamid}&appid=${appid}`);
    const data = await r.json();
    const list = (data.achievements ?? []).map((a: any) => ({
      name: a.name,
      achieved: a.achieved,
      unlocktime: a.unlocktime,
    }));
    setAchievements(list);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper for badge display name (use game name when we have it)
  const gameNameById = new Map(games.map((g) => [g.appid, g.name]));
  const badgeLabel = (b: Badge) =>
    gameNameById.get(b.appid ?? -1) ?? (b.appid ? `App ${b.appid}` : `Badge ${b.badgeid}`);

  return (
    <main className="container">
      <div className="hero">
        <h1 className="h1 title-font">
          Who&apos;s That Bud Buddy? <img src="/shadow.png" alt="" className="h1-icon" />
        </h1>
        <p className="subtle">Search by Steam Name, SteamID, or full profile URL below:</p>

        <div className="controls">
          <input
            className="input"
            placeholder="Steam vanity / SteamID64 / profile URL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadAll();
            }}
          />
          <button className="button" onClick={loadAll} disabled={loading}>
            {loading ? "Loading..." : "Show"}
          </button>
        </div>
      </div>

      {err && <div className="card" style={{ marginBottom: 12 }}>Error: {err}</div>}

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
            <div className="level-pill">
              Level&nbsp;<strong>{level ?? "—"}</strong>
            </div>
          </div>
        </section>
      )}

      {/* ===== Two-column: Top 10 (left) + Badges (right) ===== */}
      <section className="grid-2 section">
        {/* Top 10 */}
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
                    <span className="game-name">{g.name}</span>
                    <span className="game-meta">{hrsAll} hrs total</span>
                  </div>
                  <button className="button" onClick={() => loadAchievements(g.appid)}>
                    See achievements
                  </button>
                </div>
              );
            })}
            {!games.length && <div className="subtle">No public games.</div>}
          </div>
        </div>

        {/* Badges (replaces Recently Played) */}
        <div className="panel" id="badges">
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>
            Badges
          </h2>

          {badges.length ? (
            <ul className="badges-grid">
              {badges.map((b) => (
                <li key={`${b.badgeid}-${b.appid ?? "na"}`} className="badge">
                  <div className="badge-icon">🏅</div>
                  <div className="badge-meta">
                    <div className="badge-name">{badgeLabel(b)}</div>
                    <div className="badge-note">
                      Level {b.level ?? 0}
                      {typeof b.completed === "number" ? ` · ${b.completed} completed` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="subtle">No public badges.</div>
          )}
        </div>
      </section>

      {!!achievements.length && (
        <section className="section panel">
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>
            Achievements
          </h2>
          <ul className="badges-grid">
            {achievements.map((a, i) => (
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

<style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  /* force Bebas for game titles anywhere we list games */
  .games-list .game-name,
  .games-list .title-font,
  .games-list .game-title > *:first-child,
  .games-list .game-item h3,
  .games-list .game-item .name {
    font-family: "Bebas Neue", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif !important;
    font-weight: 400;
    letter-spacing: .25px;
    line-height: 1.05;
  }
`}</style>
