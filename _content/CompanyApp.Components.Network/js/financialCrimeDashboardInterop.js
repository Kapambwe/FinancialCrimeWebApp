/**
 * Financial Crime Dashboard JavaScript Interop
 * Provides clean method mappings between C# and JavaScript for dashboard visualizations
 */

// Initialize Risk Map with markers
export function initializeRiskMap(containerId, mapData) {
    try {
        // Destroy existing map if it exists
        if (window.riskMap) {
            window.riskMap.destroy();
            window.riskMap = null;
        }

        const map = new GeoMapViz(containerId, { center: [20, 0], zoom: 2 });
        map.addMarkers(mapData);
        window.riskMap = map;

        console.log('Risk map initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing risk map:', error);
        return false;
    }
}

// Initialize Network Graph with data
export function initializeNetworkGraph(containerId, networkData) {
    try {
        // Destroy existing graph if it exists
        if (window.networkGraph) {
            window.networkGraph.destroy();
            window.networkGraph = null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const graph = new NetworkGraph(containerId, {
            width: container.clientWidth,
            height: 400
        });
        graph.loadData(networkData);
        window.networkGraph = graph;

        console.log('Network graph initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing network graph:', error);
        return false;
    }
}

// Initialize Timeline Visualization with data
export function initializeTimeline(containerId, timelineData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const timeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 400
        });
        timeline.loadData(timelineData);
        window.timelineViz = timeline;

        console.log('Timeline visualization initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing timeline:', error);
        return false;
    }
}

// Add heatmap to risk map
export function addHeatmapToRiskMap(heatmapData) {
    try {
        if (window.riskMap && typeof window.riskMap.removeHeatmap === 'function' && typeof window.riskMap.addHeatmap === 'function') {
            window.riskMap.removeHeatmap();
            window.riskMap.addHeatmap(heatmapData);
            console.log('Heatmap added successfully');
            return true;
        } else {
            console.warn('Risk map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error adding heatmap:', error);
        return false;
    }
}

// Remove heatmap from risk map
export function removeHeatmapFromRiskMap() {
    try {
        if (window.riskMap && typeof window.riskMap.removeHeatmap === 'function') {
            window.riskMap.removeHeatmap();
            console.log('Heatmap removed successfully');
            return true;
        } else {
            console.warn('Risk map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error removing heatmap:', error);
        return false;
    }
}

// Change network graph layout
export function changeNetworkLayout(layoutType) {
    try {
        if (window.networkGraph && typeof window.networkGraph.changeLayout === 'function') {
            window.networkGraph.changeLayout(layoutType);
            console.log(`Network layout changed to: ${layoutType}`);
            return true;
        } else {
            console.warn('Network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error changing network layout:', error);
        return false;
    }
}

// Play timeline animation
export function playTimeline() {
    try {
        if (window.timelineViz && typeof window.timelineViz.play === 'function') {
            window.timelineViz.play();
            console.log('Timeline playback started');
            return true;
        } else {
            console.warn('Timeline visualization not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause timeline animation
export function pauseTimeline() {
    try {
        if (window.timelineViz && typeof window.timelineViz.pause === 'function') {
            window.timelineViz.pause();
            console.log('Timeline playback paused');
            return true;
        } else {
            console.warn('Timeline visualization not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop timeline animation
export function stopTimeline() {
    try {
        if (window.timelineViz && typeof window.timelineViz.stop === 'function') {
            window.timelineViz.stop();
            console.log('Timeline playback stopped');
            return true;
        } else {
            console.warn('Timeline visualization not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Destroy all visualizations
export function destroyAllVisualizations() {
    try {
        let destroyed = [];

        if (window.riskMap) {
            window.riskMap.destroy();
            window.riskMap = null;
            destroyed.push('riskMap');
        }

        if (window.networkGraph) {
            window.networkGraph.destroy();
            window.networkGraph = null;
            destroyed.push('networkGraph');
        }

        if (window.timelineViz) {
            window.timelineViz.destroy();
            window.timelineViz = null;
            destroyed.push('timelineViz');
        }

        console.log(`Destroyed visualizations: ${destroyed.join(', ')}`);
        return true;
    } catch (error) {
        console.error('Error destroying visualizations:', error);
        return false;
    }
}

// Check if a visualization is initialized
export function isVisualizationInitialized(visualizationType) {
    switch (visualizationType.toLowerCase()) {
        case 'riskmap':
            return window.riskMap !== undefined && window.riskMap !== null;
        case 'networkgraph':
            return window.networkGraph !== undefined && window.networkGraph !== null;
        case 'timeline':
            return window.timelineViz !== undefined && window.timelineViz !== null;
        default:
            return false;
    }
}
