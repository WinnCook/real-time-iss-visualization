/**
 * Sun Corona Particle System
 *
 * Creates dynamic particle effects around the sun including:
 * - Continuous corona particles
 * - Solar flare eruptions
 * - Plasma ejections
 * - Style-aware rendering
 */

// THREE.js is available globally from CDN
import { getCurrentStyleKey } from './styles.js';
import { SUN_RADIUS, scaleRadius } from '../utils/constants.js';

// Corona configuration by visual style
const CORONA_CONFIGS = {
    realistic: {
        particleCount: 3000,
        particleSize: 0.8,
        particleLife: 4000,
        emissionRate: 50,
        velocityMin: 0.3,
        velocityMax: 1.5,
        turbulence: 0.2,
        colors: [0xffff00, 0xffa500, 0xff8c00],
        opacity: 0.6,
        flareFrequency: 20000, // ms between flares
        enabled: true
    },
    cartoon: {
        particleCount: 1500,
        particleSize: 1.2,
        particleLife: 3000,
        emissionRate: 30,
        velocityMin: 0.5,
        velocityMax: 2.0,
        turbulence: 0.1,
        colors: [0xffff00, 0xffd700],
        opacity: 0.8,
        flareFrequency: 15000,
        enabled: true
    },
    neon: {
        particleCount: 5000,
        particleSize: 1.0,
        particleLife: 5000,
        emissionRate: 100,
        velocityMin: 0.5,
        velocityMax: 3.0,
        turbulence: 0.4,
        colors: [0xffff00, 0xff00ff, 0x00ffff],
        opacity: 0.9,
        flareFrequency: 10000,
        enabled: true
    },
    minimalist: {
        particleCount: 500,
        particleSize: 0.5,
        particleLife: 6000,
        emissionRate: 10,
        velocityMin: 0.2,
        velocityMax: 0.8,
        turbulence: 0.05,
        colors: [0xffcc00],
        opacity: 0.3,
        flareFrequency: 30000,
        enabled: false // Disabled by default in minimalist
    }
};

class CoronaParticle {
    constructor(config, sunRadius) {
        // Starting position on sun surface
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        this.position = new THREE.Vector3(
            sunRadius * Math.sin(phi) * Math.cos(theta),
            sunRadius * Math.sin(phi) * Math.sin(theta),
            sunRadius * Math.cos(phi)
        );

        // Velocity outward from sun
        const speed = config.velocityMin + Math.random() * (config.velocityMax - config.velocityMin);
        this.velocity = this.position.clone().normalize().multiplyScalar(speed);

        // Add some turbulence
        this.velocity.x += (Math.random() - 0.5) * config.turbulence;
        this.velocity.y += (Math.random() - 0.5) * config.turbulence;
        this.velocity.z += (Math.random() - 0.5) * config.turbulence;

        // Particle properties
        this.life = config.particleLife;
        this.maxLife = config.particleLife;
        this.size = config.particleSize * (0.5 + Math.random() * 0.5);
        this.colorIndex = Math.floor(Math.random() * config.colors.length);
        this.opacity = config.opacity;
    }

    update(deltaTime) {
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * 0.001));

        // Decrease life
        this.life -= deltaTime;

        // Fade out as particle dies
        const lifeRatio = this.life / this.maxLife;
        this.currentOpacity = this.opacity * lifeRatio;

        // Slow down over time (drag)
        this.velocity.multiplyScalar(0.99);

        return this.life > 0;
    }
}

class SolarFlare {
    constructor(config, sunRadius) {
        // Flare erupts from a specific point
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.2; // Middle latitudes

        this.origin = new THREE.Vector3(
            sunRadius * Math.sin(phi) * Math.cos(theta),
            sunRadius * Math.sin(phi) * Math.sin(theta),
            sunRadius * Math.cos(phi)
        );

        // Create burst of particles
        this.particles = [];
        const flareParticleCount = 100 + Math.floor(Math.random() * 100);

        for (let i = 0; i < flareParticleCount; i++) {
            const particle = new CoronaParticle(config, sunRadius);
            // Override position to flare origin
            particle.position = this.origin.clone();
            // Increase velocity for dramatic effect
            particle.velocity.multiplyScalar(2.0 + Math.random());
            particle.life = config.particleLife * 1.5; // Flare particles last longer
            particle.maxLife = particle.life;
            this.particles.push(particle);
        }

        this.active = true;
    }

    update(deltaTime) {
        this.particles = this.particles.filter(p => p.update(deltaTime));
        this.active = this.particles.length > 0;
        return this.active;
    }
}

let coronaSystem = null;
let particleGeometry = null;
let particleMaterial = null;
let particles = [];
let flares = [];
let lastFlareTime = 0;
let coronaEnabled = true;
let sunMesh = null;

/**
 * Initialize the sun corona particle system
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Mesh} sun - The sun mesh
 */
