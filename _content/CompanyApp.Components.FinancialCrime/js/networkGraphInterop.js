/**
 * Network Graph Interop - JavaScript module for vis.js network graph visualization
 * Provides interactive network graph rendering for financial crime detection
 */

window.NetworkGraphInterop = (function () {
    let network = null;
    let nodes = null;
    let edges = null;
    let container = null;
    let dotNetHelper = null;

    /**
     * Initialize the network graph with vis.js
     * @param {string} containerId - The ID of the container div
     * @param {object} dotNetRef - Reference to .NET component for callbacks
     */
    function initialize(containerId, dotNetRef) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('Container element not found:', containerId);
            return false;
        }

        dotNetHelper = dotNetRef;

        // Initialize empty DataSets
        nodes = new vis.DataSet([]);
        edges = new vis.DataSet([]);

        // Create network options
        const options = {
            nodes: {
                shape: 'dot',
                size: 25,
                font: {
                    size: 14,
                    color: '#333333',
                    face: 'Arial'
                },
                borderWidth: 2,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.2)',
                    size: 10,
                    x: 2,
                    y: 2
                }
            },
            edges: {
                width: 2,
                color: {
                    color: '#848484',
                    highlight: '#2B7CE9',
                    hover: '#2B7CE9'
                },
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 1.0
                    }
                },
                smooth: {
                    enabled: true,
                    type: 'dynamic',
                    roundness: 0.5
                },
                font: {
                    size: 11,
                    color: '#666666',
                    strokeWidth: 0,
                    align: 'middle'
                }
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 200,
                    springConstant: 0.08,
                    damping: 0.4,
                    avoidOverlap: 0.5
                },
                maxVelocity: 50,
                minVelocity: 0.1,
                timestep: 0.5,
                stabilization: {
                    enabled: true,
                    iterations: 150,  // Reduced iterations for faster stabilization
                    updateInterval: 25,
                    fit: true,
                    onlyDynamicEdges: false
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: false,
                hideEdgesOnZoom: false,
                zoomView: true,
                dragView: true,
                dragNodes: true,  // Allow dragging nodes for manual positioning
                navigationButtons: true,
                keyboard: {
                    enabled: true,
                    bindToWindow: false
                }
            },
            layout: {
                improvedLayout: true,
                randomSeed: 42
            }
        };

        // Create the network
        network = new vis.Network(container, { nodes, edges }, options);

        // Set up event handlers
        setupEventHandlers();

        console.log('Network graph initialized successfully');
        return true;
    }

    /**
     * Set up event handlers for network interactions
     */
    function setupEventHandlers() {
        if (!network || !dotNetHelper) return;

        // Node click event
        network.on('click', function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                dotNetHelper.invokeMethodAsync('OnNodeClicked', nodeId);
            } else {
                dotNetHelper.invokeMethodAsync('OnCanvasClicked');
            }
        });

        // Node double-click event (for expansion)
        network.on('doubleClick', function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                dotNetHelper.invokeMethodAsync('OnNodeDoubleClicked', nodeId);
            }
        });

        // Node hover event
        network.on('hoverNode', function (params) {
            const nodeId = params.node;
            dotNetHelper.invokeMethodAsync('OnNodeHovered', nodeId);
        });

        // Stabilization progress
        network.on('stabilizationProgress', function (params) {
            const progress = Math.round((params.iterations / params.total) * 100);
            console.log('Stabilization progress:', progress + '%');
        });

        // Stabilization completed - disable physics to stop movement
        network.on('stabilizationIterationsDone', function () {
            console.log('Graph stabilization complete - disabling physics');
            network.setOptions({ physics: { enabled: false } });
            network.stopSimulation();
        });

        // Zoom event
        network.on('zoom', function (params) {
            console.log('Zoom level:', params.scale);
        });
    }

    /**
     * Render the network graph with provided data
     * @param {object} graphData - Object containing nodes and edges arrays
     */
    function renderGraph(graphData) {
        if (!network) {
            console.error('Network not initialized');
            return false;
        }

        try {
            // Clear existing data
            nodes.clear();
            edges.clear();

            // Transform and add nodes
            const transformedNodes = graphData.nodes.map(node => ({
                id: node.id,
                label: node.label,
                title: createNodeTooltip(node),
                color: {
                    background: node.color || getNodeColor(node.riskLevel),
                    border: getBorderColor(node.riskLevel),
                    highlight: {
                        background: lightenColor(node.color || getNodeColor(node.riskLevel)),
                        border: getBorderColor(node.riskLevel)
                    }
                },
                shape: getNodeShape(node.shape),
                size: node.size || getNodeSize(node.riskScore),
                font: {
                    size: 12,
                    color: '#000000'
                },
                borderWidth: node.riskLevel === 'Critical' ? 4 : 2,
                borderWidthSelected: 4
            }));

            // Transform and add edges
            const transformedEdges = graphData.edges.map(edge => ({
                id: edge.id,
                from: edge.from,
                to: edge.to,
                label: edge.label || '',
                title: createEdgeTooltip(edge),
                color: {
                    color: edge.isSuspicious ? '#E17055' : (edge.color || '#848484'),
                    highlight: '#2B7CE9',
                    hover: '#2B7CE9'
                },
                width: edge.width || (edge.isSuspicious ? 4 : 2),
                dashes: edge.isSuspicious ? [5, 5] : false,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: edge.isSuspicious ? 1.2 : 1.0
                    }
                }
            }));

            nodes.add(transformedNodes);
            edges.add(transformedEdges);

            // Wait for stabilization to complete before disabling physics
            network.once('stabilizationIterationsDone', function() {
                console.log('Stabilization complete - disabling physics');
                network.setOptions({ physics: { enabled: false } });
                network.stopSimulation();
            });

            // Force disable physics after 3 seconds as a fallback
            setTimeout(() => {
                console.log('Force stopping physics simulation');
                network.setOptions({ physics: { enabled: false } });
                network.stopSimulation();

                // Fit the graph to the container
                network.fit({
                    animation: {
                        duration: 500,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }, 3000);

            console.log(`Graph rendered: ${transformedNodes.length} nodes, ${transformedEdges.length} edges`);
            return true;
        } catch (error) {
            console.error('Error rendering graph:', error);
            return false;
        }
    }

    /**
     * Update specific nodes in the graph
     * @param {array} nodesToUpdate - Array of nodes to update
     */
    function updateNodes(nodesToUpdate) {
        if (!nodes) return false;

        try {
            nodesToUpdate.forEach(node => {
                nodes.update({
                    id: node.id,
                    color: {
                        background: node.color || getNodeColor(node.riskLevel),
                        border: getBorderColor(node.riskLevel)
                    },
                    size: node.size || getNodeSize(node.riskScore)
                });
            });
            return true;
        } catch (error) {
            console.error('Error updating nodes:', error);
            return false;
        }
    }

    /**
     * Highlight specific nodes and edges
     * @param {array} nodeIds - Array of node IDs to highlight
     * @param {array} edgeIds - Array of edge IDs to highlight
     */
    function highlightElements(nodeIds, edgeIds) {
        if (!network) return false;

        try {
            network.selectNodes(nodeIds || []);
            network.selectEdges(edgeIds || []);
            return true;
        } catch (error) {
            console.error('Error highlighting elements:', error);
            return false;
        }
    }

    /**
     * Focus on a specific node
     * @param {string} nodeId - ID of the node to focus on
     */
    function focusNode(nodeId) {
        if (!network) return false;

        try {
            network.focus(nodeId, {
                scale: 1.5,
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });
            network.selectNodes([nodeId]);
            return true;
        } catch (error) {
            console.error('Error focusing node:', error);
            return false;
        }
    }

    /**
     * Get positions of all nodes
     */
    function getNodePositions() {
        if (!network) return null;

        try {
            const positions = network.getPositions();
            return positions;
        } catch (error) {
            console.error('Error getting node positions:', error);
            return null;
        }
    }

    /**
     * Export graph as image
     * @param {string} format - Image format (png, jpeg)
     */
    function exportAsImage(format = 'png') {
        if (!network) return null;

        try {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                return canvas.toDataURL(`image/${format}`);
            }
            return null;
        } catch (error) {
            console.error('Error exporting image:', error);
            return null;
        }
    }

    /**
     * Clear the graph
     */
    function clearGraph() {
        if (nodes && edges) {
            nodes.clear();
            edges.clear();
            return true;
        }
        return false;
    }

    /**
     * Destroy the network instance
     */
    function destroy() {
        if (network) {
            network.destroy();
            network = null;
            nodes = null;
            edges = null;
            dotNetHelper = null;
            return true;
        }
        return false;
    }

    /**
     * Enable/disable physics simulation
     * @param {boolean} enabled - Whether to enable physics
     */
    function setPhysics(enabled) {
        if (!network) return false;

        try {
            network.setOptions({ physics: { enabled: enabled } });
            return true;
        } catch (error) {
            console.error('Error setting physics:', error);
            return false;
        }
    }

    /**
     * Fit graph to container
     */
    function fitGraph() {
        if (!network) return false;

        try {
            network.fit({
                animation: {
                    duration: 500,
                    easingFunction: 'easeInOutQuad'
                }
            });
            return true;
        } catch (error) {
            console.error('Error fitting graph:', error);
            return false;
        }
    }

    // ============== HELPER FUNCTIONS ==============

    /**
     * Create tooltip for a node
     */
    function createNodeTooltip(node) {
        let tooltip = `${node.label}\nType: ${node.type}\nRisk: ${node.riskLevel} (${node.riskScore.toFixed(1)})`;

        if (node.properties && Object.keys(node.properties).length > 0) {
            const props = Object.entries(node.properties).slice(0, 3);
            props.forEach(([key, value]) => {
                tooltip += `\n${key}: ${value}`;
            });
        }

        return tooltip;
    }

    /**
     * Create tooltip for an edge
     */
    function createEdgeTooltip(edge) {
        let tooltip = `${edge.relationshipType}`;

        if (edge.amount) {
            tooltip += `\nAmount: $${edge.amount.toLocaleString()}`;
        }

        if (edge.transactionDate) {
            const date = new Date(edge.transactionDate);
            tooltip += `\nDate: ${date.toLocaleDateString()}`;
        }

        if (edge.isSuspicious) {
            tooltip += '\n⚠️ SUSPICIOUS';
        }

        return tooltip;
    }

    /**
     * Get node color based on risk level
     */
    function getNodeColor(riskLevel) {
        const colors = {
            'Critical': '#c0392b',
            'High': '#e74c3c',
            'Medium': '#f39c12',
            'Low': '#27ae60',
            'default': '#95a5a6'
        };
        return colors[riskLevel] || colors.default;
    }

    /**
     * Get border color based on risk level
     */
    function getBorderColor(riskLevel) {
        const colors = {
            'Critical': '#8b0000',
            'High': '#c0392b',
            'Medium': '#d68910',
            'Low': '#1e8449',
            'default': '#7f8c8d'
        };
        return colors[riskLevel] || colors.default;
    }

    /**
     * Get node size based on risk score
     */
    function getNodeSize(riskScore) {
        if (riskScore >= 80) return 40;
        if (riskScore >= 60) return 35;
        if (riskScore >= 40) return 30;
        return 25;
    }

    /**
     * Get vis.js shape from our shape string
     */
    function getNodeShape(shape) {
        const shapeMap = {
            'dot': 'dot',
            'circle': 'dot',
            'diamond': 'diamond',
            'box': 'box',
            'square': 'square',
            'star': 'star',
            'triangle': 'triangle',
            'triangleDown': 'triangleDown'
        };
        return shapeMap[shape] || 'dot';
    }

    /**
     * Lighten a color for highlight effect
     */
    function lightenColor(color, percent = 20) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    // Public API
    return {
        initialize: initialize,
        renderGraph: renderGraph,
        updateNodes: updateNodes,
        highlightElements: highlightElements,
        focusNode: focusNode,
        getNodePositions: getNodePositions,
        exportAsImage: exportAsImage,
        clearGraph: clearGraph,
        destroy: destroy,
        setPhysics: setPhysics,
        fitGraph: fitGraph
    };
})();
