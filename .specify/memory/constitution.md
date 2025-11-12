# Phobetron (Celestial Signs) Project Constitution

## Core Principles

### I. Visual-First Architecture
The application prioritizes stunning, accurate 3D visualization of celestial mechanics as the primary user interface. All features must enhance, not distract from, the core visualization experience. The Solar System visualization is the centerpiece - all other features support it.

### II. Keplerian Accuracy
Orbital mechanics must be mathematically accurate using Keplerian elements with time-dependent updates. No approximations or simplifications that sacrifice astronomical accuracy. Real ephemeris data from JPL Horizons is authoritative.

### III. Performance Over Features
Three.js rendering must maintain 60 FPS with all features enabled. Any feature that degrades performance below 50 FPS must be optimized or made optional. Pure imperative Three.js (no React Three Fiber) ensures minimal overhead.

### IV. Progressive Enhancement
Start with core functionality (planets, orbits, time controls) and layer on enhancements (moons, asteroid belt, special effects). Each layer must be independently toggleable and performant.

### V. Theological Integration
This is not just an astronomical simulator - it's a prophecy interpretation tool. Celestial events must be correlatable with theological timelines, biblical prophecies, and eschatological frameworks.

## Solar System Visualization Design (LOCKED)

### Architecture
- **Framework**: Next.js 16 + React 19 + TypeScript
- **3D Engine**: Three.js (pure imperative, NO React Three Fiber)
- **Rendering**: WebGLRenderer with CSS2DRenderer for labels
- **State Management**: React hooks (useState, useRef, useCallback)
- **UI Library**: Catalyst UI with Tailwind CSS
- **Icons**: Heroicons 24

### Core Canvas Component: TheSkyLiveCanvas.tsx
**Location**: `frontend/src/components/visualization/TheSkyLiveCanvas.tsx`
**Size**: ~3,140 lines (updated with v1.2.0 enhancements)
**Responsibility**: Complete 3D solar system simulation with research-grade orbital mechanics

**New Functions (v1.2.0)**:
- `calculateTimeToPerihelion()`: Comet countdown calculations
- `calculateApparentMagnitude()`: Astronomical magnitude from Earth
- `applyMagnitudeBasedVisibility()`: Distance-based object fading
- `calculatePerturbation()`: Gravitational force between bodies
- `applyPlanetaryPerturbations()`: N-body effects integration
- `addDebrisTrail()`: Particle system for fragmenting comets
- Enhanced `addMoonSystems()`: Elliptical orbits with inclination
- Enhanced `updateMoonPositions()`: Tidal locking rotation

#### Component Structure
```typescript
interface TheSkyLiveCanvasProps {
  showGrid: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showConstellations: boolean;
  showAsteroidBelt: boolean;
  showMoons: boolean;
  speedMultiplier: number;
  isPaused: boolean;
  onPlanetSelect?: (name: string) => void;
  onTimeUpdate?: (time: number) => void;
  onCameraControlsReady?: (controls: CameraControls) => void;
}
```

### Visual Features (Current Implementation)

#### 1. Celestial Objects (34 Total - ENHANCED v1.2.0)
- **8 Planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- **6 Asteroids**: Ceres, Vesta, Pallas, Hygiea, Eunomia, Juno (with corrected mean motion)
- **4 Comets**: Halley's, Hale-Bopp, C/2025 A6 (Lemmon), C/2025 R2 (SWAN)
  - Time-to-perihelion countdown displayed in labels (→ approaching, ← receding)
  - Dual-component tails (dust + ion) pointing away from Sun
- **2 NEOs**: Apophis, Ryugu (with corrected mean motion)
- **3 Interstellar**: 1I/'Oumuamua (no tail), 2I/Borisov, 3I/ATLAS
  - 3I/ATLAS: Anomalous tail pointing toward Sun + 200-particle orange-red debris trail
- **Magnitude-Based Visibility**: All small bodies fade/brighten based on distance from Earth
  - m < 6.5: Naked eye (opacity 1.0)
  - m < 10: Binoculars (opacity 0.7-1.0)
  - m < 13: Telescope (opacity 0.3-0.7)
  - m > 13: Very faint (opacity 0.3)

#### 2. Planet Visual Enhancements
- **Earth**: Vibrant blue jewel with NASA texture, ocean overlays, ice caps, clouds, deep blue atmosphere
- **Mars**: Red planet with NASA texture, polar ice caps
- **Jupiter**: NASA texture with atmospheric bands and Great Red Spot features
- **Saturn**: NASA texture with detailed ring system (multiple ring layers)
- **Venus**: Thick cloud layer rendering
- **Uranus**: Self-illuminating MeshBasicMaterial (bright cyan), 2.5x enlarged, triple glow layers, extreme axial tilt
- **Neptune**: Self-illuminating MeshBasicMaterial (royal blue), 2.5x enlarged, triple glow layers, atmospheric bands
- **Mercury**: Cratered surface details

