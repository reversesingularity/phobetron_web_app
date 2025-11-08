# 🎨 FRONTEND COMPONENT TEMPLATES
## Copilot-Optimized React + Catalyst UI + Three.js/Cesium

---

## Table of Contents
1. [Layout Components](#layout)
2. [Visualization Wrappers](#visualizations)
3. [Alert System](#alerts)
4. [Type Definitions](#types)
5. [API Client](#api-client)
6. [Hooks](#hooks)

---

## 🏗️ LAYOUT COMPONENTS {#layout}

### File: `frontend/components/layout/Sidebar.tsx`

```typescript
/**
 * TheSkyLive.com-inspired sidebar navigation
 * Uses Catalyst UI Sidebar components
 * 
 * Features:
 * - Collapsible navigation
 * - Dark theme optimized
 * - Real-time alert badges
 * - Module quick-access
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar as CatalystSidebar,
  SidebarBody,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarDivider,
} from '@catalyst/sidebar'
import {
  HomeIcon,
  GlobeAltIcon,
  BeakerIcon,
  BookOpenIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@catalyst/badge'

// TODO: Copilot will fetch active alerts count from API
import { useAlerts } from '@/lib/hooks/useAlerts'

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { activeAlerts } = useAlerts() // TODO: Copilot implements this hook
  
  // Navigation items configuration
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      badge: null,
    },
    {
      name: 'Solar System',
      href: '/solar-system',
      icon: GlobeAltIcon,
      badge: null,
      description: '3D Explorer',
    },
    {
      name: "Watchman's View",
      href: '/dashboard',
      icon: BeakerIcon,
      badge: null,
      description: 'Earth Dashboard',
    },
    {
      name: 'Prophecy Codex',
      href: '/prophecy-codex',
      icon: BookOpenIcon,
      badge: null,
      description: 'Biblical Reference',
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: BellAlertIcon,
      badge: activeAlerts?.length > 0 ? activeAlerts.length : null,
    },
  ]
  
  const secondaryItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
  ]

  return (
    <CatalystSidebar
      className={`
        bg-dark-surface border-r border-dark-border
        transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header with logo and collapse toggle */}
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-6">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              {/* TODO: Copilot adds logo image */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-celestial-sun to-celestial-comet" />
              <span className="text-lg font-semibold text-white">
                Celestial Signs
              </span>
            </div>
          )}
          
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-2 hover:bg-dark-elevated transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </SidebarHeader>

      <SidebarBody>
        {/* Primary Navigation */}
        <SidebarSection>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <SidebarItem key={item.href} href={item.href} current={isActive}>
                <Icon className="h-5 w-5" />
                
                {!isCollapsed && (
                  <>
                    <SidebarLabel>{item.name}</SidebarLabel>
                    
                    {/* Alert badge */}
                    {item.badge && (
                      <Badge color="red" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                    
                    {/* Module description */}
                    {item.description && (
                      <span className="ml-auto text-xs text-gray-500">
                        {item.description}
                      </span>
                    )}
                  </>
                )}
                
                {/* Collapsed mode: show badge as dot */}
                {isCollapsed && item.badge && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </SidebarItem>
            )
          })}
        </SidebarSection>

        <SidebarDivider />

        {/* Secondary Navigation */}
        <SidebarSection>
          {secondaryItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarItem key={item.href} href={item.href}>
                <Icon className="h-5 w-5" />
                {!isCollapsed && <SidebarLabel>{item.name}</SidebarLabel>}
              </SidebarItem>
            )
          })}
        </SidebarSection>

        {/* System Status Footer */}
        {!isCollapsed && (
          <div className="mt-auto px-4 py-4 border-t border-dark-border">
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span className="text-gray-400">2 min ago</span>
              </div>
              <div className="flex justify-between">
                <span>Data Sources:</span>
                <span className="text-green-400">● Active</span>
              </div>
            </div>
          </div>
        )}
      </SidebarBody>
    </CatalystSidebar>
  )
}
```

---

### File: `frontend/components/layout/Navbar.tsx`

```typescript
/**
 * Top navigation bar with date/time controls
 * Inspired by TheSkyLive.com control panel
 */

'use client'

