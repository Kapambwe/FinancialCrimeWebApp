/**
 * Operational Movement Tracker JavaScript Interop
 * Provides clean method mappings for movement tracking, map, and timeline visualization
 */

// Initialize movement map with routes
export function initializeMovementMap(containerId, routes, individuals) {
    try {
        // Destroy existing map if it exists
        if (window.movementMap) {
            window.movementMap.destroy();
            window.movementMap = null;
        }

        const movementMap = new GeoMapViz(containerId, { center: [50, 10], zoom: 5 });

        // Add markers for tracked individuals
        if (individuals && individuals.length > 0) {
            movementMap.addMarkers(individuals);
        }

        // Add routes
        if (routes && routes.length > 0) {
            routes.forEach(route => {
                movementMap.drawRoute(route.waypoints, {
                    color: route.color,
                    weight: 3,
                    label: route.label,
                    showDirection: true
                });
            });
        }

        window.movementMap = movementMap;

        console.log('Movement map initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing movement map:', error);
        return false;
    }
}

// Initialize movement timeline
export function initializeMovementTimeline(containerId, timelineData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const movementTimeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 250
        });
        movementTimeline.loadData(timelineData);
        window.movementTimeline = movementTimeline;

        console.log('Movement timeline initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing movement timeline:', error);
        return false;
    }
}

// Draw entity path on movement map
export function drawEntityPath(pathData, options) {
    try {
        if (window.movementMap && typeof window.movementMap.drawRoute === 'function') {
            window.movementMap.drawRoute(pathData, options);
            console.log('Entity path drawn on movement map');
            return true;
        } else {
            console.warn('Movement map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error drawing entity path:', error);
        return false;
    }
}

// Add marker to movement map
export function addMovementMarker(markerData) {
    try {
        if (window.movementMap && typeof window.movementMap.addMarker === 'function') {
            window.movementMap.addMarker(markerData);
            console.log('Marker added to movement map');
            return true;
        } else {
            console.warn('Movement map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error adding marker:', error);
        return false;
    }
}

// Play movement timeline
export function playMovementTimeline() {
    try {
        if (window.movementTimeline && typeof window.movementTimeline.play === 'function') {
            window.movementTimeline.play();
            console.log('Movement timeline playing');
            return true;
        } else {
            console.warn('Movement timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause movement timeline
export function pauseMovementTimeline() {
    try {
        if (window.movementTimeline && typeof window.movementTimeline.pause === 'function') {
            window.movementTimeline.pause();
            console.log('Movement timeline paused');
            return true;
        } else {
            console.warn('Movement timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop movement timeline
export function stopMovementTimeline() {
    try {
        if (window.movementTimeline && typeof window.movementTimeline.stop === 'function') {
            window.movementTimeline.stop();
            console.log('Movement timeline stopped');
            return true;
        } else {
            console.warn('Movement timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Reset movement timeline
export function resetMovementTimeline() {
    try {
        if (window.movementTimeline && typeof window.movementTimeline.reset === 'function') {
            window.movementTimeline.reset();
            console.log('Movement timeline reset');
            return true;
        } else {
            console.warn('Movement timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error resetting timeline:', error);
        return false;
    }
}

// Destroy movement visualizations
export function destroyMovementVisualizations() {
    try {
        if (window.movementMap) {
            window.movementMap.destroy();
            window.movementMap = null;
        }

        if (window.movementTimeline) {
            window.movementTimeline.destroy();
            window.movementTimeline = null;
        }

        console.log('Movement visualizations destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying visualizations:', error);
        return false;
    }
}

// Check if movement map is initialized
export function isMovementMapInitialized() {
    return window.movementMap !== undefined && window.movementMap !== null;
}

// Check if movement timeline is initialized
export function isMovementTimelineInitialized() {
    return window.movementTimeline !== undefined && window.movementTimeline !== null;
}
