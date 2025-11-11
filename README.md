# Real-Time Geometric Visualization

An elite, world-class solar system visualization powered by real-time ISS (International Space Station) tracking. Watch the ISS orbit Earth in real-time while exploring an accurate, beautiful, and highly performant 3D solar system.

**Performance:** Runs smoothly on low-end hardware (potato-proof)
**Visual Styles:** 4 switchable themes (Realistic, Cartoon, Neon, Minimalist)
**Interactivity:** Full camera controls, click-to-focus, variable time speed
**Data Source:** Live ISS tracking via Open Notify API

---

## Features

### Core Visualization
- ☀️ **The Sun** - Glowing center with corona effects
- 🪐 **Inner Planets** - Mercury, Venus, Earth (with Moon), Mars with accurate orbital mechanics
- 🛰️ **Real-Time ISS** - Live position tracking updated every 5 seconds
- 🌍 **Earth-Moon System** - Accurate orbital dynamics
- ⏰ **Variable Time Speed** - Adjust from 1x to 50,000x with slider control

### Visual Styles (Switchable)
1. **Realistic** - Photo textures, starfield, atmospheric glow
2. **Stylized/Cartoon** - Flat colors, cel-shaded, playful vibe
3. **Neon/Cyberpunk** - Glowing orbital trails, neon outlines, particles
4. **Minimalist/Abstract** - Clean geometric shapes, elegant lines

### Interactivity
- 🖱️ **Camera Controls** - Orbit, zoom, pan with mouse/touch
- 🎯 **Click-to-Focus** - Click any planet or ISS to focus camera
- 📊 **Info Panel** - Real-time ISS data (altitude, velocity, position)
- 🎛️ **Feature Toggles** - Show/hide orbital paths, labels, trails

### Performance
- 🚀 **60fps target** on modern laptops
- 💻 **Potato-proof** optimizations for low-end systems
- 📱 **Mobile-friendly** with touch controls

---

## Quick Start

### Option 1: Direct Browser (No Server Required)
1. Open `index.html` in any modern browser
2. That's it! The visualization runs entirely client-side

### Option 2: Local Server (Recommended for Development)
```bash
# Python 3
python -m http.server 8000

# Or with Node.js
npx http-server

# Then open: http://localhost:8000
```

---

## Project Structure

```
real-time-geometric-visualization/
│
├── index.html                 # Main entry point
├── README.md                  # This file
├── CURRENT_SPRINT.md          # Active sprint tasks
├── BACKLOG.md                 # Full product backlog
├── COMPLETED.md               # Historical task log
├── .env                       # Configuration (API keys if needed)
├── .gitignore                 # Git ignore rules
│
├── src/
│   ├── core/
│   │   ├── scene.js          # Three.js scene setup
│   │   ├── camera.js         # Camera configuration and controls
│   │   ├── renderer.js       # WebGL renderer setup
│   │   └── animation.js      # Main animation loop
│   │
│   ├── modules/
│   │   ├── solarSystem.js    # Solar system orchestrator
│   │   ├── sun.js            # Sun rendering and effects
│   │   ├── planets.js        # Planet data and rendering
│   │   ├── earth.js          # Earth-specific features
│   │   ├── moon.js           # Moon orbital mechanics
│   │   ├── iss.js            # ISS tracking and rendering
│   │   ├── orbits.js         # Orbital path visualization
│   │   ├── ui.js             # UI controls and info panel
│   │   └── styles.js         # Visual style system
│   │
│   ├── utils/
│   │   ├── api.js            # ISS API integration
│   │   ├── coordinates.js    # Lat/lon to 3D conversion
│   │   ├── orbital.js        # Orbital mechanics calculations
│   │   ├── time.js           # Time acceleration system
│   │   └── constants.js      # Physical constants and scaling
│   │
│   └── styles/
│       ├── main.css          # Global styles
│       └── ui.css            # UI overlay styles
│
├── assets/
│   └── textures/             # Planet textures (if using realistic style)
│
├── docs/
│   ├── ARCHITECTURE.md       # System architecture details
│   ├── API.md                # ISS API documentation
│   └── ORBITAL_MECHANICS.md  # Physics and math explanations
│
└── logs/
    └── development.log       # Development notes and debug logs
```

---

## Architecture

### Technology Stack
- **Three.js** (r160+) - 3D WebGL rendering engine
- **Vanilla JavaScript** - No frameworks, pure ES6+ modules
- **HTML5 Canvas** - UI overlays and info panels
- **Open Notify API** - Real-time ISS position data (free, no auth)

### Core Systems

