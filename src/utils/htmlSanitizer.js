/**
 * HTML Sanitization Utilities
 *
 * SECURITY: Provides functions to safely handle user input and API data
 * to prevent XSS (Cross-Site Scripting) attacks.
 *
 * @module utils/htmlSanitizer
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 *
 * @param {string} unsafe - Potentially unsafe string from user input or API
 * @returns {string} Safe HTML-escaped string
 *
 * @example
 * escapeHTML('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHTML(unsafe) {
    if (typeof unsafe !== 'string') {
        return String(unsafe);
    }

    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Creates a safe HTML element with escaped text content
 * Alternative to innerHTML for dynamic content
 *
 * @param {string} tag - HTML tag name (e.g., 'div', 'span', 'p')
 * @param {string} text - Text content (will be escaped)
 * @param {Object} attributes - Optional attributes to set
 * @returns {HTMLElement} Safe DOM element
 *
 * @example
 * const safeDiv = createSafeElement('div', userInput, { class: 'message' });
 */
export function createSafeElement(tag, text, attributes = {}) {
    const element = document.createElement(tag);
    element.textContent = text; // Safe: textContent auto-escapes

    // Apply attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'class') {
            element.className = value;
        } else if (key === 'style') {
            // For style, we need to be careful
            if (typeof value === 'string') {
                element.style.cssText = value;
            } else {
                Object.assign(element.style, value);
            }
        } else {
            element.setAttribute(key, value);
        }
    }

    return element;
}

/**
 * Safely sets innerHTML with escaped values
 * Use this when you need HTML structure but have dynamic values
 *
 * @param {HTMLElement} element - Target element
 * @param {string} htmlTemplate - HTML template with {{placeholders}}
 * @param {Object} values - Values to escape and insert
 *
 * @example
 * safeSetHTML(div, '<strong>{{name}}</strong>: {{message}}', {
 *     name: userInput,
 *     message: apiData
 * });
 */
export function safeSetHTML(element, htmlTemplate, values) {
    let safeHTML = htmlTemplate;

    for (const [key, value] of Object.entries(values)) {
        const placeholder = `{{${key}}}`;
        const escapedValue = escapeHTML(value);
        safeHTML = safeHTML.replace(new RegExp(placeholder, 'g'), escapedValue);
    }

    element.innerHTML = safeHTML;
}

/**
 * Validates that a string contains only safe characters
 * Useful for object names, IDs, etc. from API
 *
 * @param {string} input - String to validate
 * @returns {boolean} True if safe (alphanumeric + basic punctuation)
 */
export function isSafeString(input) {
    if (typeof input !== 'string') return false;

    // Allow alphanumeric, spaces, and basic punctuation
    const safePattern = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
    return safePattern.test(input);
}
