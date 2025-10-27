/**
 * Utility function to generate stable colors for agents
 * This ensures that each agent always gets the same color based on their ID
 */

/**
 * Generates a stable color based on an agent ID
 * @param {string|number} agentId - The unique identifier for the agent
 * @returns {string} - A hex color string
 */
export const generateStableAgentColor = (agentId) => {
    // Generate a stable hash based on agent ID
    let hash = 0;
    const idString = agentId.toString();
    
    for (let i = 0; i < idString.length; i++) {
        hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a pleasant color (avoid too dark or too light colors)
    const hue = Math.abs(hash % 360);
    const saturation = 70 + (Math.abs(hash) % 30); // 70-100%
    const lightness = 45 + (Math.abs(hash) % 20);  // 45-65%
    
    // Convert HSL to hex
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    
    if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
        r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
        r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
        r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Color cache to store generated colors and avoid recalculation
 */
class ColorCache {
    constructor() {
        this.cache = new Map();
    }
    
    getColor(agentId) {
        if (this.cache.has(agentId)) {
            return this.cache.get(agentId);
        }
        
        const color = generateStableAgentColor(agentId);
        this.cache.set(agentId, color);
        return color;
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// Export a singleton instance
export const agentColorCache = new ColorCache();