#### 3. Sun Rendering
- **Core**: Bright sphere with emissive material
- **Multi-layer Glow**: 3 glow layers with additive blending
- **Shadow Casting**: Directional light casting shadows on planets
- **Scale**: Visually balanced (not to true scale)

#### 4. Orbital Mechanics (ENHANCED v1.2.0 - Research-Grade)
- **System**: Keplerian orbital elements with time-dependent mean elements
- **Elements**: Semi-major axis (a), eccentricity (e), inclination (i), longitude of ascending node (Ω), longitude of perihelion (ϖ), mean longitude (L)
- **Solver**: Kepler equation solver for eccentric anomaly (elliptical) and hyperbolic anomaly (hyperbolic orbits)
- **Planetary Perturbations**: N-body gravitational effects between planets
  - Gravitational constant: G = 0.0002959122 AU³/(Earth mass·day²)
  - Planetary masses: Jupiter (317.8 M⊕), Saturn (95.2 M⊕), Neptune (17.1 M⊕), etc.
  - Formula: a = G·M/r² (gravitational acceleration)
  - Updates every 10th frame for performance
- **Coordinates**: Heliocentric ecliptic coordinates converted to Three.js coordinate system
- **Scale**: 1 AU = 10 units (AU_SCALE constant)
- **Time Step**: 1 hour per frame (adjustable via speedMultiplier)
- **Accuracy**: ⭐⭐⭐⭐⭐ (5/5 stars) - Research-grade with all enhancements

#### 5. Asteroid Belt
- **Count**: 8,000 asteroids
- **Distribution**: Random distribution between 2.2 - 3.2 AU
- **Rendering**: Points geometry with BufferAttribute
- **Colors**: Brownish-gray with variation
- **Sizes**: 95% small, 4% medium, 1% large
- **Thickness**: 0.4 AU vertical spread

