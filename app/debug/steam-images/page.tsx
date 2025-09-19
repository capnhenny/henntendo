// app/debug/steam-images/page.tsx
export const dynamic = "force-dynamic";

import GameIcon from "../../components/GameIcon";
import GameThumb from "../../components/GameThumb";

const ids = [570, 730, 440, 271590]; // Dota 2, CS2, TF2, GTA V

export default function SteamImagesDebug() {
  return (
    <div className="container section">
      <h2 className="section-title">Steam Image Debug</h2>
      <div className="card" style={{ marginBottom: 12, padding: 12 }}>
        <div style={{ fontWeight: 700 }}>If you can see the rows below, images are wired up.</div>
        <div className="subtle">This page ignores your Steam data and just hardcodes known appids.</div>
      </div>
      <ul className="games-list">
        {ids.map((id) => (
          <li key={id} className="game-item">
            <div className="game-main">
              <GameIcon appid={id} alt={`appid ${id} icon`} />
              <div className="game-title">
                <span className="game-name">AppID {id}</span>
                <span className="game-meta">Icon + Header fallback test</span>
              </div>
            </div>
            <div className="game-right">
              <GameThumb appid={id} alt={`appid ${id} header`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
