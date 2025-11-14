# Next Sprint - Camera Controls & Additional Moons

**Sprint Status:** 📋 Planned (Not Started)
**Priority:** High (Camera) + Medium (Moons)
**Estimated Duration:** 4-6 hours

---

## Sprint Goal

Improve camera interaction and controls to allow free movement, and add missing moons (especially Neptune's Triton and Uranus's major moons) with accurate orbital data.

---

## User Stories

### 1. 🎥 Free Camera Movement (HIGH PRIORITY)

**As a user**, I want to freely explore the solar system without being locked to an object, so that I can navigate the scene intuitively.

**Current Behavior (Issues):**
- ❌ On initial load, camera controls don't work (can't zoom, pan, or rotate)
- ❌ Camera only works when locked to an object (after selecting from dropdown)
- ❌ No way to unlock camera by clicking empty space
- ❌ Can't click objects in 3D scene (only dropdown works)

**Desired Behavior:**
- ✅ Camera works immediately on load (free movement mode)
- ✅ Click empty space to enter free movement mode (unlock from object)
- ✅ Click object in 3D scene to lock camera onto it (same as dropdown)
- ✅ Smooth transitions between locked and free modes
- ✅ Visual indicator showing current mode (locked vs free)

**Acceptance Criteria:**
- [ ] User can zoom/pan/rotate immediately on page load
- [ ] Clicking empty space unlocks camera (if currently locked)
- [ ] Clicking 3D object locks camera and focuses on it
- [ ] Camera transitions smoothly (no jumps)
- [ ] UI shows "🔓 Free Camera" or "🔒 Locked: [Object Name]"
- [ ] ESC key still unlocks camera (existing functionality)
- [ ] Right-click still unlocks camera (existing functionality)

---

### 2. 🖱️ 3D Object Click Detection (HIGH PRIORITY)

**As a user**, I want to click objects directly in the 3D scene, so that I don't have to use the dropdown menu.

**Current Behavior:**
- ❌ Raycasting setup exists but not fully integrated
- ❌ Only dropdown selection locks camera onto objects
- ❌ Clicking 3D objects does nothing

**Desired Behavior:**
- ✅ Click planet/moon/sun/ISS in 3D scene → lock camera onto it
- ✅ Same behavior as dropdown selection (focus + info panel)
- ✅ Visual feedback on hover (highlight/outline)
- ✅ Cursor changes to pointer when hovering over clickable object

**Acceptance Criteria:**
- [ ] Click Sun → camera locks and focuses
- [ ] Click any planet → camera locks and focuses
- [ ] Click any moon (including outer moons) → camera locks and focuses
- [ ] Click ISS → camera locks and focuses
- [ ] Hover over object → visual highlight (optional glow/outline)
- [ ] Cursor changes to pointer on hover
- [ ] Selected object info appears in right panel
- [ ] Works in all visual styles (realistic, cartoon, neon, minimalist)

---

### 3. 🌙 Add Neptune's Triton (MEDIUM PRIORITY)

**As a user**, I want to see Neptune's major moon Triton in the visualization, so that Neptune is represented like Jupiter and Saturn.

**Why Triton:**
- Largest moon of Neptune (7th largest moon in solar system)
- Only large moon with retrograde orbit (orbits backwards!)
- Geologically active (nitrogen geysers, young surface)
- Captured Kuiper Belt object (not formed with Neptune)

**Astronomical Data:**
- **Name:** Triton
- **Radius:** 1,353.4 km
- **Orbit Radius:** 354,759 km from Neptune
- **Orbit Period:** 5.877 days (RETROGRADE!)
- **Orbital Inclination:** 156.9° (retrograde = >90°)
- **Color:** 0xf0e5d8 (pinkish-white, nitrogen ice)
- **Description:** "Largest moon of Neptune, retrograde orbit, geologically active"

**Implementation:**
1. Add Triton to `MAJOR_MOONS` in `src/utils/constants.js`
2. Update `src/modules/moons.js` to handle retrograde orbits (negative period)
3. Add to dropdown under "♆ Neptune System" optgroup
4. Register as clickable in `src/main.js`
5. Create orbital path visualization

**Acceptance Criteria:**
- [ ] Triton appears in scene orbiting Neptune
- [ ] Orbit is retrograde (opposite direction from other moons)
- [ ] Orbital tilt is 156.9° (very tilted!)
- [ ] Clickable from dropdown and 3D scene
- [ ] Labeled correctly
- [ ] Info panel shows accurate data