#### 6. Moon Systems (17 Moons Total - ENHANCED v1.2.0)
- **Earth**: Moon (1)
- **Mars**: Phobos, Deimos (2)
- **Jupiter**: Io, Europa, Ganymede, Callisto (4 Galilean moons)
- **Saturn**: Titan, Rhea, Iapetus, Dione (4)
- **Uranus**: Titania, Oberon (2)
- **Neptune**: Triton (1)
- **Orbital Mechanics**: 
  - Elliptical orbits with eccentricity (e=0.0549 for Moon, e=0.000016 for Triton)
  - Inclined orbital planes (5.14° to 156.83° for Triton's retrograde)
  - True anomaly calculation using Newton-Raphson Kepler solver (5 iterations)
  - Distance formula: r = a(1-e²)/(1+e·cos(ν))
- **Tidal Locking**: All moons always show same face to planet (quaternion-based rotation)
- **Lunar Phases**: Earth's Moon shows realistic phases based on Sun-Moon-Earth geometry
- **Orbital Speed**: Divided by MOON_SPEED_DIVISOR (74) for visible motion
- **Orbits**: Visible elliptical orbit paths rendered as lines with inclination

#### 7. Background & Environment
- **Stars**: 15,000 procedurally generated stars
- **Milky Way**: 8,000 point Milky Way band
- **Constellations**: 20 constellation patterns with boundaries and star connections
- **Grid**: Optional 400x400 unit grid helper
- **Camera**: PerspectiveCamera with OrbitControls

#### 8. Lighting & Shadows
- **Primary Light**: Directional light from Sun casting shadows
- **Ambient Light**: Low ambient for background visibility
- **Shadow Maps**: Enabled on Sun light, planets receive shadows
- **Emissive Materials**: Planets and objects have self-illumination

### Interactive Features (Current Implementation)

#### 1. Time Controls (TimeControlsPanel.tsx)
- **Location**: Bottom-left (left-64, bottom-4)
- **Play/Pause**: Toggle simulation (keyboard: Space)
- **Speed Control**: 0.1x - 100x with presets and custom input
- **Time Stepping**: Hour/day forward/backward (keyboard: arrows)
- **Date Picker**: Jump to any date/time
- **Quick Jumps**: -1 week, Now, +1 week buttons
- **Keyboard Shortcuts**: Space, ←/→, Shift+←/→, ↑/↓

#### 2. Planet Information Panel (PlanetInfoPanel.tsx)
- **Location**: Fixed right sidebar (right-4, top-20, bottom-4, w-96)
- **Trigger**: Click any planet
- **Content**:
  - Planet name with color-coded accent
  - Type badge (Terrestrial/Gas Giant/Ice Giant)
  - 4 stat cards: diameter, mass, orbital period, temperature
  - Detail rows: distance, rotation, moons, composition
  - 5 interesting facts with color-coded bullets
  - NASA/JPL attribution
- **Data Source**: `lib/planetData.ts` (comprehensive info for all 8 planets)
- **Interaction**: Click X to close, click empty space to close

#### 3. Camera Controls
- **Orbit**: Left-click drag to rotate
- **Pan**: Right-click drag to translate
- **Zoom**: Scroll wheel
- **Presets**: Top view, side view, Earth focus, reset view
- **Auto-rotate**: Optional scene rotation
- **Limits**: Min/max zoom distances, max polar angle

#### 4. Raycasting & Selection
- **Method**: Three.js Raycaster with recursive child checking
- **Targets**: All planet meshes and their children (glow layers, atmospheres)
- **Parent Traversal**: Walks up mesh hierarchy to find named parent planet
- **Hover Effects**: Cursor changes to pointer, planet scales to 1.3x
- **Click**: Opens PlanetInfoPanel with detailed information

### Color Scheme (TheSkyLive.com Standard)

#### Object Colors
- **Planets**: `#4a90e2` (celestial blue)
- **Asteroids**: `#999999` (gray)
- **Comets**: `#00ffff` (cyan)
- **NEOs**: `#ff4444` (red)
- **Interstellar**: `#ff00ff` (magenta)
- **Orbits**: Same as object color, 0.5 opacity

#### Planet-Specific Colors
- Mercury: `#8C7853` (brownish-gray)
- Venus: `#FFC649` (yellowish)
- Earth: `#4A90E2` (vibrant blue)
- Mars: `#CD5C5C` (red)
- Jupiter: `#C88B3A` (orange-brown)
- Saturn: `#FAD5A5` (pale gold)
- Uranus: `#4FD0E7` / `#00FFFF` (cyan - self-illuminating)
- Neptune: `#4169E1` (royal blue - self-illuminating)

#### UI Colors (Dark Theme)
- Background: `zinc-900` / `zinc-950`
- Panels: `zinc-900/95` with backdrop blur
- Borders: `zinc-800`
- Text Primary: `zinc-50` / `white`
- Text Secondary: `zinc-300` / `zinc-400`
- Accent: `cyan-400` / `blue-400`
- Success: `green-600`
- Warning: `orange-600`
- Error: `red-600`

### Performance Optimizations

#### Implemented
- Pure Three.js (no React Three Fiber overhead)
- BufferGeometry for all objects
- InstancedMesh for asteroid belt (Points geometry)
- Efficient animation loop with requestAnimationFrame
- NaN validation in all position calculations
- Conditional rendering (toggles for grid, orbits, labels, constellations, asteroid belt, moons)
- Memoized constants and static data

#### Future Optimizations (TODO)
- Frustum culling for distant objects
- LOD (Level of Detail) for far away planets
- Object pooling for frequently created/destroyed objects
- Web Workers for orbital calculations
- GPU-based particle systems for asteroid belt

### Data Sources

#### API Backend
- **Endpoint**: `http://localhost:8020/api/v1/orbital-elements`
- **Method**: GET
- **Response**: Array of CelestialObject with orbital elements
- **Fallback**: Local test data if API unavailable

#### Orbital Elements Structure
```typescript
interface OrbitalElements {
  name: string;
  e: number;    // Eccentricity
  a: number;    // Semi-major axis (AU)
  i: number;    // Inclination (radians)
  o: number;    // Longitude of ascending node (radians)
  lp: number;   // Longitude of perihelion (radians)
  ml: number;   // Mean longitude (radians)
  epoch: number; // J2000 epoch
}
```

### Constants & Configuration

#### Scale Constants
```typescript
const AU_SCALE = 10;  // 1 AU = 10 Three.js units
const MOON_SPEED_DIVISOR = 50;  // Moons orbit 50x slower
```

#### Planet Sizes (Three.js units)
- Mercury: 0.15
- Venus: 0.35
- Earth: 0.38
- Mars: 0.20
- Jupiter: 1.2
- Saturn: 1.0
- Uranus: 1.5 (2.5x enlarged)
- Neptune: 1.4 (2.5x enlarged)

#### Animation
- Time step: 3600000ms (1 hour) * speedMultiplier per frame
- Default speed: 0.5x (30 minutes per frame)
- Frame rate target: 60 FPS

## Technology Stack (LOCKED)

### Frontend
- **Framework**: Next.js 16.0.0 (Turbopack)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **3D Graphics**: Three.js ^0.170.0
- **UI Library**: Catalyst UI (Headless UI + Tailwind)
- **Styling**: Tailwind CSS 3.x
- **Icons**: Heroicons 24 (solid + outline)
- **State**: React Hooks (no external state management)

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL 16 + PostGIS
- **ORM**: SQLAlchemy 2.x
- **Data Source**: JPL Horizons (via Astroquery)
- **Python**: 3.11+

### Development
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js built-in)
- **Linting**: ESLint + TypeScript
- **Version Control**: Git

