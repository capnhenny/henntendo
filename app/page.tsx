"use client";

import { useState } from "react";

type Badge = { badgeid: number; level?: number; appid?: number; completed?: number };
type Game = { appid: number; name: string; playtime_forever?: number };

export default function Page() {
  const [input, setInput] = useState("");         // vanity or steamid64
  const [steamid, setSteamid] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function resolveIfNeeded(value: string) {
    if (/^\d{17}$/.test(value)) return value; // already SteamID64
    const r = await fetch(`/api/steam/resolve?vanity=${encodeURIComponent(value)}`);
    const data = await r.json();
    if (data.success !== 1 || !data.steamid) throw new Error("Could not resolve vanity URL.");
    return data.steamid as string;
  }

  async function loadAll() {
    try {
      setErr(null); setLoading(true); setAchievements([]);
      const id = await resolveIfNeeded(input.trim());
      setSteamid(id);

      const [p, l, g] = await Promise.all([
        fetch(`/api/steam/profile?steamid=${id}`).then(r => r.json()),
        fetch(`/api/steam/level?steamid=${id}`).then(r => r.json()),
        fetch(`/api/steam/games?steamid=${id}`).then(r => r.json()),
      ]);

      setProfile(p);
      setLevel(l.level ?? null);
      setBadges(l.badges ?? []);
      const list: Game[] = (g.games ?? []).sort(
        (a: Game, b: Game) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0)
      );
      setGames(list.slice(0, 50));
    } catch (e: any) {
      setErr(e.message);
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

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Steam Showcase</h1>
      <p className="text-sm text-gray-600 mb-2">
        Enter your Steam vanity (e.g., <code>okhenn</code>) or SteamID64 (17 digits).
      </p>

      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Steam vanity or SteamID64"
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
                <button
                  className="border rounded px-3 py-1 text-sm"
                  onClick={() => loadAchievements(g.appid)}
                >
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
