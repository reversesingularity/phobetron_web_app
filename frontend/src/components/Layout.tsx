import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  MapPin, 
  Activity, 
  Mountain, 
  Orbit,
  Sun,
  Menu,
  X,
  Star,
  Bell,
  Book,
  Brain,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Map View', href: '/map', icon: MapPin },
    { name: 'Earthquakes', href: '/earthquakes', icon: Activity },
    { name: 'Volcanic Activity', href: '/volcanic', icon: Mountain },
    { name: 'Near-Earth Objects', href: '/neo', icon: Orbit },
    { name: 'Solar System', href: '/solar-system', icon: Sun },
    { name: "Watchman's View", href: '/watchmans-view', icon: Star, highlight: true },
    { name: 'Alerts', href: '/alerts', icon: Bell, highlight: true },
    { name: 'Prophecy Codex', href: '/prophecy-codex', icon: Book, highlight: true },
    { name: 'Celestial Signs', href: '/celestial-signs', icon: Sparkles, highlight: true },
    { name: 'Orbital Elements', href: '/orbital-elements', icon: Orbit, highlight: true },
    { name: 'ML Models', href: '/ml-models', icon: Brain, highlight: true },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-blue-400">Phobetron</span>
              </h1>
              <p className="ml-4 text-sm text-gray-400 hidden lg:block">
                Celestial Events Tracker
              </p>
            </div>

            {/* Desktop Navigation - Scrollable */}
            <nav className="hidden md:flex flex-1 overflow-x-auto scrollbar-thin ml-4 pb-1">
              <div className="flex space-x-1 min-w-max">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isHighlight = 'highlight' in item && item.highlight
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2
                        transition-colors whitespace-nowrap flex-shrink-0
                        ${
                          isActive(item.href)
                            ? isHighlight 
                              ? 'bg-purple-900 text-white border border-purple-500/50'
                              : 'bg-gray-900 text-white'
                            : isHighlight
                            ? 'text-purple-300 hover:bg-purple-900/50 hover:text-white border border-purple-500/30'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={18} />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2
                      ${
                        isActive(item.href)
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Phobetron. Real-time data from USGS, NASA/JPL, and Smithsonian GVP.</p>
            <p className="mt-2">
              <a 
                href="https://phobetronwebapp-production.up.railway.app/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                API Documentation
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
