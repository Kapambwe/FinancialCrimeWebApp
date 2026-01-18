/**
 * Timeline Enhancements JavaScript Interop
 * Provides clean method mappings for enhanced timeline visualization with callbacks
 * Version: 1.0
 * Date: 2025-11-10
 */

// Store DotNet reference for callbacks
let dotNetReference = null;

// Store timeline instances
const timelineInstances = new Map();

/**
 * Initialize enhanced timeline with modern features
 * @param {string} containerId - DOM element ID
 * @param {Array} items - Timeline items
 * @param {Array} groups - Timeline groups (optional, can be null)
 * @param {Object} options - Configuration options
 * @param {Object} dotNetRef - DotNet reference for callbacks
 * @param {boolean} useEnhancements - Whether to use TimelineEnhancements wrapper (default: true)
 * @returns {boolean} Success status
 */
export function initializeEnhancedTimeline(containerId, items, groups, options, dotNetRef, useEnhancements = true) {
    try {
        // Store the dotnet reference for callbacks
        if (dotNetRef) {
            dotNetReference = dotNetRef;
        }

        // Check if vis.js is available
        if (typeof vis === 'undefined') {
            console.error('vis.js library not loaded');
            return false;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        // Destroy existing timeline if it exists
        if (timelineInstances.has(containerId)) {
            const existingTimeline = timelineInstances.get(containerId);
            existingTimeline.destroy();
            timelineInstances.delete(containerId);
        }

        // Convert items to DataSet if it's an array
        const itemsDataSet = Array.isArray(items) ? new vis.DataSet(items) : items;
        
        // Convert groups to DataSet if provided and is an array
        let groupsDataSet = null;
        if (groups) {
            if (Array.isArray(groups)) {
                groupsDataSet = new vis.DataSet(groups);
            } else if (groups instanceof vis.DataSet) {
                groupsDataSet = groups;
            }
        }

        // Merge options with callback handlers
        const enhancedOptions = Object.assign({}, options || {}, {
            onSelect: (properties) => {
                if (dotNetReference && properties.items && properties.items.length > 0) {
                    const itemId = properties.items[0];
                    dotNetReference.invokeMethodAsync('OnItemSelected', itemId);
                }
            }
        });

        let timeline;

        // Check if we should use TimelineEnhancements wrapper
        if (useEnhancements && typeof TimelineEnhancements !== 'undefined') {
            // Initialize using TimelineEnhancements utility for enhanced features
            timeline = TimelineEnhancements.initialize(
                containerId,
                itemsDataSet,
                groupsDataSet,
                enhancedOptions
            );
        } else {
            // Direct vis.Timeline initialization (standard approach)
            // Support both signatures: new vis.Timeline(container, items, options)
            // and new vis.Timeline(container, items, groups, options)
            if (groupsDataSet) {
                timeline = new vis.Timeline(container, itemsDataSet, groupsDataSet, enhancedOptions);
            } else {
                timeline = new vis.Timeline(container, itemsDataSet, enhancedOptions);
            }
        }

        if (!timeline) {
            console.error('Failed to initialize timeline');
            return false;
        }

        // Store timeline instance
        timelineInstances.set(containerId, timeline);

        // Set up additional event listeners for callbacks
        timeline.on('click', (properties) => {
            if (dotNetReference && properties.item) {
                dotNetReference.invokeMethodAsync('OnItemClicked', properties.item);
            }
        });

        timeline.on('doubleClick', (properties) => {
            if (dotNetReference && properties.item) {
                dotNetReference.invokeMethodAsync('OnItemDoubleClicked', properties.item);
            }
        });

        timeline.on('contextmenu', (properties) => {
            if (dotNetReference && properties.item) {
                properties.event.preventDefault();
                dotNetReference.invokeMethodAsync('OnItemContextMenu', properties.item);
            }
        });

        timeline.on('rangechange', (properties) => {
            if (dotNetReference) {
                dotNetReference.invokeMethodAsync('OnRangeChanged', {
                    start: properties.start.toISOString(),
                    end: properties.end.toISOString(),
                    byUser: properties.byUser
                });
            }
        });

        timeline.on('rangechanged', (properties) => {
            if (dotNetReference) {
                dotNetReference.invokeMethodAsync('OnRangeChangeFinished', {
                    start: properties.start.toISOString(),
                    end: properties.end.toISOString(),
                    byUser: properties.byUser
                });
            }
        });

        console.log('Enhanced timeline initialized successfully:', containerId);
        return true;
    } catch (error) {
        console.error('Error initializing enhanced timeline:', error);
        return false;
    }
}

/**
 * Initialize basic timeline without enhancements (direct vis.Timeline)
 * @param {string} containerId - DOM element ID
 * @param {Array} items - Timeline items
 * @param {Array} groups - Timeline groups (optional)
 * @param {Object} options - Configuration options
 * @param {Object} dotNetRef - DotNet reference for callbacks
 * @returns {boolean} Success status
 */
export function initializeBasicTimeline(containerId, items, groups, options, dotNetRef) {
    return initializeEnhancedTimeline(containerId, items, groups, options, dotNetRef, false);
}

/**
 * Update timeline items
 * @param {string} containerId - DOM element ID
 * @param {Array} items - New timeline items
 * @returns {boolean} Success status
 */
export function updateTimelineItems(containerId, items) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const itemsDataSet = Array.isArray(items) ? new vis.DataSet(items) : items;
        timeline.setItems(itemsDataSet);

        console.log(`Timeline ${containerId} items updated`);
        return true;
    } catch (error) {
        console.error('Error updating timeline items:', error);
        return false;
    }
}

