# Sprint 3 - Major Moons & Scaling Fixes

**Created:** 2025-11-13
**Status:** 🔴 CRITICAL BUGS IDENTIFIED - Ready for execution
**Priority:** P0 - BLOCKING (User cannot see major moons system)

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### Issue #1: Major Moons Not Visible
**Symptom:** Only Earth's Moon visible, dropdown doesn't show 7 major moons
**Root Cause:** Major moons NOT registered with UI/labels system
**Impact:** HIGH - Complete feature invisible to user

### Issue #2: Earth's Moon Orbit Too Large
**Symptom:** Moon orbit is massive, way too far from Earth in enlarged mode
**Root Cause:** Moon orbit scaling logic INVERTED in orbital.js:64
**Impact:** HIGH - Visual scale completely wrong

### Issue #3: Real Proportions Mode Incorrect
**Symptom:** Real proportions mode doesn't show true astronomical ratios
**Root Cause:** Multiple scaling factors applied inconsistently
**Impact:** MEDIUM - Educational value lost

---

## 📋 SPRINT TASK LIST (Prioritized)

### ✅ Task 0: Pre-Flight Check & Backup
**Status:** READY TO START
**Estimated Time:** 2 minutes
**Priority:** P0 (Always backup before major changes)

#### Steps:
- [ ] 0.1: Create git commit of current state (safety checkpoint)
- [ ] 0.2: Verify server running at localhost:8000
- [ ] 0.3: Document current visual state (screenshot/description)

#### Rollback Plan:
```bash
git reset --hard HEAD
```

---

### 🔴 Task 1: Fix Major Moons Registration (CRITICAL)
**Status:** NOT STARTED
**Estimated Time:** 15 minutes
**Priority:** P0 (Blocks all moon visibility)
**Files to Modify:**
- `src/modules/ui.js`
- `src/main.js`

#### Problem Analysis:
The 7 major moons are created and added to scene, but:
1. NOT registered as clickable objects in UI
2. NOT added to dropdown selector
3. Labels system CAN find them (getCelestialObject works)
4. But UI never calls to register them

#### Solution Steps:
- [ ] 1.1: Open `src/modules/ui.js`
- [ ] 1.2: Find `reregisterAllClickableObjects()` function
- [ ] 1.3: Add major moons registration loop:
  ```javascript
  // Register major moons (Jupiter & Saturn)
  const majorMoonKeys = ['io', 'europa', 'ganymede', 'callisto', 'titan', 'rhea', 'iapetus'];
  majorMoonKeys.forEach(moonKey => {
      const moonMesh = getCelestialObject(moonKey);
      if (moonMesh) {
          registerClickableObject(moonKey, moonMesh, {
              name: moonMesh.name,
              type: 'major_moon',
              parent: MAJOR_MOONS[moonKey].parentPlanet
          });
      }
  });
  ```
- [ ] 1.4: Add major moons to dropdown in `index.html`
- [ ] 1.5: Test click-to-focus on each moon
- [ ] 1.6: Verify dropdown selector shows all moons

#### Success Criteria:
- ✅ Dropdown shows 11 objects: Sun, 8 planets, Earth's Moon, ISS, **+ 7 major moons**
- ✅ Can click on Io, Europa, Ganymede, Callisto, Titan, Rhea, Iapetus
- ✅ Labels appear for all major moons

#### Rollback Plan:
```bash
git checkout src/modules/ui.js src/main.js
```

---

### 🔴 Task 2: Fix Moon Orbit Scaling (CRITICAL)
**Status:** NOT STARTED
**Estimated Time:** 10 minutes
**Priority:** P0 (Moon orbit visually broken)
**Files to Modify:**
- `src/utils/orbital.js` (lines 60-69)

#### Problem Analysis:
Current code in `orbital.js:60-69`:
```javascript
if (planetSizeMode === 'real') {
    // Real mode: 100x scale
    orbitRadiusScene = kmToScene(moonData.orbitRadius) * 100;
} else {
    // Enlarged mode: 50x scale
    orbitRadiusScene = kmToScene(moonData.orbitRadius) * SCALE.MOON_ORBIT_SCALE; // 50
}
```

**This is BACKWARDS!**
- Real mode should use ACTUAL distance (1x)
- Enlarged mode should use SCALED distance (50x)

#### Solution Steps:
- [ ] 2.1: Open `src/utils/orbital.js`
- [ ] 2.2: Navigate to line 55 (`calculateMoonPosition` function)
- [ ] 2.3: INVERT the scaling logic:
  ```javascript
  if (planetSizeMode === 'real') {
      // Real mode: Use actual astronomical distance (no extra scaling)
      orbitRadiusScene = kmToScene(moonData.orbitRadius);
  } else {
      // Enlarged mode: Apply MOON_ORBIT_SCALE to make Moon visible outside Earth's scaled surface
      orbitRadiusScene = kmToScene(moonData.orbitRadius) * SCALE.MOON_ORBIT_SCALE;
  }
  ```
