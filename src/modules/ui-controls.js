/**
 * UI Controls Module - Time, Performance, and Display Controls
 * Manages sliders, buttons, and toggles for user controls
 * Extracted from monolithic ui.js for better maintainability
 */

import { timeManager } from '../utils/time.js';
import { setOrbitsVisible } from './orbits.js';
import { setLabelsVisible } from './labels.js';
import { setISSTrailVisible } from './iss.js';
import { setStarfieldVisible } from './starfield.js';
import { setCoronaEnabled } from './sunCorona.js';
import { setSunLensFlareEnabled } from './sun.js';
import { setPerformanceLevel, getPerformanceSettings } from './performanceSlider.js';
import { setMeteorFrequency, getMeteorFrequencyLabel } from './shootingStars.js';
import { updatePlanetSizeMode } from './planets.js';
import { playClickSound, playToggleSound } from '../utils/sounds.js';

/**
 * References to app state (set during initialization)
 */
let appRenderer = null;
let recreateObjectsCallback = null;

/**
 * Performance slider debounce timer
 */
let sliderDebounceTimer = null;

/**
 * Currently locked object state (for re-locking after size mode change)
 */
let lockedObjectState = null;

/**
 * Callback to update Real-Time View button state
 */
let updateRealTimeViewButtonCallback = null;

/**
 * Initialize controls module
 * @param {Object} options - Initialization options
 * @param {THREE.Renderer} options.renderer - Three.js renderer
 * @param {Function} options.recreateObjects - Callback to recreate celestial objects
 * @param {Function} options.updateRealTimeViewButton - Callback to update real-time view button
 * @param {Function} options.getLockedObjectState - Callback to get locked object state
 * @param {Function} options.setLockedObjectState - Callback to set locked object state
 */
export function initControls(options) {
    appRenderer = options.renderer;
    recreateObjectsCallback = options.recreateObjects;
    updateRealTimeViewButtonCallback = options.updateRealTimeViewButton;

    // Set up all control event listeners
    setupTimeControls();
    setupPerformanceControls();
    setupMeteorFrequencyControl();
    setupDisplayToggles();
    setupSizeModeButtons(options.getLockedObjectState, options.setLockedObjectState);

    console.log('✅ UI Controls initialized');
}

/**
 * Setup time speed controls
 */
function setupTimeControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (timeManager.isPausedState()) {
                timeManager.play();
                playPauseBtn.textContent = '⏸ Pause';
            } else {
                timeManager.pause();
                playPauseBtn.textContent = '▶️ Play';
            }
        });
    }

    // Time speed slider
    const timeSpeedSlider = document.getElementById('time-speed');
    const speedValue = document.getElementById('speed-value');
    if (timeSpeedSlider && speedValue) {
        // Set initial values
        timeSpeedSlider.value = 100000;
        speedValue.textContent = '100000x';

        timeSpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            timeManager.setTimeSpeed(speed);
            speedValue.textContent = `${speed}x`;

            // Update Real-Time View button state
            if (updateRealTimeViewButtonCallback) {
                updateRealTimeViewButtonCallback();
            }
        });
    }

    // Preset speed buttons
    const presetButtons = document.querySelectorAll('.preset-speeds button');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const speed = parseInt(button.dataset.speed);
            timeManager.setTimeSpeed(speed);
            if (timeSpeedSlider) timeSpeedSlider.value = speed;
            if (speedValue) speedValue.textContent = `${speed}x`;

            // Update Real-Time View button state
            if (updateRealTimeViewButtonCallback) {
                updateRealTimeViewButtonCallback();
            }
        });
    });

    // Time Travel slider
    const timeTravelSlider = document.getElementById('time-travel-slider');
    const timeTravelYear = document.getElementById('time-travel-year');
    const jumpToDateBtn = document.getElementById('jump-to-date-btn');

    if (timeTravelSlider && timeTravelYear) {
        // Update year display as slider moves
        timeTravelSlider.addEventListener('input', (e) => {
            const decimalYear = parseFloat(e.target.value);
            const year = Math.floor(decimalYear);
            const monthFraction = (decimalYear - year) * 12;
            const month = Math.floor(monthFraction) + 1;

            // Format display with month if not January
            if (month > 1) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                timeTravelYear.textContent = `${monthNames[month - 1]} ${year}`;
            } else {
                timeTravelYear.textContent = `${year}`;
            }
        });

        // Jump to selected date when button is clicked
        if (jumpToDateBtn) {
            jumpToDateBtn.addEventListener('click', () => {
                const decimalYear = parseFloat(timeTravelSlider.value);
                const targetDate = timeManager.getDateFromDecimalYear(decimalYear);

                // Set the simulation date
                timeManager.setSimulationDate(targetDate);

                // Set time speed to 1x for better viewing
                timeManager.setTimeSpeed(1);

                // Update UI elements
                const speedSlider = document.getElementById('time-speed');
                const speedValue = document.getElementById('speed-value');
                if (speedSlider) speedSlider.value = 1;
                if (speedValue) speedValue.textContent = '1x';

                // Update Real-Time View button state
                if (updateRealTimeViewButtonCallback) {
                    updateRealTimeViewButtonCallback();
                }

                // Play click sound
                playClickSound();

                console.log(`🕰️ Time travel to: ${targetDate.toISOString()}`);
            });
        }
    }
}

