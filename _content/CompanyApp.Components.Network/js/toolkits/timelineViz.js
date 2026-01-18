/**
 * TimelineViz Toolkit - Timeline Visualization for Event Analysis
 * Inspired by TimelineVisualization for investigating sequences of events
 * Perfect for crime investigations, fraud detection, and pattern analysis
 */

class TimelineViz {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }

        this.options = {
            width: options.width || this.container.clientWidth || 800,
            height: options.height || this.container.clientHeight || 400,
            margin: { top: 40, right: 30, bottom: 60, left: 60 },
            rowHeight: 60,
            ...options
        };

        this.events = [];
        this.svg = null;
        this.xScale = null;
        this.timeExtent = null;
        this.selectedEvent = null;
        
        this.init();
    }

    init() {
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .attr('class', 'timeline-viz');

        // Create main group
        this.mainGroup = this.svg.append('g')
            .attr('transform', `translate(${this.options.margin.left},${this.options.margin.top})`);

        // Create groups for different elements
        this.axisGroup = this.mainGroup.append('g').attr('class', 'axis');
        this.eventGroup = this.mainGroup.append('g').attr('class', 'events');
        this.brushGroup = this.mainGroup.append('g').attr('class', 'brush');

        console.log('TimelineViz initialized');
    }

    loadData(events) {
        this.events = events.map(e => ({
            ...e,
            date: new Date(e.timestamp || e.date),
            severity: e.severity || 'Medium'
        }));

        // Sort events by date
        this.events.sort((a, b) => a.date - b.date);

        // Group events by entity/lane if needed
        this.groupEvents();

        this.render();
    }

    groupEvents() {
        // Group events by entity or type for multi-lane display
        const groups = {};
        
        this.events.forEach(event => {
            const key = event.entityId || event.type || 'default';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(event);
        });

        this.eventGroups = groups;
        this.lanes = Object.keys(groups);
    }

    render() {
        const innerWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        const innerHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;

        // Set up time scale
        this.timeExtent = d3.extent(this.events, d => d.date);
        this.xScale = d3.scaleTime()
            .domain(this.timeExtent)
            .range([0, innerWidth]);

        // Create axis
        const xAxis = d3.axisBottom(this.xScale)
            .ticks(8)
            .tickFormat(d3.timeFormat('%Y-%m-%d %H:%M'));

        this.axisGroup
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .style('font-size', '11px')
            .style('fill', '#374151')
            .style('font-weight', '500')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // Style axis line and ticks
        this.axisGroup.selectAll('line')
            .style('stroke', '#9ca3af');

        this.axisGroup.select('.domain')
            .style('stroke', '#9ca3af');

        // Render events
        this.renderEvents(innerWidth, innerHeight);

        // Add brush for zooming
        this.addBrush(innerWidth, innerHeight);

        // Add playback controls
        this.addPlaybackControls();
    }

    renderEvents(width, height) {
        const laneHeight = this.options.rowHeight;
        const eventRadius = 8;

        // Render lanes
        this.lanes.forEach((lane, i) => {
            const y = i * laneHeight;
            
            // Lane background
            this.eventGroup.append('rect')
                .attr('class', 'lane')
                .attr('x', 0)
                .attr('y', y)
                .attr('width', width)
                .attr('height', laneHeight)
                .attr('fill', i % 2 === 0 ? '#f8f9fa' : '#ffffff')
                .attr('stroke', '#dee2e6')
                .attr('stroke-width', 1);

            // Lane label
            this.eventGroup.append('text')
                .attr('x', -10)
                .attr('y', y + laneHeight / 2)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text(this.getLaneLabel(lane));

            // Events in this lane
            const laneEvents = this.eventGroups[lane];
            
            laneEvents.forEach(event => {
                const x = this.xScale(event.date);
                const y_pos = y + laneHeight / 2;

                // Event circle
                const eventCircle = this.eventGroup.append('circle')
                    .datum(event)  // Bind event data to the element
                    .attr('class', 'event-point')
                    .attr('cx', x)
                    .attr('cy', y_pos)
                    .attr('r', eventRadius)
                    .attr('fill', this.getEventColor(event))
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2)
                    .style('cursor', 'pointer')
                    .on('click', (e) => this.handleEventClick(e, event))
                    .on('mouseover', (e) => this.showEventTooltip(e, event))
                    .on('mouseout', () => this.hideTooltip());

                // Event icon (simplified)
                this.eventGroup.append('text')
                    .attr('x', x)
                    .attr('y', y_pos)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .style('font-size', '10px')
                    .style('fill', '#fff')
                    .style('pointer-events', 'none')
                    .text(this.getEventIcon(event));

                // Connect events with lines if they're related
                if (event.relatedEventIds && event.relatedEventIds.length > 0) {
                    event.relatedEventIds.forEach(relatedId => {
                        const relatedEvent = this.events.find(e => e.id === relatedId);
                        if (relatedEvent) {
                            const x2 = this.xScale(relatedEvent.date);
                            const lane2 = this.getLaneForEvent(relatedEvent);
                            const y2 = this.lanes.indexOf(lane2) * laneHeight + laneHeight / 2;

                            this.eventGroup.append('line')
                                .attr('class', 'event-connection')
                                .attr('x1', x)
                                .attr('y1', y_pos)
                                .attr('x2', x2)
                                .attr('y2', y2)
                                .attr('stroke', '#95a5a6')
                                .attr('stroke-width', 1)
                                .attr('stroke-dasharray', '3,3')
                                .style('opacity', 0.5);
                        }
                    });
                }
            });
        });
    }

    getEventColor(event) {
        const severityColors = {
            'Critical': '#e74c3c',
            'High': '#e67e22',
            'Medium': '#f39c12',
            'Low': '#3498db',
            'Info': '#95a5a6'
        };
        
        return severityColors[event.severity] || '#3498db';
    }

    getEventIcon(event) {
        const iconMap = {
            'Transaction': '$',
            'Communication': '✉',
            'Movement': '➜',
            'Incident': '!',
            'Arrest': '⚠',
            'Meeting': '👥',
            'Alert': '🔔'
        };
        
        return iconMap[event.type] || '●';
    }

    getLaneLabel(lane) {
        // Try to get a friendly name for the lane
        if (lane === 'default') return 'Events';
        
        // Look up entity name if it's an entity ID
        const entity = this.events.find(e => (e.entityId || e.type) === lane);
        if (entity && entity.entityName) return entity.entityName;
        
        return lane;
    }

    getLaneForEvent(event) {
        return event.entityId || event.type || 'default';
    }

    handleEventClick(e, event) {
        // Deselect previous
        this.eventGroup.selectAll('.event-point')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Select current
        d3.select(e.currentTarget)
            .attr('stroke', '#f39c12')
            .attr('stroke-width', 4);

        this.selectedEvent = event;

        // Trigger callback
        if (this.options.onEventClick) {
            this.options.onEventClick(event);
        }
    }

    showEventTooltip(e, event) {
        const tooltip = this.getOrCreateTooltip();

        let content = `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 400px;">`;
        content += `<div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #fff; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${event.title || event.type}</div>`;

        // Date and Type
        content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">DATE:</span> <span style="color: #fff; font-weight: 500;">${d3.timeFormat('%Y-%m-%d %H:%M')(event.date)}</span></div>`;
        content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">TYPE:</span> <span style="color: #fff;">${event.type || 'N/A'}</span></div>`;

        // Severity with color coding
        content += `<div style="margin-bottom: 6px;"><span style="color: #9ca3af; font-size: 11px;">SEVERITY:</span> <span style="color: ${this.getEventColor(event)}; font-weight: 700; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">${event.severity || 'Unknown'}</span></div>`;

        // Amount
        if (event.amount) {
            content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">AMOUNT:</span> <span style="color: #4ade80; font-weight: 600;">$${event.amount.toLocaleString()}</span></div>`;
        }

        // Risk Score with progress bar
        if (event.suspicionScore) {
            const scoreColor = event.suspicionScore >= 9 ? '#ef4444' :
                             event.suspicionScore >= 7.5 ? '#f97316' :
                             event.suspicionScore >= 5 ? '#f59e0b' : '#3b82f6';
            content += `<div style="margin-bottom: 6px;">`;
            content += `<span style="color: #9ca3af; font-size: 11px;">RISK SCORE:</span> <span style="color: ${scoreColor}; font-weight: 700;">${event.suspicionScore.toFixed(1)}/10</span>`;
            content += `<div style="background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; margin-top: 3px; overflow: hidden;">`;
            content += `<div style="background: ${scoreColor}; height: 100%; width: ${event.suspicionScore * 10}%; transition: width 0.3s;"></div>`;
            content += `</div></div>`;
        }

        // Reference
        if (event.reference) {
            content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">REFERENCE:</span> <span style="color: #60a5fa; font-family: monospace; font-size: 11px;">${event.reference}</span></div>`;
        }

        // Entity/Route
        if (event.entityName) {
            content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">ROUTE:</span> <span style="color: #fff;">${event.entityName}</span></div>`;
        } else if (event.entityId) {
            content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">ENTITY:</span> <span style="color: #fff;">${event.entityId}</span></div>`;
        }

        // Origin and Destination
        if (event.origin || event.destination) {
            content += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">`;
            if (event.origin) {
                content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">ORIGIN:</span> <span style="color: #a78bfa;">📍 ${event.origin}</span></div>`;
            }
            if (event.destination) {
                content += `<div style="margin-bottom: 4px;"><span style="color: #9ca3af; font-size: 11px;">DESTINATION:</span> <span style="color: #fb923c;">📍 ${event.destination}</span></div>`;
            }
            content += `</div>`;
        }

        // Flags/Red Flags
        if (event.flags && event.flags.length > 0) {
            content += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">`;
            content += `<div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">RED FLAGS:</div>`;
            content += `<div style="display: flex; flex-wrap: wrap; gap: 4px;">`;
            event.flags.forEach(flag => {
                content += `<span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3);">${flag}</span>`;
            });
            content += `</div></div>`;
        }

        // Linked Events Indicator
        if (event.relatedEventIds && event.relatedEventIds.length > 0) {
            content += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">`;
            content += `<div style="color: #9ca3af; font-size: 11px;">🔗 <span style="color: #fbbf24; font-weight: 600;">LINKED TO ${event.relatedEventIds.length} EVENT(S)</span></div>`;
            content += `</div>`;
        }

        content += `</div>`;

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        tooltip.style.left = (e.pageX + 15) + 'px';
        tooltip.style.top = (e.pageY - 10) + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('timeline-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    getOrCreateTooltip() {
        let tooltip = document.getElementById('timeline-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'timeline-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: linear-gradient(135deg, rgba(17,24,39,0.98) 0%, rgba(31,41,55,0.98) 100%);
                color: white;
                padding: 12px 14px;
                border-radius: 8px;
                font-size: 12px;
                pointer-events: none;
                z-index: 10000;
                display: none;
                max-width: 320px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
                line-height: 1.5;
            `;
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    addBrush(width, height) {
        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on('end', (event) => {
                if (!event.selection) return;
                
                const [x0, x1] = event.selection;
                const newDomain = [this.xScale.invert(x0), this.xScale.invert(x1)];
                
                // Update scale
                this.xScale.domain(newDomain);
                
                // Re-render
                this.eventGroup.selectAll('*').remove();
                this.axisGroup.selectAll('*').remove();
                this.render();
                
                // Clear brush
                this.brushGroup.call(brush.move, null);
                
                if (this.options.onTimeRangeChange) {
                    this.options.onTimeRangeChange(newDomain);
                }
            });

        this.brushGroup.call(brush);
    }

    addPlaybackControls() {
        // Add playback functionality
        this.playbackIndex = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1000; // ms per event
    }

    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.playbackIndex = 0;
        
        this.playbackTimer = setInterval(() => {
            if (this.playbackIndex >= this.events.length) {
                this.stop();
                return;
            }
            
            const event = this.events[this.playbackIndex];
            this.highlightEventAtTime(event.date);
            
            if (this.options.onPlaybackTick) {
                this.options.onPlaybackTick(event, this.playbackIndex);
            }
            
            this.playbackIndex++;
        }, this.playbackSpeed);
    }

    pause() {
        this.isPlaying = false;
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
        }
    }

    stop() {
        this.pause();
        this.playbackIndex = 0;
        this.eventGroup.selectAll('.event-point').style('opacity', 1);
    }

    highlightEventAtTime(date) {
        this.eventGroup.selectAll('.event-point')
            .style('opacity', d => {
                // Safety check: ensure d and d.date exist
                if (!d || !d.date) return 1;
                return d.date <= date ? 1 : 0.2;
            });
    }

    filterByDateRange(startDate, endDate) {
        this.xScale.domain([startDate, endDate]);
        
        this.eventGroup.selectAll('*').remove();
        this.axisGroup.selectAll('*').remove();
        this.render();
    }

    resetZoom() {
        this.xScale.domain(this.timeExtent);

        this.eventGroup.selectAll('*').remove();
        this.axisGroup.selectAll('*').remove();
        this.render();
    }

    zoomIn() {
        if (!this.xScale || !this.timeExtent) return;

        const currentDomain = this.xScale.domain();
        const center = new Date((currentDomain[0].getTime() + currentDomain[1].getTime()) / 2);
        const range = currentDomain[1].getTime() - currentDomain[0].getTime();
        const newRange = range * 0.7; // Zoom in by 30%

        const newDomain = [
            new Date(center.getTime() - newRange / 2),
            new Date(center.getTime() + newRange / 2)
        ];

        this.filterByDateRange(newDomain[0], newDomain[1]);
    }

    zoomOut() {
        if (!this.xScale || !this.timeExtent) return;

        const currentDomain = this.xScale.domain();
        const center = new Date((currentDomain[0].getTime() + currentDomain[1].getTime()) / 2);
        const range = currentDomain[1].getTime() - currentDomain[0].getTime();
        const newRange = range * 1.3; // Zoom out by 30%

        const newDomain = [
            new Date(Math.max(center.getTime() - newRange / 2, this.timeExtent[0].getTime())),
            new Date(Math.min(center.getTime() + newRange / 2, this.timeExtent[1].getTime()))
        ];

        this.filterByDateRange(newDomain[0], newDomain[1]);
    }

    setZoomLevel(level) {
        if (!this.timeExtent) return;

        const totalRange = this.timeExtent[1].getTime() - this.timeExtent[0].getTime();
        const zoomFactor = level / 12; // Normalize to 0-1 range
        const newRange = totalRange * (1 - zoomFactor * 0.9);

        const center = new Date((this.timeExtent[0].getTime() + this.timeExtent[1].getTime()) / 2);

        const newDomain = [
            new Date(center.getTime() - newRange / 2),
            new Date(center.getTime() + newRange / 2)
        ];

        this.filterByDateRange(newDomain[0], newDomain[1]);
    }

    setPosition(position) {
        if (!this.timeExtent) return;

        const totalRange = this.timeExtent[1].getTime() - this.timeExtent[0].getTime();
        const positionFactor = position / 100; // Normalize to 0-1 range

        const targetTime = this.timeExtent[0].getTime() + (totalRange * positionFactor);

        // Highlight events up to this time
        this.highlightEventAtTime(new Date(targetTime));

        if (this.options.onPositionChange) {
            this.options.onPositionChange(new Date(targetTime), position);
        }
    }

    filterByEntity(entityId) {
        this.eventGroup.selectAll('.event-point')
            .style('opacity', d => {
                return (d.entityId === entityId || d.suspect === entityId) ? 1 : 0.2;
            })
            .attr('stroke', d => {
                return (d.entityId === entityId || d.suspect === entityId) ? '#f39c12' : '#fff';
            })
            .attr('stroke-width', d => {
                return (d.entityId === entityId || d.suspect === entityId) ? 4 : 2;
            });
    }

    reset() {
        this.stop();
        this.playbackIndex = 0;
        this.eventGroup.selectAll('.event-point')
            .style('opacity', 1)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);
        this.resetZoom();
    }

    destroy() {
        this.stop();
        if (this.svg) {
            this.svg.remove();
        }
        const tooltip = document.getElementById('timeline-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// Make TimelineViz globally available for direct usage
if (typeof window !== 'undefined') {
    window.TimelineViz = TimelineViz;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineViz;
}