- [ ] 2.4: Save file
- [ ] 2.5: Refresh browser
- [ ] 2.6: Test both modes:
  - Enlarged: Moon should be visible ~2x Earth's visual radius
  - Real: Moon should be at accurate 60x Earth's radius

#### Expected Behavior:
**Enlarged Mode:**
- Earth visual radius: ~32 units (6,371 km × 1500 scale / 297,000 km/unit)
- Moon orbit: ~64 units (384,400 km × 50 scale / 297,000)
- Ratio: Moon at ~2x Earth radius (visible and clear)

**Real Mode:**
- Earth radius: ~0.02 units (6,371 km / 297,000)
- Moon orbit: ~1.29 units (384,400 km / 297,000)
- Ratio: Moon at ~60x Earth radius (ACCURATE!)

#### Success Criteria:
- ✅ Enlarged mode: Moon orbit visible, ~2x Earth visual size
- ✅ Real mode: Moon orbit accurate 60x Earth radius
- ✅ Moon stays with Earth as it orbits Sun

#### Rollback Plan:
```bash
git checkout src/utils/orbital.js
```

---

### 🟡 Task 3: Apply Same Fix to Major Moons Scaling
**Status:** NOT STARTED
**Estimated Time:** 10 minutes
**Priority:** P1 (Same bug in major moons)
**Files to Modify:**
- `src/modules/moons.js` (lines 73-76)

#### Problem Analysis:
Same inverted logic in `moons.js`:
```javascript
const sizeMode = getPlanetSizeMode();
const orbitScale = sizeMode === 'real' ? SCALE.MAJOR_MOON_ORBIT_SCALE : 1;
```

This should be:
```javascript
const orbitScale = sizeMode === 'real' ? 1 : SCALE.MAJOR_MOON_ORBIT_SCALE;
```

#### Solution Steps:
- [ ] 3.1: Open `src/modules/moons.js`
- [ ] 3.2: Navigate to line 73 (inside `initMajorMoons`)
- [ ] 3.3: INVERT the ternary operator:
  ```javascript
  // BEFORE (WRONG):
  const orbitScale = sizeMode === 'real' ? SCALE.MAJOR_MOON_ORBIT_SCALE : 1;

  // AFTER (CORRECT):
  const orbitScale = sizeMode === 'real' ? 1 : SCALE.MAJOR_MOON_ORBIT_SCALE;
  ```
- [ ] 3.4: Save file
- [ ] 3.5: Refresh browser (or toggle size mode to trigger rebuild)
- [ ] 3.6: Test major moons visibility in both modes

#### Success Criteria:
- ✅ Io, Europa, Ganymede, Callisto visible orbiting Jupiter (both modes)
- ✅ Titan, Rhea, Iapetus visible orbiting Saturn (both modes)
- ✅ Real mode: Accurate orbital distances
- ✅ Enlarged mode: Moons visible outside planet surfaces

#### Rollback Plan:
```bash
git checkout src/modules/moons.js
```

---

### 🟢 Task 4: Verify Real Proportions Mode Accuracy
**Status:** NOT STARTED
**Estimated Time:** 20 minutes
**Priority:** P1 (Quality/educational value)
**No File Changes** (verification only)

#### Verification Checklist:
- [ ] 4.1: Toggle to "Real Proportions" mode
- [ ] 4.2: Verify Sun size vs planets (Sun should be MUCH larger)
- [ ] 4.3: Verify planet sizes relative to each other:
  - Jupiter largest (11x Earth diameter)
  - Saturn second (9.4x Earth)
  - Earth larger than Mars (2x Mars diameter)
  - Venus ~same as Earth
- [ ] 4.4: Verify orbital distances:
  - Mercury closest to Sun
  - Neptune farthest (30 AU)
  - Spacing should look accurate
- [ ] 4.5: Verify moon orbits:
  - Earth's Moon: 60x Earth radius
  - Io: closest to Jupiter
  - Iapetus: farthest from Saturn
- [ ] 4.6: Document any remaining inaccuracies

