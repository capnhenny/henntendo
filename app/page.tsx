"use client";

import { useEffect, useState } from "react";

type Badge = { badgeid: number; level?: number; appid?: number; completed?: number };
type Game = { appid: number; name: string; playtime_forever?: number };

const DEFAULT_INPUT = "laserhenn"; // ✅ your vanity from https://steamcommunity.com/id/laserhenn/

export default function Page() {
  const [input, setInput] = useState(DEFAULT_INPUT); // prefill with your vanity
  const [steamid, setSteamid] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Accepts vanity, SteamID64, or full profile URL
  async function resolveIfNeeded(value: string) {
    const trimmed = value.trim();

    // Full /profiles/ URL → extract 17-digit id
    const profilesMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
    if (profilesMatch) return profilesMatch[1];

    // Full /id/ URL → extract vanity
    const vanityUrlMatch = trimmed.match(/steamcommunity\.com\/id\/([^\/?#]+)/i);
    const candidate = vanityUrlMatch ? vanityUrlMatch[1] : trimmed;

    // Already a 17-digit id?
    if (/^\d{17}$/.test(candidate)) return candidate;

    // Otherwise treat as vanity and resolve server-side
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

      const list: Game[] = (g.games ?? []).sort(
        (a: Game, b: Game) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0)
      );
      setGames(list.slice(0, 50)); // top 50 by playtime
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadAchievements(appid: number) {
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

  // Auto-load your own profile on first visit
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Steam Showcase</h1>
      <p className="text-sm text-gray-600 mb-2">
        Paste a Steam vanity (e.g. <code>laserhenn</code>), SteamID64 (17 digits), or full profile URL.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Steam vanity / SteamID64 / profile URL"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="rounded px-4 py-2 border" onClick={loadAll} disabled={loading}>
          {loading ? "Loading..." : "Show"}
        </button>
      </div>

      {err && <p className="text-red-600 mb-4">{err}</p>}

      {profile && (
        <section className="mb-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatarfull} alt="avatar" className="w-16 h-16 rounded" />
            <div>
              <div className="font-semibold">{profile.personaname}</div>
              <div className="text-sm text-gray-500">{profile.realname ?? ""}</div>
            </div>
          </div>
          <div className="mt-2">
            Level: <strong>{level ?? "—"}</strong>
          </div>
        </section>
      )}

      {!!badges.length && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Badges</h2>
          <ul className="grid grid-cols-2 gap-2">
            {badges.slice(0, 20).map((b, i) => (
              <li key={i} className="border rounded p-2 text-sm">
                <div>Badge ID: {b.badgeid}</div>
                {"level" in b && <div>Level: {b.level}</div>}
                {"appid" in b && b.appid && <div>Game AppID: {b.appid}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!games.length && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Top Games (by playtime)</h2>
          <ul className="space-y-2">
            {games.map((g) => (
              <li key={g.appid} className="border rounded p-2 flex items-center justify-between">
                <span>{g.name}</span>
                <button className="border rounded px-3 py-1 text-sm" onClick={() => loadAchievements(g.appid)}>
                  See achievements
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!achievements.length && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Achievements</h2>
          <ul className="grid grid-cols-2 gap-2">
            {achievements.map((a, i) => (
              <li key={i} className="border rounded p-2 text-sm">
                <div className="font-medium">{a.name}</div>
                <div>{a.achieved ? "Unlocked" : "Locked"}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