/**
 * Add items to timeline
 * @param {string} containerId - DOM element ID
 * @param {Array} items - Items to add
 * @returns {boolean} Success status
 */
export function addTimelineItems(containerId, items) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const itemsData = timeline.itemsData;
        if (itemsData) {
            itemsData.add(items);
            console.log(`Added ${items.length} items to timeline ${containerId}`);
            return true;
        } else {
            console.error('Timeline items DataSet not available');
            return false;
        }
    } catch (error) {
        console.error('Error adding timeline items:', error);
        return false;
    }
}

/**
 * Remove items from timeline
 * @param {string} containerId - DOM element ID
 * @param {Array} itemIds - Item IDs to remove
 * @returns {boolean} Success status
 */
export function removeTimelineItems(containerId, itemIds) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const itemsData = timeline.itemsData;
        if (itemsData) {
            itemsData.remove(itemIds);
            console.log(`Removed ${itemIds.length} items from timeline ${containerId}`);
            return true;
        } else {
            console.error('Timeline items DataSet not available');
            return false;
        }
    } catch (error) {
        console.error('Error removing timeline items:', error);
        return false;
    }
}

/**
 * Update specific items on timeline
 * @param {string} containerId - DOM element ID
 * @param {Array} items - Items to update
 * @returns {boolean} Success status
 */
export function updateSpecificTimelineItems(containerId, items) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const itemsData = timeline.itemsData;
        if (itemsData) {
            itemsData.update(items);
            console.log(`Updated ${items.length} items in timeline ${containerId}`);
            return true;
        } else {
            console.error('Timeline items DataSet not available');
            return false;
        }
    } catch (error) {
        console.error('Error updating specific timeline items:', error);
        return false;
    }
}

/**
 * Get all items from timeline
 * @param {string} containerId - DOM element ID
 * @returns {Array|null} Array of items or null
 */
export function getTimelineItems(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const itemsData = timeline.itemsData;
        if (itemsData) {
            return itemsData.get();
        } else {
            console.error('Timeline items DataSet not available');
            return null;
        }
    } catch (error) {
        console.error('Error getting timeline items:', error);
        return null;
    }
}

/**
 * Get specific item from timeline
 * @param {string} containerId - DOM element ID
 * @param {string} itemId - Item ID
 * @returns {Object|null} Item object or null
 */
export function getTimelineItem(containerId, itemId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const itemsData = timeline.itemsData;
        if (itemsData) {
            return itemsData.get(itemId);
        } else {
            console.error('Timeline items DataSet not available');
            return null;
        }
    } catch (error) {
        console.error('Error getting timeline item:', error);
        return null;
    }
}

/**
 * Update timeline groups
 * @param {string} containerId - DOM element ID
 * @param {Array} groups - New timeline groups
 * @returns {boolean} Success status
 */
