/**
 * Visualization Toolkit Interop
 * JavaScript wrapper for C# Blazor integration
 */

// Store instances
const networkGraphs = new Map();
const timelines = new Map();
const geoMaps = new Map();

// ========================================
// NetworkGraph Interop Functions
// ========================================

export function initializeNetworkGraph(containerId, options, dotNetRef) {
    const graphId = `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const graphOptions = {
        ...options,
        onNodeClick: (node) => {
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnNodeClicked', node.id, node);
            }
        },
        onNodeDoubleClick: (node) => {
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnNodeDoubleClicked', node.id, node);
            }
        }
    };
    
    const graph = new NetworkGraph(containerId, graphOptions);
    networkGraphs.set(graphId, graph);
    
    return graphId;
}

export function loadNetworkData(graphId, data) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        graph.loadData(data);
    }
}

export function changeNetworkLayout(graphId, layoutType) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        graph.changeLayout(layoutType);
    }
}

export function highlightNode(graphId, nodeId) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        const node = graph.nodes.find(n => n.id === nodeId);
        if (node) {
            graph.highlightConnectedNodes(node);
        }
    }
}

export function clearHighlight(graphId) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        graph.clearHighlight();
    }
}

export function findShortestPath(graphId, sourceId, targetId) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        return graph.findShortestPath(sourceId, targetId);
    }
    return null;
}

export function highlightPath(graphId, path) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        graph.highlightPath(path);
    }
}

export function destroyNetworkGraph(graphId) {
    const graph = networkGraphs.get(graphId);
    if (graph) {
        graph.destroy();
        networkGraphs.delete(graphId);
    }
}

// ========================================
// Timeline Interop Functions
// ========================================

export function initializeTimeline(containerId, options, dotNetRef) {
    const timelineId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timelineOptions = {
        ...options,
        onEventClick: (event) => {
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnEventClicked', event.id, event);
            }
        },
        onPlaybackTick: (event, index) => {
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnPlaybackTick', event, index);
            }
        },
        onTimeRangeChange: (range) => {
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnTimeRangeChanged', range[0], range[1]);
            }
        }
    };
    
    const timeline = new TimelineViz(containerId, timelineOptions);
    timelines.set(timelineId, timeline);
    
    return timelineId;
}

export function loadTimelineEvents(timelineId, events) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.loadData(events);
    }
}

export function playTimeline(timelineId) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.play();
    }
}

export function pauseTimeline(timelineId) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.pause();
    }
}

export function stopTimeline(timelineId) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.stop();
    }
}

export function filterTimelineByDateRange(timelineId, startDate, endDate) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.filterByDateRange(new Date(startDate), new Date(endDate));
    }
}

export function resetTimelineZoom(timelineId) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.resetZoom();
    }
}

export function destroyTimeline(timelineId) {
    const timeline = timelines.get(timelineId);
    if (timeline) {
        timeline.destroy();
        timelines.delete(timelineId);
    }
}

// ========================================
// GeoMap Interop Functions
// ========================================

export function initializeGeoMap(containerId, options, dotNetRef) {
    const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mapOptions = {
        ...options,
        onMarkerClick: (location) => {
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnMarkerClicked', location);
            }
        }
    };
    
    const geoMap = new GeoMapViz(containerId, mapOptions);
    geoMaps.set(mapId, geoMap);
    
    return mapId;
}

export function addMapMarkers(mapId, locations) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.addMarkers(locations);
    }
}

export function drawMapRoute(mapId, waypoints, options) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.drawRoute(waypoints, options);
    }
}

export function drawMapCircle(mapId, center, radius, options) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.drawCircle(center, radius, options);
    }
}

export function addMapHeatmap(mapId, points, options) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.addHeatmap(points, options);
    }
}

export function removeMapHeatmap(mapId) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.removeHeatmap();
    }
}

export function addIncidentClusters(mapId, incidents) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.addIncidentClusters(incidents);
    }
}

export function clearMapMarkers(mapId) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.clearMarkers();
    }
}

export function clearMapRoutes(mapId) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.clearRoutes();
    }
}

export function clearAllMap(mapId) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.clearAll();
    }
}

export function fitMapBounds(mapId, locations) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.fitBounds(locations);
    }
}

export function setMapView(mapId, center, zoom) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.setView(center, zoom);
    }
}

export function destroyGeoMap(mapId) {
    const geoMap = geoMaps.get(mapId);
    if (geoMap) {
        geoMap.destroy();
        geoMaps.delete(mapId);
    }
}

// ========================================
// Utility Functions
// ========================================

export function disposeAll() {
    networkGraphs.forEach(graph => graph.destroy());
    networkGraphs.clear();
    
    timelines.forEach(timeline => timeline.destroy());
    timelines.clear();
    
    geoMaps.forEach(map => map.destroy());
    geoMaps.clear();
}
