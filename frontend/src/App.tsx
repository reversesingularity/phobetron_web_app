import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import EarthquakesPage from './pages/EarthquakesPage'
import VolcanicPage from './pages/VolcanicPage'
import NEOPage from './pages/NEOPage'
import MapPage from './pages/MapPage'
import SolarSystemPage from './pages/SolarSystemPage'
import WatchmansView from './pages/WatchmansView'
import AlertsPage from './pages/AlertsPage'
import ProphecyCodex from './pages/ProphecyCodex'
import CelestialSignsPage from './pages/CelestialSignsPage'
import OrbitalElementsPage from './pages/OrbitalElementsPage'
import MLModelsPage from './pages/MLModelsPage'
import PatternDetectionPage from './pages/PatternDetectionPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/earthquakes" element={<EarthquakesPage />} />
          <Route path="/volcanic" element={<VolcanicPage />} />
          <Route path="/neo" element={<NEOPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/solar-system" element={<SolarSystemPage />} />
          <Route path="/watchmans-view" element={<WatchmansView />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/prophecy-codex" element={<ProphecyCodex />} />
          <Route path="/celestial-signs" element={<CelestialSignsPage />} />
          <Route path="/orbital-elements" element={<OrbitalElementsPage />} />
          <Route path="/ml-models" element={<MLModelsPage />} />
          <Route path="/pattern-detection" element={<PatternDetectionPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
