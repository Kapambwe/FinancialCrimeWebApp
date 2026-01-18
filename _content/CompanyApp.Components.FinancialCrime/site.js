function renderNetworkGraph(elementId, graphData) {
    const container = document.getElementById(elementId);
    const data = JSON.parse(graphData);

    // Create nodes and edges for vis.js
    const nodes = new vis.DataSet(data.nodes);
    const edges = new vis.DataSet(data.edges);

    // Provide the data in the vis format
    const graphDataVis = {
        nodes: nodes,
        edges: edges
    };

    const options = {
        nodes: {
            shape: 'dot',
            size: 16,
            font: {
                size: 12,
                color: '#ffffff'
            },
            borderWidth: 2
        },
        edges: {
            width: 2,
            arrows: {
                to: { enabled: true, scaleFactor: 0.5 }
            },
            smooth: {
                type: 'continuous'
            }
        },
        groups: {
            person: {
                color: { background: '#4A89DC', border: '#3B7DDD' }
            },
            entity: {
                color: { background: '#ED5565', border: '#DA4453' }
            },
            financial: {
                color: { background: '#A0D468', border: '#8CC152' }
            },
            government: {
                color: { background: '#FFCE54', border: '#F6BB42' }
            }
        },
        physics: {
            stabilization: {
                enabled: true,
                iterations: 1000
            }
        },
        interaction: {
            tooltipDelay: 200,
            hideEdgesOnDrag: true
        }
    };

    // Initialize the network
    new vis.Network(container, graphDataVis, options);
}