#### 1. Scene Management (`src/core/`)
The foundation of the visualization - sets up Three.js scene, camera, renderer, and animation loop.

**Key Components:**
- `scene.js` - Creates and manages the Three.js scene
- `camera.js` - Perspective camera with orbital controls
- `renderer.js` - WebGL renderer with anti-aliasing
- `animation.js` - Main render loop with delta time

#### 2. Solar System Modules (`src/modules/`)
Domain-specific modules for celestial objects and features.

**Hierarchy:**
```
SolarSystem (orchestrator)
  ├── Sun (stationary, glowing)
  ├── Planets (Mercury, Venus, Earth, Mars)
  │   └── Earth (special case)
  │       └── Moon (sub-orbit)
  └── ISS (real-time tracking)
```

#### 3. Utilities (`src/utils/`)
Reusable helper functions and calculations.

**Key Utilities:**
- `api.js` - Fetches ISS position every 5 seconds
- `coordinates.js` - Converts lat/lon/altitude → 3D (x,y,z)
- `orbital.js` - Calculates planetary positions using Kepler's laws
- `time.js` - Manages simulation time and speed multiplier

### Data Flow

```
ISS API → coordinates.js → iss.js → scene.js → renderer.js → Canvas
             ↑                ↑         ↑          ↑
         (lat/lon)       (3D pos)   (update)   (draw)
```

### Coordinate Systems

#### Real World
- **Latitude/Longitude:** ISS position from API (-90° to 90°, -180° to 180°)
- **Altitude:** Meters above sea level (~400,000m for ISS)

#### 3D Scene
- **Units:** Scaled AU (Astronomical Units) for orbits
- **Origin:** Sun at (0, 0, 0)
- **Scale Factors:**
  - Orbital distances: 1 AU = 100 units in-scene
  - Planet radii: Enlarged 1000x for visibility
  - ISS: Enlarged 10,000x for visibility
  - Moon orbit: Accurate relative to Earth size

### Time Simulation
- **Real Time:** Actual seconds elapsed
- **Simulation Time:** Accelerated time (controlled by speed multiplier)
- **Default Speed:** 500x (Earth completes orbit in ~30 minutes)
- **Range:** 1x to 50,000x (user adjustable)

---

## Configuration

### Environment Variables (`.env`)
```bash
# ISS API Configuration
ISS_API_URL=http://api.open-notify.org/iss-now.json
ISS_UPDATE_INTERVAL=5000  # milliseconds

# Rendering Configuration
TARGET_FPS=60
ANTI_ALIASING=true
PIXEL_RATIO=1.0  # Use 2.0 for retina displays

# Simulation Settings
DEFAULT_TIME_SPEED=500  # 500x real-time
MAX_TIME_SPEED=50000

# Performance
ENABLE_SHADOWS=false     # Disable for better performance
ENABLE_BLOOM=true        # Glow effects (disable on potato mode)
ORBIT_SEGMENTS=64        # Higher = smoother orbits (32 for potato)
```

### Constants (`src/utils/constants.js`)
Physical and astronomical constants used throughout the project.

```javascript
export const ASTRONOMICAL_UNIT = 149597870.7; // km
export const EARTH_RADIUS = 6371; // km
export const ISS_ORBIT_ALTITUDE = 408; // km (average)
export const MOON_ORBIT_RADIUS = 384400; // km
export const EARTH_ORBITAL_PERIOD = 365.25; // days
// ... etc
```

---

## API Integration

### ISS Position API (Open Notify)

**Endpoint:** `http://api.open-notify.org/iss-now.json`
**Rate Limit:** None (public, no authentication)
**Update Frequency:** 5 seconds in our app

**Response Format:**
```json
{
  "message": "success",
  "timestamp": 1638360000,
  "iss_position": {
    "latitude": "12.3456",
    "longitude": "-78.9012"
  }
}
```

**Error Handling:**
- Connection timeout: Use last known position
- Invalid response: Log error, retry after 10 seconds
- Rate limiting: Back off exponentially

---

## Visual Styles System

The visualization supports 4 distinct visual styles, switchable in real-time.

### 1. Realistic
- Photo-realistic planet textures
- Starfield background
- Atmospheric glow with Fresnel shader
- Lens flare on the sun
- Accurate planet colors

### 2. Stylized/Cartoon
- Flat, vibrant colors
- Cel-shading (toon shader)
- Thick black outlines
- Simple background gradient
- Playful, animated feel

### 3. Neon/Cyberpunk
- Dark space with grid floor
- Glowing neon orbital trails
- Bloom post-processing
- Particle effects
- Electric blue/pink color palette

