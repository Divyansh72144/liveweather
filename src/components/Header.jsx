import { CITIES } from '../../backend/cities.js'

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>🌍 Global Weather Map</h1>
        <p className="subtitle">Live weather in {CITIES.length} cities worldwide</p>
      </div>
    </header>
  )
}