export function updateTimelineGroups(containerId, groups) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const groupsDataSet = Array.isArray(groups) ? new vis.DataSet(groups) : groups;
        timeline.setGroups(groupsDataSet);

        console.log(`Timeline ${containerId} groups updated`);
        return true;
    } catch (error) {
        console.error('Error updating timeline groups:', error);
        return false;
    }
}

/**
 * Add groups to timeline
 * @param {string} containerId - DOM element ID
 * @param {Array} groups - Groups to add
 * @returns {boolean} Success status
 */
export function addTimelineGroups(containerId, groups) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const groupsData = timeline.groupsData;
        if (groupsData) {
            groupsData.add(groups);
            console.log(`Added ${groups.length} groups to timeline ${containerId}`);
            return true;
        } else {
            console.error('Timeline groups DataSet not available');
            return false;
        }
    } catch (error) {
        console.error('Error adding timeline groups:', error);
        return false;
    }
}

/**
 * Remove groups from timeline
 * @param {string} containerId - DOM element ID
 * @param {Array} groupIds - Group IDs to remove
 * @returns {boolean} Success status
 */
export function removeTimelineGroups(containerId, groupIds) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const groupsData = timeline.groupsData;
        if (groupsData) {
            groupsData.remove(groupIds);
            console.log(`Removed ${groupIds.length} groups from timeline ${containerId}`);
            return true;
        } else {
            console.error('Timeline groups DataSet not available');
            return false;
        }
    } catch (error) {
        console.error('Error removing timeline groups:', error);
        return false;
    }
}

/**
 * Update specific groups on timeline
 * @param {string} containerId - DOM element ID
 * @param {Array} groups - Groups to update
 * @returns {boolean} Success status
 */
export function updateSpecificTimelineGroups(containerId, groups) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        const groupsData = timeline.groupsData;
        if (groupsData) {
            groupsData.update(groups);
            console.log(`Updated ${groups.length} groups in timeline ${containerId}`);
            return true;
        } else {
            console.error('Timeline groups DataSet not available');
            return false;
        }
    } catch (error) {
        console.error('Error updating specific timeline groups:', error);
        return false;
    }
}

/**
 * Get all groups from timeline
 * @param {string} containerId - DOM element ID
 * @returns {Array|null} Array of groups or null
 */
export function getTimelineGroups(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const groupsData = timeline.groupsData;
        if (groupsData) {
            return groupsData.get();
        } else {
            console.warn('Timeline has no groups');
            return null;
        }
    } catch (error) {
        console.error('Error getting timeline groups:', error);
        return null;
    }
}

/**
 * Get specific group from timeline
 * @param {string} containerId - DOM element ID
 * @param {string} groupId - Group ID
 * @returns {Object|null} Group object or null
 */
export function getTimelineGroup(containerId, groupId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const groupsData = timeline.groupsData;
        if (groupsData) {
            return groupsData.get(groupId);
        } else {
            console.warn('Timeline has no groups');
            return null;
        }
    } catch (error) {
        console.error('Error getting timeline group:', error);
        return null;
    }
}

/**
 * Filter timeline by criteria
 * @param {string} containerId - DOM element ID
 * @param {Object} criteria - Filter criteria
 * @returns {boolean} Success status
 */
export function filterTimeline(containerId, criteria) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        if (typeof TimelineEnhancements === 'undefined') {
            console.error('TimelineEnhancements utility not loaded');
            return false;
        }

        TimelineEnhancements.filterTimeline(timeline, criteria);

        console.log(`Timeline ${containerId} filtered`);
        return true;
    } catch (error) {
        console.error('Error filtering timeline:', error);
        return false;
    }
}

/**
 * Get timeline statistics
 * @param {string} containerId - DOM element ID
 * @returns {Object|null} Statistics object or null
 */
export function getTimelineStatistics(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        if (typeof TimelineEnhancements === 'undefined') {
            console.error('TimelineEnhancements utility not loaded');
            return null;
        }

        const stats = TimelineEnhancements.getStatistics(timeline);
        console.log(`Timeline ${containerId} statistics retrieved`);
        return stats;
    } catch (error) {
        console.error('Error getting timeline statistics:', error);
        return null;
    }
}