---

### 4. 🌙 Add Uranus's 5 Major Moons (MEDIUM PRIORITY)

**As a user**, I want to see Uranus's major moons, so that all gas/ice giants have moon representations.

**Why Uranus Moons:**
- Uranus has extreme 97.8° axial tilt (rotates on its side)
- Moons orbit in Uranus's equatorial plane → nearly perpendicular to orbital plane!
- Most dramatic visual effect in the entire solar system
- Would showcase the tilt rotation algorithm perfectly

**Astronomical Data:**

| Moon | Radius (km) | Orbit Radius (km) | Period (days) | Color | Description |
|------|-------------|-------------------|---------------|-------|-------------|
| **Miranda** | 235.8 | 129,390 | 1.413 | 0xc0c0c0 | Smallest, bizarre patchwork surface |
| **Ariel** | 578.9 | 190,900 | 2.520 | 0xd3d3d3 | Bright, youngest surface |
| **Umbriel** | 584.7 | 266,000 | 4.144 | 0x696969 | Darkest moon, ancient surface |
| **Titania** | 788.9 | 436,300 | 8.706 | 0xb8b8b8 | Largest Uranian moon |
| **Oberon** | 761.4 | 583,500 | 13.463 | 0x8b8b8b | Second largest, heavily cratered |

**Implementation:**
1. Add all 5 moons to `MAJOR_MOONS` in `src/utils/constants.js`
2. Update dropdown to include "⛢ Uranus System" optgroup
3. Register all 5 as clickable
4. Test orbital tilt rendering (should be nearly vertical!)

**Acceptance Criteria:**
- [ ] All 5 Uranus moons appear in scene
- [ ] Moons orbit at 97.8° tilt (nearly perpendicular - DRAMATIC!)
- [ ] All clickable from dropdown and 3D scene
- [ ] Labeled correctly
- [ ] Proper size scaling relative to each other
- [ ] Visual verification: moons orbit "sideways" compared to planets

---

## Technical Tasks

### Task 1: Implement Free Camera Mode

**File:** `src/core/camera.js`
**Changes:**
```javascript
// Add camera mode state
let cameraMode = 'free'; // 'free' or 'locked'

export function setCameraMode(mode) {
    cameraMode = mode;
}

export function getCameraMode() {
    return cameraMode;
}

// Ensure controls are always enabled
export function enableControls() {
    if (controls) {
        controls.enabled = true;
    }
}
```

**File:** `src/modules/ui.js`
**Changes:**
1. Call `enableControls()` immediately on init (line ~106)
2. Update `unlockCamera()` to set mode to 'free'
3. Update `handleObjectClick()` to set mode to 'locked'
4. Add UI indicator: "🔓 Free Camera" or "🔒 Locked: Earth"

---

### Task 2: Implement Click-to-Unlock (Click Empty Space)

**File:** `src/modules/ui.js`
**Function:** `setupClickToFocus()` (line ~632)

**Changes:**
```javascript
canvas.addEventListener('mouseup', (event) => {
    // ... existing drag detection ...

    // Perform raycasting
    raycaster.setFromCamera(mouse, appCamera);
    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        // HIT OBJECT - lock camera
        handleObjectClick(clickedObject);
    } else {
        // HIT EMPTY SPACE - unlock camera
        unlockCamera();
        console.log('🔓 Clicked empty space - camera unlocked');
    }
});
```

---

### Task 3: Add Visual Hover Effects

**File:** `src/modules/ui.js`
**New Function:** `setupHoverEffects()`

**Implementation:**
```javascript
let hoveredObject = null;

canvas.addEventListener('mousemove', (event) => {
    // Update mouse position
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast for hover detection
    raycaster.setFromCamera(mouse, appCamera);
    const intersects = raycaster.intersectObjects(Array.from(clickableObjects.values()), true);

    if (intersects.length > 0) {
        // Object hovered
        canvas.style.cursor = 'pointer';

        // Optional: Add glow effect
        const object = intersects[0].object;
        if (object !== hoveredObject) {
            // Remove previous hover effect
            if (hoveredObject && hoveredObject.material) {
                hoveredObject.material.emissiveIntensity = 0;
            }
            // Add new hover effect
            if (object.material) {
                object.material.emissiveIntensity = 0.5;
            }
            hoveredObject = object;
        }
    } else {
        // No object hovered
        canvas.style.cursor = 'default';
        if (hoveredObject && hoveredObject.material) {
            hoveredObject.material.emissiveIntensity = 0;
        }
        hoveredObject = null;
    }
});
```