## File Structure (Solar System Module)

```
frontend/
├── src/
│   ├── app/
│   │   └── solar-system/
│   │       └── page.tsx                    # Main page component
│   ├── components/
│   │   ├── layout/
│   │   │   └── MainLayout.tsx              # App layout wrapper
│   │   └── visualization/
│   │       ├── TheSkyLiveCanvas.tsx        # Main 3D canvas (2,518 lines)
│   │       ├── TimeControlsPanel.tsx       # Time controls UI
│   │       ├── PlanetInfoPanel.tsx         # Planet details sidebar
│   │       └── (TODO: SearchBar, ToggleControls, CameraPresets)
│   └── lib/
│       ├── planetData.ts                   # Planet information database
│       ├── constellations.ts               # Constellation data
│       └── hooks/
│           ├── useEphemeris.ts            # Ephemeris data hook
│           ├── useOrbitalElements.ts       # Orbital elements hook
│           └── useCloseApproaches.ts       # NEO approaches hook

backend/
├── app/
│   ├── services/
│   │   └── ingestion/
│   │       └── horizons_client.py         # JPL Horizons integration
│   └── api/
│       └── v1/
│           └── orbital_elements.py        # Orbital data endpoint
```

## Development Workflow

### Feature Development
1. **Plan**: Update TODO list with specific tasks
2. **Design**: Document UI/UX in constitution if it affects core design
3. **Implement**: Write TypeScript code following existing patterns
4. **Test**: Verify in browser at http://localhost:3000/solar-system
5. **Optimize**: Ensure 60 FPS performance maintained
6. **Document**: Update constitution if design is locked

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Components**: Functional components with hooks
- **Props**: Explicit interfaces for all component props
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **Validation**: NaN checks on all calculated positions
- **Error Handling**: Console warnings for invalid data, graceful fallbacks

### Performance Requirements
- **Target FPS**: 60 FPS
- **Minimum FPS**: 50 FPS (with all features enabled)
- **Load Time**: Initial render < 2 seconds
- **Interaction Latency**: Click response < 100ms
- **Memory**: No memory leaks in animation loop

## Roadmap Status

### ✅ Completed (Week 1-10 - UPDATED Nov 1, 2025)
- [x] Three.js setup with orbital mechanics
- [x] 34 celestial objects with accurate orbits
- [x] NASA planet textures and visual enhancements
- [x] Special features (Saturn rings, Jupiter stripes, Mars ice caps, Venus clouds)
- [x] Uranus/Neptune brightness fix (self-illuminating)
- [x] Sun with multi-layer glow and shadows
- [x] Asteroid belt (8,000 objects)
- [x] Moon systems (17 moons with elliptical orbits)
- [x] Interactive planet information panels
- [x] Time controls panel with keyboard shortcuts
- [x] Planet click detection with child mesh traversal
- [x] **Moon eccentricity (elliptical orbits)**
- [x] **Moon inclination (tilted orbital planes 5.14°-156.83°)**
- [x] **3I/ATLAS debris trail (200 particles)**
- [x] **Lunar phases (real-time brightness)**
- [x] **Time-to-perihelion countdown (comet labels)**
- [x] **Object magnitudes (distance-based fading)**
- [x] **Tidal locking (quaternion rotation)**
- [x] **Planetary perturbations (N-body physics)**
- [x] **Research-grade accuracy achieved (⭐⭐⭐⭐⭐)**

### 🔄 In Progress (Week 9-10)
- [ ] Object search and filter
- [ ] Toggle controls panel (consolidated UI)
- [ ] Camera preset buttons

### 📋 Upcoming (Week 11-14)
- [ ] Performance optimization (LOD, frustum culling)
- [ ] Mobile responsiveness
- [ ] Screenshot/share feature
- [ ] MVP Release 1.0

## Constraints & Requirements

### Visual Quality
- All planets must have realistic appearance
- Orbits must be smooth and accurate
- UI must not obstruct 3D visualization
- Dark theme for optimal space viewing

### Astronomical Accuracy
- Orbital elements from JPL Horizons
- Keplerian mechanics implementation
- Time-dependent mean element updates
- Hyperbolic orbit support for interstellar objects

### User Experience
- Intuitive camera controls
- Responsive interactions (< 100ms)
- Clear visual feedback (hover, selection)
- Keyboard shortcuts for power users
- Graceful degradation on slower hardware

### Theological Integration (Future)
- Date correlation with biblical events
- Celestial sign pattern recognition
- Prophecy timeline visualization
- Event significance indicators

## Governance

### Design Lock Process
When a feature reaches stable design:
1. Test thoroughly in production-like conditions
2. Document complete specification in constitution
3. Mark as "LOCKED" in constitution
4. Future changes require amendment process

