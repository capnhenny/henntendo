"use client";

import { useEffect, useState } from "react";

type Game = {
  appid: number;
  name: string;
  playtime_forever?: number;
  img_icon_url?: string;
};

const DEFAULT_INPUT = "laserhenn";

export default function Page() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [steamid, setSteamid] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [level, setLevel] = useState<number | null>(null);

  // Top 10
  const [games, setGames] = useState<Game[]>([]);
  // Full library for Owned Games
  const [allGames, setAllGames] = useState<Game[]>([]);

  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Owned Games filter/pagination
  const [ownedQuery, setOwnedQuery] = useState("");
  const [ownedLimit, setOwnedLimit] = useState(24);

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

      const [p, l, g]: [
        any,
        { level?: number },
        { games?: Game[] }
      ] = await Promise.all([
        fetch(`/api/steam/profile?steamid=${id}`).then((r) => r.json()),
        fetch(`/api/steam/level?steamid=${id}`).then((r) => r.json()),
        fetch(`/api/steam/games?steamid=${id}`).then((r) => r.json()),
      ]);

      setProfile(p);
      setLevel(l.level ?? null);

      const all: Game[] = (g.games ?? []) as Game[];
      setAllGames(all);

      const top10: Game[] = all
        .slice()
        .sort((a: Game, b: Game) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
        .slice(0, 10);
      setGames(top10);

      // reset owned view on fresh load
      setOwnedLimit(24);
      setOwnedQuery("");
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

  const toHrs = (m?: number) => Math.round((m ?? 0) / 60);

  // Owned Games filter + slice
  const ownedFiltered = allGames.filter((g) =>
    g.name.toLowerCase().includes(ownedQuery.toLowerCase())
  );
  const ownedVisible = ownedFiltered.slice(0, ownedLimit);

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
            onKeyDown={(e) => e.key === "Enter" && loadAll()}
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

      {/* ===== Two-column: Top 10 (left) + Owned Games (right) ===== */}
      <section className="grid-2 section">
        {/* Top 10 */}
        <div className="panel">
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>
            Top 10 Games (all-time playtime)
          </h2>

          <div className="games-list">
            {games.map((g) => {
              const hrsAll = toHrs(g.playtime_forever);
              return (
                <div key={g.appid} className="card game-item">
                  <div className="game-main">
                    {/* left square = cropped header */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                      alt={`${g.name} icon`}
                      width={36}
                      height={36}
                      className="game-icon"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="game-title">
                      <span className="game-name">{g.name}</span>
                      <span className="game-meta">{hrsAll} hrs total</span>
                    </div>
                  </div>

                  {/* right wide header */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                    alt={`${g.name} header`}
                    className="game-thumb"
                  />

                  <button className="button" onClick={() => loadAchievements(g.appid)}>
                    See achievements
                  </button>
                </div>
              );
            })}
            {!games.length && <div className="subtle">No public games.</div>}
          </div>
        </div>

        {/* Owned Games (grid) */}
        <div className="panel" id="owned">
          <h2 className="section-title title-font" style={{ fontSize: 16 }}>
            Owned Games ({ownedFiltered.length})
          </h2>

          <div className="controls" style={{ marginTop: 8 }}>
            <input
              className="input"
              placeholder="Filter owned games…"
              value={ownedQuery}
              onChange={(e) => {
                setOwnedQuery(e.target.value);
                setOwnedLimit(24); // reset paging when filtering
              }}
            />
          </div>

          {ownedFiltered.length ? (
            <>
<ul className="owned-grid">
  {ownedVisible.map((g) => (
    <li key={g.appid} className="owned-card">
      {/* full-bleed image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
        alt={`${g.name} art`}
        className="owned-bg"
        loading="lazy"
        decoding="async"
      />
      {/* title overlay */}
      <span className="game-name owned-name" title={g.name}>
        {g.name}
      </span>
    </li>
  ))}
</ul>

              {ownedFiltered.length > ownedVisible.length && (
                <button
                  className="button"
                  onClick={() => setOwnedLimit((n) => n + 24)}
                  style={{ alignSelf: "center", marginTop: 12 }}
                >
                  Load more
                </button>
              )}
            </>
          ) : (
            <div className="subtle">No owned games (or none matched your filter).</div>
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

      {/* Owned grid styles (scoped) */}
<style jsx>{`
  .owned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  /* Square tile */
  .owned-card {
    position: relative;
    aspect-ratio: 1 / 1;                  /* ← keeps the whole tile square */
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 1px 2px rgba(0,0,0,.12);
  }

  /* Image fills the square */
  .owned-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Title band inside the square */
  .owned-name {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 6px 8px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    /* subtle readable band */
    background: linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.0) 70%);
  }
`}</style>

      {/* Bebas override (works site-wide) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        .games-list .game-name,
        .game-item .game-title > :first-child,
        .owned-grid .game-name {
          font-family: "Bebas Neue", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif !important;
          font-weight: 400;
          letter-spacing: .25px;
          line-height: 1.05;
        }
      `}</style>
    </main>
  );
}