import { useState } from 'react'
import { Navbar, NavbarSection, NavbarItem, NavbarSpacer } from '@catalyst/navbar'
import { Input } from '@catalyst/input'
import { Button } from '@catalyst/button'
import { Select } from '@catalyst/select'
import {
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline'

// TODO: Copilot will implement time control logic
import { useTimeControl } from '@/lib/hooks/useTimeControl'

export function TopNavbar() {
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    setCurrentTime,
    togglePlayback,
    setPlaybackSpeed,
  } = useTimeControl() // TODO: Copilot implements this hook

  return (
    <Navbar className="bg-dark-surface border-b border-dark-border">
      <NavbarSection>
        {/* Date/Time Picker */}
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <Input
            type="datetime-local"
            value={currentTime.toISOString().slice(0, 16)}
            onChange={(e) => setCurrentTime(new Date(e.target.value))}
            className="bg-dark-elevated text-white border-dark-border"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1 ml-4">
          <Button
            outline
            onClick={() => {
              // TODO: Copilot implements step backward logic
              const newTime = new Date(currentTime.getTime() - 86400000) // -1 day
              setCurrentTime(newTime)
            }}
            aria-label="Step backward"
          >
            <BackwardIcon className="h-4 w-4" />
          </Button>

          <Button
            outline
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>

          <Button
            outline
            onClick={() => {
              // TODO: Copilot implements step forward logic
              const newTime = new Date(currentTime.getTime() + 86400000) // +1 day
              setCurrentTime(newTime)
            }}
            aria-label="Step forward"
          >
            <ForwardIcon className="h-4 w-4" />
          </Button>

          {/* Speed Control */}
          <Select
            value={playbackSpeed.toString()}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="ml-2 bg-dark-elevated text-white border-dark-border"
          >
            <option value="0.1">0.1x</option>
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
            <option value="100">100x</option>
          </Select>
          <span className="text-xs text-gray-500 ml-2">days/sec</span>
        </div>
      </NavbarSection>

      <NavbarSpacer />

      <NavbarSection>
        {/* Current Time Display */}
        <div className="text-sm text-gray-300">
          {currentTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
          })}
          {' UTC'}
        </div>

        {/* Real-time Mode Toggle */}
        <Button
          outline
          onClick={() => setCurrentTime(new Date())}
          className="ml-4"
        >
          Now
        </Button>
      </NavbarSection>
    </Navbar>
  )
}
```

---

### File: `frontend/app/layout.tsx`

```typescript
/**
 * Root layout with Catalyst UI provider and dark theme
 * Sets up global structure matching TheSkyLive.com
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNavbar } from '@/components/layout/Navbar'
import { CatalystProvider } from '@catalyst/react'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Celestial Signs - Digital Watchman Observatory',
  description: 'Monitoring astronomical events and correlating with biblical eschatology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Persist collapse state in localStorage via Copilot
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-bg text-white antialiased`}>
        <CatalystProvider theme="dark">
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Top Navigation Bar */}
              <TopNavbar />

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto overflow-x-hidden bg-dark-bg">
                <div className="container mx-auto px-6 py-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </CatalystProvider>
      </body>
    </html>
  )
}
```

---

## 🌌 VISUALIZATION WRAPPERS {#visualizations}

### File: `frontend/components/visualizations/SolarSystemViewer.tsx`

```typescript
/**
 * Three.js Solar System 3D Visualization
 * Renders planetary orbits and celestial objects
 * 
 * Data flow:
 * 1. Fetch ephemeris vectors from backend API
 * 2. Create BufferGeometry for orbital paths
 * 3. Animate object positions based on current time
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useTimeControl } from '@/lib/hooks/useTimeControl'
import { fetchEphemerisVectors } from '@/lib/api-client'
import type { EphemerisVector } from '@/lib/types'

interface SolarSystemViewerProps {
  focusObject?: string
  showOrbits?: boolean
  showLabels?: boolean
}

// TODO: Copilot will generate the main scene component
function SolarSystemScene({ focusObject }: { focusObject?: string }) {
  const { currentTime } = useTimeControl()
  const [ephemerisData, setEphemerisData] = useState<Map<string, EphemerisVector[]>>(new Map())

  // Fetch ephemeris data for all tracked objects
  useEffect(() => {
    async function loadEphemeris() {
      // TODO: Copilot implements data fetching for multiple objects
      const objects = ['Mars', 'Jupiter', 'Saturn', '3I/ATLAS', 'Halley']
      
      const dataMap = new Map<string, EphemerisVector[]>()
      for (const obj of objects) {
        try {
          const vectors = await fetchEphemerisVectors(obj, {
            startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
            endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year ahead
            stepSize: '1d',
          })
          dataMap.set(obj, vectors)
        } catch (error) {
          console.error(`Failed to fetch ephemeris for ${obj}:`, error)
        }
      }
      
      setEphemerisData(dataMap)
    }

    loadEphemeris()
  }, [])

  return (
    <>
      {/* Starfield background */}
      <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />
      
      {/* Sun at origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
      
      {/* Render each celestial object and orbit */}
      {Array.from(ephemerisData.entries()).map(([objectName, vectors]) => (
        <CelestialObject
          key={objectName}
          name={objectName}
          ephemeris={vectors}
          currentTime={currentTime}
          isFocused={focusObject === objectName}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={100}
      />
    </>
  )
}

// TODO: Copilot will generate CelestialObject component
interface CelestialObjectProps {
  name: string
  ephemeris: EphemerisVector[]
  currentTime: Date
  isFocused: boolean
}

function CelestialObject({ name, ephemeris, currentTime, isFocused }: CelestialObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const orbitRef = useRef<THREE.Line>(null)

  // Create orbital path geometry
  useEffect(() => {
    if (ephemeris.length === 0 || !orbitRef.current) return

    // TODO: Copilot creates BufferGeometry from ephemeris vectors
    const points = ephemeris.map(vec => new THREE.Vector3(vec.x_au, vec.y_au, vec.z_au))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    orbitRef.current.geometry = geometry
  }, [ephemeris])

  // Animate object position based on current time
  useFrame(() => {
    if (!meshRef.current || ephemeris.length === 0) return

    // TODO: Copilot interpolates position based on currentTime
    // Find two ephemeris points bracketing currentTime
    // Linearly interpolate between them
    const currentJD = timeToJulianDate(currentTime)
    
    // Binary search or find closest points
    let closest = ephemeris[0]
    for (const vec of ephemeris) {
      if (Math.abs(vec.epoch_jd - currentJD) < Math.abs(closest.epoch_jd - currentJD)) {
        closest = vec
      }
    }
    
    meshRef.current.position.set(closest.x_au, closest.y_au, closest.z_au)
  })

  return (
    <>
      {/* Orbital path */}
      <line ref={orbitRef}>
        <lineBasicMaterial color="#4a90e2" opacity={0.5} transparent />
      </line>
      
      {/* Celestial body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={isFocused ? '#00d4ff' : '#ffffff'}
          emissive={isFocused ? '#00d4ff' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Label (TODO: Copilot adds HTML label overlay) */}
    </>
  )
}

// Helper function
function timeToJulianDate(date: Date): number {
  // TODO: Copilot implements Julian Date conversion
  return date.getTime() / 86400000 + 2440587.5
}

// Main exported component
export function SolarSystemViewer(props: SolarSystemViewerProps) {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        
        <SolarSystemScene {...props} />
      </Canvas>
    </div>
  )
}
```

---

### File: `frontend/components/visualizations/EarthDashboard.tsx`

```typescript
/**
 * Cesium.js Earth-centric 3D Dashboard
 * Displays NEOs, earthquakes, space weather on 3D globe
 * 
 * Data format: CZML (Cesium Language)
 * Generated by backend service using czml3/poliastro
 */

