# Sprint 7 - Planet & Moon Texture Alignment + Accurate Axial Rotation

**Sprint Goal:** Achieve maximum astronomical accuracy for all celestial bodies through proper texture alignment, accurate axial rotation, and realistic axial tilt implementation.

**Sprint Duration:** 2-3 weeks
**Status:** 🔄 PLANNING
**Created:** 2025-01-15
**Priority:** P0 (User Requested)

---

## 🎯 Sprint Objectives

1. ✅ Source high-quality, accurate planet/moon textures from NASA/JPL
2. ✅ Implement proper texture coordinate mapping with correct alignment
3. ✅ Add accurate axial rotation for all planets and moons
4. ✅ Implement proper axial tilt for all celestial bodies
5. ✅ Ensure texture features (e.g., Great Red Spot, Earth continents) are correctly positioned
6. ✅ Validate accuracy against real astronomical data

---

## 📊 Current State Analysis

### Existing Implementation:
- ✅ 8 planets rendered (Mercury → Neptune)
- ✅ Earth's Moon rendered
- ✅ Saturn's rings implemented
- ✅ Basic materials (colors only, no textures in realistic mode)
- ✅ Orbital rotation (planets orbit Sun correctly)
- ❌ No axial rotation (planets don't spin on axis)
- ❌ No axial tilt (all planets upright)
- ❌ No planet textures (solid colors only)

### Files to Modify:
- `src/modules/planets.js` - Add texture loading, axial rotation, axial tilt
- `src/modules/moon.js` - Add Moon texture, rotation, tidal locking validation
- `src/utils/constants.js` - Add rotation periods, axial tilts, texture URLs
- `src/modules/styles.js` - Update realistic style to use textures
- `assets/textures/` - New directory for planet texture maps

---

## 🗺️ Task Breakdown & Order of Operations

### PHASE 1: Research & Data Collection [Priority: P0]
*Gather accurate astronomical data before implementation*

#### Task 1.1: Research Accurate Astronomical Data ⭐ START HERE
**Effort:** 1 hour
**Priority:** P0 (Critical - Foundation for all other tasks)

**Subtasks:**
- [ ] 1.1.1: Research axial rotation periods for all 8 planets + Moon
  - Mercury: 58.646 days
  - Venus: 243.025 days (retrograde!)
  - Earth: 23.9345 hours
  - Mars: 24.6229 hours
  - Jupiter: 9.9259 hours
  - Saturn: 10.656 hours
  - Uranus: 17.24 hours (retrograde!)
  - Neptune: 16.11 hours
  - Moon: 27.322 days (tidally locked to Earth)

- [ ] 1.1.2: Research axial tilt angles (obliquity) for all planets
  - Mercury: 0.034°
  - Venus: 177.4° (nearly upside down!)
  - Earth: 23.44°
  - Mars: 25.19°
  - Jupiter: 3.13°
  - Saturn: 26.73°
  - Uranus: 97.77° (rotates on its side!)
  - Neptune: 28.32°
  - Moon: 6.68° (relative to ecliptic)

- [ ] 1.1.3: Document texture alignment requirements
  - Prime meridian (0° longitude) orientation
  - Equator alignment
  - Notable features for validation (Great Red Spot, Earth continents, etc.)
  - Texture seam locations

- [ ] 1.1.4: Create reference document with all data
  - Create `docs/ASTRONOMICAL_ACCURACY.md`
  - Include all rotation periods, axial tilts, texture requirements
  - Add validation criteria for each planet

**Output:** `docs/ASTRONOMICAL_ACCURACY.md` with all reference data

---

#### Task 1.2: Source High-Quality Planet Textures ⭐
**Effort:** 2 hours
**Priority:** P0 (Critical)
**Dependencies:** Task 1.1

**Subtasks:**
- [ ] 1.2.1: Identify texture sources (NASA, JPL, Solar System Scope, etc.)
  - NASA Visible Earth (Earth textures)
  - USGS Astrogeology (planetary textures)
  - Solar System Scope (creative commons textures)
  - JPL Photojournal (high-res imagery)

- [ ] 1.2.2: Download base color maps for all planets (2K or 4K resolution)
  - Mercury: Color map (gray, cratered surface)
  - Venus: Cloud-top map (yellowish clouds)
  - Earth: Blue marble map (clouds + land + ocean)
  - Mars: Surface map (rusty red, polar caps)
  - Jupiter: Cloud bands with Great Red Spot
  - Saturn: Cloud bands (muted colors)
  - Uranus: Cyan/blue-green atmosphere
  - Neptune: Deep blue atmosphere
  - Moon: Lunar surface (gray, maria visible)

- [ ] 1.2.3: Download optional enhancement maps (normal, specular, emissive)
  - Earth: Night lights map (emissive), specular map (ocean reflections)
  - Moon: Normal map (surface detail)
  - Consider deferring to later sprint if base maps work well

- [ ] 1.2.4: Optimize texture file sizes
  - Target: 512KB - 2MB per texture (balance quality vs load time)
  - Format: JPG for color maps (compression), PNG for alpha/normal maps
  - Use image compression tools (TinyPNG, ImageOptim)

- [ ] 1.2.5: Organize textures in directory structure
  - Create `/assets/textures/planets/` directory
  - Create `/assets/textures/moons/` directory
  - Naming convention: `{body}_color.jpg`, `{body}_normal.png`, etc.

**Output:** `/assets/textures/` directory with all planet/moon textures

---

### PHASE 2: Texture Implementation [Priority: P0]
*Implement texture loading and proper mapping*

#### Task 2.1: Set Up Texture Loading System
**Effort:** 1.5 hours
**Priority:** P0
**Dependencies:** Task 1.2

**Subtasks:**
- [ ] 2.1.1: Create texture loader utility module
  - File: `src/utils/textureLoader.js`
  - Implement async texture loading with Three.js TextureLoader
  - Add loading progress tracking
  - Add error handling for missing textures
  - Add texture caching to avoid reloading

- [ ] 2.1.2: Update constants.js with texture paths
  - Add TEXTURE_PATHS object with URLs for all textures
  - Add TEXTURE_SETTINGS (anisotropy, wrap modes, etc.)

- [ ] 2.1.3: Integrate texture loader into main.js
  - Preload all textures during loading screen
  - Update loading screen progress bar
  - Handle texture load failures gracefully

- [ ] 2.1.4: Test texture loading system
  - Verify all textures load correctly
  - Test with missing textures (fallback to solid color)
  - Check console for errors

**Output:** `src/utils/textureLoader.js` + updated `constants.js` + `main.js`

---

#### Task 2.2: Apply Textures to Planets with Correct Alignment
**Effort:** 2 hours
**Priority:** P0
**Dependencies:** Task 2.1

**Subtasks:**
- [ ] 2.2.1: Update planets.js to use textures in realistic mode
  - Modify `getMaterialConfig()` in styles.js for realistic style
  - Apply loaded textures to MeshStandardMaterial
  - Set proper texture wrapping (RepeatWrapping vs ClampToEdgeWrapping)

- [ ] 2.2.2: Align texture coordinates for accurate 0° longitude
  - Research prime meridian for each planet
  - Apply texture rotation offset if needed (material.map.rotation)
  - Validate alignment against reference images

- [ ] 2.2.3: Verify equator alignment
  - Ensure textures aren't flipped or rotated incorrectly
  - Check UV mapping on sphere geometry
  - Validate with Earth continents as reference

- [ ] 2.2.4: Test Great Red Spot alignment (Jupiter)
  - Position should be at correct longitude (~160° System II)
  - Validate size and appearance

- [ ] 2.2.5: Test Earth continent positions
  - Prime meridian (0°) through Greenwich, London
  - Validate continents are recognizable and correctly positioned

- [ ] 2.2.6: Test Moon maria (dark patches) alignment
  - "Man in the Moon" face should be visible from Earth
  - Validate tidal locking maintains correct orientation

**Output:** Updated `planets.js`, `moon.js`, `styles.js` with textured materials

---

#### Task 2.3: Implement Texture Enhancement Maps (Optional)
**Effort:** 1.5 hours
**Priority:** P2 (Nice to have)
**Dependencies:** Task 2.2

**Subtasks:**
- [ ] 2.3.1: Add normal maps for surface detail
  - Moon: Crater details
  - Earth: Terrain bump mapping

- [ ] 2.3.2: Add specular maps for reflectivity
  - Earth: Ocean specular highlights (water shines, land doesn't)

- [ ] 2.3.3: Add emissive maps
  - Earth: Night-side city lights

- [ ] 2.3.4: Test performance impact
  - Ensure FPS doesn't drop significantly
  - Consider making enhancement maps toggleable

**Output:** Enhanced realistic visual style (optional)

---

### PHASE 3: Axial Rotation Implementation [Priority: P0]
*Make planets spin on their axes accurately*

#### Task 3.1: Add Rotation Data to Constants
**Effort:** 0.5 hours
**Priority:** P0
**Dependencies:** Task 1.1

**Subtasks:**
- [ ] 3.1.1: Add rotation period constants to constants.js
  - ROTATION_PERIODS object with periods in hours
  - Include retrograde flags for Venus and Uranus

- [ ] 3.1.2: Calculate rotation speeds
  - Convert rotation periods to radians/second
  - Account for simulation time multiplier
  - Store as ROTATION_SPEEDS object

**Output:** Updated `constants.js` with rotation data

---

#### Task 3.2: Implement Axial Rotation in planets.js
**Effort:** 2 hours
**Priority:** P0
**Dependencies:** Task 3.1

**Subtasks:**
- [ ] 3.2.1: Add rotation state tracking
  - Track current rotation angle for each planet
  - Update in animation loop based on deltaTime

- [ ] 3.2.2: Apply rotation to planet meshes
  - Update mesh.rotation.y each frame
  - Account for time multiplier (faster simulation = faster spin)

- [ ] 3.2.3: Implement retrograde rotation
  - Venus: Rotate opposite direction (negative speed)
  - Uranus: Rotate opposite direction

- [ ] 3.2.4: Optimize rotation updates
  - Only update visible planets (frustum culling)
  - Use modulo to prevent angle overflow

- [ ] 3.2.5: Test rotation at different time speeds
  - 1x speed: Earth should complete rotation in ~24 hours
  - 1000x speed: Visible rotation
  - 100,000x speed: Fast spinning

**Output:** Updated `planets.js` with axial rotation

---

#### Task 3.3: Implement Moon Tidal Locking Validation
**Effort:** 1 hour
**Priority:** P1
**Dependencies:** Task 3.2

**Subtasks:**
- [ ] 3.3.1: Verify Moon rotation = orbital period
  - Moon should rotate once per orbit (27.322 days)
  - Same face always toward Earth

- [ ] 3.3.2: Calculate correct rotation based on orbital position
  - Rotation angle = orbital angle
  - Update moon.js rotation logic

- [ ] 3.3.3: Test tidal locking
  - View from Earth: Same Moon face visible
  - View from side: Moon rotates as it orbits

**Output:** Updated `moon.js` with validated tidal locking

---

### PHASE 4: Axial Tilt Implementation [Priority: P0]
*Add realistic axial tilt to all planets*

#### Task 4.1: Research Three.js Rotation Conventions
**Effort:** 0.5 hours
**Priority:** P0
**Dependencies:** None

**Subtasks:**
- [ ] 4.1.1: Understand Euler angles in Three.js
  - Order of rotations (XYZ, ZXY, etc.)
  - How to apply axial tilt vs rotation

- [ ] 4.1.2: Determine tilt implementation strategy
  - Option A: Rotate mesh on X-axis before Y-axis rotation
  - Option B: Use quaternions for combined rotation
  - Choose based on simplicity and accuracy

**Output:** Documentation of rotation strategy

---

#### Task 4.2: Implement Axial Tilt in Constants and Planets
**Effort:** 2 hours
**Priority:** P0
**Dependencies:** Task 4.1, Task 1.1

**Subtasks:**
- [ ] 4.2.1: Add axial tilt data to constants.js
  - AXIAL_TILTS object with angles in degrees
  - Convert to radians for Three.js

- [ ] 4.2.2: Apply axial tilt to planet meshes at creation
  - Set mesh.rotation.x or mesh.rotation.z (depending on convention)
  - Apply tilt before starting rotation animation

- [ ] 4.2.3: Handle special cases
  - Venus: 177.4° tilt (nearly upside down)
  - Uranus: 97.77° tilt (rotates on its side!)

- [ ] 4.2.4: Update rotation logic to work with tilted axes
  - Ensure rotation happens around tilted axis
  - May need to use mesh.rotateOnWorldAxis() or local axis rotation

- [ ] 4.2.5: Test axial tilt visibility
  - Earth: 23.44° tilt should be visible (seasons!)
  - Uranus: Should appear to roll on its side
  - Saturn: Rings should align with axial tilt

**Output:** Updated `planets.js` with axial tilt

---

#### Task 4.3: Validate Saturn Ring Alignment with Axial Tilt
**Effort:** 1 hour
**Priority:** P1
**Dependencies:** Task 4.2

**Subtasks:**
- [ ] 4.3.1: Ensure rings are perpendicular to Saturn's rotation axis
  - Rings should tilt with planet (26.73°)

- [ ] 4.3.2: Test ring appearance from different angles
  - View from above: Rings visible as circles
  - View from side: Rings appear as thin lines

- [ ] 4.3.3: Adjust ring orientation if needed
  - May need to parent rings to planet mesh

**Output:** Validated Saturn ring alignment

---

### PHASE 5: Testing & Validation [Priority: P1]
*Ensure astronomical accuracy and performance*

#### Task 5.1: Create Validation Test Suite
**Effort:** 2 hours
**Priority:** P1
**Dependencies:** All Phase 3 & 4 tasks

**Subtasks:**
- [ ] 5.1.1: Create test HTML page for rotation validation
  - File: `test-rotation-accuracy.html`
  - Display rotation periods in real-time
  - Show axial tilt angles
  - Compare against reference data

- [ ] 5.1.2: Test texture alignment for each planet
  - Screenshot each planet
  - Compare against reference images
  - Validate notable features (Great Red Spot, continents, etc.)

- [ ] 5.1.3: Test rotation accuracy
  - Earth: 1 rotation = ~24 hours simulation time
  - Jupiter: 1 rotation = ~10 hours simulation time
  - Validate at 1x, 100x, 10,000x time speeds

- [ ] 5.1.4: Test axial tilt accuracy
  - Measure tilt angles visually
  - Validate Uranus appears on its side
  - Validate Earth's tilt is visible

**Output:** `test-rotation-accuracy.html` + validation report

---

#### Task 5.2: Performance Testing with Textures
**Effort:** 1.5 hours
**Priority:** P1
**Dependencies:** Task 5.1

**Subtasks:**
- [ ] 5.2.1: Test FPS with all textures loaded
  - Quality preset: Should maintain 45+ FPS
  - Performance preset: Should maintain 60 FPS

- [ ] 5.2.2: Test texture memory usage
  - Monitor DevTools memory panel
  - Ensure no memory leaks during long sessions

- [ ] 5.2.3: Test texture loading time
  - Measure time to load all textures
  - Should be < 5 seconds on decent connection

- [ ] 5.2.4: Optimize if needed
  - Reduce texture resolutions if FPS drops
  - Implement texture LOD (high-res when close, low-res when far)

**Output:** Performance validation report

---

#### Task 5.3: Cross-Browser & Device Testing
**Effort:** 1 hour
**Priority:** P1
**Dependencies:** Task 5.2

**Subtasks:**
- [ ] 5.3.1: Test in Chrome (primary browser)
- [ ] 5.3.2: Test in Firefox
- [ ] 5.3.3: Test in Safari (if available)
- [ ] 5.3.4: Test on mobile device (touch controls, performance)
- [ ] 5.3.5: Document any browser-specific issues

**Output:** Browser compatibility report

---

### PHASE 6: Documentation & Polish [Priority: P2]
*Document changes and update user-facing information*

#### Task 6.1: Update Documentation
**Effort:** 1 hour
**Priority:** P2
**Dependencies:** All previous tasks

**Subtasks:**
- [ ] 6.1.1: Update README.md with new features
  - Mention realistic planet textures
  - Document axial rotation feature
  - Note accuracy improvements

- [ ] 6.1.2: Update COMPLETED.md with all sprint tasks
  - Log all completed tasks
  - Include performance notes
  - Document any issues encountered

- [ ] 6.1.3: Create `docs/ASTRONOMICAL_ACCURACY.md`
  - Document all rotation periods
  - Document all axial tilts
  - Include validation methodology
  - Add references to data sources (NASA, JPL, etc.)

- [ ] 6.1.4: Update `docs/ARCHITECTURE.md`
  - Document texture loading system
  - Explain rotation and tilt implementation
  - Add diagrams if helpful

**Output:** Updated documentation

---

#### Task 6.2: UI Enhancements for New Features
**Effort:** 1.5 hours
**Priority:** P2
**Dependencies:** Task 6.1

**Subtasks:**
- [ ] 6.2.1: Add rotation speed display to info panel
  - Show current rotation speed for selected planet
  - Display rotation period

- [ ] 6.2.2: Add axial tilt display to info panel
  - Show tilt angle for selected planet

- [ ] 6.2.3: Add texture quality toggle (optional)
  - Allow switching between textured and solid color modes
  - Useful for performance comparison

- [ ] 6.2.4: Update help modal
  - Explain rotation and tilt features
  - Add keyboard shortcuts if any

**Output:** Enhanced UI with rotation/tilt information

---

## 📈 Sprint Metrics

### Task Summary:
- **Total Tasks:** 21 tasks
- **Total Subtasks:** ~90 subtasks
- **Estimated Effort:** 22-28 hours
- **Priority Breakdown:**
  - P0 (Critical): 15 tasks
  - P1 (High): 5 tasks
  - P2 (Medium): 2 tasks

### Phase Breakdown:
1. **Phase 1 (Research):** 3 hours | 2 tasks
2. **Phase 2 (Textures):** 5 hours | 3 tasks
3. **Phase 3 (Rotation):** 3.5 hours | 3 tasks
4. **Phase 4 (Axial Tilt):** 3.5 hours | 3 tasks
5. **Phase 5 (Testing):** 4.5 hours | 3 tasks
6. **Phase 6 (Documentation):** 2.5 hours | 2 tasks

### Files to Create:
- `/assets/textures/planets/` directory (9 textures)
- `/assets/textures/moons/` directory (1 texture)
- `src/utils/textureLoader.js`
- `docs/ASTRONOMICAL_ACCURACY.md`
- `test-rotation-accuracy.html`

### Files to Modify:
- `src/utils/constants.js` (add rotation periods, axial tilts, texture paths)
- `src/modules/planets.js` (textures, rotation, tilt)
- `src/modules/moon.js` (texture, tidal locking)
- `src/modules/styles.js` (realistic mode textures)
- `src/main.js` (texture preloading)
- `README.md`, `COMPLETED.md`, `docs/ARCHITECTURE.md`

---

## 🎯 Success Criteria

Sprint 7 is considered complete when:

1. ✅ All 8 planets have high-quality, accurately aligned textures
2. ✅ Earth's Moon has accurate texture
3. ✅ All planets rotate on their axes at correct speeds
4. ✅ Retrograde rotation works correctly (Venus, Uranus)
5. ✅ All planets have correct axial tilt angles
6. ✅ Uranus visibly rotates on its side (97.77° tilt)
7. ✅ Earth's 23.44° tilt is visible
8. ✅ Saturn's rings align with planet's axial tilt
9. ✅ Great Red Spot on Jupiter is correctly positioned
10. ✅ Earth continents are recognizable and accurately placed
11. ✅ Moon maintains tidal locking (same face toward Earth)
12. ✅ Performance targets met (45+ FPS Quality, 60 FPS Performance)
13. ✅ All textures load in < 5 seconds
14. ✅ No console errors
15. ✅ Documentation updated with accuracy data

---

## 🚧 Known Challenges & Mitigation

### Challenge 1: Texture File Sizes
**Risk:** Large textures may cause slow loading times
**Mitigation:**
- Use 2K textures (2048x1024) as default
- Compress to < 1MB per texture
- Implement progressive loading (low-res first, then high-res)

### Challenge 2: Texture Alignment Complexity
**Risk:** Getting prime meridian and equator aligned correctly is tricky
**Mitigation:**
- Use Earth as reference (easiest to validate with continents)
- Research existing implementations (Solar System Scope, etc.)
- Test with Great Red Spot on Jupiter (well-documented position)

### Challenge 3: Axial Tilt + Rotation Interaction
**Risk:** Combining tilt and rotation in Three.js can be complex
**Mitigation:**
- Research Euler angle order carefully
- Test with Earth first (familiar 23.44° tilt)
- Use quaternions if Euler angles prove problematic

### Challenge 4: Performance Impact
**Risk:** Textures and rotation may reduce FPS
**Mitigation:**
- Profile with Chrome DevTools
- Implement texture LOD if needed
- Make rotation optional (toggle in settings)
- Use texture compression

---

## 📝 Notes & Decisions

### Texture Resolution Strategy:
- **Quality Mode:** 2K textures (2048x1024)
- **Performance Mode:** 1K textures (1024x512) or solid colors
- **Format:** JPG for color maps (smaller file size)

### Rotation Implementation:
- Use `mesh.rotation.y` for axial spin
- Update based on `deltaTime` for frame-rate independence
- Account for `timeManager.getTimeSpeed()` multiplier

### Tilt Implementation:
- Apply tilt at mesh creation (one-time operation)
- Use `mesh.rotation.x` or `mesh.rotation.z` based on convention
- Special handling for Venus (177°) and Uranus (98°)

---

## 🔄 Sprint Workflow

### Daily Workflow:
1. Pick next task in order (start with Phase 1, Task 1.1)
2. Complete all subtasks
3. Test thoroughly
4. Commit with conventional commit message
5. Update CURRENT_SPRINT.md with progress
6. Move to next task

### Testing Checkpoints:
- After Phase 2: Verify textures load and look correct
- After Phase 3: Verify rotation works at all time speeds
- After Phase 4: Verify axial tilt is visible and accurate
- After Phase 5: Final validation before completion

---

## 🚀 Next Sprint Ideas (Sprint 8)

After Sprint 7 completion, potential next sprints:
- **Sprint 8:** Planet atmosphere effects (Earth clouds, Venus thick atmosphere)
- **Sprint 9:** Major moons (Europa, Titan, Ganymede, Io)
- **Sprint 10:** Advanced realism (orbital eccentricity, Moon phases, eclipses)
- **Sprint 11:** VR/AR support (WebXR integration)

---

**Created:** 2025-01-15
**Status:** READY TO BEGIN
**First Task:** Task 1.1 - Research Accurate Astronomical Data

