// leafletWrapper.js - Extended Leaflet wrapper for Blazor

// Initialize the map
let map; // Global map
let baseLayers = {};
let currentBaseLayer = 'osm';
let miniMapControl = null;

export function createMap(elementId, lat, lng, zoom) {
    map = L.map(elementId).setView([lat, lng], zoom);

    // Create base layers
    baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '� OpenStreetMap contributors'
    }).addTo(map);

    baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '� Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });

    // Add layer control
    L.control.layers({
        "OpenStreetMap": baseLayers.osm,
        "Satellite": baseLayers.satellite
    }).addTo(map);

    return map;
}

// Switch between map types
export function setMapType(mapType) {
    if (baseLayers[currentBaseLayer]) {
        map.removeLayer(baseLayers[currentBaseLayer]);
    }

    if (baseLayers[mapType]) {
        map.addLayer(baseLayers[mapType]);
        currentBaseLayer = mapType;
    }
}

// Add a marker
export function addMarker(lat, lng, popupText) {
    const marker = L.marker([lat, lng]).addTo(map); // Uses global `map`
    if (popupText) marker.bindPopup(popupText).openPopup();
    return marker;
}

// Add a circle (with customizable options)
export function addCircle(lat, lng, radius, options = {}) {
    const circle = L.circle([lat, lng], {
        radius: radius,
        color: options.color || 'red',
        fillColor: options.fillColor || '#f03',
        fillOpacity: options.fillOpacity || 0.5,
        weight: options.weight || 2,
        ...options
    }).addTo(map);
    return circle;
}

// Add a polygon (accepts array of LatLng points)
export function addPolygon(latLngs, options = {}) {
    const polygon = L.polygon(latLngs, {
        color: options.color || 'blue',
        fillColor: options.fillColor || options.color || 'blue',
        fillOpacity: options.fillOpacity || 0.5,
        weight: options.weight || 2,
        ...options
    }).addTo(map);
    return polygon;
}

// Add a polyline (accepts array of LatLng points)
export function addPolyline(latLngs, options = {}) {
    const polyline = L.polyline(latLngs, {
        color: options.color || 'green',
        weight: options.weight || 3,
        ...options
    }).addTo(map);
    return polyline;
}

// Add a structure with customizable color and border width
export function addStructure(latLngs, color = 'blue', borderWidth = 2, options = {}) {
    const structure = L.polygon(latLngs, {
        color: color,
        weight: borderWidth,
        fillColor: color,
        fillOpacity: options.fillOpacity || 0.5,
        opacity: options.opacity || 1.0,
        ...options
    }).addTo(map);

    return structure;
}

// Add a rectangle structure with customizable color and border width
export function addRectangleStructure(bounds, color = 'blue', borderWidth = 2, options = {}) {
    const rectangle = L.rectangle(bounds, {
        color: color,
        weight: borderWidth,
        fillColor: color,
        fillOpacity: options.fillOpacity || 0.5,
        opacity: options.opacity || 1.0,
        ...options
    }).addTo(map);

    return rectangle;
}

// Render GeoJSON data
export function addGeoJson(geoJsonData, options = {}) {
    const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: options.style || { color: 'purple' },
        onEachFeature: options.onEachFeature,
        ...options
    }).addTo(map);
    return geoJsonLayer;
}

export function addGeoJsonWithPopup(geoJsonData, popupTemplate) {
    return L.geoJSON(geoJsonData, {
        onEachFeature: function (feature, layer) {
            if (feature.properties && popupTemplate) {
                let popupContent = popupTemplate;
                for (const prop in feature.properties) {
                    popupContent = popupContent.replace(`{${prop}}`, feature.properties[prop]);
                }
                layer.bindPopup(popupContent);
            }
        }
    }).addTo(map);
}

// Remove a layer (marker, circle, polygon, etc.)
export function removeLayer(layer) {
    map.removeLayer(layer);
}

// Clear all layers except base tiles
export function clearMap() {
    map.eachLayer(layer => {
        if (!layer._url && !baseLayers.osm && !baseLayers.satellite) {
            map.removeLayer(layer);
        }
    });
}

// Drawing Tools with parameter support
let drawControl;
let drawEnabled;
let drawnItems = L.featureGroup();

export function initDrawTools(lineColor = '#3388ff', fillColor = '#3388ff', lineWeight = 2) {
    // Clear existing drawn items if any
    if (drawnItems) {
        map.removeLayer(drawnItems);
    }

    drawnItems = L.featureGroup().addTo(map);

    // Remove existing draw control if any
    if (drawControl) {
        map.removeControl(drawControl);
    }

    drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polygon: {
                shapeOptions: {
                    color: lineColor,
                    fillColor: fillColor,
                    weight: lineWeight,
                    fillOpacity: 0.2
                }
            },
            polyline: {
                shapeOptions: {
                    color: lineColor,
                    weight: lineWeight
                }
            },
            rectangle: {
                shapeOptions: {
                    color: lineColor,
                    fillColor: fillColor,
                    weight: lineWeight,
                    fillOpacity: 0.2
                }
            },
            circle: {
                shapeOptions: {
                    color: lineColor,
                    fillColor: fillColor,
                    weight: lineWeight,
                    fillOpacity: 0.2
                }
            },
            marker: {
                icon: L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }
        },
        edit: {
            featureGroup: drawnItems
        }
    }).addTo(map);

    drawEnabled = true;

    // Clear previous event listeners
    map.off(L.Draw.Event.CREATED);

    map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
    });
}

