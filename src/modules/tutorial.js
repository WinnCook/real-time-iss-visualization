/**
 * Tutorial Module - Interactive first-time user guide
 * Shows step-by-step overlay highlighting key features
 */

/**
 * Tutorial steps with instructions and target elements
 */
const tutorialSteps = [
    {
        title: "Welcome to ISS Tracker! 🚀",
        content: "This visualization shows the International Space Station's real-time orbit around Earth, along with the full solar system. Let's take a quick tour!",
        target: null,
        position: "center"
    },
    {
        title: "Camera Controls 🎥",
        content: "<strong>Left Click + Drag:</strong> Rotate camera<br><strong>Right Click + Drag:</strong> Pan<br><strong>Scroll Wheel:</strong> Zoom<br><br>Try moving the camera around now!",
        target: "#canvas-container",
        position: "center"
    },
    {
        title: "Click to Focus 🎯",
        content: "Click on any planet or the ISS to focus the camera on it. The view will smoothly transition to the selected object.",
        target: "#canvas-container",
        position: "center",
        highlight: "earth"
    },
    {
        title: "Time Speed ⏰",
        content: "Adjust how fast time moves. Try <strong>2000x</strong> to see Earth orbit in ~7 minutes, or <strong>100,000x</strong> to see all planets move!",
        target: "#time-speed",
        position: "right"
    },
    {
        title: "Visual Styles 🎨",
        content: "Switch between 4 different visual themes: Realistic, Cartoon, Neon, and Minimalist. Each style has unique colors and effects!",
        target: ".style-buttons",
        position: "right"
    },
    {
        title: "Display Toggles 👁️",
        content: "Show or hide orbits, labels, trails, and stars. Customize your view!",
        target: ".toggles",
        position: "right"
    },
    {
        title: "Object Selector 📍",
        content: "Use the dropdown to quickly jump to any object in the solar system.",
        target: "#object-dropdown",
        position: "left"
    },
    {
        title: "Keyboard Shortcuts ⌨️",
        content: "<strong>Space:</strong> Play/Pause<br><strong>R:</strong> Reset Camera<br><strong>H:</strong> Help<br><strong>F:</strong> Focus Earth<br><strong>I:</strong> Focus ISS<br><strong>O/L/T/S:</strong> Toggle displays<br><strong>1-4:</strong> Switch styles",
        target: null,
        position: "center"
    },
    {
        title: "You're All Set! ✨",
        content: "Explore the solar system and track the ISS in real-time. Have fun!<br><br><em>Press H anytime for help.</em>",
        target: null,
        position: "center"
    }
];

/**
 * Tutorial state
 */
let currentStep = 0;
let tutorialOverlay = null;
let tutorialBox = null;
let isActive = false;

/**
 * Check if user has seen tutorial before
 * @returns {boolean} True if first visit
 */
function isFirstVisit() {
    return !localStorage.getItem('tutorialCompleted');
}

/**
 * Mark tutorial as completed
 */
function markTutorialComplete() {
    localStorage.setItem('tutorialCompleted', 'true');
}

/**
 * Initialize tutorial system
 * @param {boolean} force - Force show tutorial even if already seen
 */
export function initTutorial(force = false) {
    // Only show on first visit (or if forced)
    if (!force && !isFirstVisit()) {
        console.log('✅ Tutorial skipped (already seen)');
        return;
    }

    console.log('🎓 Initializing tutorial...');

    // Create tutorial overlay
    createTutorialOverlay();

    // Wait a moment for scene to load, then show tutorial
    setTimeout(() => {
        showTutorial();
    }, 1000);
}

/**
 * Create tutorial overlay HTML
 */
