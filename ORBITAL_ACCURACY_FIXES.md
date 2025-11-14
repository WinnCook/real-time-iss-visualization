# Orbital Accuracy Fixes - 2025-11-14

## Issues Identified

### 1. Moon Orbital Orientations - INACCURATE ❌

**Current Implementation:**
- File: `src/modules/moons.js:196`
- All outer planet moons orbit in flat XZ plane (horizontal)
- Code: `moonMesh.position.y = parentPosition.y` (same Y as parent)
- Comment: "Same Y as parent (moons orbit in equatorial plane)"

**Problem:**
- Moons DO orbit in their parent planet's equatorial plane
- BUT parent planets have different axial tilts
- Current code ignores axial tilt → all moon orbits are parallel to planetary orbital plane
- This is **astronomically incorrect**

**Reality:**
- Jupiter: Axial tilt ~3.1° → moons orbit at ~3.1° to orbital plane
- Saturn: Axial tilt ~26.7° → moons orbit at ~26.7° to orbital plane
- Uranus: Axial tilt ~97.8° → moons orbit nearly perpendicular to orbital plane
- Neptune: Axial tilt ~28.3° → moons orbit at ~28.3° to orbital plane

**Conclusion:** Moon orbital planes should be **tilted** relative to planetary orbital plane, not perpendicular.

---

### 2. Asteroid Belt Orientation - MOSTLY ACCURATE ✅

**Current Implementation:**
- File: `src/modules/asteroidBelt.js:133`
- Asteroids orbit in XZ plane with gaussian vertical scatter
- Vertical offset simulates orbital inclinations

**Reality:**
- Main asteroid belt orbits close to ecliptic plane (Earth's orbital plane)
- Individual asteroids have varying inclinations (0-30°)
- Gaussian vertical distribution is a reasonable approximation

**Conclusion:** Asteroid belt is **mostly accurate** for visualization purposes.

---

### 3. Outer Moon Dropdown - NOT CLICKABLE ❌

**Current Implementation:**
- File: `index.html:214-224`
- Outer moons (Io, Europa, Ganymede, Callisto, Titan, Rhea, Iapetus) are in dropdown HTML
- File: `src/modules/ui.js:989-999`
- Moons are registered in `reregisterAllClickableObjects()`

**Problem:**
- Timing issue: `reregisterAllClickableObjects()` may not be called after moons initialize
- Or moons may not be available when function runs
- Clicking dropdown options for outer moons does nothing

**Solution:**
- Ensure `reregisterAllClickableObjects()` is called AFTER moons are fully initialized
- Add defensive checks to ensure moon objects exist before registering

---

### 4. UI Hierarchy - Moon & ISS Should be Earth Subitems 🎨

**Current Implementation:**
- File: `index.html:202-226`
- Dropdown structure:
  ```
  - Sun
  - Mercury
  - Venus
  - Earth
  - Mars
  - Jupiter
  - Saturn
  - Uranus
  - Neptune
  - Moon (standalone)
  - Jupiter's Moons (optgroup)
  - Saturn's Moons (optgroup)
  - ISS (standalone)
  ```

**Desired Structure:**
  ```
  - Sun
  - Mercury
  - Venus
  - Earth (optgroup)
    - 🌍 Earth
    - 🌙 Moon
    - 🛰️ ISS
  - Mars
  - Jupiter (optgroup)
    - ♃ Jupiter
    - 🌋 Io
    - ❄️ Europa
    - 🌑 Ganymede
    - 🌑 Callisto
  - Saturn (optgroup)
    - ♄ Saturn
    - 🟠 Titan
    - ⚪ Rhea
    - ⚫ Iapetus
  - Uranus
  - Neptune
  ```

**Rationale:**
- Moon and ISS orbit Earth → should be visually grouped with Earth
- Matches the structure used for Jupiter and Saturn moons
- More intuitive hierarchy for users

---

## Planned Fixes

### Fix 1: Add Axial Tilt Data to Constants

**File:** `src/utils/constants.js`

**Add to PLANETS object:**
```javascript
axialTilt: <degrees>, // Axial tilt in degrees (obliquity to orbit)
```

**Data to add:**
- Mercury: 0.034°
- Venus: 177.4° (retrograde rotation)
- Earth: 23.44°
- Mars: 25.19°
- Jupiter: 3.13°
- Saturn: 26.73°
- Uranus: 97.77° (sideways!)
- Neptune: 28.32°

---

### Fix 2: Update Moon Orbital Mechanics

**File:** `src/modules/moons.js`

**Changes:**
1. Import parent planet axial tilt from constants
2. Create rotation matrix for tilted orbital plane
3. Apply rotation to moon position vectors
4. Rotate around parent planet's axis (not solar system's axis)

