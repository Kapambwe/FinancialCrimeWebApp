/**
 * GeoMapViz Toolkit - Geospatial Visualization using Leaflet
 * For tracking movements, routes, incidents, and geographic patterns
 * Perfect for TBML route analysis, incident mapping, and patrol tracking
 */

class GeoMapViz {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }

        this.options = {
            center: options.center || [20, 0],
            zoom: options.zoom || 2,
            minZoom: options.minZoom || 2,
            maxZoom: options.maxZoom || 18,
            tileLayer: options.tileLayer || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: options.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            ...options
        };

        this.map = null;
        this.markers = [];
        this.routes = [];
        this.clusters = null;
        this.heatmapLayer = null;
        
        this.init();
    }

    init() {
        // Check if container already has a Leaflet instance and clean it up
        if (this.container._leaflet_id) {
            console.warn('Container already has a Leaflet map, cleaning up...');
            delete this.container._leaflet_id;
            this.container.innerHTML = '';
        }

        // Initialize Leaflet map
        this.map = L.map(this.container, {
            center: this.options.center,
            zoom: this.options.zoom,
            minZoom: this.options.minZoom,
            maxZoom: this.options.maxZoom
        });

        // Add tile layer
        L.tileLayer(this.options.tileLayer, {
            attribution: this.options.attribution,
            maxZoom: 19
        }).addTo(this.map);

        // Initialize marker cluster group
        if (typeof L.markerClusterGroup !== 'undefined') {
            this.clusters = L.markerClusterGroup({
                iconCreateFunction: (cluster) => {
                    const count = cluster.getChildCount();
                    let className = 'marker-cluster-';
                    
                    if (count < 10) className += 'small';
                    else if (count < 50) className += 'medium';
                    else className += 'large';
                    
                    return L.divIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: 'marker-cluster ' + className,
                        iconSize: L.point(40, 40)
                    });
                }
            });
            this.map.addLayer(this.clusters);
        }

        // Add scale
        L.control.scale().addTo(this.map);

        console.log('GeoMapViz initialized');
    }

    addMarkers(locations) {
        // Filter valid locations
        const validLocations = locations.filter(location => {
            const isValid =
                location &&
                typeof location.latitude === 'number' &&
                typeof location.longitude === 'number' &&
                !isNaN(location.latitude) &&
                !isNaN(location.longitude) &&
                location.latitude >= -90 &&
                location.latitude <= 90 &&
                location.longitude >= -180 &&
                location.longitude <= 180;

            if (!isValid) {
                console.warn('Invalid marker location:', location);
            }
            return isValid;
        });

        if (validLocations.length === 0) {
            console.warn('No valid locations to add markers');
            return;
        }

        validLocations.forEach(location => {
            const marker = this.createMarker(location);
            this.markers.push(marker);

            if (this.clusters) {
                this.clusters.addLayer(marker);
            } else {
                marker.addTo(this.map);
            }
        });

        // Fit bounds to show all markers
        const bounds = L.latLngBounds(validLocations.map(loc => [loc.latitude, loc.longitude]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    createMarker(location) {
        const latLng = [location.latitude, location.longitude];
        
        // Create custom icon based on location properties
        const icon = this.createCustomIcon(location);
        
        const marker = L.marker(latLng, { icon });
        
        // Add popup
        const popupContent = this.createPopupContent(location);
        marker.bindPopup(popupContent);
        
        // Add click handler
        marker.on('click', () => {
            if (this.options.onMarkerClick) {
                this.options.onMarkerClick(location);
            }
        });

        // Store reference to location data
        marker.locationData = location;
        
        return marker;
    }

    createCustomIcon(location) {
        const riskScore = location.riskScore || 0;
        const iconColor = this.getRiskColor(riskScore);
        const iconSymbol = this.getIconSymbol(location.type);
        
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-pin" style="background-color: ${iconColor};">
                    <span class="marker-icon">${iconSymbol}</span>
                </div>
                <div class="marker-pulse" style="border-color: ${iconColor};"></div>
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -42]
        });
    }

    getRiskColor(riskScore) {
        if (riskScore >= 8) return '#e74c3c';
        if (riskScore >= 6) return '#e67e22';
        if (riskScore >= 4) return '#f39c12';
        return '#3498db';
    }

    getIconSymbol(type) {
        const iconMap = {
            'Person': '👤',
            'Company': '🏢',
            'Location': '📍',
            'Vessel': '🚢',
            'Vehicle': '🚗',
            'Incident': '⚠️',
            'Transaction': '💰',
            'Warehouse': '🏭',
            'Port': '⚓',
            'Airport': '✈️'
        };
        
        return iconMap[type] || '📍';
    }

    createPopupContent(location) {
        let content = `<div class="location-popup">`;
        content += `<h6>${location.name || 'Location'}</h6>`;
        if (location.type) content += `<p><strong>Type:</strong> ${location.type}</p>`;
        if (location.address) content += `<p><strong>Address:</strong> ${location.address}</p>`;
        if (location.city) content += `<p><strong>City:</strong> ${location.city}, ${location.country || ''}</p>`;
        if (location.riskScore !== undefined) {
            content += `<p><strong>Risk Score:</strong> <span class="risk-badge" style="background: ${this.getRiskColor(location.riskScore)};">${location.riskScore.toFixed(1)}</span></p>`;
        }
        if (location.description) content += `<p>${location.description}</p>`;
        content += `</div>`;
        
        return content;
    }

    drawRoute(waypoints, options = {}) {
        // Validate waypoints
        const validWaypoints = waypoints.filter(wp => {
            const isValid =
                wp &&
                typeof wp.latitude === 'number' &&
                typeof wp.longitude === 'number' &&
                !isNaN(wp.latitude) &&
                !isNaN(wp.longitude) &&
                wp.latitude >= -90 &&
                wp.latitude <= 90 &&
                wp.longitude >= -180 &&
                wp.longitude <= 180;

            if (!isValid) {
                console.warn('Invalid waypoint:', wp);
            }
            return isValid;
        });

        if (validWaypoints.length < 2) {
            console.warn('Not enough valid waypoints to draw route (need at least 2)');
            return;
        }

        const latLngs = validWaypoints.map(wp => [wp.latitude, wp.longitude]);

        const routeOptions = {
            color: options.color || '#3498db',
            weight: options.weight || 3,
            opacity: options.opacity || 0.7,
            dashArray: options.dashArray || null,
            ...options
        };

        const polyline = L.polyline(latLngs, routeOptions).addTo(this.map);

        // Add arrows to show direction (only if polylineDecorator plugin is available)
        if (options.showDirection !== false && typeof L.polylineDecorator !== 'undefined' && typeof L.Symbol !== 'undefined') {
            try {
                const decorator = L.polylineDecorator(polyline, {
                    patterns: [
                        {
                            offset: '50%',
                            repeat: 100,
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 10,
                                polygon: false,
                                pathOptions: {
                                    stroke: true,
                                    color: routeOptions.color,
                                    weight: 2
                                }
                            })
                        }
                    ]
                });

                if (typeof decorator !== 'undefined') {
                    decorator.addTo(this.map);
                    this.routes.push({ polyline, decorator });
                } else {
                    this.routes.push({ polyline });
                }
            } catch (error) {
                console.warn('Error adding route decorator:', error);
                this.routes.push({ polyline });
            }
        } else {
            this.routes.push({ polyline });
        }
        
        // Add popup with route info
        if (options.label) {
            polyline.bindPopup(options.label);
        }
        
        return polyline;
    }

    drawCircle(center, radius, options = {}) {
        const circle = L.circle([center.latitude, center.longitude], {
            radius: radius,
            color: options.color || '#3498db',
            fillColor: options.fillColor || '#3498db',
            fillOpacity: options.fillOpacity || 0.2,
            weight: options.weight || 2
        }).addTo(this.map);
        
        if (options.label) {
            circle.bindPopup(options.label);
        }
        
        return circle;
    }

    drawPolygon(coordinates, options = {}) {
        const latLngs = coordinates.map(coord => [coord.latitude, coord.longitude]);
        
        const polygon = L.polygon(latLngs, {
            color: options.color || '#3498db',
            fillColor: options.fillColor || '#3498db',
            fillOpacity: options.fillOpacity || 0.2,
            weight: options.weight || 2
        }).addTo(this.map);
        
        if (options.label) {
            polygon.bindPopup(options.label);
        }
        
        return polygon;
    }

    addHeatmap(points, options = {}) {
        if (typeof L.heatLayer === 'undefined') {
            console.warn('Heatmap plugin not loaded');
            return;
        }

        // Filter and validate points before creating heatmap
        const heatPoints = points
            .filter(p => {
                // Validate that coordinates are numbers and within valid ranges
                const isValid =
                    p &&
                    typeof p.latitude === 'number' &&
                    typeof p.longitude === 'number' &&
                    !isNaN(p.latitude) &&
                    !isNaN(p.longitude) &&
                    p.latitude >= -90 &&
                    p.latitude <= 90 &&
                    p.longitude >= -180 &&
                    p.longitude <= 180;

                if (!isValid) {
                    console.warn('Invalid heatmap point:', p);
                }
                return isValid;
            })
            .map(p => [
                p.latitude,
                p.longitude,
                p.intensity || p.riskScore || 1
            ]);

        // Only create heatmap if we have valid points
        if (heatPoints.length === 0) {
            console.warn('No valid points for heatmap');
            return;
        }

        this.heatmapLayer = L.heatLayer(heatPoints, {
            radius: options.radius || 25,
            blur: options.blur || 15,
            maxZoom: options.maxZoom || 17,
            max: options.max || 10,
            gradient: options.gradient || {
                0.0: 'blue',
                0.5: 'yellow',
                1.0: 'red'
            }
        }).addTo(this.map);
    }

    removeHeatmap() {
        if (this.heatmapLayer) {
            this.map.removeLayer(this.heatmapLayer);
            this.heatmapLayer = null;
        }
    }

    addIncidentClusters(incidents) {
        const incidentMarkers = incidents.map(incident => {
            const marker = L.marker([incident.latitude, incident.longitude], {
                icon: L.divIcon({
                    className: 'incident-marker',
                    html: `
                        <div class="incident-pin ${incident.severity.toLowerCase()}">
                            <span>${this.getIncidentIcon(incident.type)}</span>
                        </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });
            
            marker.bindPopup(`
                <div class="incident-popup">
                    <h6>${incident.title}</h6>
                    <p><strong>Type:</strong> ${incident.type}</p>
                    <p><strong>Severity:</strong> ${incident.severity}</p>
                    <p><strong>Date:</strong> ${new Date(incident.date).toLocaleString()}</p>
                    ${incident.description ? `<p>${incident.description}</p>` : ''}
                </div>
            `);
            
            return marker;
        });

        if (this.clusters) {
            incidentMarkers.forEach(marker => this.clusters.addLayer(marker));
        }
    }

    getIncidentIcon(type) {
        const iconMap = {
            'Theft': '🔓',
            'Assault': '⚔️',
            'Fraud': '💳',
            'Vandalism': '🔨',
            'Burglary': '🏠',
            'Drug': '💊',
            'Weapon': '🔫',
            'Cyber': '💻'
        };
        
        return iconMap[type] || '⚠️';
    }

    highlightArea(bounds, label) {
        const rectangle = L.rectangle([
            [bounds.south, bounds.west],
            [bounds.north, bounds.east]
        ], {
            color: '#f39c12',
            weight: 3,
            fillOpacity: 0.1
        }).addTo(this.map);
        
        if (label) {
            rectangle.bindPopup(label);
        }
        
        return rectangle;
    }

    addMovementTracking(path, options = {}) {
        // Animated movement along path
        let currentIndex = 0;
        const marker = L.marker(path[0], {
            icon: L.divIcon({
                className: 'moving-marker',
                html: '<div class="moving-pin">🎯</div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(this.map);

        const animate = () => {
            if (currentIndex < path.length - 1) {
                currentIndex++;
                const newPos = path[currentIndex];
                marker.setLatLng(newPos);
                
                if (options.onMove) {
                    options.onMove(newPos, currentIndex);
                }
                
                setTimeout(animate, options.speed || 500);
            } else if (options.onComplete) {
                options.onComplete();
            }
        };

        if (options.autoStart !== false) {
            animate();
        }

        return {
            marker,
            start: animate,
            stop: () => clearTimeout(),
            reset: () => {
                currentIndex = 0;
                marker.setLatLng(path[0]);
            }
        };
    }

    clearMarkers() {
        if (this.clusters) {
            this.clusters.clearLayers();
        } else {
            this.markers.forEach(marker => this.map.removeLayer(marker));
        }
        this.markers = [];
    }

    clearRoutes() {
        this.routes.forEach(route => {
            this.map.removeLayer(route.polyline);
            if (route.decorator) {
                this.map.removeLayer(route.decorator);
            }
        });
        this.routes = [];
    }

    clearAll() {
        this.clearMarkers();
        this.clearRoutes();
        this.removeHeatmap();
    }

    fitBounds(locations) {
        if (locations.length === 0) return;
        
        const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    setView(center, zoom) {
        this.map.setView([center.latitude, center.longitude], zoom || this.options.zoom);
    }

    getCenter() {
        const center = this.map.getCenter();
        return {
            latitude: center.lat,
            longitude: center.lng
        };
    }

    getZoom() {
        return this.map.getZoom();
    }

    addMarker(location) {
        const marker = this.createMarker(location);
        this.markers.push(marker);

        if (this.clusters) {
            this.clusters.addLayer(marker);
        } else {
            marker.addTo(this.map);
        }

        return marker;
    }

    enableDrawMode() {
        // Enable drawing mode for hotspots/polygons
        if (typeof L.Draw === 'undefined') {
            console.warn('Leaflet.draw plugin not loaded');
            return;
        }

        const drawnItems = new L.FeatureGroup();
        this.map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            },
            draw: {
                polygon: true,
                polyline: false,
                circle: true,
                rectangle: true,
                marker: false,
                circlemarker: false
            }
        });

        this.map.addControl(drawControl);

        this.map.on(L.Draw.Event.CREATED, (event) => {
            const layer = event.layer;
            drawnItems.addLayer(layer);

            if (this.options.onDrawCreated) {
                this.options.onDrawCreated(event.layerType, layer);
            }
        });

        this.drawnItems = drawnItems;
        this.drawControl = drawControl;
    }

    clearHotspots() {
        if (this.drawnItems) {
            this.drawnItems.clearLayers();
        }

        // Clear any manually drawn shapes
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polygon || layer instanceof L.Circle || layer instanceof L.Rectangle) {
                if (!layer.options.permanent) {
                    this.map.removeLayer(layer);
                }
            }
        });
    }

    switchLayer(layerType) {
        // Remove current tile layer
        this.map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });

        // Add new tile layer based on type
        let tileUrl, attribution;

        switch(layerType) {
            case 'satellite':
                tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                attribution = '&copy; <a href="https://www.esri.com/">Esri</a>';
                break;
            case 'terrain':
                tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
                attribution = '&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a>';
                break;
            case 'district':
            case 'street':
            default:
                tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        }

        L.tileLayer(tileUrl, {
            attribution: attribution,
            maxZoom: 19
        }).addTo(this.map);

        this.currentLayer = layerType;
    }

    zoomToLocation(latitude, longitude, zoomLevel = 12) {
        this.map.setView([latitude, longitude], zoomLevel);
    }

    panTo(latitude, longitude) {
        this.map.panTo([latitude, longitude]);
    }

    getBounds() {
        const bounds = this.map.getBounds();
        return {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        };
    }

    destroy() {
        try {
            // Remove all layers first
            if (this.heatmapLayer && this.map) {
                this.map.removeLayer(this.heatmapLayer);
                this.heatmapLayer = null;
            }

            if (this.clusters && this.map) {
                this.clusters.clearLayers();
                this.map.removeLayer(this.clusters);
                this.clusters = null;
            }

            // Remove all markers
            this.markers.forEach(marker => {
                if (marker && this.map) {
                    this.map.removeLayer(marker);
                }
            });
            this.markers = [];

            // Remove all routes
            this.routes.forEach(route => {
                if (route && this.map) {
                    this.map.removeLayer(route);
                }
            });
            this.routes = [];

            // Remove the map instance
            if (this.map) {
                this.map.off();  // Remove all event listeners
                this.map.remove();
                this.map = null;
            }

            // Clean up the container to allow reuse
            if (this.container) {
                // Remove Leaflet's internal ID that prevents reuse
                delete this.container._leaflet_id;
                // Clear any remaining content
                this.container.innerHTML = '';
            }
        } catch (error) {
            console.warn('Error during GeoMapViz cleanup:', error);
            // Force cleanup even if there was an error
            if (this.container) {
                delete this.container._leaflet_id;
                this.container.innerHTML = '';
            }
            this.map = null;
            this.markers = [];
            this.routes = [];
            this.clusters = null;
            this.heatmapLayer = null;
        }
    }
}

// Make GeoMapViz globally available for direct usage
if (typeof window !== 'undefined') {
    window.GeoMapViz = GeoMapViz;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeoMapViz;
}
