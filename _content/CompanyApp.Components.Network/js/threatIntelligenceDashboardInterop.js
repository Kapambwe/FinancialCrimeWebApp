/**
 * Threat Intelligence Dashboard JavaScript Interop
 * Provides clean method mappings for intelligence graph and timeline visualization
 */

// Initialize intelligence network graph
export function initializeIntelligenceGraph(containerId, networkData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const intelGraph = new NetworkGraph(containerId, {
            width: container.clientWidth,
            height: 550,
            nodeRadius: 12,
            linkDistance: 100
        });
        intelGraph.loadData(networkData);
        window.intelGraph = intelGraph;

        console.log('Intelligence graph initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing intelligence graph:', error);
        return false;
    }
}

// Initialize intelligence timeline
export function initializeIntelligenceTimeline(containerId, timelineData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const intelTimeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 200
        });
        intelTimeline.loadData(timelineData);
        window.intelTimeline = intelTimeline;

        console.log('Intelligence timeline initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing intelligence timeline:', error);
        return false;
    }
}

// Change intelligence graph layout
export function changeIntelligenceGraphLayout(layoutType) {
    try {
        if (window.intelGraph && typeof window.intelGraph.changeLayout === 'function') {
            window.intelGraph.changeLayout(layoutType);
            console.log(`Intelligence graph layout changed to: ${layoutType}`);
            return true;
        } else {
            console.warn('Intelligence graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error changing graph layout:', error);
        return false;
    }
}

// Focus on node in intelligence graph
export function focusIntelligenceNode(nodeId) {
    try {
        if (window.intelGraph && typeof window.intelGraph.focusOnNode === 'function') {
            window.intelGraph.focusOnNode(nodeId);
            console.log(`Focused on node: ${nodeId}`);
            return true;
        } else {
            console.warn('Intelligence graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error focusing on node:', error);
        return false;
    }
}

// Play intelligence timeline
export function playIntelligenceTimeline() {
    try {
        if (window.intelTimeline && typeof window.intelTimeline.play === 'function') {
            window.intelTimeline.play();
            console.log('Intelligence timeline playing');
            return true;
        } else {
            console.warn('Intelligence timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause intelligence timeline
export function pauseIntelligenceTimeline() {
    try {
        if (window.intelTimeline && typeof window.intelTimeline.pause === 'function') {
            window.intelTimeline.pause();
            console.log('Intelligence timeline paused');
            return true;
        } else {
            console.warn('Intelligence timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop intelligence timeline
export function stopIntelligenceTimeline() {
    try {
        if (window.intelTimeline && typeof window.intelTimeline.stop === 'function') {
            window.intelTimeline.stop();
            console.log('Intelligence timeline stopped');
            return true;
        } else {
            console.warn('Intelligence timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Set timeline position
export function setIntelligenceTimelinePosition(position) {
    try {
        if (window.intelTimeline && typeof window.intelTimeline.setPosition === 'function') {
            window.intelTimeline.setPosition(position);
            console.log(`Timeline position set to: ${position}`);
            return true;
        } else {
            console.warn('Intelligence timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error setting timeline position:', error);
        return false;
    }
}

// Destroy intelligence visualizations
export function destroyIntelligenceVisualizations() {
    try {
        if (window.intelGraph) {
            window.intelGraph.destroy();
            window.intelGraph = null;
        }

        if (window.intelTimeline) {
            window.intelTimeline.destroy();
            window.intelTimeline = null;
        }

        console.log('Intelligence visualizations destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying visualizations:', error);
        return false;
    }
}

// Check if intelligence graph is initialized
export function isIntelligenceGraphInitialized() {
    return window.intelGraph !== undefined && window.intelGraph !== null;
}

// Check if intelligence timeline is initialized
export function isIntelligenceTimelineInitialized() {
    return window.intelTimeline !== undefined && window.intelTimeline !== null;
}
