# Developer Onboarding - Real-Time ISS Visualization

**Purpose:** Get new developers (especially AI agents) 100% effective in 5 minutes.

**Project Type:** Pure frontend JavaScript + Three.js 3D visualization with real-time ISS tracking

---

## 🚀 QUICK START (30 seconds)

```bash
# Clone the repo
git clone <repo-url>
cd real-time-geometric-visualization

# ⚠️ CRITICAL: This project REQUIRES a local server due to ES6 modules and CORS!
# DO NOT open index.html directly - it will fail with CORS errors!

# Run a local server (REQUIRED):
python -m http.server 8000
# Then visit: http://localhost:8000
```

**That's it!** No npm install, no build process, no dependencies to install.

### ⚠️ CRITICAL FOR AI AGENTS: Testing After Making Changes

**EVERY TIME you complete a task that modifies code, you MUST:**

1. **Start the local server** (not optional - direct file:// access will fail):
   ```bash
   cd real-time-geometric-visualization
   python -m http.server 8000
   ```

2. **Open in browser** at `http://localhost:8000` (NOT file://)

3. **Check the browser console** (F12) for errors before marking task complete

4. **Why?** ES6 modules (`import/export`) are blocked by CORS when opened via `file://`
   - Opening `index.html` directly = CORS errors, nothing works
   - Opening via `http://localhost:8000` = Works perfectly

**AI Agent Rule:** Do NOT mark a coding task as complete until you've verified it works on localhost!

---

## 📁 PROJECT STRUCTURE (Memorize This)

```
real-time-geometric-visualization/
│
├── index.html                          # Main entry point - loads everything
├── .env                                # Configuration (time speed, rendering settings)
├── .gitignore                          # Git ignore rules
│
├── README.md                           # Architecture & user documentation
├── DEVELOPER_ONBOARDING.md            # This file - developer quick reference
├── CURRENT_SPRINT.md                  # Active sprint (update task status here)
├── BACKLOG.md                         # Future tasks (90+ items)
├── COMPLETED.md                       # Historical log (record completed work)
│
├── src/
│   ├── main.js                        # Application entry point (loads on startup)
│   │
│   ├── core/                          # Three.js foundation
│   │   ├── scene.js                   # Scene initialization, lights, background
│   │   ├── camera.js                  # Camera setup + OrbitControls
│   │   ├── renderer.js                # WebGL renderer configuration
│   │   └── animation.js               # Main animation loop, delta time, FPS
│   │
│   ├── modules/                       # Domain-specific features
│   │   ├── solarSystem.js             # Orchestrator (manages all celestial objects)
│   │   ├── sun.js                     # Sun rendering + glow effects
│   │   ├── planets.js                 # Planet orbital mechanics (Mercury, Venus, Earth, Mars)
│   │   ├── moon.js                    # Moon orbit around Earth
│   │   ├── iss.js                     # ISS real-time tracking + rendering
│   │   ├── orbits.js                  # Orbital path visualization (toggleable)
│   │   ├── styles.js                  # Visual style system (4 themes: realistic, cartoon, neon, minimalist)
│   │   └── ui.js                      # UI controls, info panel, event handlers
│   │
│   ├── utils/                         # Helper functions
│   │   ├── constants.js               # All physical constants, planet data, scaling factors
│   │   ├── time.js                    # Time acceleration system
│   │   ├── coordinates.js             # Lat/lon/alt → 3D (x,y,z) conversion
│   │   ├── orbital.js                 # Kepler orbital mechanics calculations
│   │   └── api.js                     # ISS API integration (Open Notify)
│   │
│   └── styles/                        # CSS
│       ├── main.css                   # Global styles, resets, canvas
│       └── ui.css                     # UI panels, controls, modals
│
├── assets/                            # Static assets (textures, models)
│   └── textures/                      # Planet textures (if using realistic style)
│
├── docs/                              # Additional documentation
└── logs/                              # Development logs
```

---

## 🎯 COMMON TASKS - WHERE TO EDIT

### Task: Change Time Speed Default
**File:** `src/utils/constants.js`
**Line:** Look for `SIMULATION.DEFAULT_TIME_SPEED`
```javascript
export const SIMULATION = {
    DEFAULT_TIME_SPEED: 500,  // ← Change this
    MIN_TIME_SPEED: 1,
    MAX_TIME_SPEED: 50000
};
```

### Task: Add a New Planet
**Files to edit:**
1. `src/utils/constants.js` - Add planet data to `PLANETS` object
2. `src/modules/planets.js` - Add planet to rendering loop

**Example:**
```javascript
// In constants.js
export const PLANETS = {
    jupiter: {
        name: "Jupiter",
        color: 0xc88b3a,
        radius: 69911,
        orbitRadius: 5.2,  // AU
        orbitPeriod: 4333,  // days
        // ...
    }
};
```

### Task: Change ISS Update Frequency
**File:** `src/utils/constants.js`
**Look for:** `API.UPDATE_INTERVAL`
```javascript
export const API = {
    ISS_URL: 'http://api.open-notify.org/iss-now.json',
    UPDATE_INTERVAL: 5000,  // ← Change this (milliseconds)
};
```

### Task: Modify Camera Starting Position
**File:** `src/utils/constants.js`
**Look for:** `RENDER.DEFAULT_CAMERA_POSITION`
```javascript
DEFAULT_CAMERA_POSITION: { x: 0, y: 50, z: 150 }
```

### Task: Change Planet/ISS Size Scaling
**File:** `src/utils/constants.js`
**Look for:** `SCALE` object
```javascript
export const SCALE = {
    PLANET_SIZE: 1000,    // Planets 1000x actual size
    ISS_SIZE: 50000,      // ISS 50,000x actual size
    // ...
};
```

### Task: Add a New Visual Style
**File:** `src/modules/styles.js`
**Steps:**
1. Add style definition to `src/utils/constants.js` in `STYLES` object
2. Implement style logic in `src/modules/styles.js`
3. Add button in `index.html` (search for "style-buttons")

### Task: Change UI Colors/Styling
**Files:**
- `src/styles/ui.css` - Control panels, buttons, modals
- `src/styles/main.css` - Global styles, loading screen

### Task: Add a New Control to UI
**Files:**
1. `index.html` - Add HTML element in control panel
2. `src/modules/ui.js` - Add event listener and handler
3. `src/styles/ui.css` - Style the control (if needed)

---

## 🔑 KEY FILES REFERENCE

### MUST-READ FILES (Read these first):

1. **`README.md`** (13KB) - Complete architecture, tech stack, data flow, API integration
2. **`CURRENT_SPRINT.md`** - Current work, task status, what's in progress
3. **`src/utils/constants.js`** - All configuration, planet data, scaling factors
4. **`index.html`** - UI structure, see what controls exist

### CONFIGURATION FILES:

- **`.env`** - Simulation settings, rendering config, feature toggles
- **`src/utils/constants.js`** - Physical constants, planet data, visual styles

### DOCUMENTATION FILES:

- **`README.md`** - Architecture, setup, API docs
- **`CURRENT_SPRINT.md`** - Active sprint tasks (9 tasks, 61 subtasks)
- **`BACKLOG.md`** - Future work (90+ tasks across 4 sprints)
- **`COMPLETED.md`** - Historical task log
- **`DEVELOPER_ONBOARDING.md`** - This file

---

## 📊 PROJECT MANAGEMENT SYSTEM

### Sprint Workflow:

1. **Check Active Work:** Read `CURRENT_SPRINT.md`
2. **Find Task Status:** Look for `[PENDING]`, `[IN PROGRESS]`, `[COMPLETED]`
3. **Update Task:** Edit markdown file, change status
4. **When Done:** Move task details to `COMPLETED.md`

### Adding New Tasks:

1. **Small/Immediate:** Add to current sprint in `CURRENT_SPRINT.md`
2. **Future Work:** Add to `BACKLOG.md` under appropriate sprint
3. **Completed:** Always log in `COMPLETED.md` with details

### Task Format Example:
```markdown
### 5. My New Feature [IN PROGRESS 🔄]

**Subtasks:**
- [x] 5.1: Research approach
- [ ] 5.2: Implement core logic
- [ ] 5.3: Add tests

**Priority:** P1 (High)
**Estimated Effort:** 3 hours
**Dependencies:** Task #3
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### Making Changes:

1. **Read the task** in `CURRENT_SPRINT.md`
2. **Find the relevant file** (see structure above)
3. **Make your edit**
4. **Test in browser** (refresh page)
5. **Check console** for errors (F12 → Console)
6. **Update sprint status** in `CURRENT_SPRINT.md`
7. **Commit with clear message**

### Git Commit Format (Follow This):

```bash
# Format: <type>: <description>
#
# Types: feat, fix, docs, refactor, perf, test, chore

# Examples:
git commit -m "feat: add Jupiter to solar system"
git commit -m "fix: ISS position calculation at poles"
git commit -m "docs: update API integration guide"
git commit -m "perf: optimize orbit path rendering"
git commit -m "refactor: extract camera controls to module"
```

### Testing Checklist:

Before marking a task complete:
- [ ] No console errors (F12 → Console)
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Performance acceptable (check FPS counter)
- [ ] UI controls responsive
- [ ] Code is commented
- [ ] Updated CURRENT_SPRINT.md

---

## 🧠 ARCHITECTURE QUICK REFERENCE

### Data Flow:

```
User Interaction (UI) → ui.js → solarSystem.js → Individual Modules → Three.js Scene → Renderer → Canvas

ISS API → api.js → coordinates.js → iss.js → scene → renderer → canvas
  ↓ (every 5 sec)  ↓ (lat/lon)    ↓ (x,y,z)   ↓ (3D obj)
```

### Module Dependencies:

```
main.js
  ├── core/scene.js
  ├── core/camera.js
  ├── core/renderer.js
  ├── core/animation.js
  │     ↓ (calls every frame)
  └── modules/solarSystem.js
        ├── modules/sun.js
        ├── modules/planets.js
        │     └── modules/moon.js
        ├── modules/iss.js
        ├── modules/orbits.js
        └── modules/styles.js
```

### Coordinate Systems:

| System | Unit | Usage |
|--------|------|-------|
| Real World | km, AU | Actual distances |
| Scene | Scene Units | Three.js positions |
| Screen | Pixels | UI overlay |

**Key Conversions:**
- 1 AU = 100 scene units (`SCALE.AU_TO_SCENE`)
- Planet radii × 1000 for visibility (`SCALE.PLANET_SIZE`)
- ISS × 50,000 for visibility (`SCALE.ISS_SIZE`)

### Time Systems:

| Type | Description |
|------|-------------|
| Real Time | Actual clock time (Date.now()) |
| Simulation Time | Accelerated time (real × speed multiplier) |
| Delta Time | Time since last frame (for smooth animation) |

---

## 📦 EXTERNAL DEPENDENCIES

### Via CDN (No Installation Needed):

1. **Three.js r160** - 3D WebGL library
   - Loaded from: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r160/three.min.js`
   - Docs: https://threejs.org/docs/

2. **OrbitControls** - Camera controls
   - Loaded from: `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js`

### External APIs:

1. **Open Notify - ISS Position API**
   - URL: `http://api.open-notify.org/iss-now.json`
   - Rate Limit: None
   - Auth: None required
   - Update Frequency: 5 seconds in our app
   - Response Format: JSON with lat/lon/timestamp

---

## 🎨 VISUAL STYLES SYSTEM

### Available Styles (Switchable in Real-Time):

1. **Realistic** (`realistic`)
   - Photo textures, starfield, atmospheric glow
   - Config: `src/utils/constants.js` → `STYLES.realistic`

2. **Cartoon** (`cartoon`)
   - Flat colors, cel-shading, playful
   - Config: `src/utils/constants.js` → `STYLES.cartoon`

3. **Neon** (`neon`)
   - Glowing trails, dark background, cyberpunk
   - Config: `src/utils/constants.js` → `STYLES.neon`

4. **Minimalist** (`minimalist`)
   - Clean geometric, simple colors
   - Config: `src/utils/constants.js` → `STYLES.minimalist`

### Adding a New Style:

1. **Define style** in `src/utils/constants.js`:
```javascript
export const STYLES = {
    myNewStyle: {
        name: "My Style Name",
        background: 0x123456,
        sunGlow: true,
        // ... other properties
    }
};
```

2. **Implement rendering** in `src/modules/styles.js`

3. **Add UI button** in `index.html` → search for `style-buttons` div

---

## 🐛 DEBUGGING GUIDE

### Common Issues:

**Issue:** Page loads but canvas is black
- **Check:** Browser console (F12) for errors
- **Common cause:** Three.js not loaded, check CDN links in `index.html`

**Issue:** ISS not updating
- **Check:** `src/utils/api.js` - verify API URL is correct
- **Check:** Network tab (F12) - see if API requests are happening
- **Common cause:** CORS issues (use local server, not file://)

**Issue:** Performance is slow (low FPS)
- **Check:** FPS counter in top-right
- **Solutions:**
  - Reduce `RENDER.SPHERE_SEGMENTS` in constants.js
  - Disable effects in .env (`ENABLE_BLOOM=false`)
  - Lower `ORBIT_SEGMENTS`

**Issue:** Objects not visible
- **Check:** Camera position - is it looking at origin?
- **Check:** Object scale - might be too small
- **Check:** Scene lighting - are lights set up?

### Debug Helpers:

Enable debug mode in `.env`:
```bash
DEBUG_MODE=true      # Console logging
SHOW_AXES=true       # Show X/Y/Z axes
SHOW_GRID=true       # Show grid helper
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Target Performance:

| Device | Target FPS | Settings |
|--------|-----------|----------|
| Gaming PC | 60 fps | High quality |
| Modern Laptop | 60 fps | Medium |
| 2015 Laptop | 30-60 fps | Low |
| Mobile | 30 fps | Potato mode |

### Optimization Checklist:

- [ ] Use lower `SPHERE_SEGMENTS` (16-32 instead of 64)
- [ ] Disable shadows (`ENABLE_SHADOWS=false`)
- [ ] Disable bloom effects (`ENABLE_BLOOM=false`)
- [ ] Reduce `ORBIT_SEGMENTS`
- [ ] Cap pixel ratio (`PIXEL_RATIO=1.0` instead of 2.0)
- [ ] Reuse geometry instances
- [ ] Pool materials per style

### Measuring Performance:

1. **FPS Counter** - Visible in top-right of UI
2. **Browser DevTools** - Performance tab (F12)
3. **Three.js Stats** - Can be added via Stats.js library

---

## 📝 CODE STYLE GUIDE

### JavaScript Style:

```javascript
// ✅ GOOD - Clear, documented, modular
/**
 * Calculate orbital position at given time
 * @param {number} time - Simulation time in milliseconds
 * @param {number} period - Orbital period in days
 * @returns {Object} Position {x, y, z}
 */
export function calculateOrbitalPosition(time, period) {
    const angle = (time / daysToMs(period)) * TWO_PI;
    return {
        x: Math.cos(angle) * orbitRadius,
        y: 0,
        z: Math.sin(angle) * orbitRadius
    };
}

// ❌ BAD - Unclear, uncommented, magic numbers
function calcPos(t, p) {
    const a = (t / (p * 86400000)) * 6.283185;
    return { x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r };
}
```

### Rules:

1. **Use JSDoc comments** for all functions
2. **Descriptive variable names** - `orbitRadius` not `r`
3. **Extract magic numbers** to constants
4. **Single responsibility** - one function, one purpose
5. **ES6+ features** - use `const`, `let`, arrow functions, modules
6. **No console.log in production** - remove or use DEBUG_MODE flag

---

## 🎓 LEARNING RESOURCES

### Essential Reading:

1. **Three.js Docs** - https://threejs.org/docs/
2. **Open Notify API** - http://open-notify.org/Open-Notify-API/
3. **WebGL Fundamentals** - https://webglfundamentals.org/

### Astronomical References:

- **NASA JPL Horizons** - https://ssd.jpl.nasa.gov/horizons/
- **USGS Planetary Fact Sheets** - https://nssdc.gsfc.nasa.gov/planetary/factsheet/

### Inspiration:

- **Solar System Scope** - https://www.solarsystemscope.com/
- **NASA Eyes on the Solar System** - https://eyes.nasa.gov/

---

## 🤖 AI AGENT SPECIFIC NOTES

### When Assigned a Task:

1. **Read `CURRENT_SPRINT.md`** first - understand current state
2. **Check dependencies** - are prerequisite tasks done?
3. **Locate the files** - use structure above to find relevant code
4. **Make focused changes** - don't refactor unrelated code
5. **Test immediately** - don't batch changes without testing
6. **Update documentation** - keep sprint file current
7. **Commit with clear message** - follow conventional commits

### File Reading Priority:

**For any new task, read in this order:**
1. `CURRENT_SPRINT.md` - Task definition and status
2. `README.md` - Architecture context
3. `src/utils/constants.js` - Configuration and data
4. Relevant module file based on task

### Making Edits:

- **Always preserve existing structure** - don't reformat entire files
- **Match existing code style** - follow patterns you see
- **Add comments** - especially for complex calculations
- **Don't over-engineer** - simplicity > cleverness
- **Performance matters** - this runs in browser, keep it fast

### When Stuck:

1. Check browser console for errors
2. Read the relevant module's code comments
3. Check `README.md` architecture section
4. Verify constants in `constants.js` are correct
5. Test in isolation - simplify to find the issue

---

## 📋 QUICK COMMAND REFERENCE

```bash
# Start development
python -m http.server 8000          # Start local server
open http://localhost:8000          # Open in browser

# Git workflow
git status                          # Check what's changed
git add .                           # Stage all changes
git commit -m "feat: description"   # Commit with message
git push                            # Push to GitHub

# View project stats
find . -name "*.js" | xargs wc -l   # Count lines of JavaScript
git log --oneline                   # View commit history
git diff                            # See uncommitted changes

# Debug
cat src/utils/constants.js          # View constants
grep -r "function_name" src/        # Find function in codebase
```

---

## ✅ ONBOARDING CHECKLIST

Before starting work, verify:

- [ ] Read this entire document
- [ ] Read `README.md` architecture section
- [ ] Read `CURRENT_SPRINT.md` to understand current state
- [ ] Understand file structure (memorize key directories)
- [ ] Know where constants are (`src/utils/constants.js`)
- [ ] Know where to update tasks (`CURRENT_SPRINT.md`)
- [ ] Can open project in browser successfully
- [ ] Can see solar system rendering (even if incomplete)
- [ ] Understand git workflow (add, commit, push)
- [ ] Know how to check console for errors (F12)

---

## 🎯 SUMMARY - TL;DR

**Project:** Real-time ISS tracking + 3D solar system (Three.js + Vanilla JS)

**Files:** 24 total (11 done, 17 remaining)

**Key Files:**
- `src/utils/constants.js` - All config/data
- `CURRENT_SPRINT.md` - Current work
- `index.html` - Entry point
- `README.md` - Architecture

**To Start Work:**
1. Read `CURRENT_SPRINT.md`
2. Find relevant file in structure above
3. Make edit
4. Test in browser
5. Update sprint file
6. Commit

**Common Edits:**
- Planet data: `src/utils/constants.js` → `PLANETS`
- Time speed: `src/utils/constants.js` → `SIMULATION`
- Camera: `src/utils/constants.js` → `RENDER`
- Styling: `src/styles/*.css`

**Git:**
```bash
git add .
git commit -m "type: description"
git push
```

**Need Help?** Check browser console (F12) for errors first.

---

**Last Updated:** 2025-11-10
**Version:** 1.0.0
**Status:** Sprint 1 - Foundation Complete (18%)