/**
 * Setup performance slider
 */
function setupPerformanceControls() {
    const performanceSlider = document.getElementById('performance-slider');
    const performanceValue = document.getElementById('performance-value');

    if (performanceSlider && performanceValue) {
        performanceSlider.addEventListener('input', (e) => {
            const level = parseInt(e.target.value);

            // Update performance level immediately (renderer settings only)
            if (appRenderer) {
                const settings = setPerformanceLevel(level, appRenderer);

                // Update display
                performanceValue.textContent = `${settings.description}`;
            }

            // Debounce object recreation (wait 500ms after user stops moving slider)
            clearTimeout(sliderDebounceTimer);
            sliderDebounceTimer = setTimeout(() => {
                console.log(`🎨 Recreating objects for performance level: ${level}%`);
                if (recreateObjectsCallback) {
                    recreateObjectsCallback();
                }
            }, 500);
        });

        // Set initial value
        const initialSettings = getPerformanceSettings(50);
        performanceValue.textContent = `${initialSettings.description}`;
    }
}

/**
 * Setup meteor frequency slider
 */
function setupMeteorFrequencyControl() {
    const slider = document.getElementById('meteor-frequency');
    const valueDisplay = document.getElementById('meteor-frequency-value');

    if (slider && valueDisplay) {
        // Set initial display
        valueDisplay.textContent = getMeteorFrequencyLabel();

        // Add event listener
        slider.addEventListener('input', (e) => {
            const frequency = parseInt(e.target.value);
            setMeteorFrequency(frequency);
            valueDisplay.textContent = getMeteorFrequencyLabel();
            playToggleSound();
            console.log(`🌠 Meteor frequency: ${frequency}% (${getMeteorFrequencyLabel()})`);
        });
    }
}

/**
 * Setup display toggle checkboxes
 */
