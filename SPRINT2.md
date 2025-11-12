# Sprint 2 - Solar System Expansion & Enhanced Features

**Sprint Goal:** Expand solar system to include outer planets, enhance ISS visualization with 3D model, and improve visual realism

**Sprint Duration:** Sprint 2
**Status:** 📝 **READY TO START**
**Planned Start:** 2025-11-12
**Estimated Duration:** 12-16 hours across 3 major tasks

---

## Sprint Overview

Sprint 2 focuses on expanding the solar system visualization with outer planets (Jupiter, Saturn, Uranus, Neptune) and enhancing the ISS with a detailed 3D model. This sprint builds upon the solid foundation established in Sprint 1.

### Key Goals:
1. ✨ Add outer planets to complete the solar system
2. 🛰️ Replace ISS sphere with detailed 3D model
3. 🌟 Enhance visual effects and realism

---

## Sprint Tasks

### 1. Outer Planets System 🪐 [PENDING 📝]

**Priority:** P1 (High)
**Estimated Effort:** 6-8 hours
**Complexity:** Medium-High

#### Overview:
Expand the solar system to include Jupiter, Saturn (with rings), Uranus, and Neptune. This will complete the full solar system visualization.

#### Subtasks:
- [ ] 1.1: Add Jupiter planet data to constants.js (orbital radius, period, size, color)
- [ ] 1.2: Add Saturn planet data with ring system parameters
- [ ] 1.3: Add Uranus planet data with tilted rotation axis
- [ ] 1.4: Add Neptune planet data
- [ ] 1.5: Implement Saturn ring geometry (THREE.RingGeometry or custom)
- [ ] 1.6: Update planets.js to support 8 planets (currently supports 4)
- [ ] 1.7: Add orbital paths for outer planets (much larger scale)
- [ ] 1.8: Implement camera zoom presets (inner system / outer system / full system)
- [ ] 1.9: Add labels for new planets
- [ ] 1.10: Update UI to register new clickable objects
- [ ] 1.11: Test performance with 8 planets + orbits
- [ ] 1.12: Optimize rendering if needed (LOD for distant planets)

#### Technical Considerations:
- **Scale challenge:** Outer planets are MUCH farther (Jupiter: 5.2 AU, Neptune: 30 AU)
- **Camera presets needed:**
  - Inner System View (Sun → Mars): Current default
  - Outer System View (Jupiter → Neptune): New zoom level
  - Full System View: See entire solar system at once
- **Saturn rings:** Critical visual feature, requires special geometry
  - Option 1: THREE.RingGeometry with texture
  - Option 2: Custom ring shader for better performance
- **Size scaling:** Jupiter is 11x Earth radius, need proper visual scaling

#### Files to Modify:
- `src/utils/constants.js` - Add OUTER_PLANETS data
- `src/modules/planets.js` - Support 8 planets, handle rings
- `src/modules/orbits.js` - Add outer planet orbits
- `src/modules/labels.js` - Register new planet labels
- `src/modules/ui.js` - Add camera zoom presets
- `src/main.js` - Register new clickable objects

#### Acceptance Criteria:
- [ ] All 8 planets visible and orbiting correctly
- [ ] Saturn has visible ring system
- [ ] Orbital periods accurate (Jupiter: 11.86 years, Saturn: 29.46 years)
- [ ] Camera can zoom to see full system or focus on inner/outer regions
- [ ] Performance remains smooth (60 FPS target on balanced settings)
- [ ] All planets clickable with click-to-focus
- [ ] Labels show correct distances from Sun and Earth

#### Research Resources:
- NASA JPL Horizons System: https://ssd.jpl.nasa.gov/horizons/
- Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- Saturn rings reference: https://solarsystem.nasa.gov/planets/saturn/overview/

---

### 2. Enhanced ISS Visualization 🛰️ [PENDING 📝]

**Priority:** P1 (High)
**Estimated Effort:** 4-6 hours
**Complexity:** Medium

#### Overview:
Replace the simple red sphere ISS representation with a detailed 3D model featuring solar panels, modules, and proper orientation. Add visual enhancements like solar panel rotation and module labels.

#### Subtasks:
- [ ] 2.1: Research and acquire ISS 3D model (.glb or .obj format, public domain)
- [ ] 2.2: Implement GLTFLoader or OBJLoader in project
- [ ] 2.3: Load ISS model and replace sphere mesh
- [ ] 2.4: Scale model appropriately (ISS is ~109m × 73m)
- [ ] 2.5: Add proper ISS orientation based on position
- [ ] 2.6: Implement solar panel rotation to face sun
- [ ] 2.7: Add optional ISS module labels (Zvezda, Harmony, Columbus, Destiny, etc.)
- [ ] 2.8: Implement "ISS Chase Camera" mode (close follow with rotation)
- [ ] 2.9: Add LOD system (detailed when close, simple when far)
- [ ] 2.10: Update all 4 visual styles to work with 3D model
- [ ] 2.11: Test performance with detailed model
- [ ] 2.12: Ensure click-to-focus works with new model