// Advanced configuration function
export function initDrawToolsAdvanced(options) {
    const defaultOptions = {
        lineColor: '#3388ff',
        fillColor: '#3388ff',
        lineWeight: 2,
        fillOpacity: 0.2,
        position: 'topright',
        enablePolygon: true,
        enablePolyline: true,
        enableRectangle: true,
        enableCircle: true,
        enableMarker: true
    };

    const config = { ...defaultOptions, ...options };

    // Clear existing
    if (drawnItems) {
        map.removeLayer(drawnItems);
    }
    drawnItems = L.featureGroup().addTo(map);

    if (drawControl) {
        map.removeControl(drawControl);
    }

    const drawConfig = {
        position: config.position,
        draw: {},
        edit: {
            featureGroup: drawnItems
        }
    };

    if (config.enablePolygon) {
        drawConfig.draw.polygon = {
            shapeOptions: {
                color: config.lineColor,
                fillColor: config.fillColor,
                weight: config.lineWeight,
                fillOpacity: config.fillOpacity
            }
        };
    }

    if (config.enablePolyline) {
        drawConfig.draw.polyline = {
            shapeOptions: {
                color: config.lineColor,
                weight: config.lineWeight
            }
        };
    }

    if (config.enableRectangle) {
        drawConfig.draw.rectangle = {
            shapeOptions: {
                color: config.lineColor,
                fillColor: config.fillColor,
                weight: config.lineWeight,
                fillOpacity: config.fillOpacity
            }
        };
    }

    if (config.enableCircle) {
        drawConfig.draw.circle = {
            shapeOptions: {
                color: config.lineColor,
                fillColor: config.fillColor,
                weight: config.lineWeight,
                fillOpacity: config.fillOpacity
            }
        };
    }

    if (config.enableMarker) {
        drawConfig.draw.marker = {
            icon: L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        };
    }

    drawControl = new L.Control.Draw(drawConfig).addTo(map);

    drawEnabled = true;

    map.off(L.Draw.Event.CREATED);
    map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
    });
}

export function updateDrawToolsStyle(lineColor, fillColor, lineWeight, fillOpacity = 0.2) {
    // Reinitialize with new styles
    initDrawTools(lineColor, fillColor, lineWeight);
}

export function enableDrawing() {
    if (!drawControl) return;
    if (!drawEnabled) {
        drawControl.addTo(map);
        drawEnabled = true;
    }
}

export function disableDrawing() {
    if (!drawControl) return;
    if (drawEnabled) {
        drawControl.remove();
        drawEnabled = false;
    }
}

export function clearAllDrawn() {
    drawnItems.clearLayers();
}

export function getDrawnGeoJson() {
    return JSON.stringify(drawnItems.toGeoJSON());
}

export function addDrawnFromGeoJson(geoJson) {
    L.geoJSON(geoJson, {
        onEachFeature: function (feature, layer) {
            drawnItems.addLayer(layer);
        }
    });
}
// Add MiniMap control
export function addMiniMap(miniMapLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', options = {}) {
    // Remove existing miniMap if any
    if (miniMapControl) {
        map.removeControl(miniMapControl);
    }

    const defaultOptions = {
        toggleDisplay: true,
        position: 'bottomright',
        width: 150,
        height: 150,
        collapsedWidth: 19,
        collapsedHeight: 19,
        zoomLevelOffset: -5,
        zoomLevelFixed: false,
        centerFixed: false,
        zoomAnimation: true,
        autoToggleDisplay: false,
        minimized: false,
        strings: { hideText: 'Hide MiniMap', showText: 'Show MiniMap' }
    };

    const config = { ...defaultOptions, ...options };

    const mbAttr = '� OpenStreetMap contributors';
    const miniMapLayer = new L.TileLayer(miniMapLayerUrl, {
        minZoom: 0,
        maxZoom: 13,
        attribution: mbAttr
    });

    miniMapControl = new L.Control.MiniMap(miniMapLayer, config).addTo(map);
    return miniMapControl;
}

// Remove MiniMap control
export function removeMiniMap() {
    if (miniMapControl) {
        map.removeControl(miniMapControl);
        miniMapControl = null;
    }
}

// Toggle MiniMap visibility
export function toggleMiniMap() {
    if (miniMapControl) {
        miniMapControl._toggleDisplay();
    }
}
// Keep the setupMapClick function
export function setupMapClick(dotNetReference) {
    map.on('click', function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        dotNetReference.invokeMethodAsync('OnMapClick', lat, lng);
    });
}