function setupDisplayToggles() {
    // Orbits toggle
    const toggleOrbits = document.getElementById('toggle-orbits');
    if (toggleOrbits) {
        toggleOrbits.addEventListener('change', (e) => {
            setOrbitsVisible(e.target.checked);
            playToggleSound();
            console.log(`🌐 Orbits ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Trails toggle (ISS trail)
    const toggleTrails = document.getElementById('toggle-trails');
    if (toggleTrails) {
        toggleTrails.addEventListener('change', (e) => {
            setISSTrailVisible(e.target.checked);
            playToggleSound();
            console.log(`✨ Trails ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Labels toggle
    const toggleLabels = document.getElementById('toggle-labels');
    if (toggleLabels) {
        toggleLabels.addEventListener('change', (e) => {
            setLabelsVisible(e.target.checked);
            playToggleSound();
            console.log(`🏷️ Labels ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Stars toggle
    const toggleStars = document.getElementById('toggle-stars');
    if (toggleStars) {
        toggleStars.addEventListener('change', (e) => {
            setStarfieldVisible(e.target.checked);
            playToggleSound();
            console.log(`⭐ Stars ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Sun Corona toggle
    const toggleCorona = document.getElementById('toggle-corona');
    if (toggleCorona) {
        toggleCorona.addEventListener('change', (e) => {
            setCoronaEnabled(e.target.checked);
            playToggleSound();
            console.log(`🌟 Sun Corona ${e.target.checked ? 'enabled' : 'disabled'}`);
        });
    }

    // Atmosphere toggle
    const toggleAtmosphere = document.getElementById('toggle-atmosphere');
    if (toggleAtmosphere) {
        toggleAtmosphere.addEventListener('change', (e) => {
            import('./atmosphere.js').then(({ setAtmosphereVisible }) => {
                setAtmosphereVisible(e.target.checked);
                playToggleSound();
                console.log(`🌍 Atmosphere ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        });
    }

    // Lens Flare toggle
    const toggleLensFlare = document.getElementById('toggle-lens-flare');
    if (toggleLensFlare) {
        toggleLensFlare.addEventListener('change', (e) => {
            setSunLensFlareEnabled(e.target.checked);
            playToggleSound();
            console.log(`✨ Lens Flare ${e.target.checked ? 'enabled' : 'disabled'}`);
        });
    }

    // Asteroid belt toggle
    const toggleAsteroidBelt = document.getElementById('toggle-asteroid-belt');
    if (toggleAsteroidBelt) {
        toggleAsteroidBelt.addEventListener('change', (e) => {
            import('./solarSystem.js').then(({ toggleAsteroidBelt }) => {
                toggleAsteroidBelt(e.target.checked);
                playToggleSound();
                console.log(`☄️ Asteroid Belt ${e.target.checked ? 'shown' : 'hidden'}`);
            });
        });
    }

    // Orbital markers toggle (perihelion/aphelion)
    const toggleOrbitalMarkersCheckbox = document.getElementById('toggle-orbital-markers');
    if (toggleOrbitalMarkersCheckbox) {
        toggleOrbitalMarkersCheckbox.addEventListener('change', (e) => {
            import('./solarSystem.js').then(({ toggleOrbitalMarkers }) => {
                toggleOrbitalMarkers(e.target.checked);
                playToggleSound();
                console.log(`🎯 Orbital Markers ${e.target.checked ? 'shown' : 'hidden'}`);
            });
        });
    }

    // Sounds toggle
    const toggleSounds = document.getElementById('toggle-sounds');
    if (toggleSounds) {
        toggleSounds.addEventListener('change', (e) => {
            import('../utils/sounds.js').then(({ setSoundsEnabled }) => {
                setSoundsEnabled(e.target.checked);
                if (e.target.checked) {
                    // Play a test sound when enabling
                    playClickSound();
                }
                console.log(`🔊 Sounds ${e.target.checked ? 'enabled' : 'muted'}`);
            });
        });
    }
}

/**
 * Setup planet size mode radio buttons
 * @param {Function} getLockedObjectState - Callback to get locked object state
 * @param {Function} setLockedObjectState - Callback to set locked object state
 */
function setupSizeModeButtons(getLockedObjectState, setLockedObjectState) {
    const sizeModeBtns = document.querySelectorAll('.size-mode-btn');
    const radioButtons = document.querySelectorAll('input[name="size-mode"]');

    // Handle radio button changes
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                const mode = e.target.value; // 'enlarged' or 'real'

                playToggleSound();

                // Update visual state of buttons
                sizeModeBtns.forEach(btn => btn.classList.remove('active'));
                e.target.closest('.size-mode-btn').classList.add('active');

                // Save camera lock state before size change
                const lockedState = getLockedObjectState ? getLockedObjectState() : null;

                // Update planet sizes
                updatePlanetSizeMode(mode);

                // Restore camera lock after size change
                if (lockedState && setLockedObjectState) {
                    setTimeout(() => {
                        setLockedObjectState(lockedState);
                    }, 100); // Small delay to ensure objects are recreated
                }

                console.log(`📏 Planet size mode: ${mode.toUpperCase()}`);

                // Show helpful notification for real mode
                if (mode === 'real') {
                    import('./ui-panels.js').then(({ showNotification }) => {
                        showNotification('🔬 Real Proportions Active',
                            'Planets now show accurate size ratios! The Sun is massive (~230 units radius), Earth is ~2 units. Zoom in to see them. Note: ISS marker is not to scale.');
                    });
                }
            }
        });
    });

    // Also handle label clicks
    sizeModeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                const radio = btn.querySelector('input[type="radio"]');
                if (radio && !radio.checked) {
                    radio.click();
                }
            }
        });
    });
}

/**
 * Dispose controls module (cleanup)
 */
export function disposeControls() {
    // Clear debounce timer
    if (sliderDebounceTimer) {
        clearTimeout(sliderDebounceTimer);
        sliderDebounceTimer = null;
    }

    // Reset references
    appRenderer = null;
    recreateObjectsCallback = null;
    updateRealTimeViewButtonCallback = null;

    console.log('✅ UI Controls disposed');
}