'use client'

import { useEffect, useRef } from 'react'
import { Viewer, Entity, CzmlDataSource } from 'resium'
import { Cartesian3, Color } from 'cesium'
import { useTimeControl } from '@/lib/hooks/useTimeControl'
import { fetchCZMLData } from '@/lib/api-client'

interface EarthDashboardProps {
  showNEOs?: boolean
  showEarthquakes?: boolean
  showVolcanoes?: boolean
  showSpaceWeather?: boolean
}

export function EarthDashboard({
  showNEOs = true,
  showEarthquakes = true,
  showVolcanoes = true,
  showSpaceWeather = true,
}: EarthDashboardProps) {
  const viewerRef = useRef<any>(null)
  const czmlDataSourceRef = useRef<CzmlDataSource>(null)
  const { currentTime } = useTimeControl()

  // Load CZML data from backend
  useEffect(() => {
    async function loadCZML() {
      try {
        // TODO: Copilot fetches CZML from backend API
        const czmlData = await fetchCZMLData({
          includeNEOs: showNEOs,
          includeEarthquakes: showEarthquakes,
          includeVolcanoes: showVolcanoes,
          includeSpaceWeather: showSpaceWeather,
        })

        // Load into Cesium viewer
        if (czmlDataSourceRef.current && czmlData) {
          await czmlDataSourceRef.current.load(czmlData)
        }
      } catch (error) {
        console.error('Failed to load CZML data:', error)
      }
    }

    loadCZML()
  }, [showNEOs, showEarthquakes, showVolcanoes, showSpaceWeather])

  // Sync viewer time with global time control
  useEffect(() => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(currentTime)
    }
  }, [currentTime])

  return (
    <div className="w-full h-full">
      <Viewer
        ref={viewerRef}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        sceneModePicker={false}
        style={{ height: '100%' }}
      >
        {/* CZML Data Source */}
        <CzmlDataSource ref={czmlDataSourceRef} />

        {/* Additional static overlays can be added here */}
        {/* TODO: Copilot adds custom earthquake markers, etc. */}
      </Viewer>
    </div>
  )
}
```

---

## 🚨 ALERT SYSTEM {#alerts}

### File: `frontend/components/alerts/AlertCard.tsx`

```typescript
/**
 * Individual alert card component
 * Uses Catalyst UI for consistent styling
 */

