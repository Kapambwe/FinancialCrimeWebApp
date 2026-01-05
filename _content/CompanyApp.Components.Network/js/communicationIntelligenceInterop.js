/**
 * Communication Intelligence JavaScript Interop
 * Provides clean method mappings for communication network and timeline visualization
 */

// Initialize communication network graph
export function initializeCommunicationNetwork(containerId, networkData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const commNetwork = new NetworkGraph(containerId, {
            width: container.clientWidth,
            height: 600,
            nodeRadius: 14,
            linkDistance: 120
        });
        commNetwork.loadData(networkData);
        window.commNetwork = commNetwork;

        console.log('Communication network initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing communication network:', error);
        return false;
    }
}

// Initialize communication timeline
export function initializeCommunicationTimeline(containerId, timelineData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const commTimeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 250
        });
        commTimeline.loadData(timelineData);
        window.commTimeline = commTimeline;

        console.log('Communication timeline initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing communication timeline:', error);
        return false;
    }
}

// Change communication network layout
export function changeCommunicationNetworkLayout(layoutType) {
    try {
        if (window.commNetwork && typeof window.commNetwork.changeLayout === 'function') {
            window.commNetwork.changeLayout(layoutType);
            console.log(`Communication network layout changed to: ${layoutType}`);
            return true;
        } else {
            console.warn('Communication network not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error changing network layout:', error);
        return false;
    }
}

// Filter timeline by entity
export function filterTimelineByEntity(entityId) {
    try {
        if (window.commTimeline && typeof window.commTimeline.filterByEntity === 'function') {
            window.commTimeline.filterByEntity(entityId);
            console.log(`Timeline filtered by entity: ${entityId}`);
            return true;
        } else {
            console.warn('Communication timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error filtering timeline:', error);
        return false;
    }
}

// Play communication timeline
export function playCommunicationTimeline() {
    try {
        if (window.commTimeline && typeof window.commTimeline.play === 'function') {
            window.commTimeline.play();
            console.log('Communication timeline playing');
            return true;
        } else {
            console.warn('Communication timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause communication timeline
export function pauseCommunicationTimeline() {
    try {
        if (window.commTimeline && typeof window.commTimeline.pause === 'function') {
            window.commTimeline.pause();
            console.log('Communication timeline paused');
            return true;
        } else {
            console.warn('Communication timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop communication timeline
export function stopCommunicationTimeline() {
    try {
        if (window.commTimeline && typeof window.commTimeline.stop === 'function') {
            window.commTimeline.stop();
            console.log('Communication timeline stopped');
            return true;
        } else {
            console.warn('Communication timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Destroy communication visualizations
export function destroyCommunicationVisualizations() {
    try {
        if (window.commNetwork) {
            window.commNetwork.destroy();
            window.commNetwork = null;
        }

        if (window.commTimeline) {
            window.commTimeline.destroy();
            window.commTimeline = null;
        }

        console.log('Communication visualizations destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying visualizations:', error);
        return false;
    }
}

// Check if communication network is initialized
export function isCommunicationNetworkInitialized() {
    return window.commNetwork !== undefined && window.commNetwork !== null;
}

// Check if communication timeline is initialized
export function isCommunicationTimelineInitialized() {
    return window.commTimeline !== undefined && window.commTimeline !== null;
}