/**
 * Highlight related items on the timeline
 * @param {string} containerId - DOM element ID
 * @param {string} itemId - Item ID to find related items for
 * @returns {Array|null} Array of related item IDs or null
 */
export function highlightRelatedItems(containerId, itemId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        if (typeof TimelineEnhancements === 'undefined') {
            console.error('TimelineEnhancements utility not loaded');
            return null;
        }

        const relatedIds = TimelineEnhancements.highlightRelatedItems(timeline, itemId);
        console.log(`Highlighted related items for ${itemId}:`, relatedIds);
        return relatedIds;
    } catch (error) {
        console.error('Error highlighting related items:', error);
        return null;
    }
}

/**
 * Zoom in on timeline
 * @param {string} containerId - DOM element ID
 * @param {number} percentage - Zoom percentage (default 0.4)
 * @returns {boolean} Success status
 */
export function zoomInTimeline(containerId, percentage = 0.4) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.zoomIn(percentage);
        console.log(`Timeline ${containerId} zoomed in`);
        return true;
    } catch (error) {
        console.error('Error zooming in timeline:', error);
        return false;
    }
}

/**
 * Zoom out on timeline
 * @param {string} containerId - DOM element ID
 * @param {number} percentage - Zoom percentage (default 0.4)
 * @returns {boolean} Success status
 */
export function zoomOutTimeline(containerId, percentage = 0.4) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.zoomOut(percentage);
        console.log(`Timeline ${containerId} zoomed out`);
        return true;
    } catch (error) {
        console.error('Error zooming out timeline:', error);
        return false;
    }
}

/**
 * Move timeline to specific date
 * @param {string} containerId - DOM element ID
 * @param {string} date - ISO date string
 * @returns {boolean} Success status
 */
export function moveTimelineTo(containerId, date) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.moveTo(new Date(date));
        console.log(`Timeline ${containerId} moved to ${date}`);
        return true;
    } catch (error) {
        console.error('Error moving timeline:', error);
        return false;
    }
}

/**
 * Set timeline window (visible date range)
 * @param {string} containerId - DOM element ID
 * @param {string} start - Start date ISO string
 * @param {string} end - End date ISO string
 * @returns {boolean} Success status
 */
export function setTimelineWindow(containerId, start, end) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.setWindow(new Date(start), new Date(end));
        console.log(`Timeline ${containerId} window set`);
        return true;
    } catch (error) {
        console.error('Error setting timeline window:', error);
        return false;
    }
}

/**
 * Fit timeline to show all items
 * @param {string} containerId - DOM element ID
 * @returns {boolean} Success status
 */
export function fitTimelineToItems(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.fit();
        console.log(`Timeline ${containerId} fitted to items`);
        return true;
    } catch (error) {
        console.error('Error fitting timeline:', error);
        return false;
    }
}

/**
 * Select an item on the timeline
 * @param {string} containerId - DOM element ID
 * @param {string} itemId - Item ID to select
 * @returns {boolean} Success status
 */
export function selectTimelineItem(containerId, itemId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.setSelection(itemId);
        console.log(`Timeline ${containerId} item ${itemId} selected`);
        return true;
    } catch (error) {
        console.error('Error selecting timeline item:', error);
        return false;
    }
}

/**
 * Get currently selected items
 * @param {string} containerId - DOM element ID
 * @returns {Array|null} Array of selected item IDs or null
 */
export function getSelectedItems(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const selection = timeline.getSelection();
        console.log(`Timeline ${containerId} selection retrieved:`, selection);
        return selection;
    } catch (error) {
        console.error('Error getting selected items:', error);
        return null;
    }
}

/**
 * Toggle theme between light and dark
 * @returns {boolean} Success status
 */
export function toggleTimelineTheme() {
    try {
        if (typeof TimelineEnhancements === 'undefined') {
            console.error('TimelineEnhancements utility not loaded');
            return false;
        }

        TimelineEnhancements.toggleTheme();
        console.log('Timeline theme toggled');
        return true;
    } catch (error) {
        console.error('Error toggling theme:', error);
        return false;
    }
}

/**
 * Export timeline to image
 * @param {string} containerId - DOM element ID
 * @param {string} filename - Output filename
 * @returns {boolean} Success status
 */
