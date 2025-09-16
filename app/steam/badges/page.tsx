export default function BadgesPage() {
  return (
    <div className="container section" id="badges">
      <h2 className="section-title">Badges</h2>
      <ul className="badges-grid">
        <li className="badge"><div className="badge-icon">🎯</div><div className="badge-meta"><div className="badge-name">Precision Player</div><div className="badge-note">100% completion</div></div></li>
        <li className="badge"><div className="badge-icon">🌙</div><div className="badge-meta"><div className="badge-name">Night Owl</div><div className="badge-note">Late sessions</div></div></li>
        <li className="badge"><div className="badge-icon">⚡</div><div className="badge-meta"><div className="badge-name">Speedrunner</div><div className="badge-note">Fastest clear</div></div></li>
      </ul>
    </div>
  );
}
