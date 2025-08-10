/**
 * Vérifie si un point est contenu dans un polygone
 * @param {Object} point - { lat: number, lng: number }
 * @param {Array} polygon - Tableau de coordonnées [[lat, lng], ...]
 * @returns {boolean}
 */
export const isPointInPolygon = (point, polygon) => {
    if (!polygon || !Array.isArray(polygon)) return false;

    const x = point.lat;
    const y = point.lng;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

/**
 * Calcule les limites d'un polygone
 * @param {Array} polygon - Tableau de coordonnées [[lat, lng], ...]
 * @returns {Object|null} - { minLat, maxLat, minLng, maxLng, center }
 */
export const getPolygonBounds = (polygon) => {
    if (!polygon || polygon.length === 0) return null;

    let minLat = polygon[0][0], maxLat = polygon[0][0];
    let minLng = polygon[0][1], maxLng = polygon[0][1];

    polygon.forEach(coord => {
        minLat = Math.min(minLat, coord[0]);
        maxLat = Math.max(maxLat, coord[0]);
        minLng = Math.min(minLng, coord[1]);
        maxLng = Math.max(maxLng, coord[1]);
    });

    return {
        minLat,
        maxLat,
        minLng,
        maxLng,
        center: {
            lat: (minLat + maxLat) / 2,
            lng: (minLng + maxLng) / 2
        }
    };
};

/**
 * Calcule la distance entre deux points en km
 * @param {Object} point1 - { lat: number, lng: number }
 * @param {Object} point2 - { lat: number, lng: number }
 * @returns {number}
 */
export const calculateDistance = (point1, point2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) *
        Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};