---

### Task 4: Add Triton (Neptune's Moon)

**File:** `src/utils/constants.js`
**Location:** After `iapetus` definition (line ~359)

```javascript
// Neptune's Major Moon
triton: {
    name: "Triton",
    color: 0xf0e5d8, // Pinkish-white (nitrogen ice surface)
    radius: 1353.4, // km (7th largest moon in solar system)
    orbitRadius: 354759, // km from Neptune
    orbitPeriod: -5.877, // days (NEGATIVE = RETROGRADE ORBIT!)
    rotationPeriod: 5.877, // days (tidally locked)
    parentPlanet: 'neptune',
    description: "Largest moon of Neptune, retrograde orbit, geologically active (nitrogen geysers)"
}
```

**File:** `src/modules/moons.js`
**Changes:** Handle negative orbital period for retrograde motion

```javascript
// In updateMajorMoons(), line ~187
const angle = startAngles[moonKey] + (simulationTime / Math.abs(cached.periodMs)) * TWO_PI;
// Use Math.abs() so retrograde orbits work correctly
```

**File:** `index.html`
**Changes:** Add Neptune System optgroup

```html
<optgroup label="♆ Neptune System">
    <option value="neptune">♆ Neptune</option>
    <option value="triton">🔱 Triton (retrograde)</option>
</optgroup>
```

**File:** `src/main.js`
**Changes:** Register Triton as clickable

```javascript
// Register Neptune's moon
registerClickableObject('triton', getCelestialObject('triton'), {
    type: 'major_moon',
    name: 'Triton',
    parent: 'Neptune',
    retrograde: true
});
```

---

### Task 5: Add Uranus's 5 Major Moons

**File:** `src/utils/constants.js`
**Location:** After `triton` definition

```javascript
// Uranus's Major Moons (orbit at 97.8° tilt - nearly perpendicular!)
miranda: {
    name: "Miranda",
    color: 0xc0c0c0, // Light gray
    radius: 235.8, // km
    orbitRadius: 129390, // km from Uranus
    orbitPeriod: 1.413, // days
    rotationPeriod: 1.413, // days (tidally locked)
    parentPlanet: 'uranus',
    description: "Smallest major Uranian moon, bizarre patchwork surface"
},
ariel: {
    name: "Ariel",
    color: 0xd3d3d3, // Light gray (brightest)
    radius: 578.9, // km
    orbitRadius: 190900, // km from Uranus
    orbitPeriod: 2.520, // days
    rotationPeriod: 2.520, // days (tidally locked)
    parentPlanet: 'uranus',
    description: "Bright surface, youngest geological features"
},
umbriel: {
    name: "Umbriel",
    color: 0x696969, // Dark gray (darkest)
    radius: 584.7, // km
    orbitRadius: 266000, // km from Uranus
    orbitPeriod: 4.144, // days
    rotationPeriod: 4.144, // days (tidally locked)
    parentPlanet: 'uranus',
    description: "Darkest Uranian moon, ancient cratered surface"
},
titania: {
    name: "Titania",
    color: 0xb8b8b8, // Medium gray
    radius: 788.9, // km (largest!)
    orbitRadius: 436300, // km from Uranus
    orbitPeriod: 8.706, // days
    rotationPeriod: 8.706, // days (tidally locked)
    parentPlanet: 'uranus',
    description: "Largest moon of Uranus, ice and rock composition"
},
oberon: {
    name: "Oberon",
    color: 0x8b8b8b, // Gray
    radius: 761.4, // km (second largest)
    orbitRadius: 583500, // km from Uranus
    orbitPeriod: 13.463, // days
    rotationPeriod: 13.463, // days (tidally locked)
    parentPlanet: 'uranus',
    description: "Second largest Uranian moon, heavily cratered ancient surface"
}
```

**File:** `index.html`
**Changes:** Add Uranus System optgroup

```html
<optgroup label="⛢ Uranus System">
    <option value="uranus">⛢ Uranus</option>
    <option value="miranda">🌑 Miranda</option>
    <option value="ariel">🌑 Ariel</option>
    <option value="umbriel">🌑 Umbriel</option>
    <option value="titania">🌑 Titania</option>
    <option value="oberon">🌑 Oberon</option>
</optgroup>
```

**File:** `src/main.js`
**Changes:** Register all 5 Uranus moons