### 4. Minimalist/Abstract
- Simple geometric spheres
- Clean white/gray colors
- Thin orbital lines
- Subtle gradients
- Mathematical aesthetic

**Implementation:** Each style is a different material configuration applied to the same geometry for maximum performance.

---

## Performance Optimization

### Strategies Employed
1. **Geometry Reuse** - All planets use the same SphereGeometry instance
2. **Material Pooling** - Shared materials per visual style
3. **Frustum Culling** - Auto-enabled by Three.js
4. **LOD (Future)** - Level of detail for distant objects
5. **Conditional Effects** - Expensive effects only in high-quality mode
6. **Efficient Updates** - Only update ISS position every 5 seconds
7. **RequestAnimationFrame** - Synced with monitor refresh rate

### Target Performance
| Device Type | Target FPS | Settings |
|-------------|-----------|----------|
| Gaming PC | 60 fps | High quality, all effects |
| Modern Laptop | 60 fps | Medium quality |
| 2015 Laptop | 30-60 fps | Low quality, minimal effects |
| Mobile | 30 fps | Potato mode |

---

## Development Workflow

### Adding a New Feature
1. Add task to `BACKLOG.md`
2. During sprint planning, move to `CURRENT_SPRINT.md`
3. Create feature branch: `git checkout -b feature/feature-name`
4. Implement with clear commits
5. Test on multiple devices/browsers
6. Update documentation
7. Move task to `COMPLETED.md` with details
8. Merge to main

### Code Style
- **ES6+ Modules** - Use import/export
- **JSDoc Comments** - Document all functions
- **Descriptive Names** - `calculateOrbitalPosition()` not `calcPos()`
- **Single Responsibility** - Each module does one thing well
- **Constants** - Extract magic numbers to `constants.js`

### Git Commit Messages
Follow conventional commits:
```
feat: add neon visual style with bloom effects
fix: ISS position calculation at poles
docs: update API integration guide
perf: optimize planetary orbit calculations
refactor: extract camera controls to separate module
```

---

## Testing

### Manual Testing Checklist
- [ ] Opens in Chrome without errors
- [ ] Opens in Firefox without errors
- [ ] Opens in Safari without errors
- [ ] ISS updates every 5 seconds
- [ ] All 4 visual styles work
- [ ] Time speed slider functions correctly
- [ ] Camera controls respond smoothly
- [ ] Click-to-focus works on all objects
- [ ] Info panel displays correct data
- [ ] No memory leaks after 30 minutes
- [ ] Mobile touch controls work
- [ ] Runs at 30+ fps on target devices

### Automated Testing (Future)
- Unit tests for coordinate conversion
- API mock for ISS position tests
- Visual regression tests for styles

---

## Known Issues & Limitations

### Current Limitations
- Orbital eccentricity not yet implemented (all orbits are circles)
- Planet axial tilt not shown
- No physics simulation (pre-calculated orbits)
- ISS altitude variation not visible at default zoom

### Future Enhancements
See `BACKLOG.md` for full list. Highlights:
- Add outer planets (Jupiter, Saturn, etc.)
- Implement eclipses (solar and lunar)
- Add other satellites (Hubble, Starlink)
- VR support (WebXR)
- Export as video/GIF

---

## Resources & References

### Documentation
- [Three.js Docs](https://threejs.org/docs/)
- [Open Notify API](http://open-notify.org/Open-Notify-API/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

### Astronomical Data
- [NASA JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) - Orbital elements
- [Heavens-Above](https://www.heavens-above.com/) - ISS tracking
- [USGS Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)

### Inspiration
- [Solar System Scope](https://www.solarsystemscope.com/)
- [Eyes on the Solar System (NASA)](https://eyes.nasa.gov/)
- [Where is ISS?](https://wheretheiss.at/)

---

## Contributing

This is a personal project, but ideas and feedback are welcome!

### How to Contribute
1. Review the `BACKLOG.md` for ideas
2. Open an issue to discuss your idea
3. Fork the repository
4. Create a feature branch
5. Submit a pull request with clear description

---

## License

MIT License - Feel free to use, modify, and share.

---

## Credits

**Created by:** [Your Name]
**Powered by:** Three.js, Open Notify API
**Inspired by:** The beauty of space and the ISS crew

---

## Contact & Support

- **Issues:** Use GitHub Issues for bug reports
- **Questions:** Open a discussion thread
- **Updates:** Watch this repo for new features

---

**Last Updated:** 2025-11-10
**Version:** 0.1.0-alpha (Sprint 1 in progress)