#### 3D Model Resources:
- **NASA 3D Resources:** https://nasa3d.arc.nasa.gov/
  - Official ISS models available (public domain)
  - Look for .glb format (preferred for Three.js)
  - Target size: 10-50 KB for reasonable load time
- **Model Requirements:**
  - Separate meshes for solar panels (for animation)
  - Reasonable polygon count (< 50K triangles)
  - Proper scale (1 unit = 1 meter works well)

#### Technical Implementation:

**GLTFLoader Setup:**
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/assets/models/iss.glb', (gltf) => {
    issMesh = gltf.scene;
    // Setup materials, scale, orientation
});
```

**Solar Panel Rotation:**
```javascript
// Find solar panel meshes
const solarPanels = issMesh.children.filter(child =>
    child.name.includes('solar_panel')
);

// Rotate to face sun in update loop
const sunDirection = new THREE.Vector3()
    .subVectors(sunPosition, issPosition)
    .normalize();
solarPanels.forEach(panel => {
    panel.lookAt(sunDirection);
});
```

**LOD System:**
```javascript
const issLOD = new THREE.LOD();
issLOD.addLevel(detailedModel, 0);    // < 500 units
issLOD.addLevel(mediumModel, 500);    // 500-1500 units
issLOD.addLevel(simpleModel, 1500);   // > 1500 units
```

#### Files to Create/Modify:
- `assets/models/iss.glb` - 3D model file (new)
- `src/modules/iss.js` - Major refactor for 3D model
- `src/utils/loaders.js` - GLTF loader utility (new)
- `src/modules/ui.js` - Add "Chase ISS" camera mode
- All visual style modules - Ensure materials work with model

#### Acceptance Criteria:
- [ ] ISS 3D model loads and displays correctly
- [ ] Model is properly scaled and positioned
- [ ] Solar panels rotate to face sun
- [ ] Click-to-focus works with 3D model
- [ ] "Chase Camera" mode follows ISS closely
- [ ] LOD system improves performance when far away
- [ ] Works in all 4 visual styles
- [ ] Trail still works correctly
- [ ] Info panel updates as before
- [ ] No significant performance degradation

#### Stretch Goals (Optional):
- [ ] Add Canadarm2 robotic arm
- [ ] Add docked spacecraft (Soyuz, Dragon, etc.)
- [ ] Implement ISS roll/pitch/yaw based on real orientation data
- [ ] Add glow effect for sun-facing surfaces

---

### 3. Visual Effects Enhancement 🌟 [PENDING 📝]

**Priority:** P2 (Medium)
**Estimated Effort:** 2-3 hours
**Complexity:** Low-Medium

#### Overview:
Add visual effects to improve realism and aesthetic appeal, including atmospheric glow for Earth, sun corona particles, and lens flare effects.

#### Subtasks:
- [ ] 3.1: Add atmospheric glow shader for Earth
- [ ] 3.2: Implement sun corona particle system
- [ ] 3.3: Add lens flare effect for sun
- [ ] 3.4: Add planet rotation on axis (optional)
- [ ] 3.5: Implement day/night cycle visualization on Earth
- [ ] 3.6: Add subtle shooting stars in background (fun element)
- [ ] 3.7: Optimize effects for performance slider
- [ ] 3.8: Test effects in all 4 visual styles

#### Technical Implementation:

**Atmospheric Glow (Fresnel Shader):**
```javascript
const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});
```

**Sun Corona Particles:**
```javascript
const coronaGeometry = new THREE.BufferGeometry();
const coronaParticles = 1000;
const positions = new Float32Array(coronaParticles * 3);
// Populate with radial positions around sun
const coronaMaterial = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 2,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
```

**Lens Flare:**
```javascript
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';

