/**
 * NetworkGraph Network Visualization Wrapper
 * Provides integration between Blazor and NetworkGraph SDK
 * Falls back to D3.js if NetworkGraph is not available
 *
 * DEPENDENCIES:
 * - NetworkGraph SDK (commercial license required)
 * OR
 * - D3.js v7+ as fallback (https://d3js.org/)
 */

class NetworkGraphNetworkGraph {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }

        this.containerId = containerId;
        this.options = {
            width: options.width || this.container.clientWidth || 800,
            height: options.height || this.container.clientHeight || 600,
            layout: options.layout || 'force',
            ...options
        };

        this.chart = null;
        this.nodes = [];
        this.links = [];
        this.isNetworkGraphAvailable = typeof NetworkGraph !== 'undefined';

        console.log(`NetworkGraph available: ${this.isNetworkGraphAvailable}`);

        this.init();
    }

    init() {
        if (this.isNetworkGraphAvailable) {
            this.initNetworkGraph();
        } else {
            console.warn('NetworkGraph not available, falling back to D3.js');
            this.initD3Fallback();
        }
    }

    initNetworkGraph() {
        try {
            // Initialize NetworkGraph chart
            NetworkGraph.create(this.containerId, {
                width: this.options.width,
                height: this.options.height,
                type: 'graph'
            }, (err, chart) => {
                if (err) {
                    console.error('NetworkGraph initialization error:', err);
                    this.initD3Fallback();
                    return;
                }

                this.chart = chart;

                // Configure chart options
                this.chart.options({
                    foreground: {
                        node: {
                            radius: 20,
                            labelOpacity: 1,
                            label: 'name',
                            color: (item) => this.getNodeColor(item.d),
                            size: (item) => this.getNodeSize(item.d)
                        },
                        link: {
                            color: '#999',
                            width: 2,
                            arrow: 'end'
                        }
                    },
                    layout: {
                        type: this.options.layout === 'force' ? 'standard' :
                              this.options.layout === 'radial' ? 'radial' :
                              this.options.layout === 'hierarchical' ? 'hierarchy' : 'standard',
                        gravity: 0.1,
                        linkLength: 100
                    }
                });

                // Set up event handlers
                this.chart.bind('click', (event) => {
                    if (event.id && event.t === 'node') {
                        this.onNodeClick(event.id, event);
                    }
                });

                this.chart.bind('double-click', (event) => {
                    if (event.id && event.t === 'node') {
                        this.onNodeDoubleClick(event.id, event);
                    }
                });

                console.log('NetworkGraph chart initialized');
            });
        } catch (error) {
            console.error('Failed to initialize NetworkGraph:', error);
            this.initD3Fallback();
        }
    }

    initD3Fallback() {
        if (typeof d3 === 'undefined') {
            console.error('Neither NetworkGraph nor D3.js is available. Please include one of them.');
            this.showErrorMessage();
            return;
        }

        console.log('Initializing D3.js fallback...');

        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .attr('class', 'network-graph');

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on('zoom', (event) => {
                this.svg.select('g').attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // Create main group
        this.mainGroup = this.svg.append('g');

        // Add arrow markers
        this.svg.append('defs').selectAll('marker')
            .data(['end'])
            .enter().append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 25)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');

        this.linkGroup = this.mainGroup.append('g').attr('class', 'links');
        this.nodeGroup = this.mainGroup.append('g').attr('class', 'nodes');
        this.labelGroup = this.mainGroup.append('g').attr('class', 'labels');

        console.log('D3.js fallback initialized');
    }

    loadData(data) {
        this.nodes = data.nodes || [];
        this.links = data.links || [];

        if (this.isNetworkGraphAvailable && this.chart) {
            this.loadDataNetworkGraph(data);
        } else if (this.svg) {
            this.loadDataD3(data);
        }
    }

    loadDataNetworkGraph(data) {
        try {
            // Convert data to NetworkGraph format
            const items = {
                type: 'LinkChart',
                items: [
                    ...this.nodes.map(node => ({
                        type: 'node',
                        id: node.id,
                        d: {
                            name: node.name || node.label || node.id,
                            type: node.type,
                            riskScore: node.riskScore,
                            status: node.status,
                            ...node
                        }
                    })),
                    ...this.links.map((link, idx) => ({
                        type: 'link',
                        id: `link_${idx}`,
                        id1: link.source,
                        id2: link.target,
                        d: {
                            type: link.type || 'connection'
                        }
                    }))
                ]
            };

            // Load data into chart
            this.chart.load(items);

            // Apply layout
            this.chart.layout('standard');

            console.log(`Loaded ${this.nodes.length} nodes and ${this.links.length} links into NetworkGraph`);
        } catch (error) {
            console.error('Error loading data into NetworkGraph:', error);
        }
    }

    loadDataD3(data) {
        // Process nodes
        this.nodes.forEach(node => {
            if (!node.id) node.id = Math.random().toString(36).substr(2, 9);
            if (!node.color) node.color = this.getNodeColor(node);
            if (!node.size) node.size = this.getNodeSize(node);
        });

        // Create force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
            .force('collision', d3.forceCollide().radius(30));

        // Create links
        const link = this.linkGroup.selectAll('line')
            .data(this.links)
            .enter().append('line')
            .attr('class', 'network-link')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow)');

        // Create nodes
        const node = this.nodeGroup.selectAll('circle')
            .data(this.nodes)
            .enter().append('circle')
            .attr('class', 'network-node')
            .attr('r', d => d.size || 20)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .call(d3.drag()
                .on('start', (event, d) => this.dragStarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragEnded(event, d)))
            .on('click', (event, d) => this.onNodeClick(d.id, d))
            .on('dblclick', (event, d) => this.onNodeDoubleClick(d.id, d));

        // Create labels
        const label = this.labelGroup.selectAll('text')
            .data(this.nodes)
            .enter().append('text')
            .attr('class', 'network-label')
            .attr('text-anchor', 'middle')
            .attr('dy', 35)
            .style('font-size', '12px')
            .style('fill', '#333')
            .style('pointer-events', 'none')
            .text(d => d.name || d.label || d.id);

        // Update positions on simulation tick
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });

        console.log(`Loaded ${this.nodes.length} nodes and ${this.links.length} links using D3.js`);
    }

    changeLayout(layoutType) {
        if (this.isNetworkGraphAvailable && this.chart) {
            const klLayout = layoutType === 'force' ? 'standard' :
                           layoutType === 'radial' ? 'radial' :
                           layoutType === 'hierarchical' ? 'hierarchy' : 'standard';
            this.chart.layout(klLayout);
        } else if (this.simulation) {
            // For D3, we'd need to reconfigure the simulation
            // This is a simplified version
            this.simulation.alpha(1).restart();
        }
    }

    highlightNode(nodeId) {
        if (this.isNetworkGraphAvailable && this.chart) {
            this.chart.selection([nodeId]);
        } else if (this.svg) {
            this.svg.selectAll('.network-node')
                .filter(d => d.id === nodeId)
                .attr('stroke', '#ff9800')
                .attr('stroke-width', 4);
        }
    }

    clearHighlight() {
        if (this.isNetworkGraphAvailable && this.chart) {
            this.chart.selection([]);
        } else if (this.svg) {
            this.svg.selectAll('.network-node')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);
        }
    }

    getNodeColor(node) {
        const riskScore = node.riskScore || 0;
        if (riskScore >= 8) return '#e74c3c';      // Critical - Red
        if (riskScore >= 6) return '#ff9800';       // High - Orange
        if (riskScore >= 4) return '#3498db';       // Medium - Blue
        return '#27ae60';                           // Low - Green
    }

    getNodeSize(node) {
        const riskScore = node.riskScore || 0;
        return 15 + (riskScore * 2);
    }

    onNodeClick(nodeId, nodeData) {
        console.log('Node clicked:', nodeId, nodeData);
        if (this.options.onNodeClick) {
            this.options.onNodeClick(nodeId, nodeData);
        }
        if (this.options.dotNetReference) {
            this.options.dotNetReference.invokeMethodAsync('OnNodeClicked', nodeId, nodeData);
        }
    }

    onNodeDoubleClick(nodeId, nodeData) {
        console.log('Node double-clicked:', nodeId, nodeData);
        if (this.options.onNodeDoubleClick) {
            this.options.onNodeDoubleClick(nodeId, nodeData);
        }
        if (this.options.dotNetReference) {
            this.options.dotNetReference.invokeMethodAsync('OnNodeDoubleClicked', nodeId, nodeData);
        }
    }

    dragStarted(event, d) {
        if (!event.active && this.simulation) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragEnded(event, d) {
        if (!event.active && this.simulation) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    showErrorMessage() {
        this.container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;">
                <div>
                    <h3 style="color: #e74c3c;">Network Visualization Unavailable</h3>
                    <p>Please include either NetworkGraph SDK or D3.js library.</p>
                    <p style="font-size: 0.9em; color: #666;">
                        For D3.js: Add <code>&lt;script src="https://d3js.org/d3.v7.min.js"&gt;&lt;/script&gt;</code>
                    </p>
                </div>
            </div>
        `;
    }

    destroy() {
        if (this.isNetworkGraphAvailable && this.chart) {
            try {
                this.chart.destroy();
            } catch (e) {
                console.error('Error destroying NetworkGraph chart:', e);
            }
        } else if (this.simulation) {
            this.simulation.stop();
        }

        if (this.svg) {
            this.svg.remove();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkGraphNetworkGraph;
}

// Global graph instances registry
window.klNetworkGraphs = window.klNetworkGraphs || {};

// JavaScript Interop Functions for Blazor
export function initializeNetworkGraph(containerId, options, dotNetReference) {
    try {
        const graphId = `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        options.dotNetReference = dotNetReference;

        const graph = new NetworkGraphNetworkGraph(containerId, options);
        window.klNetworkGraphs[graphId] = graph;

        console.log(`Network graph initialized with ID: ${graphId}`);
        return graphId;
    } catch (error) {
        console.error('Error initializing network graph:', error);
        throw error;
    }
}

export function loadNetworkData(graphId, data) {
    const graph = window.klNetworkGraphs[graphId];
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.loadData(data);
}

export function changeNetworkLayout(graphId, layoutType) {
    const graph = window.klNetworkGraphs[graphId];
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.changeLayout(layoutType);
}

export function highlightNode(graphId, nodeId) {
    const graph = window.klNetworkGraphs[graphId];
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.highlightNode(nodeId);
}

export function clearHighlight(graphId) {
    const graph = window.klNetworkGraphs[graphId];
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.clearHighlight();
}

export function destroyNetworkGraph(graphId) {
    const graph = window.klNetworkGraphs[graphId];
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.destroy();
    delete window.klNetworkGraphs[graphId];
}
