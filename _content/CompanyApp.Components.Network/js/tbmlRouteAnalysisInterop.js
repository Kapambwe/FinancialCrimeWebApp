/**
 * TBML Route Analysis JavaScript Interop
 * Provides clean method mappings for trade map and shipment timeline visualization
 */

// Initialize trade map with routes
export function initializeTradeMap(containerId, routes) {
    try {
        // Destroy existing map if it exists
        if (window.tradeMap) {
            window.tradeMap.destroy();
            window.tradeMap = null;
        }

        const tradeMap = new GeoMapViz(containerId, { center: [20, 0], zoom: 2 });

        // Add routes
        if (routes && routes.length > 0) {
            routes.forEach(route => {
                tradeMap.drawRoute(route.waypoints, {
                    color: route.color,
                    weight: route.weight || 3,
                    label: route.label,
                    showDirection: route.showDirection !== false
                });
            });
        }

        window.tradeMap = tradeMap;

        console.log('Trade map initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing trade map:', error);
        return false;
    }
}

// Initialize shipment timeline
export function initializeShipmentTimeline(containerId, timelineData) {
    try {
        // Destroy existing timeline if it exists
        if (window.shipmentTimeline) {
            window.shipmentTimeline.destroy();
            window.shipmentTimeline = null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        // Check if vis is available
        if (typeof vis === 'undefined') {
            console.error('vis.js library not loaded');
            return false;
        }

        // Convert timeline data to vis.js format
        const items = new vis.DataSet(timelineData.map((item, index) => ({
            id: item.id || `item-${index}`,
            content: item.title || item.content || 'Event',
            start: new Date(item.timestamp || item.start),
            end: item.end ? new Date(item.end) : undefined,
            type: item.end ? 'range' : 'box',
            className: item.severity ? `severity-${item.severity.toLowerCase()}` : '',
            // Enhanced metadata for rich tooltips
            severity: item.severity || 'Low',
            eventType: item.type || 'transaction',
            amount: item.amount,
            suspicionScore: item.suspicionScore,
            origin: item.origin,
            destination: item.destination,
            entityName: item.entityName,
            reference: item.reference,
            flags: item.flags || [],
            relatedEventIds: item.relatedEventIds || []
        })));

        // Timeline options
        const options = {
            height: '300px',
            width: '100%',
            margin: { item: { horizontal: 10, vertical: 5 } },
            orientation: 'top',
            showCurrentTime: true,
            zoomable: true,
            moveable: true,
            selectable: true,
            editable: false,
            stack: true,
            tooltip: {
                followMouse: true,
                overflowMethod: 'cap'
            }
        };

        // Create timeline using vis.js
        const timeline = new vis.Timeline(container, items, options);

        // Apply enhanced tooltips if TimelineEnhancements is available
        if (typeof TimelineEnhancements !== 'undefined') {
            TimelineEnhancements.addEnhancedTooltips(timeline, container);
            TimelineEnhancements.addKeyboardNavigation(timeline);
        }

        window.shipmentTimeline = timeline;

        console.log('Shipment timeline initialized successfully with vis.js');
        return true;
    } catch (error) {
        console.error('Error initializing shipment timeline:', error);
        return false;
    }
}

// Clear routes from trade map
export function clearTradeRoutes() {
    try {
        if (window.tradeMap && typeof window.tradeMap.clearRoutes === 'function') {
            window.tradeMap.clearRoutes();
            console.log('Trade routes cleared');
            return true;
        } else {
            console.warn('Trade map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error clearing routes:', error);
        return false;
    }
}

// Draw single route on trade map
export function drawTradeRoute(waypoints, options) {
    try {
        if (window.tradeMap && typeof window.tradeMap.drawRoute === 'function') {
            window.tradeMap.drawRoute(waypoints, options);
            console.log('Trade route drawn');
            return true;
        } else {
            console.warn('Trade map not initialized yet');
            return false;
        }
    } catch (error) {
        console.error('Error drawing route:', error);
        return false;
    }
}

// Play shipment timeline
export function playShipmentTimeline() {
    try {
        if (!window.shipmentTimeline) {
            console.warn('Shipment timeline not initialized yet');
            return false;
        }

        // For vis.js timeline, implement play as auto-scroll animation
        const items = window.shipmentTimeline.itemsData.get();
        if (items.length === 0) {
            console.warn('No items in timeline to play');
            return false;
        }

        // Sort items by start time
        items.sort((a, b) => new Date(a.start) - new Date(b.start));

        // Animate through timeline
        if (!window.shipmentTimeline._playInterval) {
            let currentIndex = 0;
            window.shipmentTimeline._playInterval = setInterval(() => {
                if (currentIndex < items.length) {
                    const item = items[currentIndex];
                    window.shipmentTimeline.setSelection(item.id);
                    window.shipmentTimeline.focus(item.id, { animation: true });
                    currentIndex++;
                } else {
                    clearInterval(window.shipmentTimeline._playInterval);
                    window.shipmentTimeline._playInterval = null;
                }
            }, 2000); // 2 seconds per item
        }

        console.log('Shipment timeline playing');
        return true;
    } catch (error) {
        console.error('Error playing timeline:', error);
        return false;
    }
}

// Pause shipment timeline
export function pauseShipmentTimeline() {
    try {
        if (!window.shipmentTimeline) {
            console.warn('Shipment timeline not initialized yet');
            return false;
        }

        // Clear play interval
        if (window.shipmentTimeline._playInterval) {
            clearInterval(window.shipmentTimeline._playInterval);
            window.shipmentTimeline._playInterval = null;
            console.log('Shipment timeline paused');
            return true;
        }

        return true;
    } catch (error) {
        console.error('Error pausing timeline:', error);
        return false;
    }
}

// Stop/Reset shipment timeline
export function stopShipmentTimeline() {
    try {
        if (!window.shipmentTimeline) {
            console.warn('Shipment timeline not initialized yet');
            return false;
        }

        // Clear play interval
        if (window.shipmentTimeline._playInterval) {
            clearInterval(window.shipmentTimeline._playInterval);
            window.shipmentTimeline._playInterval = null;
        }

        // Reset selection and fit all items in view
        window.shipmentTimeline.setSelection([]);
        window.shipmentTimeline.fit({ animation: true });

        console.log('Shipment timeline stopped');
        return true;
    } catch (error) {
        console.error('Error stopping timeline:', error);
        return false;
    }
}

// Destroy trade map and shipment timeline
export function destroyTbmlVisualizations() {
    try {
        if (window.tradeMap) {
            window.tradeMap.destroy();
            window.tradeMap = null;
        }

        if (window.shipmentTimeline) {
            window.shipmentTimeline.destroy();
            window.shipmentTimeline = null;
        }

        console.log('TBML visualizations destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying visualizations:', error);
        return false;
    }
}

// Check if trade map is initialized
export function isTradeMapInitialized() {
    return window.tradeMap !== undefined && window.tradeMap !== null;
}

// Check if shipment timeline is initialized
export function isShipmentTimelineInitialized() {
    return window.shipmentTimeline !== undefined && window.shipmentTimeline !== null;
}