'use client'

import { Badge } from '@catalyst/badge'
import { Button } from '@catalyst/button'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import type { Alert } from '@/lib/types'

interface AlertCardProps {
  alert: Alert
  onAcknowledge?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
}

export function AlertCard({ alert, onAcknowledge, onDismiss }: AlertCardProps) {
  const severityColors = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'yellow',
    LOW: 'blue',
  } as const

  const severityIcons = {
    CRITICAL: ExclamationTriangleIcon,
    HIGH: ExclamationTriangleIcon,
    MEDIUM: ExclamationTriangleIcon,
    LOW: ExclamationTriangleIcon,
  }

  const SeverityIcon = severityIcons[alert.severity]

  return (
    <div
      className={`
        bg-dark-surface border-l-4 rounded-lg p-4
        ${alert.severity === 'CRITICAL' ? 'border-red-500' : ''}
        ${alert.severity === 'HIGH' ? 'border-orange-500' : ''}
        ${alert.severity === 'MEDIUM' ? 'border-yellow-500' : ''}
        ${alert.severity === 'LOW' ? 'border-blue-500' : ''}
        ${alert.status === 'ACKNOWLEDGED' ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Severity Icon */}
          <SeverityIcon
            className={`h-6 w-6 mt-0.5 ${
              alert.severity === 'CRITICAL' ? 'text-red-500' : ''
            } ${alert.severity === 'HIGH' ? 'text-orange-500' : ''} ${
              alert.severity === 'MEDIUM' ? 'text-yellow-500' : ''
            } ${alert.severity === 'LOW' ? 'text-blue-500' : ''}`}
          />

          {/* Alert Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white">{alert.title}</h3>
              <Badge color={severityColors[alert.severity]}>
                {alert.severity}
              </Badge>
              {alert.status === 'ACKNOWLEDGED' && (
                <Badge color="gray">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Acknowledged
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-400 mb-2">{alert.description}</p>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>
                {formatDistanceToNow(new Date(alert.triggered_at), {
                  addSuffix: true,
                })}
              </span>
              {alert.related_object_name && (
                <span className="text-celestial-comet">
                  Object: {alert.related_object_name}
                </span>
              )}
              <span className="text-gray-600">
                Type: {alert.alert_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {alert.status === 'ACTIVE' && onAcknowledge && (
            <Button
              outline
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs"
            >
              Acknowledge
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Dismiss alert"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 📝 TYPE DEFINITIONS {#types}

### File: `frontend/lib/types.ts`

```typescript
/**
 * TypeScript type definitions for Celestial Signs
 * Auto-synced with backend Pydantic schemas
 */

// ============================================================================
// ASTRONOMICAL DATA TYPES
// ============================================================================

export interface EphemerisVector {
  id: string
  object_name: string
  object_designation?: string
  epoch_jd: number
  epoch_iso: string
  x_au: number
  y_au: number
  z_au: number
  vx_au_per_day?: number
  vy_au_per_day?: number
  vz_au_per_day?: number
  range_au?: number
  range_rate?: number
  reference_frame: string
  data_source: string
  ingested_at: string
}

export interface OrbitalElements {
  id: string
  object_name: string
  epoch_jd: number
  epoch_iso: string
  eccentricity: number
  semi_major_axis_au?: number
  inclination_deg: number
  longitude_ascending_node_deg?: number
  argument_perihelion_deg?: number
  mean_anomaly_deg?: number
  perihelion_distance_au?: number
  aphelion_distance_au?: number
  orbital_period_years?: number
  is_interstellar: boolean
  data_source: string
  ingested_at: string
}

export interface ImpactRisk {
  id: string
  object_name: string
  object_designation?: string
  torino_scale_max?: number
  palermo_scale_cumulative?: number
  impact_probability_cumulative?: number
  possible_impacts?: number
  last_observation_date?: string
  is_active: boolean
  removal_date?: string
  data_source: string
  last_updated: string
  ingested_at: string
}

export interface Earthquake {
  id: string
  usgs_event_id: string
  magnitude: number
  magnitude_type?: string
  location_description?: string
  latitude: number
  longitude: number
  depth_km: number
  event_time: string
  felt_reports?: number
  tsunami: boolean
  data_source: string
  ingested_at: string
}

// ============================================================================
// THEOLOGICAL DATA TYPES
// ============================================================================

export interface Prophecy {
  id: number
  event_name: string
  scripture_reference: string
  scripture_text?: string
  event_description?: string
  prophecy_category?: string
  chronological_order?: number
  created_at: string
  updated_at: string
}

export interface CelestialSign {
  id: number
  sign_name: string
  sign_description?: string
  theological_interpretation?: string
  primary_scripture?: string
  related_scriptures?: string[]
  created_at: string
}

export interface DataTrigger {
  id: number
  sign_id: number
  trigger_name: string
  description?: string
  data_source_api: string
  query_parameter: string
  query_operator: string
  query_value: string
  additional_conditions?: Record<string, any>
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
export type AlertType = 'PDS_MATCH' | 'CORRELATION' | 'MANUAL'

export interface Alert {
  id: string
  trigger_id?: number
  alert_type: AlertType
  title: string
  description?: string
  related_object_name?: string
  related_event_id?: string
  severity: AlertSeverity
  status: AlertStatus
  triggered_at: string
  acknowledged_at?: string
  resolved_at?: string
  trigger_data?: Record<string, any>
  created_at: string
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface FetchEphemerisParams {
  startTime: Date
  endTime: Date
  stepSize: string // e.g., '1d', '1h'
  referenceFrame?: string
}

export interface FetchCZMLParams {
  includeNEOs: boolean
  includeEarthquakes: boolean
  includeVolcanoes: boolean
  includeSpaceWeather: boolean
  startTime?: Date
  endTime?: Date
}

export interface AlertListResponse {
  alerts: Alert[]
  total: number
  page: number
  page_size: number
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface TimeControlState {
  currentTime: Date
  isPlaying: boolean
  playbackSpeed: number
  realTimeMode: boolean
}

export interface VisualizationSettings {
  showOrbits: boolean
  showLabels: boolean
  showGrid: boolean
  cameraMode: 'free' | 'follow' | 'top'
  focusObject?: string
}

// TODO: Copilot will add more types as needed
```

---

**Continue to Part 4: Backend API Templates and 12-Month Roadmap?**

This frontend package provides:
- ✅ TheSkyLive.com-inspired layout with Catalyst UI
- ✅ Copilot-optimized component templates
- ✅ Complete type definitions
- ✅ Three.js and Cesium.js integration patterns
- ✅ Alert system UI components