function createTutorialOverlay() {
    // Create overlay backdrop
    tutorialOverlay = document.createElement('div');
    tutorialOverlay.id = 'tutorial-overlay';
    tutorialOverlay.className = 'tutorial-overlay hidden';

    // Create tutorial box
    tutorialBox = document.createElement('div');
    tutorialBox.className = 'tutorial-box';
    tutorialBox.innerHTML = `
        <div class="tutorial-content">
            <h2 id="tutorial-title"></h2>
            <div id="tutorial-text"></div>
        </div>
        <div class="tutorial-progress">
            <span id="tutorial-step-counter"></span>
        </div>
        <div class="tutorial-buttons">
            <button id="tutorial-skip" class="tutorial-btn-secondary">Skip Tutorial</button>
            <div class="tutorial-nav-buttons">
                <button id="tutorial-prev" class="tutorial-btn-secondary" disabled>Previous</button>
                <button id="tutorial-next" class="tutorial-btn-primary">Next</button>
            </div>
        </div>
    `;

    tutorialOverlay.appendChild(tutorialBox);
    document.body.appendChild(tutorialOverlay);

    // Attach event listeners
    document.getElementById('tutorial-skip').addEventListener('click', skipTutorial);
    document.getElementById('tutorial-prev').addEventListener('click', previousStep);
    document.getElementById('tutorial-next').addEventListener('click', nextStep);

    console.log('✅ Tutorial overlay created');
}

/**
 * Show tutorial and start from step 0
 */
export function showTutorial() {
    if (!tutorialOverlay) {
        console.warn('⚠️ Tutorial overlay not created');
        return;
    }

    currentStep = 0;
    isActive = true;
    tutorialOverlay.classList.remove('hidden');
    updateTutorialStep();
    console.log('✅ Tutorial started');
}

/**
 * Hide tutorial
 */
export function hideTutorial() {
    if (!tutorialOverlay) return;

    isActive = false;
    tutorialOverlay.classList.add('hidden');

    // Remove highlight from any elements
    removeHighlight();

    console.log('✅ Tutorial hidden');
}

/**
 * Update tutorial display for current step
 */
function updateTutorialStep() {
    const step = tutorialSteps[currentStep];

    // Update content
    document.getElementById('tutorial-title').textContent = step.title;
    document.getElementById('tutorial-text').innerHTML = step.content;
    document.getElementById('tutorial-step-counter').textContent =
        `Step ${currentStep + 1} of ${tutorialSteps.length}`;

    // Update button states
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');

    prevBtn.disabled = currentStep === 0;
    nextBtn.textContent = currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next';

    // Position tutorial box
    positionTutorialBox(step);

    // Highlight target element if specified
    if (step.target) {
        highlightElement(step.target);
    } else {
        removeHighlight();
    }
}

/**
 * Position tutorial box based on step configuration
 * @param {Object} step - Tutorial step
 */
function positionTutorialBox(step) {
    tutorialBox.className = 'tutorial-box'; // Reset classes

    if (step.position === 'center') {
        tutorialBox.classList.add('tutorial-box-center');
    } else if (step.position === 'right') {
        tutorialBox.classList.add('tutorial-box-right');
    } else if (step.position === 'left') {
        tutorialBox.classList.add('tutorial-box-left');
    }
}

/**
 * Highlight a target element
 * @param {string} selector - CSS selector for element to highlight
 */
function highlightElement(selector) {
    removeHighlight(); // Remove existing highlight

    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('tutorial-highlight');
    }
}

/**
 * Remove highlight from all elements
 */
function removeHighlight() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
}

/**
 * Go to next tutorial step
 */
function nextStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        updateTutorialStep();
    } else {
        // Tutorial complete
        completeTutorial();
    }
}

/**
 * Go to previous tutorial step
 */
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateTutorialStep();
    }
}

/**
 * Skip tutorial
 */
function skipTutorial() {
    completeTutorial();
}

/**
 * Complete tutorial and mark as seen
 */
function completeTutorial() {
    markTutorialComplete();
    hideTutorial();
    console.log('✅ Tutorial completed');
}

/**
 * Reset tutorial (for testing or user request)
 */
export function resetTutorial() {
    localStorage.removeItem('tutorialCompleted');
    console.log('✅ Tutorial reset - will show on next page load');
}

/**
 * Check if tutorial is currently active
 * @returns {boolean} True if tutorial is showing
 */
export function isTutorialActive() {
    return isActive;
}

// Export default object
export default {
    initTutorial,
    showTutorial,
    hideTutorial,
    resetTutorial,
    isTutorialActive
};
