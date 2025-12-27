export default function Header({ citiesCount }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>🌍 Global Weather Map</h1>
        <p className="subtitle">Live weather in {citiesCount} cities worldwide</p>
      </div>
      <a
        href="https://divyansh.fi"
        target="_blank"
        rel="noopener noreferrer"
        className="creator-link"
      >
        Hey, I'm Divyansh. Click here to know more
      </a>
    </header>
  )
}