#### Known Limitations (EXPECTED):
- ISS will be invisible at real scale (it's tiny!)
- Inner planets will be very small
- Outer planets will be far apart
- This is CORRECT behavior for real proportions

#### Issues to Document:
If found, log here for future tasks

---

### 🟢 Task 5: Update Documentation
**Status:** NOT STARTED
**Estimated Time:** 10 minutes
**Priority:** P2 (Record work done)
**Files to Modify:**
- `SPRINT3.md`
- `SESSION_NOTES_2025-11-13.md`
- `COMPLETED.md`

#### Steps:
- [ ] 5.1: Mark Task 2 (Major Moons) as 100% complete in SPRINT3.md
- [ ] 5.2: Add session notes to SESSION_NOTES_2025-11-13.md
- [ ] 5.3: Move completed work to COMPLETED.md
- [ ] 5.4: Update sprint metrics (Task 2: 100%, overall: ~50%)

---

## 📊 PROGRESS TRACKING

### Current Status: NOT STARTED
**Last Updated:** 2025-11-13 [Initial Plan]

### Completion Log:
```
[ ] Task 0: Pre-Flight Check (0/3 steps)
[ ] Task 1: Major Moons Registration (0/6 steps)
[ ] Task 2: Moon Orbit Scaling Fix (0/6 steps)
[ ] Task 3: Major Moons Scaling Fix (0/6 steps)
[ ] Task 4: Real Proportions Verification (0/6 steps)
[ ] Task 5: Documentation Update (0/4 steps)

Total: 0/31 steps completed (0%)
```

---

## 🔧 TECHNICAL REFERENCE

### Scale Calculations (For Reference)

#### kmToScene conversion:
```javascript
// 1 AU = 149,597,870.7 km
// AU_TO_SCENE = 500
// Therefore: 1 km = 500 / 149,597,870.7 = 0.00000334 scene units
// Or: 1 scene unit = 297,000 km
```

#### Earth's Moon:
```javascript
// Moon orbit radius: 384,400 km
// Earth radius: 6,371 km
// Real ratio: 384,400 / 6,371 = 60.3

// ENLARGED MODE (correct):
// - Earth radius: 6,371 × 1500 / 297,000 = 32.2 units
// - Moon orbit: 384,400 × 50 / 297,000 = 64.6 units
// - Visual ratio: 64.6 / 32.2 = 2.0 (Moon outside Earth)

// REAL MODE (correct):
// - Earth radius: 6,371 / 297,000 = 0.021 units
// - Moon orbit: 384,400 / 297,000 = 1.29 units
// - Real ratio: 1.29 / 0.021 = 61.4 ✓ ACCURATE!
```

#### Jupiter's Io:
```javascript
// Io orbit radius: 421,700 km
// Jupiter radius: 69,911 km
// Real ratio: 421,700 / 69,911 = 6.03

// ENLARGED MODE (correct with fix):
// - Jupiter radius: 69,911 × 250 / 297,000 = 58.9 units
// - Io orbit: 421,700 × 50 / 297,000 = 71.0 units
// - Visual ratio: 71.0 / 58.9 = 1.2 (Io just outside Jupiter)

// REAL MODE (correct with fix):
// - Jupiter radius: 69,911 / 297,000 = 0.235 units
// - Io orbit: 421,700 / 297,000 = 1.42 units
// - Real ratio: 1.42 / 0.235 = 6.04 ✓ ACCURATE!
```

---

## ⚠️ SAFETY PROTOCOLS

### Before Each Task:
1. ✅ Commit current state
2. ✅ Note file paths being modified
3. ✅ Keep browser DevTools open (F12)
4. ✅ Watch console for errors

### During Each Task:
1. ✅ Make ONE change at a time
2. ✅ Test immediately after each change
3. ✅ Update progress log in this file
4. ✅ Document any unexpected behavior

### If Something Breaks:
1. 🛑 STOP immediately
2. 📝 Document what broke and what was changed
3. 🔄 Rollback using git checkout
4. 🔍 Analyze root cause before retrying

---

## 🎯 SUCCESS CRITERIA (Sprint Complete When...)

- [ ] All 7 major moons visible in visualization
- [ ] All major moons appear in dropdown
- [ ] All major moons clickable and focusable
- [ ] Earth's Moon orbit correct in both modes
- [ ] Major moon orbits correct in both modes
- [ ] Real Proportions mode shows accurate astronomical ratios
- [ ] Enlarged mode keeps all objects visible
- [ ] No console errors
- [ ] 60 FPS maintained
- [ ] Documentation updated

---

## 📝 NOTES SECTION

### Session Notes:
(Will be filled in as work progresses)

### Unexpected Findings:
(Document surprises or additional issues discovered)

### Future Improvements:
(Ideas for next sprint)

---

**Status Legend:**
- 🔴 CRITICAL - Blocking issue, must fix immediately
- 🟡 HIGH - Important, should fix soon
- 🟢 MEDIUM - Beneficial, fix when time allows
- ⚪ LOW - Nice to have, defer to backlog