// Set map view to specific coordinates and zoom
export function setView(lat, lng, zoom) {
    if (map) {
        map.setView([lat, lng], zoom);
    }
}

// Fit map to bounds
export function fitBounds(bounds) {
    if (map) {
        map.fitBounds(bounds);
    }
}

// ============================================================================
// TBML Trade Map Functions
// ============================================================================

let tradeRouteLayer = null; // Store trade routes layer

/**
 * Initialize trade map with routes for TBML analysis
 * @param {string} elementId - Map container element ID
 * @param {Array} routes - Array of trade routes
 */
export function initializeTradeMap(elementId, routes) {
    // Create map if it doesn't exist
    if (!map) {
        map = L.map(elementId).setView([20, 0], 2); // Center on world view
        
        // Add base layer
        baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Create feature group for trade routes (featureGroup has getBounds())
    if (!tradeRouteLayer) {
        tradeRouteLayer = L.featureGroup().addTo(map);
    }

    // Clear existing routes
    tradeRouteLayer.clearLayers();

    // Add routes to map
    if (routes && Array.isArray(routes)) {
        routes.forEach(route => {
            if (route.waypoints && route.waypoints.length >= 2) {
                // Create polyline for route
                const latLngs = route.waypoints.map(wp => [wp.latitude, wp.longitude]);
                
                const polyline = L.polyline(latLngs, {
                    color: route.color || '#3b82f6',
                    weight: 3,
                    opacity: 0.7,
                    smoothFactor: 1
                }).addTo(tradeRouteLayer);

                // Add popup with route info
                if (route.label) {
                    polyline.bindPopup(route.label);
                }

                // Add markers for start and end points
                const startMarker = L.circleMarker(latLngs[0], {
                    radius: 6,
                    fillColor: route.color || '#3b82f6',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(tradeRouteLayer);

                const endMarker = L.circleMarker(latLngs[latLngs.length - 1], {
                    radius: 8,
                    fillColor: route.color || '#3b82f6',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(tradeRouteLayer);

                // Add arrow decorator if available
                if (typeof L.polylineDecorator !== 'undefined') {
                    const decorator = L.polylineDecorator(polyline, {
                        patterns: [
                            {
                                offset: '50%',
                                repeat: 0,
                                symbol: L.Symbol.arrowHead({
                                    pixelSize: 15,
                                    polygon: false,
                                    pathOptions: {
                                        stroke: true,
                                        weight: 2,
                                        color: route.color || '#3b82f6'
                                    }
                                })
                            }
                        ]
                    }).addTo(tradeRouteLayer);
                }
            }
        });

        // Fit bounds to show all routes
        try {
            if (tradeRouteLayer.getLayers().length > 0) {
                const bounds = tradeRouteLayer.getBounds();
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        } catch (error) {
            console.warn('Could not fit bounds:', error);
            // Fallback to world view if bounds calculation fails
            map.setView([20, 0], 2);
        }
    }

    console.log(`Trade map initialized with ${routes && routes.length ? routes.length : 0} routes`);
}

/**
 * Clear all trade routes from the map
 */
export function clearTradeRoutes() {
    if (tradeRouteLayer) {
        tradeRouteLayer.clearLayers();
        console.log('Trade routes cleared');
    }
}

/**
 * Draw a single trade route with waypoints
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @param {Object} options - Route styling options
 */
export function drawTradeRoute(waypoints, options = {}) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }

    if (!tradeRouteLayer) {
        tradeRouteLayer = L.featureGroup().addTo(map);
    }

    if (!waypoints || waypoints.length < 2) {
        console.error('At least 2 waypoints required');
        return;
    }

    // Convert waypoints to LatLng array
    const latLngs = waypoints.map(wp => [wp.latitude, wp.longitude]);

    // Create polyline
    const polylineOptions = {
        color: options.color || '#f59e0b',
        weight: options.weight || 4,
        opacity: options.opacity || 0.8,
        smoothFactor: 1
    };

    const polyline = L.polyline(latLngs, polylineOptions).addTo(tradeRouteLayer);

    // Add popup if label provided
    if (options.label) {
        polyline.bindPopup(options.label).openPopup();
    }

    // Add markers for start and end
    L.circleMarker(latLngs[0], {
        radius: 6,
        fillColor: options.color || '#f59e0b',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(tradeRouteLayer).bindPopup('Origin');

    L.circleMarker(latLngs[latLngs.length - 1], {
        radius: 8,
        fillColor: options.color || '#f59e0b',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(tradeRouteLayer).bindPopup('Destination');

    // Add direction arrow if showDirection is true and polyline decorator is available
    if (options.showDirection && typeof L.polylineDecorator !== 'undefined') {
        L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: '50%',
                    repeat: 0,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 18,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            weight: 3,
                            color: options.color || '#f59e0b'
                        }
                    })
                }
            ]
        }).addTo(tradeRouteLayer);
    }

    // Fit bounds to show the route
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    console.log('Trade route drawn with', waypoints.length, 'waypoints');
}