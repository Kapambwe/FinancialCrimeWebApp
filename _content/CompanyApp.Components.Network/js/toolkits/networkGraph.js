/**
 * NetworkGraph Toolkit - Interactive Network Visualization
 * Inspired by NetworkGraph/ReGraph for crime investigation and financial analysis
 * Supports force-directed, hierarchical, and radial layouts
 * 
 * DEPENDENCIES:
 * - D3.js v7 or higher (https://d3js.org/)
 *   Include in your page: <script src="https://d3js.org/d3.v7.min.js"></script>
 */

// Check if D3 is loaded
if (typeof d3 === 'undefined') {
    console.error('D3.js is required for NetworkGraph. Please include D3.js before this script.');
    console.error('Add to your page: <script src="https://d3js.org/d3.v7.min.js"></script>');
}

class NetworkGraph {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }

        this.options = {
            width: options.width || this.container.clientWidth || 800,
            height: options.height || this.container.clientHeight || 600,
            layout: options.layout || 'force',
            nodeRadius: options.nodeRadius || 20,
            linkDistance: options.linkDistance || 100,
            charge: options.charge || -300,
            ...options
        };

        this.nodes = [];
        this.links = [];
        this.svg = null;
        this.simulation = null;
        this.selectedNode = null;
        this.highlightedNodes = new Set();
        
        this.init();
    }

    init() {
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

        // Add arrow markers for directed edges
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

        // Create link and node groups
        this.linkGroup = this.mainGroup.append('g').attr('class', 'links');
        this.nodeGroup = this.mainGroup.append('g').attr('class', 'nodes');
        this.labelGroup = this.mainGroup.append('g').attr('class', 'labels');

        console.log('NetworkGraph initialized');
    }

    loadData(data) {
        this.nodes = data.nodes || [];
        this.links = data.links || [];

        // Process nodes
        this.nodes.forEach(node => {
            if (!node.id) node.id = Math.random().toString(36).substr(2, 9);
            if (!node.color) node.color = this.getNodeColor(node);
            if (!node.size) node.size = this.getNodeSize(node);
        });

        // Process links
        this.links.forEach(link => {
            if (!link.source || !link.target) {
                console.warn('Link missing source or target', link);
            }
            if (!link.color) link.color = '#999';
            if (!link.width) link.width = 2;
        });

        this.render();
    }

    render() {
        // Create force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(this.options.linkDistance))
            .force('charge', d3.forceManyBody().strength(this.options.charge))
            .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
            .force('collision', d3.forceCollide().radius(d => d.size + 5));

        // Render links
        const link = this.linkGroup.selectAll('line')
            .data(this.links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke', d => d.color)
            .attr('stroke-width', d => d.width)
            .attr('marker-end', 'url(#arrow)')
            .on('mouseover', (event, d) => this.showLinkTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Render nodes
        const node = this.nodeGroup.selectAll('circle')
            .data(this.nodes)
            .join('circle')
            .attr('class', 'node')
            .attr('r', d => d.size)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .call(this.drag())
            .on('click', (event, d) => this.handleNodeClick(event, d))
            .on('dblclick', (event, d) => this.handleNodeDoubleClick(event, d))
            .on('mouseover', (event, d) => this.showNodeTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Render labels
        const label = this.labelGroup.selectAll('text')
            .data(this.nodes)
            .join('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.size + 15)
            .text(d => d.label || d.name || d.id)
            .style('font-size', '12px')
            .style('pointer-events', 'none');

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
    }

    getNodeColor(node) {
        const riskScore = node.riskScore || 0;
        if (node.status === 'Sanctioned') return '#e74c3c';
        if (node.status === 'Flagged') return '#e67e22';
        if (riskScore >= 8) return '#e74c3c';
        if (riskScore >= 6) return '#f39c12';
        if (riskScore >= 4) return '#3498db';
        return '#2ecc71';
    }

    getNodeSize(node) {
        const baseSize = this.options.nodeRadius;
        const riskScore = node.riskScore || 0;
        return baseSize + (riskScore * 2);
    }

    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    handleNodeClick(event, node) {
        // Deselect previous
        this.nodeGroup.selectAll('circle')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Select current
        d3.select(event.currentTarget)
            .attr('stroke', '#f39c12')
            .attr('stroke-width', 4);

        this.selectedNode = node;

        // Highlight connected nodes
        this.highlightConnectedNodes(node);

        // Trigger callback
        if (this.options.onNodeClick) {
            this.options.onNodeClick(node);
        }
    }

    handleNodeDoubleClick(event, node) {
        if (this.options.onNodeDoubleClick) {
            this.options.onNodeDoubleClick(node);
        }
    }

    highlightConnectedNodes(node) {
        this.highlightedNodes.clear();
        
        // Find connected nodes
        this.links.forEach(link => {
            if (link.source.id === node.id) {
                this.highlightedNodes.add(link.target.id);
            }
            if (link.target.id === node.id) {
                this.highlightedNodes.add(link.source.id);
            }
        });

        // Update visual highlighting
        this.nodeGroup.selectAll('circle')
            .style('opacity', d => {
                if (d.id === node.id) return 1;
                if (this.highlightedNodes.has(d.id)) return 1;
                return 0.3;
            });

        this.linkGroup.selectAll('line')
            .style('opacity', d => {
                if (d.source.id === node.id || d.target.id === node.id) return 1;
                return 0.1;
            });
    }

    clearHighlight() {
        this.highlightedNodes.clear();
        this.nodeGroup.selectAll('circle').style('opacity', 1);
        this.linkGroup.selectAll('line').style('opacity', 1);
    }

    showNodeTooltip(event, node) {
        const tooltip = this.getOrCreateTooltip();
        
        let content = `<strong>${node.label || node.name || node.id}</strong><br>`;
        content += `Type: ${node.type || 'Unknown'}<br>`;
        if (node.riskScore !== undefined) {
            content += `Risk Score: ${node.riskScore.toFixed(1)}<br>`;
        }
        if (node.status) {
            content += `Status: ${node.status}<br>`;
        }
        
        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 20) + 'px';
    }

    showLinkTooltip(event, link) {
        const tooltip = this.getOrCreateTooltip();
        
        let content = `<strong>Connection</strong><br>`;
        content += `From: ${link.source.label || link.source.id}<br>`;
        content += `To: ${link.target.label || link.target.id}<br>`;
        if (link.type) content += `Type: ${link.type}<br>`;
        if (link.amount) content += `Amount: $${link.amount.toLocaleString()}<br>`;
        
        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 20) + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('network-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    getOrCreateTooltip() {
        let tooltip = document.getElementById('network-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'network-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                pointer-events: none;
                z-index: 10000;
                display: none;
            `;
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    changeLayout(layoutType) {
        this.options.layout = layoutType;
        
        switch(layoutType) {
            case 'force':
                this.applyForceLayout();
                break;
            case 'radial':
                this.applyRadialLayout();
                break;
            case 'hierarchical':
                this.applyHierarchicalLayout();
                break;
            case 'circular':
                this.applyCircularLayout();
                break;
        }
    }

    applyForceLayout() {
        // Clear fixed positions from other layouts
        this.nodes.forEach(node => {
            node.fx = null;
            node.fy = null;
        });

        this.simulation
            .force('link', d3.forceLink(this.links).distance(this.options.linkDistance))
            .force('charge', d3.forceManyBody().strength(this.options.charge))
            .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
            .alpha(1).restart();
    }

    applyRadialLayout() {
        const centerNode = this.selectedNode || this.nodes[0];
        const radius = 150;
        
        this.nodes.forEach((node, i) => {
            if (node.id === centerNode.id) {
                node.fx = this.options.width / 2;
                node.fy = this.options.height / 2;
            } else {
                const angle = (i / this.nodes.length) * 2 * Math.PI;
                node.fx = this.options.width / 2 + radius * Math.cos(angle);
                node.fy = this.options.height / 2 + radius * Math.sin(angle);
            }
        });
        
        this.simulation.alpha(1).restart();
    }

    applyCircularLayout() {
        const radius = Math.min(this.options.width, this.options.height) / 3;
        
        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * 2 * Math.PI;
            node.fx = this.options.width / 2 + radius * Math.cos(angle);
            node.fy = this.options.height / 2 + radius * Math.sin(angle);
        });
        
        this.simulation.alpha(1).restart();
    }

    applyHierarchicalLayout() {
        // Simple hierarchical layout
        const levels = {};
        let maxLevel = 0;
        
        // Assign levels
        this.nodes.forEach(node => {
            if (!node.level) node.level = 0;
            if (!levels[node.level]) levels[node.level] = [];
            levels[node.level].push(node);
            maxLevel = Math.max(maxLevel, node.level);
        });
        
        // Position nodes
        const levelHeight = this.options.height / (maxLevel + 1);
        
        Object.keys(levels).forEach(level => {
            const nodesInLevel = levels[level];
            const levelWidth = this.options.width / (nodesInLevel.length + 1);
            
            nodesInLevel.forEach((node, i) => {
                node.fx = levelWidth * (i + 1);
                node.fy = levelHeight * (parseInt(level) + 1);
            });
        });
        
        this.simulation.alpha(1).restart();
    }

    findShortestPath(sourceId, targetId) {
        // BFS to find shortest path
        const queue = [[sourceId]];
        const visited = new Set([sourceId]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            if (current === targetId) {
                return path;
            }
            
            this.links.forEach(link => {
                let neighbor = null;
                if (link.source.id === current && !visited.has(link.target.id)) {
                    neighbor = link.target.id;
                } else if (link.target.id === current && !visited.has(link.source.id)) {
                    neighbor = link.source.id;
                }
                
                if (neighbor) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            });
        }
        
        return null;
    }

    highlightPath(path) {
        if (!path || path.length === 0) return;
        
        const pathSet = new Set(path);
        
        this.nodeGroup.selectAll('circle')
            .style('opacity', d => pathSet.has(d.id) ? 1 : 0.2)
            .attr('stroke', d => pathSet.has(d.id) ? '#f39c12' : '#fff')
            .attr('stroke-width', d => pathSet.has(d.id) ? 4 : 2);
        
        this.linkGroup.selectAll('line')
            .style('opacity', d => {
                const inPath = pathSet.has(d.source.id) && pathSet.has(d.target.id);
                return inPath ? 1 : 0.1;
            })
            .attr('stroke', d => {
                const inPath = pathSet.has(d.source.id) && pathSet.has(d.target.id);
                return inPath ? '#f39c12' : d.color;
            })
            .attr('stroke-width', d => {
                const inPath = pathSet.has(d.source.id) && pathSet.has(d.target.id);
                return inPath ? 4 : d.width;
            });
    }

    focusOnNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Center the view on the node
        const transform = d3.zoomIdentity
            .translate(this.options.width / 2 - node.x, this.options.height / 2 - node.y)
            .scale(1.5);

        this.svg.transition()
            .duration(750)
            .call(this.svg.property('__zoom', transform));

        // Highlight the node
        this.highlightConnectedNodes(node);

        // Select the node
        this.nodeGroup.selectAll('circle')
            .filter(d => d.id === nodeId)
            .attr('stroke', '#f39c12')
            .attr('stroke-width', 4);

        this.selectedNode = node;
    }

    zoomIn() {
        this.svg.transition()
            .duration(300)
            .call(d3.zoom().scaleBy, 1.3);
    }

    zoomOut() {
        this.svg.transition()
            .duration(300)
            .call(d3.zoom().scaleBy, 0.7);
    }

    resetView() {
        this.svg.transition()
            .duration(750)
            .call(d3.zoom().transform, d3.zoomIdentity);
    }

    destroy() {
        if (this.simulation) {
            this.simulation.stop();
        }
        if (this.svg) {
            this.svg.remove();
        }
        const tooltip = document.getElementById('network-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// Make NetworkGraph globally available for direct usage
if (typeof window !== 'undefined') {
    window.NetworkGraph = NetworkGraph;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkGraph;
}

// Graph instances storage
const graphInstances = new Map();

// ES Module exports for Blazor interop
export function initializeNetworkGraph(containerId, options = {}, dotNetReference = null) {
    try {
        const graphId = `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add callbacks to options if dotNetReference provided
        if (dotNetReference) {
            options.onNodeClick = (node) => {
                dotNetReference.invokeMethodAsync('OnNodeClicked', node.id, node);
            };
            options.onNodeDoubleClick = (node) => {
                dotNetReference.invokeMethodAsync('OnNodeDoubleClicked', node.id, node);
            };
        }
        
        const graph = new NetworkGraph(containerId, options);
        graphInstances.set(graphId, graph);
        
        console.log(`NetworkGraph initialized with ID: ${graphId}`);
        return graphId;
    } catch (error) {
        console.error('Error initializing NetworkGraph:', error);
        throw error;
    }
}

export function loadNetworkData(graphId, data) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.loadData(data);
}

export function changeNetworkLayout(graphId, layoutType) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.changeLayout(layoutType);
}

export function highlightNode(graphId, nodeId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node) {
        graph.highlightConnectedNodes(node);
    }
}

export function clearHighlight(graphId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.clearHighlight();
}

export function findShortestPath(graphId, sourceId, targetId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return null;
    }
    return graph.findShortestPath(sourceId, targetId);
}

export function highlightPath(graphId, path) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.highlightPath(path);
}

export function focusOnNode(graphId, nodeId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.focusOnNode(nodeId);
}

export function zoomIn(graphId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.zoomIn();
}

export function zoomOut(graphId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.zoomOut();
}

export function resetView(graphId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.resetView();
}

export function destroyGraph(graphId) {
    const graph = graphInstances.get(graphId);
    if (!graph) {
        console.error(`Graph ${graphId} not found`);
        return;
    }
    graph.destroy();
    graphInstances.delete(graphId);
}
