/**
 * Criminal Timeline JavaScript Interop
 * Provides clean method mappings for criminal timeline visualization with callbacks
 */

// Store DotNet reference for callbacks
let dotNetReference = null;

// Initialize criminal timeline with callbacks
export function initializeCriminalTimeline(containerId, timelineData, dotNetRef) {
    try {
        // Store the dotnet reference for callbacks
        dotNetReference = dotNetRef;

        // Destroy existing timeline if it exists
        if (window.criminalTimeline) {
            window.criminalTimeline.destroy();
            window.criminalTimeline = null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        // Create new timeline with callback
        const timeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 600,
            interactive: true,
            onEventClick: (event) => {
                if (dotNetReference) {
                    dotNetReference.invokeMethodAsync('OnEventSelected', event.id);
                }
            }
        });
        timeline.loadData(timelineData);
        window.criminalTimeline = timeline;

        console.log('Criminal timeline initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing criminal timeline:', error);
        return false;
    }
}

// Initialize comparison timeline
export function initializeComparisonTimeline(containerId, timelineData) {
    try {
        // Destroy existing comparison timeline if it exists
        if (window.comparisonTimeline) {
            window.comparisonTimeline.destroy();
            window.comparisonTimeline = null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        const compTimeline = new TimelineViz(containerId, {
            width: container.clientWidth,
            height: 300
        });
        compTimeline.loadData(timelineData);
        window.comparisonTimeline = compTimeline;

        console.log('Comparison timeline initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing comparison timeline:', error);
        return false;
    }
}

// Play criminal timeline
export function playCriminalTimeline() {
    try {
        if (window.criminalTimeline && typeof window.criminalTimeline.play === 'function') {
            window.criminalTimeline.play();
            console.log('Criminal timeline playing');
            return true;
        } else {
            console.warn('Criminal timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause criminal timeline
export function pauseCriminalTimeline() {
    try {
        if (window.criminalTimeline && typeof window.criminalTimeline.pause === 'function') {
            window.criminalTimeline.pause();
            console.log('Criminal timeline paused');
            return true;
        } else {
            console.warn('Criminal timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop criminal timeline
export function stopCriminalTimeline() {
    try {
        if (window.criminalTimeline && typeof window.criminalTimeline.stop === 'function') {
            window.criminalTimeline.stop();
            console.log('Criminal timeline stopped');
            return true;
        } else {
            console.warn('Criminal timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Zoom in on criminal timeline
export function zoomInCriminalTimeline() {
    try {
        if (window.criminalTimeline && typeof window.criminalTimeline.zoomIn === 'function') {
            window.criminalTimeline.zoomIn();
            console.log('Zoomed in on criminal timeline');
            return true;
        } else {
            console.warn('Criminal timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error zooming in:', error);
        return false;
    }
}

// Zoom out on criminal timeline
export function zoomOutCriminalTimeline() {
    try {
        if (window.criminalTimeline && typeof window.criminalTimeline.zoomOut === 'function') {
            window.criminalTimeline.zoomOut();
            console.log('Zoomed out on criminal timeline');
            return true;
        } else {
            console.warn('Criminal timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error zooming out:', error);
        return false;
    }
}

// Set zoom level on criminal timeline
export function setTimelineZoomLevel(zoomLevel) {
    try {
        if (window.criminalTimeline && typeof window.criminalTimeline.setZoomLevel === 'function') {
            window.criminalTimeline.setZoomLevel(zoomLevel);
            console.log(`Timeline zoom level set to: ${zoomLevel}`);
            return true;
        } else {
            console.warn('Criminal timeline not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error setting zoom level:', error);
        return false;
    }
}

// Destroy criminal timelines
export function destroyCriminalTimelines() {
    try {
        if (window.criminalTimeline) {
            window.criminalTimeline.destroy();
            window.criminalTimeline = null;
        }

        if (window.comparisonTimeline) {
            window.comparisonTimeline.destroy();
            window.comparisonTimeline = null;
        }

        // Dispose dotnet reference
        if (dotNetReference) {
            dotNetReference.dispose();
            dotNetReference = null;
        }

        console.log('Criminal timelines destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying timelines:', error);
        return false;
    }
}

// Check if criminal timeline is initialized
export function isCriminalTimelineInitialized() {
    return window.criminalTimeline !== undefined && window.criminalTimeline !== null;
}