```javascript
// Register Uranus's major moons
registerClickableObject('miranda', getCelestialObject('miranda'), { type: 'major_moon', name: 'Miranda', parent: 'Uranus' });
registerClickableObject('ariel', getCelestialObject('ariel'), { type: 'major_moon', name: 'Ariel', parent: 'Uranus' });
registerClickableObject('umbriel', getCelestialObject('umbriel'), { type: 'major_moon', name: 'Umbriel', parent: 'Uranus' });
registerClickableObject('titania', getCelestialObject('titania'), { type: 'major_moon', name: 'Titania', parent: 'Uranus' });
registerClickableObject('oberon', getCelestialObject('oberon'), { type: 'major_moon', name: 'Oberon', parent: 'Uranus' });
```

**File:** `src/modules/solarSystem.js`
**Changes:** Update `getCelestialObject()` to include new moons

```javascript
case 'triton':
case 'miranda':
case 'ariel':
case 'umbriel':
case 'titania':
case 'oberon':
    return getMoonMesh(name.toLowerCase());
```

---

## Testing Checklist

### Camera Controls Testing
- [ ] Page loads → camera controls work immediately (zoom, pan, rotate)
- [ ] Click empty space → camera unlocks (if locked)
- [ ] Click planet in 3D → camera locks and focuses
- [ ] Click moon in 3D → camera locks and focuses
- [ ] Hover over object → cursor changes to pointer
- [ ] Hover over object → visual highlight appears (optional)
- [ ] ESC key → unlocks camera
- [ ] Right-click → unlocks camera
- [ ] UI shows correct mode: "🔓 Free" or "🔒 Locked: [Name]"

### Triton Testing
- [ ] Triton appears in scene orbiting Neptune
- [ ] Triton orbits BACKWARDS (retrograde motion)
- [ ] Orbital tilt is 156.9° (very tilted)
- [ ] Triton clickable from dropdown
- [ ] Triton clickable from 3D scene (once implemented)
- [ ] Info panel shows correct data
- [ ] Label appears correctly

### Uranus Moons Testing
- [ ] All 5 moons appear in scene
- [ ] Moons orbit at 97.8° tilt (nearly perpendicular - DRAMATIC!)
- [ ] Moons are in correct order by distance
- [ ] All clickable from dropdown
- [ ] All clickable from 3D scene (once implemented)
- [ ] Labels appear correctly
- [ ] Size scaling is correct (Titania largest, Miranda smallest)

---

## Data Sources

**Neptune - Triton:**
- NASA Planetary Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html
- Triton Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/tritonfact.html

**Uranus - Major Moons:**
- NASA Uranus Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html
- Uranian Satellites Data: https://ssd.jpl.nasa.gov/sats/phys_par/

---

## Sprint Backlog

### Priority Order

1. **HIGH - Free Camera Movement**
   - [ ] Enable controls on page load
   - [ ] Click empty space to unlock
   - [ ] Add mode indicator UI

2. **HIGH - 3D Object Click Detection**
   - [ ] Implement click-to-lock in 3D scene
   - [ ] Add hover cursor change
   - [ ] (Optional) Add hover highlight effect

3. **MEDIUM - Add Triton**
   - [ ] Add to constants
   - [ ] Handle retrograde orbit
   - [ ] Update dropdown
   - [ ] Register as clickable
   - [ ] Test visual appearance

4. **MEDIUM - Add Uranus Moons**
   - [ ] Add all 5 to constants
   - [ ] Update dropdown
   - [ ] Register all as clickable
   - [ ] Test dramatic 97.8° tilt effect

---

## Expected Outcomes

After this sprint:
- ✅ Users can explore freely on page load
- ✅ Intuitive click interactions (objects and empty space)
- ✅ Neptune represented with Triton (retrograde orbit!)
- ✅ Uranus represented with 5 moons (dramatic perpendicular orbits!)
- ✅ All major planets now have moon representations
- ✅ Total of 13 moons in visualization (up from 8)

---

## Sprint Estimation

- **Camera Controls:** 2-3 hours
- **3D Click Detection:** 1-2 hours
- **Add Triton:** 30 minutes
- **Add Uranus Moons:** 1 hour
- **Testing & Debugging:** 1 hour

**Total:** 4.5 - 7.5 hours

---

**Sprint Created:** 2025-11-14
**Status:** 📋 Planned (Not Started)
**Ready to Start:** ✅ YES (after current changes are committed)

---

*End of Next Sprint Planning*