export function exportTimelineToImage(containerId, filename = 'timeline-export.png') {
    try {
        if (typeof TimelineEnhancements === 'undefined') {
            console.error('TimelineEnhancements utility not loaded');
            return false;
        }

        TimelineEnhancements.exportToImage(containerId, filename);
        console.log(`Timeline ${containerId} export initiated`);
        return true;
    } catch (error) {
        console.error('Error exporting timeline:', error);
        return false;
    }
}

/**
 * Apply severity coloring to timeline items
 * @param {string} containerId - DOM element ID
 * @returns {boolean} Success status
 */
export function applySeverityColors(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        if (typeof TimelineEnhancements === 'undefined') {
            console.error('TimelineEnhancements utility not loaded');
            return false;
        }

        TimelineEnhancements.applySeverityColors(timeline);
        console.log(`Timeline ${containerId} severity colors applied`);
        return true;
    } catch (error) {
        console.error('Error applying severity colors:', error);
        return false;
    }
}

/**
 * Destroy timeline and cleanup resources
 * @param {string} containerId - DOM element ID
 * @returns {boolean} Success status
 */
export function destroyTimeline(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (timeline) {
            timeline.destroy();
            timelineInstances.delete(containerId);
            console.log(`Timeline ${containerId} destroyed`);
        }

        return true;
    } catch (error) {
        console.error('Error destroying timeline:', error);
        return false;
    }
}

/**
 * Destroy all timelines and cleanup resources
 * @returns {boolean} Success status
 */
export function destroyAllTimelines() {
    try {
        timelineInstances.forEach((timeline, containerId) => {
            timeline.destroy();
            console.log(`Timeline ${containerId} destroyed`);
        });

        timelineInstances.clear();

        // Dispose dotnet reference
        if (dotNetReference) {
            dotNetReference.dispose();
            dotNetReference = null;
        }

        console.log('All timelines destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying all timelines:', error);
        return false;
    }
}

/**
 * Check if timeline is initialized
 * @param {string} containerId - DOM element ID
 * @returns {boolean} Initialization status
 */
export function isTimelineInitialized(containerId) {
    return timelineInstances.has(containerId);
}

/**
 * Get current timeline window
 * @param {string} containerId - DOM element ID
 * @returns {Object|null} Window object with start and end dates or null
 */
export function getTimelineWindow(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const window = timeline.getWindow();
        return {
            start: window.start.toISOString(),
            end: window.end.toISOString()
        };
    } catch (error) {
        console.error('Error getting timeline window:', error);
        return null;
    }
}

/**
 * Focus on specific item and bring it into view
 * @param {string} containerId - DOM element ID
 * @param {string} itemId - Item ID to focus on
 * @returns {boolean} Success status
 */
export function focusOnItem(containerId, itemId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.focus(itemId);
        console.log(`Timeline ${containerId} focused on item ${itemId}`);
        return true;
    } catch (error) {
        console.error('Error focusing on item:', error);
        return false;
    }
}

/**
 * Set timeline options dynamically
 * @param {string} containerId - DOM element ID
 * @param {Object} options - New options to apply
 * @returns {boolean} Success status
 */
export function setTimelineOptions(containerId, options) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.setOptions(options);
        console.log(`Timeline ${containerId} options updated`);
        return true;
    } catch (error) {
        console.error('Error setting timeline options:', error);
        return false;
    }
}

/**
 * Redraw the timeline
 * @param {string} containerId - DOM element ID
 * @returns {boolean} Success status
 */
export function redrawTimeline(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.redraw();
        console.log(`Timeline ${containerId} redrawn`);
        return true;
    } catch (error) {
        console.error('Error redrawing timeline:', error);
        return false;
    }
}

/**
 * Get current time marker position
 * @param {string} containerId - DOM element ID
 * @returns {string|null} Current time as ISO string or null
 */
export function getCurrentTime(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const currentTime = timeline.getCurrentTime();
        return currentTime ? currentTime.toISOString() : null;
    } catch (error) {
        console.error('Error getting current time:', error);
        return null;
    }
}

/**
 * Set current time marker position
 * @param {string} containerId - DOM element ID
 * @param {string} time - ISO date string
 * @returns {boolean} Success status
 */