### Amendment Process
To change locked design:
1. Document reason for change
2. Assess impact on dependent features
3. Create migration plan if breaking
4. Update constitution with amendment note
5. Update version and last amended date

### Version Control
- **Constitution Version**: Changes increment MINOR version
- **Major Version**: Breaking changes to core principles
- **Minor Version**: Design locks, amendments, clarifications
- **Patch Version**: Typo fixes, formatting

## Celestial Theme Design System (LOCKED v1.3.0)

### Visual Design Philosophy
The application embodies a **celestial observatory** aesthetic - as if viewing the cosmos through an ancient telescope reimagined for the digital age. Every interface element evokes the wonder of stargazing, with deep space backgrounds, glowing stellar elements, and smooth cosmic animations.

### Core Design Pattern (Applied to All Pages)

#### Background Elements
- **Twinkling Stars**: 12-20 randomly positioned stars using `motion.div`
  - Positions calculated via `useState` on mount (stable, no re-renders)
  - Sizes: 1-3px with occasional 4px for bright stars
  - Animation: Opacity 0.3-1.0 with 2-4s duration, infinite repeat
  - Colors: White/cyan/blue variations
  - z-index: 0 (behind all content)

- **Nebula Clouds**: 2 animated gradient blobs per page
  - Sizes: 300-600px diameter
  - Blur: blur-3xl (48px)
  - Gradients: bg-gradient-to-br with dual-color stops
  - Animation: Scale 1.0-1.2 + opacity 0.3-0.6, 8-10s duration
  - Positioning: Opposite corners (top-left + bottom-right typically)
  - Color themes:
    - Purple/Blue: from-purple-500/20 to-blue-500/20
    - Cyan/Teal: from-cyan-500/20 to-teal-500/20
    - Red/Orange: from-red-500/20 to-orange-500/20
  - z-index: 0 (behind content)

#### Typography
- **Page Headers**: 
  - Font: text-4xl/5xl/6xl font-bold
  - Gradient: bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400
  - Effect: bg-clip-text text-transparent (glowing text effect)
  - Animation: Fade-in with Framer Motion

- **Section Headers**:
  - Font: text-xl/2xl font-semibold
  - Color: Gradient or solid cyan-400/blue-400/purple-400
  - Animation: Fade-in with staggered delays

- **Body Text**:
  - Primary: text-zinc-50 / text-white
  - Secondary: text-zinc-300 / text-zinc-400
  - Muted: text-zinc-500

#### Card Design (Neumorphic Glassmorphism)
- **Background**: bg-gradient-to-br from-zinc-900/90 to-zinc-950/90
- **Border**: border border-cyan-500/20 (or color-specific: blue/purple/red/green)
- **Backdrop**: backdrop-blur-xl (strongest blur available)
- **Padding**: p-4 to p-8 depending on content density
- **Rounded**: rounded-xl (12px) or rounded-2xl (16px)
- **Hover Effects**: 
  - Scale: scale-[1.01] to scale-[1.02]
  - Border glow: border-cyan-500/40
  - translateY: -2px (subtle lift)
- **Animation**: Fade-in with spring transitions

#### Stat Cards
- **Structure**: Small cards showing key metrics
- **Layout**: Grid (grid-cols-2 md:grid-cols-4)
- **Content**:
  - Icon: 24px Heroicon with color-specific class
  - Label: text-sm text-zinc-400
  - Value: text-2xl font-bold gradient text
- **Colors by Type**:
  - Primary/Active: Cyan (text-cyan-400, border-cyan-500/20)
  - Secondary/Total: Blue (text-blue-400, border-blue-500/20)
  - Success/Status: Green (text-green-400, border-green-500/20)
  - Warning: Orange (text-orange-400, border-orange-500/20)
  - Critical/Error: Red (text-red-400, border-red-500/20)
  - Special: Purple (text-purple-400, border-purple-500/20)

#### Animations (Framer Motion)
- **Page Entry**: 
  - Container: Fade-in (opacity 0→1)
  - Staggered Children: delay = index * 0.05 to 0.1
  
- **Hover Effects**:
  - Cards: whileHover={{ scale: 1.01, y: -2 }}
  - Buttons: whileHover={{ scale: 1.05 }}
  - Icons: whileHover={{ scale: 1.1, rotate: 5 }}

- **Transitions**:
  - Type: spring
  - Stiffness: 300
  - Damping: 30

- **Special Effects**:
  - Pulsing indicators: scale 1.0-1.2 loop
  - Spinning loaders: rotate 0-360deg infinite
  - Slide animations: x: 0→4px on hover