export function initSunCorona(scene, sun) {
    sunMesh = sun;
    const style = getCurrentStyleKey();
    const config = CORONA_CONFIGS[style];

    if (!config.enabled || !coronaEnabled) {
        return;
    }

    // Get sun radius in scene units
    const sunRadius = scaleRadius(SUN_RADIUS, 'sun') * 1.1; // Slightly larger than sun surface

    // Create particle geometry
    const positions = new Float32Array(config.particleCount * 3);
    const colors = new Float32Array(config.particleCount * 3);
    const sizes = new Float32Array(config.particleCount);
    const opacities = new Float32Array(config.particleCount);

    particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    // Create particle material with custom shader
    particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute float opacity;
            varying vec3 vColor;
            varying float vOpacity;

            void main() {
                vColor = color;
                vOpacity = opacity;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vOpacity;

            void main() {
                // Create circular particle
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(gl_PointCoord, center);

                if (dist > 0.5) {
                    discard;
                }

                // Soft edges
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                alpha *= vOpacity;

                // Glow effect
                vec3 glowColor = vColor * (1.0 + (1.0 - dist) * 0.5);

                gl_FragColor = vec4(glowColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    // Create particle system mesh
    coronaSystem = new THREE.Points(particleGeometry, particleMaterial);
    coronaSystem.frustumCulled = false;
    scene.add(coronaSystem);

    // Initialize particles
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new CoronaParticle(config, sunRadius));
        // Stagger initial particle creation
        particles[i].life = Math.random() * config.particleLife;
        particles[i].maxLife = config.particleLife;
    }
}

/**
 * Update the corona particle system
 * @param {number} deltaTime - Time since last frame in milliseconds
 */
export function updateSunCorona(deltaTime) {
    if (!coronaSystem || !coronaEnabled) return;

    const style = getCurrentStyleKey();
    const config = CORONA_CONFIGS[style];

    if (!config.enabled) {
        if (coronaSystem.visible) {
            coronaSystem.visible = false;
        }
        return;
    }

    coronaSystem.visible = true;

    // Get sun radius
    const sunRadius = scaleRadius(SUN_RADIUS, 'sun') * 1.1;

    // Update existing particles
    particles = particles.filter(p => p.update(deltaTime));

    // Spawn new particles to maintain count
    const particlesToSpawn = Math.min(
        config.emissionRate * deltaTime * 0.001,
        config.particleCount - particles.length
    );

    for (let i = 0; i < particlesToSpawn; i++) {
        particles.push(new CoronaParticle(config, sunRadius));
    }

    // Check for solar flare
    const now = Date.now();
    if (now - lastFlareTime > config.flareFrequency) {
        flares.push(new SolarFlare(config, sunRadius));
        lastFlareTime = now;
    }

    // Update flares
    flares = flares.filter(f => f.update(deltaTime));

    // Combine all particles for rendering
    const allParticles = [...particles];
    flares.forEach(flare => {
        allParticles.push(...flare.particles);
    });

    // Update geometry attributes
    const positions = particleGeometry.attributes.position.array;
    const colors = particleGeometry.attributes.color.array;
    const sizes = particleGeometry.attributes.size.array;
    const opacities = particleGeometry.attributes.opacity.array;

    for (let i = 0; i < config.particleCount; i++) {
        if (i < allParticles.length) {
            const particle = allParticles[i];

            // Position
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;

            // Color
            const color = new THREE.Color(config.colors[particle.colorIndex]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Size and opacity
            sizes[i] = particle.size;
            opacities[i] = particle.currentOpacity || particle.opacity;
        } else {
            // Hide unused particles
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            sizes[i] = 0;
            opacities[i] = 0;
        }
    }

    // Mark attributes as needing update
    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.color.needsUpdate = true;
    particleGeometry.attributes.size.needsUpdate = true;
    particleGeometry.attributes.opacity.needsUpdate = true;

    // Update time uniform for shader animation
    if (particleMaterial.uniforms.time) {
        particleMaterial.uniforms.time.value += deltaTime * 0.001;
    }
}

/**
 * Set corona enabled state
 * @param {boolean} enabled - Whether corona should be visible
 */
export function setCoronaEnabled(enabled) {
    coronaEnabled = enabled;
    if (coronaSystem) {
        coronaSystem.visible = enabled && CORONA_CONFIGS[getCurrentStyleKey()].enabled;
    }
}

/**
 * Get corona enabled state
 * @returns {boolean} Whether corona is enabled
 */
export function getCoronaEnabled() {
    return coronaEnabled;
}

/**
 * Dispose of corona resources
 */
export function disposeSunCorona() {
    if (coronaSystem) {
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();
        if (coronaSystem.parent) {
            coronaSystem.parent.remove(coronaSystem);
        }
        coronaSystem = null;
    }

    particles = [];
    flares = [];
    lastFlareTime = 0;
}

/**
 * Recreate corona with new style
 * @param {THREE.Scene} scene - The Three.js scene
 */
export function recreateSunCorona(scene) {
    disposeSunCorona();
    if (sunMesh) {
        initSunCorona(scene, sunMesh);
    }
}

// Export for use in other modules
export default {
    initSunCorona,
    updateSunCorona,
    setCoronaEnabled,
    getCoronaEnabled,
    disposeSunCorona,
    recreateSunCorona
};