export function setCurrentTime(containerId, time) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.setCurrentTime(new Date(time));
        console.log(`Timeline ${containerId} current time set to ${time}`);
        return true;
    } catch (error) {
        console.error('Error setting current time:', error);
        return false;
    }
}

/**
 * Get custom time marker position
 * @param {string} containerId - DOM element ID
 * @param {string} id - Custom time marker ID
 * @returns {string|null} Custom time as ISO string or null
 */
export function getCustomTime(containerId, id) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const customTime = timeline.getCustomTime(id);
        return customTime ? customTime.toISOString() : null;
    } catch (error) {
        console.error('Error getting custom time:', error);
        return null;
    }
}

/**
 * Set custom time marker position
 * @param {string} containerId - DOM element ID
 * @param {string} time - ISO date string
 * @param {string} id - Custom time marker ID
 * @returns {boolean} Success status
 */
export function setCustomTime(containerId, time, id) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.setCustomTime(new Date(time), id);
        console.log(`Timeline ${containerId} custom time ${id} set to ${time}`);
        return true;
    } catch (error) {
        console.error('Error setting custom time:', error);
        return false;
    }
}

/**
 * Add custom time marker
 * @param {string} containerId - DOM element ID
 * @param {string} time - ISO date string
 * @param {string} id - Custom time marker ID
 * @returns {boolean} Success status
 */
export function addCustomTime(containerId, time, id) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.addCustomTime(new Date(time), id);
        console.log(`Timeline ${containerId} custom time ${id} added at ${time}`);
        return true;
    } catch (error) {
        console.error('Error adding custom time:', error);
        return false;
    }
}

/**
 * Remove custom time marker
 * @param {string} containerId - DOM element ID
 * @param {string} id - Custom time marker ID
 * @returns {boolean} Success status
 */
export function removeCustomTime(containerId, id) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.removeCustomTime(id);
        console.log(`Timeline ${containerId} custom time ${id} removed`);
        return true;
    } catch (error) {
        console.error('Error removing custom time:', error);
        return false;
    }
}

/**
 * Get visible items in current view
 * @param {string} containerId - DOM element ID
 * @returns {Array|null} Array of visible item IDs or null
 */
export function getVisibleItems(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const visibleItems = timeline.getVisibleItems();
        console.log(`Timeline ${containerId} visible items:`, visibleItems);
        return visibleItems;
    } catch (error) {
        console.error('Error getting visible items:', error);
        return null;
    }
}

/**
 * Get event properties at screen coordinates
 * @param {string} containerId - DOM element ID
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} Event properties or null
 */
export function getEventProperties(containerId, x, y) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return null;
        }

        const props = timeline.getEventProperties({ x, y });
        return props;
    } catch (error) {
        console.error('Error getting event properties:', error);
        return null;
    }
}

/**
 * Toggle rolling mode (continuous moving window)
 * @param {string} containerId - DOM element ID
 * @returns {boolean} Success status
 */