**Algorithm:**
```javascript
// 1. Calculate moon position in parent's equatorial plane (current logic)
const localX = Math.cos(angle) * orbitRadius;
const localY = 0; // Flat in equatorial plane
const localZ = Math.sin(angle) * orbitRadius;

// 2. Create rotation matrix for parent's axial tilt
const tiltRadians = parentPlanet.axialTilt * DEG_TO_RAD;
const rotationMatrix = new THREE.Matrix4().makeRotationX(tiltRadians);

// 3. Apply rotation to position vector
const localPosition = new THREE.Vector3(localX, localY, localZ);
localPosition.applyMatrix4(rotationMatrix);

// 4. Add to parent's world position
moonMesh.position.set(
    parentPosition.x + localPosition.x,
    parentPosition.y + localPosition.y,
    parentPosition.z + localPosition.z
);
```

---

### Fix 3: Fix Outer Moon Dropdown Clickability

**File:** `src/modules/ui.js`

**Changes:**
1. Ensure `reregisterAllClickableObjects()` is called after moon initialization
2. Add console logging to verify moon objects exist
3. Add error handling for missing objects

**File:** `src/modules/solarSystem.js`

**Changes:**
1. Call `reregisterAllClickableObjects()` after `initMajorMoons()` completes
2. Ensure proper async/await handling

---

### Fix 4: Reorganize Dropdown HTML

**File:** `index.html`

**Changes:**
1. Group Earth with Moon and ISS using `<optgroup>`
2. Add Earth as first option in Earth group
3. Group Jupiter with its moons
4. Group Saturn with its moons
5. Keep Uranus and Neptune standalone (no major moons in viz yet)

---

## Implementation Steps

1. ✅ Document findings and planned fixes (this file)
2. ⏳ Add axial tilt data to `src/utils/constants.js`
3. ⏳ Update `src/modules/moons.js` orbital calculations
4. ⏳ Fix dropdown clickability in `src/modules/ui.js`
5. ⏳ Reorganize dropdown HTML in `index.html`
6. ⏳ Test all changes in browser
7. ⏳ Verify astronomical accuracy with reference data

---

## Testing Checklist

After implementation:
- [ ] Uranus moons orbit nearly perpendicular to orbital plane (97.77° tilt)
- [ ] Saturn moons orbit at visible angle (~27° tilt)
- [ ] Jupiter moons orbit nearly flat (~3° tilt, subtle)
- [ ] Neptune moons orbit at visible angle (~28° tilt)
- [ ] Asteroid belt remains in ecliptic plane
- [ ] All outer moons are clickable from dropdown
- [ ] Earth group shows Earth, Moon, and ISS
- [ ] Jupiter group shows Jupiter and its 4 moons
- [ ] Saturn group shows Saturn and its 3 moons
- [ ] Camera lock works on all objects
- [ ] No console errors

---

## References

- NASA Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- JPL Solar System Dynamics: https://ssd.jpl.nasa.gov/
- Wikipedia Axial Tilt Data: https://en.wikipedia.org/wiki/Axial_tilt

---

**Last Updated:** 2025-11-14
**Status:** Documentation complete, ready to implement
