/**
 * Criminal Network Intelligence JavaScript Interop
 * Provides clean method mappings between C# and JavaScript for criminal network visualization
 */

// Store DotNet reference for callbacks
let dotNetReference = null;

// Initialize Criminal Network Graph with data and callbacks
export function initializeCriminalNetwork(containerId, networkData, dotNetRef) {
    try {
        // Store the dotnet reference for callbacks
        dotNetReference = dotNetRef;

        // Destroy existing graph if it exists
        if (window.criminalGraph) {
            window.criminalGraph.destroy();
            window.criminalGraph = null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        // Create new graph with callback
        const criminalGraph = new NetworkGraph(containerId, {
            width: container.clientWidth,
            height: 700,
            onNodeClick: (node) => {
                if (dotNetReference) {
                    dotNetReference.invokeMethodAsync('OnNodeClicked', node.id);
                }
            }
        });

        criminalGraph.loadData(networkData);
        window.criminalGraph = criminalGraph;

        console.log('Criminal network graph initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing criminal network:', error);
        return false;
    }
}

// Change network layout
export function changeNetworkLayout(layoutType) {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.changeLayout === 'function') {
            window.criminalGraph.changeLayout(layoutType);
            console.log(`Criminal network layout changed to: ${layoutType}`);
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error changing network layout:', error);
        return false;
    }
}

// Highlight node and its connected nodes
export function highlightConnectedNodes(nodeId) {
    try {
        if (window.criminalGraph && window.criminalGraph.nodes) {
            const node = window.criminalGraph.nodes.find(n => n.id === nodeId);
            if (node && typeof window.criminalGraph.highlightConnectedNodes === 'function') {
                window.criminalGraph.highlightConnectedNodes(node);
                console.log(`Highlighted connections for node: ${nodeId}`);
                return true;
            } else {
                console.warn(`Node ${nodeId} not found in graph`);
                return false;
            }
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error highlighting connected nodes:', error);
        return false;
    }
}

// Highlight a specific node
export function highlightNode(nodeId) {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.highlightNode === 'function') {
            window.criminalGraph.highlightNode(nodeId);
            console.log(`Highlighted node: ${nodeId}`);
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error highlighting node:', error);
        return false;
    }
}

// Clear all highlights
export function clearHighlights() {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.clearHighlight === 'function') {
            window.criminalGraph.clearHighlight();
            console.log('Cleared all highlights');
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error clearing highlights:', error);
        return false;
    }
}

// Find shortest path between two nodes
export function findShortestPath(sourceId, targetId) {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.findShortestPath === 'function') {
            const path = window.criminalGraph.findShortestPath(sourceId, targetId);
            console.log(`Found path from ${sourceId} to ${targetId}:`, path);
            return path || [];
        } else {
            console.warn('Criminal network graph not initialized yet');
            return [];
        }
    } catch (error) {
        console.error('Error finding shortest path:', error);
        return [];
    }
}

// Focus on a specific node (zoom and center)
export function focusOnNode(nodeId) {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.focusOnNode === 'function') {
            window.criminalGraph.focusOnNode(nodeId);
            console.log(`Focused on node: ${nodeId}`);
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error focusing on node:', error);
        return false;
    }
}

// Zoom in
export function zoomIn() {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.zoomIn === 'function') {
            window.criminalGraph.zoomIn();
            console.log('Zoomed in');
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error zooming in:', error);
        return false;
    }
}

// Zoom out
export function zoomOut() {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.zoomOut === 'function') {
            window.criminalGraph.zoomOut();
            console.log('Zoomed out');
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error zooming out:', error);
        return false;
    }
}

// Reset view to default
export function resetView() {
    try {
        if (window.criminalGraph && typeof window.criminalGraph.resetView === 'function') {
            window.criminalGraph.resetView();
            console.log('View reset to default');
            return true;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error resetting view:', error);
        return false;
    }
}

// Get network statistics
export function getNetworkStatistics() {
    try {
        if (window.criminalGraph && window.criminalGraph.nodes && window.criminalGraph.links) {
            const stats = {
                nodeCount: window.criminalGraph.nodes.length,
                linkCount: window.criminalGraph.links.length,
                averageDegree: (window.criminalGraph.links.length * 2) / window.criminalGraph.nodes.length
            };
            console.log('Network statistics:', stats);
            return stats;
        } else {
            console.warn('Criminal network graph not initialized yet');
            return { nodeCount: 0, linkCount: 0, averageDegree: 0 };
        }
    } catch (error) {
        console.error('Error getting network statistics:', error);
        return { nodeCount: 0, linkCount: 0, averageDegree: 0 };
    }
}

// Destroy the criminal network graph
export function destroyCriminalNetwork() {
    try {
        if (window.criminalGraph) {
            window.criminalGraph.destroy();
            window.criminalGraph = null;
            console.log('Criminal network graph destroyed');
        }

        // Dispose dotnet reference
        if (dotNetReference) {
            dotNetReference.dispose();
            dotNetReference = null;
        }

        return true;
    } catch (error) {
        console.error('Error destroying criminal network:', error);
        return false;
    }
}

// Check if criminal network is initialized
export function isCriminalNetworkInitialized() {
    return window.criminalGraph !== undefined && window.criminalGraph !== null;
}
