/**
 * Loading Manager - Tracks initialization progress and updates loading screen
 * Provides visual feedback during app startup
 */

/**
 * Loading tasks to track
 * Each task has a name, weight (contribution to total progress), and completion status
 */
const loadingTasks = [
    { name: 'Loading Three.js library', weight: 5, completed: false },
    { name: 'Initializing renderer', weight: 10, completed: false },
    { name: 'Creating scene', weight: 5, completed: false },
    { name: 'Setting up camera', weight: 5, completed: false },
    { name: 'Loading starfield', weight: 10, completed: false },
    { name: 'Creating sun', weight: 10, completed: false },
    { name: 'Creating planets', weight: 15, completed: false },
    { name: 'Creating orbits', weight: 10, completed: false },
    { name: 'Creating moon', weight: 5, completed: false },
    { name: 'Initializing ISS', weight: 10, completed: false },
    { name: 'Setting up labels', weight: 5, completed: false },
    { name: 'Configuring controls', weight: 5, completed: false },
    { name: 'Finalizing setup', weight: 5, completed: false }
];

/**
 * DOM elements
 */
let progressFill = null;
let progressPercent = null;
let loadingStatus = null;
let loadingScreen = null;

/**
 * Initialize the loading manager
 */
export function initLoadingManager() {
    // Get DOM elements
    progressFill = document.getElementById('progress-fill');
    progressPercent = document.getElementById('progress-percent');
    loadingStatus = document.getElementById('loading-status');
    loadingScreen = document.getElementById('loading-screen');

    // Verify all elements exist
    if (!progressFill || !progressPercent || !loadingStatus || !loadingScreen) {
        console.warn('⚠️ Loading screen elements not found, loading manager disabled');
        return false;
    }

    console.log('✅ Loading manager initialized');
    return true;
}

/**
 * Complete a loading task by name
 * @param {string} taskName - Name of the task to complete
 */
export function completeTask(taskName) {
    const task = loadingTasks.find(t => t.name === taskName);
    if (task && !task.completed) {
        task.completed = true;
        updateProgress();
        console.log(`✅ Loading: ${taskName}`);
    }
}

/**
 * Update the loading progress bar and percentage
 */
function updateProgress() {
    if (!progressFill || !progressPercent) return;

    // Calculate total progress as weighted average
    const totalWeight = loadingTasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = loadingTasks.reduce((sum, task) =>
        task.completed ? sum + task.weight : sum, 0);

    const progressPercentValue = Math.round((completedWeight / totalWeight) * 100);

    // Update progress bar
    progressFill.style.width = `${progressPercentValue}%`;
    progressPercent.textContent = `${progressPercentValue}%`;

    // Update status message with next task
    const nextTask = loadingTasks.find(t => !t.completed);
    if (nextTask && loadingStatus) {
        loadingStatus.textContent = nextTask.name + '...';
    } else if (loadingStatus) {
        loadingStatus.textContent = 'Ready!';
    }
}

/**
 * Set loading progress manually (0-100)
 * @param {number} percent - Progress percentage (0-100)
 * @param {string} message - Optional status message
 */
export function setProgress(percent, message = null) {
    if (!progressFill || !progressPercent) return;

    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;

    if (message && loadingStatus) {
        loadingStatus.textContent = message;
    }
}

/**
 * Hide the loading screen with fade animation
 */
export function hideLoadingScreen() {
    if (!loadingScreen) return;

    // Set to 100% before hiding
    setProgress(100, 'Complete!');

    // Wait a moment to show 100%, then fade out
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        console.log('✅ Loading screen hidden');

        // Remove from DOM after fade animation completes (500ms transition)
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 300);
}

/**
 * Show loading screen (for reloading)
 */
export function showLoadingScreen() {
    if (!loadingScreen) return;

    loadingScreen.style.display = 'flex';
    loadingScreen.classList.remove('hidden');

    // Reset all tasks
    loadingTasks.forEach(task => task.completed = false);
    setProgress(0, 'Initializing...');

    console.log('✅ Loading screen shown');
}

/**
 * Get current loading progress (0-100)
 * @returns {number} Current progress percentage
 */
export function getCurrentProgress() {
    const totalWeight = loadingTasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = loadingTasks.reduce((sum, task) =>
        task.completed ? sum + task.weight : sum, 0);

    return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Check if all tasks are complete
 * @returns {boolean} True if all loading tasks are complete
 */
export function isLoadingComplete() {
    return loadingTasks.every(task => task.completed);
}

// Export default object
export default {
    initLoadingManager,
    completeTask,
    setProgress,
    hideLoadingScreen,
    showLoadingScreen,
    getCurrentProgress,
    isLoadingComplete
};