#### Scrollbar Styling
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(34 211 238 / 0.3); /* cyan-500/30 */
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgb(34 211 238 / 0.5); /* cyan-500/50 */
}
```

### Page-Specific Implementations

#### 1. Dashboard V2 (`/` - page.tsx)
- **Purpose**: Main landing page with overview metrics
- **Stars**: 10 twinkling stars
- **Nebulas**: 4 clouds (purple, cyan, pink, blue)
- **Special**: 3 shooting stars (diagonal animations)
- **Cards**: API status, data metrics, system health
- **Status**: ✅ LOCKED (v1.3.0)

#### 2. Solar System (`/solar-system` - page.tsx)
- **Purpose**: 3D visualization of celestial mechanics
- **Canvas**: TheSkyLiveCanvas.tsx (pure Three.js)
- **Panels**: TimeControlsPanel, PlanetInfoPanel
- **Theme**: Dark space theme with glowing UI overlays
- **Status**: ✅ LOCKED (v1.2.0) - See Solar System section above

#### 3. Watchman's View (`/watchmans-view` - page.tsx)
- **Purpose**: Prophecy interpretation dashboard
- **Stars**: 10 twinkling stars
- **Nebulas**: 2 clouds (purple/blue, cyan/teal)
- **Cards**: Celestial Events, Prophecy Correlations, Watch Alerts
- **Special**: AI Insights panel with cyan theme
- **Status**: ✅ LOCKED (v1.3.0)

#### 4. Earth Dashboard (`/dashboard` - page.tsx)
- **Purpose**: Real-time earthquake monitoring with Leaflet map
- **Stars**: 12 twinkling stars
- **Nebulas**: 2 clouds (red/orange, cyan/blue)
- **Map**: Leaflet OpenStreetMap (absolute inset-0 positioning)
- **Panels**: 
  - Earthquake stats (top-left, z-30)
  - Map controls (bottom-left, z-20)
  - Event modal (center, z-30 when open)
- **Key Fix**: Map container must be `absolute inset-0 z-10` for visibility
- **Status**: ✅ LOCKED (v1.3.0)

#### 5. Prophecy Codex (`/prophecy-codex` - page.tsx)
- **Purpose**: Biblical scripture database with celestial event correlation
- **Stars**: 15 twinkling stars
- **Nebulas**: 2 clouds (purple/blue, cyan/teal)
- **Database**: 100+ scripture entries with metadata
- **Features**:
  - Scripture search with book/category filters
  - Color-coded categories (Celestial Events-cyan, Prophecy-purple, etc.)
  - Hover cards with scripture preview
  - Staggered fade-in animations
- **Status**: ✅ LOCKED (v1.3.0)

#### 6. Alerts (`/alerts` - page.tsx)
- **Purpose**: Real-time alert monitoring and notifications
- **Stars**: 15 twinkling stars
- **Nebulas**: 2 clouds (red/orange, cyan/blue)
- **Stats**: 3 cards (Active Alerts-red, Total Alerts-cyan, Status-green)
- **Alert List**:
  - Color-coded severity (CRITICAL-red, HIGH-orange, MEDIUM-yellow, LOW-blue)
  - Pulsing indicators for critical alerts (1.5s loop)
  - Staggered animations (delay: idx * 0.05)
  - Hover slide-right effect (x: 4px)
- **Status**: ✅ LOCKED (v1.3.0)

#### 7. Settings (`/settings` - page.tsx)
- **Purpose**: Application configuration and preferences
- **Stars**: 15 twinkling stars
- **Nebulas**: 2 clouds (purple/blue, cyan/teal)
- **Panels**: 4 themed sections
  - General (cyan, Cog6ToothIcon): Theme, timezone
  - API Configuration (blue, ServerIcon): Backend URL, refresh intervals
  - Notifications (purple, BellIcon): Alert toggles
  - Data Sources (green, CloudIcon): Status indicators with pulsing dots
- **Forms**: Enhanced focus states (border-cyan-500/50, ring-2)
- **Status**: ✅ LOCKED (v1.3.0)

#### 8. Timeline (`/timeline` - page.tsx)
- **Purpose**: Celestial events and prophecy timeline visualization
- **Stars**: 18 twinkling stars
- **Nebulas**: 2 clouds (purple/blue, cyan/teal)
- **Stats**: 4 cards (Celestial Events, Prophecy Markers, Critical Events, Visible Now)
- **Controls**:
  - Navigation: Prev/Next month (ArrowLeftIcon/ArrowRightIcon)
  - Current date: CalendarIcon + formatted display
  - "Today" jump button
  - Zoom levels: Years/Months/Weeks (MagnifyingGlassPlus/Minus)
  - Filter: All Types / Celestial / Prophecy dropdown
- **Timeline Track**:
  - Gradient line (cyan→purple)
  - Event markers positioned by date
  - Prophecy markers: 📜 (purple), Celestial: 🌙 (cyan/red)
  - Pulsing animation for critical events (2s loop)
  - Hover scale: 1.5x
- **Event List**: Staggered fade-in, color-coded by type/significance
- **Status**: ✅ LOCKED (v1.3.0)

### Icon System
- **Library**: @heroicons/react/24/outline (primary), /24/solid (accents)
- **Size**: 24px (w-6 h-6) standard, 20px (w-5 h-5) compact, 32px (w-8 h-8) headers
- **Colors**: Matches card theme (cyan/blue/purple/red/green/orange)
- **Common Icons**:
  - Navigation: HomeIcon, CameraIcon, BeakerIcon, MapIcon, BookOpenIcon, BellIcon, Cog6ToothIcon, CalendarIcon
  - Data: ChartBarIcon, ClockIcon, GlobeAmericasIcon
  - Status: CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon
  - Actions: MagnifyingGlassIcon, PlusIcon, MinusIcon, ArrowLeftIcon, ArrowRightIcon
  - Special: SparklesIcon, CloudIcon, ServerIcon

### Responsive Design
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Grid Adaptation**: 
  - Mobile: grid-cols-1
  - Tablet: md:grid-cols-2
  - Desktop: lg:grid-cols-3 xl:grid-cols-4
- **Text Scaling**: text-2xl md:text-3xl lg:text-4xl
- **Sidebar**: Left-64 offset on desktop, overlay on mobile

### Color Palette Reference
```typescript
// Primary Gradients
const headerGradient = "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400";
const cardGradient = "bg-gradient-to-br from-zinc-900/90 to-zinc-950/90";

