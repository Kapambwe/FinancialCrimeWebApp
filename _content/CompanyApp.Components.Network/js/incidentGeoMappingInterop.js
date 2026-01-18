/**
 * Incident Geo Mapping JavaScript Interop
 * Provides clean method mappings for incident mapping and timeline visualization
 */

// Initialize incident map with markers
export function initializeIncidentMap(containerId, mapData) {
    try {
        // Destroy existing map if it exists
        if (window.incidentMap) {
            window.incidentMap.destroy();
            window.incidentMap = null;
        }

        const incidentMap = new GeoMapViz(containerId, { center: [51.5074, -0.1278], zoom: 12 });
        incidentMap.addMarkers(mapData);
        window.incidentMap = incidentMap;

        console.log('Incident map initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing incident map:', error);
        return false;
    }
}

// Initialize incident timeline
export function initializeIncidentTimeline(containerId, timelineData) {
    try {
        // Destroy existing timeline if it exists
        if (window.incidentTimeline) {
            window.incidentTimeline.destroy();
            window.incidentTimeline = null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const incidentTimeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 250
        });
        incidentTimeline.loadData(timelineData);
        window.incidentTimeline = incidentTimeline;

        console.log('Incident timeline initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing incident timeline:', error);
        return false;
    }
}

// Add heatmap to incident map
export function addIncidentHeatmap(heatmapData) {
    try {
        if (window.incidentMap && typeof window.incidentMap.addHeatmap === 'function') {
            window.incidentMap.removeHeatmap();
            window.incidentMap.addHeatmap(heatmapData);
            console.log('Heatmap added to incident map');
            return true;
        } else {
            console.warn('Incident map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error adding heatmap:', error);
        return false;
    }
}

// Remove heatmap from incident map
export function removeIncidentHeatmap() {
    try {
        if (window.incidentMap && typeof window.incidentMap.removeHeatmap === 'function') {
            window.incidentMap.removeHeatmap();
            console.log('Heatmap removed from incident map');
            return true;
        } else {
            console.warn('Incident map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error removing heatmap:', error);
        return false;
    }
}

// Enable draw mode on incident map
export function enableIncidentDrawMode() {
    try {
        if (window.incidentMap && typeof window.incidentMap.enableDrawMode === 'function') {
            window.incidentMap.enableDrawMode();
            console.log('Draw mode enabled on incident map');
            return true;
        } else {
            console.warn('Incident map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error enabling draw mode:', error);
        return false;
    }
}

// Clear hotspots from incident map
export function clearIncidentHotspots() {
    try {
        if (window.incidentMap && typeof window.incidentMap.clearHotspots === 'function') {
            window.incidentMap.clearHotspots();
            console.log('Hotspots cleared from incident map');
            return true;
        } else {
            console.warn('Incident map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error clearing hotspots:', error);
        return false;
    }
}

// Draw patrol route on incident map
export function drawPatrolRoute(routeData, options) {
    try {
        if (window.incidentMap && typeof window.incidentMap.drawRoute === 'function') {
            window.incidentMap.drawRoute(routeData, options);
            console.log('Patrol route drawn on incident map');
            return true;
        } else {
            console.warn('Incident map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error drawing patrol route:', error);
        return false;
    }
}

// Play incident timeline
export function playIncidentTimeline() {
    try {
        if (window.incidentTimeline && typeof window.incidentTimeline.play === 'function') {
            window.incidentTimeline.play();
            console.log('Incident timeline playing');
            return true;
        } else {
            console.warn('Incident timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause incident timeline
export function pauseIncidentTimeline() {
    try {
        if (window.incidentTimeline && typeof window.incidentTimeline.pause === 'function') {
            window.incidentTimeline.pause();
            console.log('Incident timeline paused');
            return true;
        } else {
            console.warn('Incident timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop incident timeline
export function stopIncidentTimeline() {
    try {
        if (window.incidentTimeline && typeof window.incidentTimeline.stop === 'function') {
            window.incidentTimeline.stop();
            console.log('Incident timeline stopped');
            return true;
        } else {
            console.warn('Incident timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Destroy incident map and timeline
export function destroyIncidentVisualizations() {
    try {
        if (window.incidentMap) {
            window.incidentMap.destroy();
            window.incidentMap = null;
        }

        if (window.incidentTimeline) {
            window.incidentTimeline.destroy();
            window.incidentTimeline = null;
        }

        console.log('Incident visualizations destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying visualizations:', error);
        return false;
    }
}

// Check if incident map is initialized
export function isIncidentMapInitialized() {
    return window.incidentMap !== undefined && window.incidentMap !== null;
}

// Check if incident timeline is initialized
export function isIncidentTimelineInitialized() {
    return window.incidentTimeline !== undefined && window.incidentTimeline !== null;
}
