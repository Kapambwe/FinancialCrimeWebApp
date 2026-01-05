/**
 * Timeline Enhancements JavaScript Utilities
 * Modern timeline features and interactions
 * Version: 1.0
 * Date: 2025-11-10
 */

(function (window) {
  'use strict';

  /**
   * TimelineEnhancements - Main utility object
   */
  const TimelineEnhancements = {
    /**
     * Initialize enhanced timeline with modern features
     * @param {string} containerId - DOM element ID
     * @param {Array} items - Timeline items
     * @param {Object} groups - Timeline groups
     * @param {Object} options - Configuration options
     * @returns {Object} Timeline instance
     */
    initialize: function (containerId, items, groups, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Timeline container not found: ${containerId}`);
        return null;
      }

      // Merge with default enhanced options
      const enhancedOptions = this.getEnhancedOptions(options);

      // Create timeline
      const timeline = new vis.Timeline(container, items, groups, enhancedOptions);

      // Add enhanced features
      this.addEnhancedTooltips(timeline, container);
      this.addKeyboardNavigation(timeline);
      this.addThemeSupport(container);
      this.addPatternDetection(timeline, items);

      return timeline;
    },

    /**
     * Get enhanced default options
     */
    getEnhancedOptions: function (customOptions) {
      const defaults = {
        // Visual
        orientation: 'both',
        stack: true,
        stackSubgroups: true,
        showCurrentTime: true,
        showMajorLabels: true,
        showMinorLabels: true,

        // Interaction
        selectable: true,
        multiselect: false,
        editable: false,
        zoomable: true,
        zoomMin: 1000 * 60 * 60 * 24,      // 1 day
        zoomMax: 1000 * 60 * 60 * 24 * 365, // 1 year
        moveable: true,
        verticalScroll: true,
        zoomKey: 'ctrlKey',

        // Styling
        margin: {
          item: {
            horizontal: 10,
            vertical: 10
          },
          axis: 5
        },

        // Performance
        throttleRedraw: 16, // 60fps

        // Custom template
        template: function (item, element, data) {
          return TimelineEnhancements.renderEnhancedItem(item);
        },

        groupTemplate: function (group, element, data) {
          return TimelineEnhancements.renderEnhancedGroup(group);
        }
      };

      return Object.assign({}, defaults, customOptions);
    },

    /**
     * Render enhanced item with severity and source indicators
     */
    renderEnhancedItem: function (item) {
      const severity = item.severity || 'medium';
      const source = item.source || '';
      const confidence = item.confidence || 0;
      const eventType = item.eventType || 'general';
      const classification = item.classification || '';

      let html = '<div class="enhanced-timeline-item">';

      // Classification banner (if exists)
      if (classification) {
        const classLevel = classification.toLowerCase().replace(/\s+/g, '-');
        html += `<span class="classification-banner ${classLevel}">${classification}</span>`;
      }

      // Header with badges
      html += '<div class="item-header">';
      if (source) {
        html += `<span class="source-indicator ${source.toLowerCase()}">${source.toUpperCase()}</span>`;
      }
      html += `<span class="severity-badge ${severity}">${severity.toUpperCase()}</span>`;
      html += '</div>';

      // Content
      html += '<div class="item-content">';
      html += `<div class="timeline-event-label">${eventType}</div>`;
      html += `<div>${item.content}</div>`;

      // Entity chain (if exists)
      if (item.entities && item.entities.length > 0) {
        html += '<div class="entity-chain">';
        item.entities.forEach((entity, index) => {
          if (index > 0) {
            html += '<div class="relationship-arrow">→</div>';
          }
          html += `<div class="entity-node"><span class="entity-name">${entity}</span></div>`;
        });
        html += '</div>';
      }

      // Metadata
      if (item.start) {
        html += `<div class="timeline-timestamp">${this.formatTimestamp(item.start)}</div>`;
      }

      html += '</div>';

      // Confidence meter (if exists)
      if (confidence > 0) {
        html += '<div class="confidence-meter">';
        html += `<div class="confidence-fill" style="width: ${confidence}%"></div>`;
        html += `<span class="confidence-value">${confidence}%</span>`;
        html += '</div>';
      }

      html += '</div>';

      return html;
    },

    /**
     * Render enhanced group with statistics
     */
    renderEnhancedGroup: function (group) {
      const itemCount = group.itemCount || '';
      return `
        <div class="enhanced-group-label">
          <span class="group-name">${group.content}</span>
          ${itemCount ? `<span class="group-stats">${itemCount}</span>` : ''}
        </div>
      `;
    },

    /**
     * Add enhanced tooltip system
     */
    addEnhancedTooltips: function (timeline, container) {
      let tooltipElement = null;

      timeline.on('itemover', function (properties) {
        const item = timeline.itemsData.get(properties.item);
        if (!item) return;

        // Remove existing tooltip
        if (tooltipElement) {
          tooltipElement.remove();
        }

        // Create tooltip
        tooltipElement = TimelineEnhancements.createTooltip(item, properties.event);
        container.appendChild(tooltipElement);

        // Position tooltip
        TimelineEnhancements.positionTooltip(tooltipElement, properties.event);
      });

      timeline.on('itemout', function () {
        if (tooltipElement) {
          tooltipElement.remove();
          tooltipElement = null;
        }
      });

      // Remove tooltip when scrolling or zooming
      timeline.on('rangechange', function () {
        if (tooltipElement) {
          tooltipElement.remove();
          tooltipElement = null;
        }
      });
    },

    /**
     * Create rich tooltip card
     */
    createTooltip: function (item, event) {
      const tooltip = document.createElement('div');
      tooltip.className = 'timeline-tooltip-card';
      tooltip.style.position = 'absolute';
      tooltip.style.zIndex = '10000';

      const severity = item.severity || 'medium';
      const source = item.source || 'Unknown';
      const eventType = item.eventType || 'Event';
      const confidence = item.confidence || 0;

      tooltip.innerHTML = `
        <div class="tooltip-header">
          <span class="event-type-badge">${eventType}</span>
          <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
        </div>
        <div class="tooltip-body">
          <h4>${item.content}</h4>
          <div class="tooltip-meta">
            <div class="meta-item">
              <i class="material-icons">calendar_today</i>
              <span>${this.formatTimestamp(item.start)}</span>
            </div>
            ${item.location ? `
              <div class="meta-item">
                <i class="material-icons">location_on</i>
                <span>${item.location}</span>
              </div>
            ` : ''}
            ${item.entities ? `
              <div class="meta-item">
                <i class="material-icons">link</i>
                <span>${item.entities.join(' → ')}</span>
              </div>
            ` : ''}
          </div>
          ${confidence > 0 ? `
            <div class="confidence-score">
              <span>Confidence: ${confidence}%</span>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${confidence}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="tooltip-footer">
          <button class="tooltip-action" onclick="TimelineEnhancements.handleTooltipAction('details', '${item.id}')">
            View Details
          </button>
          <button class="tooltip-action" onclick="TimelineEnhancements.handleTooltipAction('alert', '${item.id}')">
            Create Alert
          </button>
        </div>
      `;

      return tooltip;
    },

    /**
     * Position tooltip near cursor
     */
    positionTooltip: function (tooltip, event) {
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = event.pageX + 15;
      let top = event.pageY - 15;

      // Adjust if tooltip goes off screen
      if (left + tooltipRect.width > viewportWidth) {
        left = event.pageX - tooltipRect.width - 15;
      }

      if (top + tooltipRect.height > viewportHeight) {
        top = event.pageY - tooltipRect.height - 15;
      }

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    },

    /**
     * Handle tooltip action buttons
     */
    handleTooltipAction: function (action, itemId) {
      console.log(`Tooltip action: ${action} for item: ${itemId}`);
      // Dispatch custom event that Blazor can listen to
      const event = new CustomEvent('timelineTooltipAction', {
        detail: { action: action, itemId: itemId }
      });
      window.dispatchEvent(event);
    },

    /**
     * Add keyboard navigation
     */
    addKeyboardNavigation: function (timeline) {
      document.addEventListener('keydown', function (e) {
        // Don't intercept if user is typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }

        const window = timeline.getWindow();
        const range = window.end - window.start;
        const step = range * 0.1; // 10% of current window

        switch (e.key) {
          case 'ArrowLeft':
            timeline.moveTo(new Date(window.start - step));
            e.preventDefault();
            break;
          case 'ArrowRight':
            timeline.moveTo(new Date(window.start + step));
            e.preventDefault();
            break;
          case '+':
          case '=':
            timeline.zoomIn(0.4);
            e.preventDefault();
            break;
          case '-':
          case '_':
            timeline.zoomOut(0.4);
            e.preventDefault();
            break;
          case 'Home':
            const items = timeline.itemsData.get();
            if (items.length > 0) {
              const startDate = Math.min(...items.map(item => new Date(item.start)));
              timeline.moveTo(new Date(startDate));
            }
            e.preventDefault();
            break;
          case 'End':
            const endItems = timeline.itemsData.get();
            if (endItems.length > 0) {
              const endDate = Math.max(...endItems.map(item => new Date(item.end || item.start)));
              timeline.moveTo(new Date(endDate));
            }
            e.preventDefault();
            break;
        }
      });
    },

    /**
     * Add theme toggle support
     */
    addThemeSupport: function (container) {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('timeline-theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      // Create theme toggle button if it doesn't exist
      if (!document.getElementById('timeline-theme-toggle')) {
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'timeline-theme-toggle';
        toggleBtn.innerHTML = `
          <button id="timeline-theme-toggle" aria-label="Toggle dark mode">
            <i class="material-icons light-icon">light_mode</i>
            <i class="material-icons dark-icon">dark_mode</i>
          </button>
        `;

        container.parentElement.style.position = 'relative';
        container.parentElement.insertBefore(toggleBtn, container);

        // Add click handler
        document.getElementById('timeline-theme-toggle').addEventListener('click', function () {
          TimelineEnhancements.toggleTheme();
        });
      }
    },

    /**
     * Toggle between light and dark themes
     */
    toggleTheme: function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('timeline-theme', newTheme);

      // Dispatch theme change event
      const event = new CustomEvent('themeChanged', { detail: { theme: newTheme } });
      window.dispatchEvent(event);
    },

    /**
     * Detect and highlight patterns (bursts, gaps, correlations)
     */
    addPatternDetection: function (timeline, items) {
      const itemArray = items.get();

      // Detect bursts (high frequency in short time)
      const bursts = this.detectBursts(itemArray);
      if (bursts.length > 0) {
        console.log('Detected bursts:', bursts);
        // Could add visual indicators for bursts
      }

      // Detect suspicious gaps
      const gaps = this.detectGaps(itemArray);
      if (gaps.length > 0) {
        console.log('Detected gaps:', gaps);
      }
    },

    /**
     * Detect bursts of activity
     */
    detectBursts: function (items) {
      const bursts = [];
      const threshold = 5; // Number of events
      const timeWindow = 60 * 60 * 1000; // 1 hour

      const sortedItems = items.sort((a, b) => new Date(a.start) - new Date(b.start));

      for (let i = 0; i < sortedItems.length; i++) {
        const currentTime = new Date(sortedItems[i].start);
        let count = 1;

        for (let j = i + 1; j < sortedItems.length; j++) {
          const nextTime = new Date(sortedItems[j].start);
          if (nextTime - currentTime < timeWindow) {
            count++;
          } else {
            break;
          }
        }

        if (count >= threshold) {
          bursts.push({
            start: currentTime,
            count: count,
            items: sortedItems.slice(i, i + count)
          });
        }
      }

      return bursts;
    },

    /**
     * Detect suspicious gaps in activity
     */
    detectGaps: function (items) {
      const gaps = [];
      const threshold = 24 * 60 * 60 * 1000; // 24 hours

      const sortedItems = items.sort((a, b) => new Date(a.start) - new Date(b.start));

      for (let i = 0; i < sortedItems.length - 1; i++) {
        const currentTime = new Date(sortedItems[i].start);
        const nextTime = new Date(sortedItems[i + 1].start);
        const gap = nextTime - currentTime;

        if (gap > threshold) {
          gaps.push({
            start: currentTime,
            end: nextTime,
            duration: gap
          });
        }
      }

      return gaps;
    },

    /**
     * Format timestamp for display
     */
    formatTimestamp: function (date) {
      const d = new Date(date);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      return d.toLocaleString('en-US', options);
    },

    /**
     * Apply severity coloring to timeline items
     */
    applySeverityColors: function (timeline) {
      const items = timeline.itemsData.get();

      items.forEach(item => {
        const severity = item.severity || 'medium';
        const element = document.querySelector(`[data-id="${item.id}"]`);

        if (element) {
          element.setAttribute('data-severity', severity);
        }
      });
    },

    /**
     * Add classification markers to items
     */
    addClassificationMarkers: function (item, classification) {
      if (!classification) return '';

      const classLevel = classification.toLowerCase().replace(/\s+/g, '-');
      return `<span class="classification-banner ${classLevel}">${classification}</span>`;
    },

    /**
     * Filter timeline by criteria
     */
    filterTimeline: function (timeline, criteria) {
      const allItems = timeline.itemsData.get();

      const filtered = allItems.filter(item => {
        let matches = true;

        if (criteria.severity) {
          matches = matches && item.severity === criteria.severity;
        }

        if (criteria.eventType) {
          matches = matches && item.eventType === criteria.eventType;
        }

        if (criteria.source) {
          matches = matches && item.source === criteria.source;
        }

        if (criteria.dateRange) {
          const itemDate = new Date(item.start);
          matches = matches &&
            itemDate >= criteria.dateRange.start &&
            itemDate <= criteria.dateRange.end;
        }

        if (criteria.entities) {
          matches = matches &&
            item.entities &&
            criteria.entities.some(e => item.entities.includes(e));
        }

        return matches;
      });

      // Update timeline with filtered items
      timeline.setItems(filtered);

      return filtered;
    },

    /**
     * Export timeline to image
     */
    exportToImage: function (containerId, filename = 'timeline-export.png') {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Use html2canvas if available
      if (window.html2canvas) {
        html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false
        }).then(canvas => {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
        });
      } else {
        console.error('html2canvas library not loaded');
      }
    },

    /**
     * Get timeline statistics
     */
    getStatistics: function (timeline) {
      const items = timeline.itemsData.get();

      const stats = {
        total: items.length,
        bySeverity: {},
        byEventType: {},
        bySource: {},
        dateRange: {
          start: null,
          end: null
        }
      };

      items.forEach(item => {
        // Severity counts
        const severity = item.severity || 'unknown';
        stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

        // Event type counts
        const eventType = item.eventType || 'unknown';
        stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;

        // Source counts
        const source = item.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;

        // Date range
        const itemDate = new Date(item.start);
        if (!stats.dateRange.start || itemDate < stats.dateRange.start) {
          stats.dateRange.start = itemDate;
        }
        if (!stats.dateRange.end || itemDate > stats.dateRange.end) {
          stats.dateRange.end = itemDate;
        }
      });

      return stats;
    },

    /**
     * Highlight related items
     */
    highlightRelatedItems: function (timeline, itemId) {
      const item = timeline.itemsData.get(itemId);
      if (!item) return;

      const allItems = timeline.itemsData.get();
      const relatedIds = [];

      // Find items with matching entities
      if (item.entities) {
        allItems.forEach(otherItem => {
          if (otherItem.id !== itemId && otherItem.entities) {
            const hasCommonEntity = item.entities.some(e =>
              otherItem.entities.includes(e)
            );
            if (hasCommonEntity) {
              relatedIds.push(otherItem.id);
            }
          }
        });
      }

      // Apply connected class
      const allElements = document.querySelectorAll('.vis-item');
      allElements.forEach(el => {
        const elId = el.getAttribute('data-id');
        if (relatedIds.includes(elId)) {
          el.classList.add('connected');
        } else {
          el.classList.remove('connected');
        }
      });

      return relatedIds;
    }
  };

  // Expose to global scope
  window.TimelineEnhancements = TimelineEnhancements;

})(window);

// Initialize any timeline with data-timeline-enhanced attribute
document.addEventListener('DOMContentLoaded', function () {
  const enhancedTimelines = document.querySelectorAll('[data-timeline-enhanced]');

  enhancedTimelines.forEach(container => {
    console.log('Auto-initializing enhanced timeline:', container.id);
    // Timeline should be initialized by Blazor components
    // This just adds the enhanced features if vis.Timeline is already loaded
  });
});