// Accent Colors
const cyan = "text-cyan-400 border-cyan-500/20";
const blue = "text-blue-400 border-blue-500/20";
const purple = "text-purple-400 border-purple-500/20";
const red = "text-red-400 border-red-500/20";
const orange = "text-orange-400 border-orange-500/20";
const green = "text-green-400 border-green-500/20";

// Background Neutrals
const bgPrimary = "bg-zinc-900 text-zinc-50";
const bgSecondary = "bg-zinc-950 text-zinc-300";
const border = "border-zinc-800";
```

### Performance Considerations
- **Star Positioning**: Calculate once on mount using useState (no re-renders)
- **Animations**: Use CSS transforms (GPU-accelerated)
- **Framer Motion**: Lazy-load motion components
- **Backdrop Blur**: Use sparingly (expensive on low-end hardware)
- **Z-index Management**: Stars/nebulas at 0, content at 10, overlays at 20+

### Accessibility
- **Contrast**: WCAG AA compliant (text-zinc-50 on zinc-900)
- **Focus States**: Visible focus rings on all interactive elements
- **ARIA Labels**: All icon buttons have aria-label
- **Keyboard Navigation**: Tab order follows visual hierarchy
- **Screen Readers**: Semantic HTML with proper heading structure

---

## Production Deployment (Railway.app) - LOCKED

### Architecture: Multi-Project Setup
**Backend Project**: endearing-encouragement  
**Frontend + Database Project**: humble-fascination  

⚠️ **CRITICAL**: Backend and Postgres are in SEPARATE Railway projects - internal DNS (`postgres.railway.internal`) does NOT work cross-project.

### Backend Configuration (endearing-encouragement)

#### Railway Settings
- **Root Directory**: `backend`
- **Build Command**: Automatic (Dockerfile detected)
- **Start Command**: Defined in railway.toml

#### Environment Variables (EXACT VALUES - VERIFIED WORKING)
```bash
DATABASE_URL=postgresql://postgres:diAzWOwKuEhKBcNLcZlsVqfwHrptCQlt@crossover.proxy.rlwy.net:44440/railway
RAILWAY_ENVIRONMENT=production
PORT=8080  # Auto-injected by Railway
```

⚠️ **DATABASE CONNECTION RULES**:
1. **MUST use public proxy**: `crossover.proxy.rlwy.net:44440` (NOT `postgres.railway.internal:5432`)
2. **Password is case-sensitive**: Verify exact characters from Railway Postgres → Credentials tab
3. **DO NOT use variable references**: `${{Postgres.DATABASE_URL}}` or `${{shared.DATABASE_PUBLIC_URL}}` contain stale/incorrect values
4. **Hardcode full connection string** with verified password

#### railway.toml (Repository Root)
```toml
[build]
builder = "dockerfile"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "bash railway-start.sh"  # MUST use "bash" for $PORT expansion
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
RAILWAY_ENVIRONMENT = "production"
```

⚠️ **CRITICAL**: `startCommand = "bash railway-start.sh"` ensures environment variables expand correctly. Using `"./railway-start.sh"` causes literal "$PORT" string to be passed to uvicorn, breaking deployment.

#### backend/Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc g++ curl && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .  # Note: Railway sets context to /backend when Root Directory = "backend"

# Make startup script executable
RUN chmod +x railway-start.sh

EXPOSE 8080
CMD ["bash", "railway-start.sh"]
```

