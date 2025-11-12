/**
 * Sound Effects Module - Optional audio feedback for interactions
 * Uses Web Audio API to generate simple tones (no external audio files needed)
 */

/**
 * Audio context for sound generation
 */
let audioContext = null;

/**
 * Master volume (0.0 to 1.0)
 */
let masterVolume = 0.3;

/**
 * Sound enabled state
 */
let soundsEnabled = false;

/**
 * Initialize sound system
 */
export function initSounds() {
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('soundsEnabled');
    soundsEnabled = savedPreference === 'true';

    // Create audio context (lazy initialization on first sound)
    if (soundsEnabled) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Sound system initialized (enabled)');
        } catch (error) {
            console.warn('⚠️ Web Audio API not supported:', error);
            soundsEnabled = false;
        }
    } else {
        console.log('✅ Sound system initialized (muted by default)');
    }
}

/**
 * Enable or disable sounds
 * @param {boolean} enabled - Whether sounds should be enabled
 */
export function setSoundsEnabled(enabled) {
    soundsEnabled = enabled;
    localStorage.setItem('soundsEnabled', enabled.toString());

    // Initialize audio context if enabling for first time
    if (enabled && !audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Sounds enabled');
        } catch (error) {
            console.warn('⚠️ Web Audio API not supported:', error);
            soundsEnabled = false;
        }
    } else if (!enabled) {
        console.log('🔇 Sounds muted');
    }
}

/**
 * Get current sound enabled state
 * @returns {boolean}
 */
export function isSoundsEnabled() {
    return soundsEnabled;
}

/**
 * Set master volume
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export function setMasterVolume(volume) {
    masterVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Play a simple tone
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0.0 to 1.0)
 * @param {string} waveType - Wave type (sine, square, sawtooth, triangle)
 */
function playTone(frequency, duration, volume = 0.5, waveType = 'sine') {
    if (!soundsEnabled || !audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = waveType;

        // Apply volume
        gainNode.gain.value = volume * masterVolume;

        // Fade out to avoid click
        gainNode.gain.setValueAtTime(volume * masterVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('⚠️ Sound playback error:', error);
    }
}

/**
 * Play click sound (for UI interactions)
 */
export function playClickSound() {
    playTone(800, 0.05, 0.2, 'sine');
}

/**
 * Play focus sound (when focusing on object)
 */
export function playFocusSound() {
    playTone(600, 0.1, 0.25, 'sine');
    setTimeout(() => playTone(800, 0.1, 0.2, 'sine'), 50);
}

/**
 * Play toggle sound (for switches)
 */
export function playToggleSound() {
    playTone(1000, 0.05, 0.15, 'square');
}

/**
 * Play screenshot sound
 */
export function playScreenshotSound() {
    playTone(1200, 0.05, 0.2, 'sine');
    setTimeout(() => playTone(1000, 0.05, 0.15, 'sine'), 30);
}

/**
 * Play style change sound
 */
export function playStyleChangeSound() {
    playTone(500, 0.08, 0.2, 'triangle');
    setTimeout(() => playTone(700, 0.08, 0.2, 'triangle'), 40);
    setTimeout(() => playTone(900, 0.08, 0.2, 'triangle'), 80);
}

/**
 * Play time speed change sound (subtle whoosh)
 */
export function playTimeSpeedSound() {
    playTone(400, 0.06, 0.15, 'sawtooth');
}

/**
 * Play error sound
 */
export function playErrorSound() {
    playTone(200, 0.2, 0.3, 'sawtooth');
}

/**
 * Play success sound
 */
export function playSuccessSound() {
    playTone(800, 0.08, 0.2, 'sine');
    setTimeout(() => playTone(1000, 0.08, 0.2, 'sine'), 60);
    setTimeout(() => playTone(1200, 0.12, 0.25, 'sine'), 120);
}

// Export default object
export default {
    initSounds,
    setSoundsEnabled,
    isSoundsEnabled,
    setMasterVolume,
    playClickSound,
    playFocusSound,
    playToggleSound,
    playScreenshotSound,
    playStyleChangeSound,
    playTimeSpeedSound,
    playErrorSound,
    playSuccessSound
};