const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(textureFlare0, 512, 0));
lensflare.addElement(new LensflareElement(textureFlare1, 60, 0.6));
sunMesh.add(lensflare);
```

#### Files to Create/Modify:
- `src/modules/effects.js` - New effects module (atmospheric glow, corona)
- `src/modules/sun.js` - Add lens flare, corona particles
- `src/modules/planets.js` - Add atmosphere to Earth, axial rotation
- `src/utils/shaders.js` - Atmospheric glow shader (new)
- `assets/textures/lensflare0.png` - Lens flare textures (new)

#### Acceptance Criteria:
- [ ] Earth has visible atmospheric glow (blue halo)
- [ ] Sun has corona particle effect
- [ ] Lens flare appears when looking at sun
- [ ] Planet rotation on axis visible (if implemented)
- [ ] Day/night terminator visible on Earth (if implemented)
- [ ] Effects work in all visual styles (or disabled in minimalist)
- [ ] Performance slider can disable effects at low settings
- [ ] No FPS drop > 5fps with all effects enabled

#### Style-Specific Behavior:
- **Realistic:** All effects enabled, subtle and realistic
- **Cartoon:** Effects simplified, more pronounced/playful
- **Neon:** Effects enhanced, high intensity, glowing
- **Minimalist:** Effects disabled or very subtle

---

## Sprint Metrics

- **Total Major Tasks:** 3
- **Estimated Effort:** 12-17 hours total
- **Priority Breakdown:**
  - P1 (High): 2 tasks (Outer Planets, Enhanced ISS)
  - P2 (Medium): 1 task (Visual Effects)
- **Total Subtasks:** 33 subtasks across all tasks

---

## Sprint Dependencies

### Prerequisites (from Sprint 1):
- ✅ Core Three.js infrastructure
- ✅ Solar system orchestrator module
- ✅ Planet orbital mechanics system
- ✅ Visual styles system (4 themes)
- ✅ Performance optimization system
- ✅ UI module with click-to-focus

### New Dependencies for Sprint 2:
- **3D Model Loading:** Need GLTFLoader or OBJLoader
- **Shader System:** Need custom shaders for effects
- **Texture Loading:** Need texture loader for rings, flares
- **LOD System:** Need level-of-detail management

---

## Technical Risks & Mitigations

### Risk 1: Performance Degradation with 8 Planets
**Impact:** High
**Probability:** Medium
**Mitigation:**
- Use geometry caching (already implemented)
- Implement LOD for distant planets
- Optimize update loop (pre-calculate orbital data)
- Test on low-end hardware early

### Risk 2: ISS 3D Model Complexity
**Impact:** Medium
**Probability:** Medium
**Mitigation:**
- Choose optimized model (< 50K triangles)
- Implement LOD system (3 detail levels)
- Use simple model as fallback if detailed model fails to load
- Profile performance before/after to measure impact

### Risk 3: Saturn Ring Rendering
**Impact:** Low
**Probability:** Low
**Mitigation:**
- Use simple RingGeometry first
- Optimize with texture atlas if needed
- Consider shader-based approach for best performance

---

## Definition of Done (Sprint 2)

A task is considered "Done" when:
1. ✅ All subtasks completed and tested
2. ✅ Code is written, commented, and follows style guide
3. ✅ No console errors or warnings
4. ✅ Performance target maintained (60fps on balanced settings)
5. ✅ Works in all 4 visual styles
6. ✅ Tested in Chrome and Firefox
7. ✅ Changes committed to git with clear messages
8. ✅ Task documentation added to COMPLETED.md
9. ✅ No regressions in existing features

---

## Sprint Success Criteria

Sprint 2 will be considered successful when:
- ✅ All 8 planets visible and orbiting correctly
- ✅ Saturn has ring system
- ✅ ISS has detailed 3D model with solar panels
- ✅ Visual effects enhance realism
- ✅ Performance remains smooth (60 FPS on balanced)
- ✅ Camera zoom presets allow viewing full solar system
- ✅ All new features work in 4 visual styles
- ✅ No major bugs or regressions
- ✅ Code quality maintained

---

## Post-Sprint Goals

After Sprint 2 completion:
1. **Testing:** Comprehensive cross-browser testing
2. **Optimization:** Profile and optimize any bottlenecks
3. **Documentation:** Update README with new features
4. **Deployment:** Deploy to GitHub Pages
5. **Sprint 3 Planning:** Plan next features (data accuracy, UX enhancements)

---

## Notes & Ideas

### Camera Preset Implementation Ideas:
```javascript
const CAMERA_PRESETS = {
    innerSystem: {
        position: { x: 0, y: 50, z: 150 },
        target: { x: 0, y: 0, z: 0 },
        description: "View inner planets (Sun to Mars)"
    },
    outerSystem: {
        position: { x: 0, y: 200, z: 800 },
        target: { x: 300, y: 0, z: 0 },
        description: "View outer planets (Jupiter to Neptune)"
    },
    fullSystem: {
        position: { x: 0, y: 500, z: 1500 },
        target: { x: 0, y: 0, z: 0 },
        description: "View entire solar system"
    }
};
```

### Potential Sprint 2 Stretch Goals:
- [ ] Add major moons of Jupiter (Io, Europa, Ganymede, Callisto)
- [ ] Add Pluto (dwarf planet) with highly eccentric orbit
- [ ] Implement asteroid belt visualization (particle system)
- [ ] Add comet with tail effect
- [ ] Implement planet information cards (on hover or click)

---

**Created:** 2025-11-12
**Status:** Ready to start
**Estimated Completion:** 2025-11-14 (2-3 days of focused development)