export function toggleRollingMode(containerId) {
    try {
        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not initialized`);
            return false;
        }

        timeline.toggleRollingMode();
        console.log(`Timeline ${containerId} rolling mode toggled`);
        return true;
    } catch (error) {
        console.error('Error toggling rolling mode:', error);
        return false;
    }
}

// ============================================================================
// TBML-Specific Timeline Methods
// ============================================================================

// Store playback state for shipment timeline
let shipmentTimelinePlayback = {
    interval: null,
    currentIndex: 0,
    isPlaying: false,
    containerId: null
};

/**
 * Initialize shipment timeline for TBML route analysis
 * @param {string} containerId - DOM element ID
 * @param {Array} timelineData - Shipment timeline data with linked events
 * @returns {boolean} Success status
 */
export function initializeShipmentTimeline(containerId, timelineData) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        // Check if vis.js is available
        if (typeof vis === 'undefined') {
            console.error('vis.js library not loaded');
            return false;
        }

        // Destroy existing timeline if it exists
        if (timelineInstances.has(containerId)) {
            const existingTimeline = timelineInstances.get(containerId);
            existingTimeline.destroy();
            timelineInstances.delete(containerId);
        }

        // Convert timeline data to vis.js format
        const items = timelineData.map(item => ({
            id: item.id,
            content: item.title || item.description,
            start: new Date(item.timestamp),
            type: 'point',
            className: `severity-${item.severity?.toLowerCase() || 'low'}`,
            title: `${item.entityName}<br>Amount: $${item.amount?.toLocaleString()}<br>Score: ${item.suspicionScore}`,
            // Store additional data
            data: {
                entityId: item.entityId,
                entityName: item.entityName,
                amount: item.amount,
                suspicionScore: item.suspicionScore,
                severity: item.severity,
                origin: item.origin,
                destination: item.destination,
                flags: item.flags,
                relatedEventIds: item.relatedEventIds || []
            }
        }));

        // Create DataSet
        const itemsDataSet = new vis.DataSet(items);

        // Configure timeline options for TBML visualization
        const options = {
            orientation: 'top',
            stack: true,
            showCurrentTime: true,
            showMajorLabels: true,
            showMinorLabels: true,
            selectable: true,
            multiselect: false,
            zoomable: true,
            moveable: true,
            height: '400px',
            margin: {
                item: { horizontal: 10, vertical: 10 },
                axis: 5
            },
            tooltip: {
                followMouse: true,
                overflowMethod: 'cap'
            },
            // Custom styling based on severity
            onInitialDrawComplete: function() {
                applySeverityColoring(containerId);
            }
        };

        // Create timeline
        const timeline = new vis.Timeline(container, itemsDataSet, options);

        // Add event listener for item selection
        timeline.on('select', function(properties) {
            if (properties.items && properties.items.length > 0) {
                const itemId = properties.items[0];
                const item = itemsDataSet.get(itemId);
                
                // Highlight related events if they exist
                if (item.data && item.data.relatedEventIds && item.data.relatedEventIds.length > 0) {
                    highlightRelatedShipments(containerId, itemId, item.data.relatedEventIds);
                }
                
                console.log('Selected shipment:', itemId, item);
            }
        });

        // Store timeline instance
        timelineInstances.set(containerId, timeline);
        
        // Store container ID for playback
        shipmentTimelinePlayback.containerId = containerId;

        console.log(`Shipment timeline initialized: ${containerId} with ${items.length} events`);
        return true;
    } catch (error) {
        console.error('Error initializing shipment timeline:', error);
        return false;
    }
}

/**
 * Apply severity-based coloring to timeline items
 * @param {string} containerId - DOM element ID
 */
function applySeverityColoring(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Add severity-based CSS classes
    const items = container.querySelectorAll('.vis-item');
    items.forEach(item => {
        const classes = item.className;
        if (classes.includes('severity-critical')) {
            item.style.backgroundColor = '#dc2626';
            item.style.borderColor = '#991b1b';
            item.style.color = 'white';
        } else if (classes.includes('severity-high')) {
            item.style.backgroundColor = '#f59e0b';
            item.style.borderColor = '#d97706';
            item.style.color = 'white';
        } else if (classes.includes('severity-medium')) {
            item.style.backgroundColor = '#3b82f6';
            item.style.borderColor = '#2563eb';
            item.style.color = 'white';
        } else if (classes.includes('severity-low')) {
            item.style.backgroundColor = '#10b981';
            item.style.borderColor = '#059669';
            item.style.color = 'white';
        }
    });
}

/**
 * Highlight related shipments on the timeline
 * @param {string} containerId - DOM element ID
 * @param {string} mainItemId - Main item ID
 * @param {Array} relatedIds - Array of related item IDs
 */
function highlightRelatedShipments(containerId, mainItemId, relatedIds) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove existing highlights
    const allItems = container.querySelectorAll('.vis-item');
    allItems.forEach(item => {
        item.classList.remove('related-highlight', 'main-highlight');
    });

    // Add highlight to main item
    const mainElement = container.querySelector(`.vis-item[data-id="${mainItemId}"]`);
    if (mainElement) {
        mainElement.classList.add('main-highlight');
    }

    // Add highlight to related items
    relatedIds.forEach(relatedId => {
        const relatedElement = container.querySelector(`.vis-item[data-id="${relatedId}"]`);
        if (relatedElement) {
            relatedElement.classList.add('related-highlight');
        }
    });

    console.log(`Highlighted related shipments for ${mainItemId}:`, relatedIds);
}

/**
 * Play shipment timeline animation
 * Animates through timeline events chronologically
 * @returns {boolean} Success status
 */
export function playShipmentTimeline() {
    try {
        const containerId = shipmentTimelinePlayback.containerId;
        if (!containerId) {
            console.warn('No shipment timeline initialized for playback');
            return false;
        }

        const timeline = timelineInstances.get(containerId);
        if (!timeline) {
            console.warn(`Timeline ${containerId} not found`);
            return false;
        }

        // Get all items sorted by time
        const items = timeline.itemsData.get({
            order: 'start'
        });

        if (items.length === 0) {
            console.warn('No items to play');
            return false;
        }

        // If already playing, don't start again
        if (shipmentTimelinePlayback.isPlaying) {
            console.log('Shipment timeline already playing');
            return true;
        }

        shipmentTimelinePlayback.isPlaying = true;

        // Start from current index or beginning
        if (shipmentTimelinePlayback.currentIndex >= items.length) {
            shipmentTimelinePlayback.currentIndex = 0;
        }

        // Animate through items
        shipmentTimelinePlayback.interval = setInterval(() => {
            if (shipmentTimelinePlayback.currentIndex < items.length) {
                const currentItem = items[shipmentTimelinePlayback.currentIndex];
                
                // Select current item
                timeline.setSelection([currentItem.id]);
                
                // Move timeline view to current item
                timeline.focus(currentItem.id, {
                    animation: {
                        duration: 500,
                        easingFunction: 'easeInOutQuad'
                    }
                });

                shipmentTimelinePlayback.currentIndex++;
            } else {
                // Reached end, stop playback
                pauseShipmentTimeline();
            }
        }, 2000); // 2 seconds per item

        console.log('Shipment timeline playback started');
        return true;
    } catch (error) {
        console.error('Error playing shipment timeline:', error);
        return false;
    }
}

/**
 * Pause shipment timeline animation
 * @returns {boolean} Success status
 */
export function pauseShipmentTimeline() {
    try {
        if (shipmentTimelinePlayback.interval) {
            clearInterval(shipmentTimelinePlayback.interval);
            shipmentTimelinePlayback.interval = null;
        }
        shipmentTimelinePlayback.isPlaying = false;
        
        console.log('Shipment timeline playback paused');
        return true;
    } catch (error) {
        console.error('Error pausing shipment timeline:', error);
        return false;
    }
}

/**
 * Stop shipment timeline animation and reset to beginning
 * @returns {boolean} Success status
 */
export function stopShipmentTimeline() {
    try {
        // Clear interval
        if (shipmentTimelinePlayback.interval) {
            clearInterval(shipmentTimelinePlayback.interval);
            shipmentTimelinePlayback.interval = null;
        }
        
        // Reset playback state
        shipmentTimelinePlayback.isPlaying = false;
        shipmentTimelinePlayback.currentIndex = 0;

        // Clear selection
        const containerId = shipmentTimelinePlayback.containerId;
        if (containerId) {
            const timeline = timelineInstances.get(containerId);
            if (timeline) {
                timeline.setSelection([]);
                // Fit all items in view
                timeline.fit({
                    animation: {
                        duration: 500,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        }
        
        console.log('Shipment timeline playback stopped and reset');
        return true;
    } catch (error) {
        console.error('Error stopping shipment timeline:', error);
        return false;
    }
}

/**
 * Destroy TBML-specific visualizations and cleanup resources
 * @returns {boolean} Success status
 */
export function destroyTbmlVisualizations() {
    try {
        // Stop any ongoing playback
        stopShipmentTimeline();

        // Destroy shipment timeline if it exists
        const containerId = shipmentTimelinePlayback.containerId;
        if (containerId && timelineInstances.has(containerId)) {
            const timeline = timelineInstances.get(containerId);
            timeline.destroy();
            timelineInstances.delete(containerId);
        }

        // Reset playback state
        shipmentTimelinePlayback = {
            interval: null,
            currentIndex: 0,
            isPlaying: false,
            containerId: null
        };

        console.log('TBML visualizations destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying TBML visualizations:', error);
        return false;
    }
}