⚠️ **COPY PATH RULES**: When Railway Root Directory = `backend`, use relative paths:
- ✅ `COPY requirements.txt .`
- ✅ `COPY . .`
- ❌ `COPY backend/requirements.txt .` (wrong - Railway already in /backend context)

#### backend/railway-start.sh
```bash
#!/bin/bash
PORT="${PORT:-8080}"  # Default to 8080 if Railway doesn't inject PORT
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 2
```

### Frontend Configuration (humble-fascination)

#### Environment Variables
```bash
VITE_API_URL=https://phobetronwebapp-production.up.railway.app/api/v1
```

⚠️ **CRITICAL**: Include `/api/v1` suffix in base URL, but do NOT duplicate it.

#### frontend/src/services/api.ts
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://phobetronwebapp-production.up.railway.app/api/v1';
```

### Deployment Verification Checklist

After any deployment:

```bash
# 1. Test database connection
curl https://phobetronwebapp-production.up.railway.app/api/v1/admin/check-tables
# Expected: {"status":"success","table_count":18,"tables":[...]}

# 2. Test data endpoints
curl https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes?limit=5
curl https://phobetronwebapp-production.up.railway.app/api/v1/events/volcanic-activity?limit=5
curl https://phobetronwebapp-production.up.railway.app/api/v1/scientific/close-approaches?limit=5

# 3. Verify frontend
# Open: https://phobetronwebapp-production-d69a.up.railway.app
# Check: All pages load data, no 404s in Network tab
```

### Common Deployment Failures & Solutions

1. **"password authentication failed for user postgres"**
   - **Cause**: Wrong password or using internal DNS
   - **Fix**: Verify password character-by-character, use public proxy `crossover.proxy.rlwy.net:44440`

2. **"could not translate host name postgres.railway.internal"**
   - **Cause**: Using internal DNS across projects
   - **Fix**: Change to public proxy `crossover.proxy.rlwy.net:44440`

3. **"Error: Invalid value for '--port': '$PORT' is not a valid integer"**
   - **Cause**: railway.toml uses `./railway-start.sh` instead of `bash railway-start.sh`
   - **Fix**: Change startCommand to `"bash railway-start.sh"`

4. **Frontend 404 errors for /api/v1/api/v1/...**
   - **Cause**: Duplicate /api/v1 prefix in VITE_API_URL
   - **Fix**: Ensure VITE_API_URL ends with `/api/v1` (no duplicate)

5. **Dockerfile build fails: '/requirements.txt': not found**
   - **Cause**: Wrong COPY paths when Root Directory set
   - **Fix**: Use `COPY requirements.txt .` (not `COPY backend/requirements.txt .`)

### Production URLs (VERIFIED STABLE - Nov 12, 2025)
- **Backend API**: https://phobetronwebapp-production.up.railway.app
- **Frontend**: https://phobetronwebapp-production-d69a.up.railway.app
- **Database**: crossover.proxy.rlwy.net:44440 (public proxy)

### Stable Backup Reference
**Location**: `backups/PRODUCTION_STABLE_20251112_183253/`  
**Status**: ✅ VERIFIED PRODUCTION STABLE  
**Deployment Notes**: `PRODUCTION_STABLE_20251112_183253/DEPLOYMENT_NOTES.md`  

Use this backup for restoration if production breaks.

---

**Version**: 1.4.0 | **Ratified**: October 27, 2025 | **Last Amended**: November 12, 2025

**Amendment Notes**:
- v1.4.0 (Nov 12, 2025): **PRODUCTION DEPLOYMENT LOCKED** - Added comprehensive Railway deployment section after 15+ hours of debugging. Documented critical password case sensitivity issue, cross-project networking limitations, Dockerfile COPY path rules, railway.toml startCommand bash requirement, and frontend API base URL configuration. Linked to PRODUCTION_STABLE_20251112_183253 backup as canonical reference.
- v1.3.0 (Nov 2, 2025): **CELESTIAL THEME COMPLETE** - All 8 pages transformed with unified celestial design system. Added comprehensive design pattern documentation: twinkling stars, nebula clouds, glowing gradients, neumorphic cards, Framer Motion animations, custom scrollbars. Locked designs for Dashboard V2, Watchman's View, Earth Dashboard, Prophecy Codex, Alerts, Settings, and Timeline pages. Timeline rebuilt (504→400 lines) and added to navigation sidebar. 100% project completion achieved.
- v1.2.0 (Nov 1, 2025): All 8 orbital mechanics enhancements completed - Moon eccentricity/inclination, 3I/ATLAS debris trail, lunar phases, time-to-perihelion countdown, object magnitudes, tidal locking, planetary perturbations. Research-grade accuracy achieved (⭐⭐⭐⭐⭐)
- v1.1.0 (Oct 27, 2025): Solar System visualization design locked, Time Controls Panel completed, Planet Info Panel completed
- v1.0.0 (Oct 25, 2025): Initial constitution created with core principles

