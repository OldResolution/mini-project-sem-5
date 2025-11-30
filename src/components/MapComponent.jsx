import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../leaflet-draw-fix'; // Import fix before leaflet-draw
import 'leaflet-draw';
import 'leaflet.markercluster';
import Papa from 'papaparse';
import * as turf from '@turf/turf';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const MapComponent = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [activeLayer, setActiveLayer] = useState('population');
    const [populationData, setPopulationData] = useState(null);
    const [currentYear, setCurrentYear] = useState(2001);
    const [drawnShapes, setDrawnShapes] = useState([]);
    const [wardDataLoaded, setWardDataLoaded] = useState(false);
    const [selectedShapes, setSelectedShapes] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [chartType, setChartType] = useState('bar');
    const [chartMetric, setChartMetric] = useState('density'); // 'density', 'population', 'area'
    const [predictionMode, setPredictionMode] = useState(false);
    const [monthOffset, setMonthOffset] = useState(0); // -12 to +12 months
    const [isPlaying, setIsPlaying] = useState(false);
    const years = [2001, 2011, 2022];
    
    const geoJsonDataRef = useRef(null);
    const latestMonthOffset = useRef(monthOffset);

    useEffect(() => {
        latestMonthOffset.current = monthOffset;
    }, [monthOffset]);
    
    // Layer Refs to keep track of instances
    const layersRef = useRef({
        base: null,
        population: null,
        pollution: null,
        pollutionMarkers: null,
        climate: null, // The tile layer (if used, though legacy code seems to use tiles AND heatmap?)
        climateWard: null,
        climateMarkers: null,
        ward: null,
        markers: null, // For population clusters
        editable: null,
        predictionMarkers: null
    });

    const supportedStations = [
        { name: "Kurla", lat: 19.0726, lon: 72.8845 },
        { name: "Chhatrapati Shivaji Intl. Airport (T2)", lat: 19.0974, lon: 72.8745 },
        { name: "Chakala-Andheri East", lat: 19.1113, lon: 72.8608 },
        { name: "Mazgaon", lat: 18.9696, lon: 72.8456 },
        { name: "Powai", lat: 19.1176, lon: 72.9060 },
        { name: "Navy Nagar-Colaba", lat: 18.9067, lon: 72.8147 },
        { name: "Worli", lat: 19.0178, lon: 72.8181 }
    ];

    // Fetch Population Data
    useEffect(() => {
        Papa.parse('/data/Population_Density_Scaled_2011_2022.csv', {
            download: true,
            header: true,
            complete: function(results) {
                const data = extractPopulationData(results.data);
                setPopulationData(data);
            }
        });
    }, []);

    // Re-plot clusters when year or data changes
    useEffect(() => {
        if (activeLayer === 'population' && populationData && mapInstanceRef.current && wardDataLoaded) {
            plotClusters(populationData, currentYear);
        }
    }, [currentYear, populationData, activeLayer, wardDataLoaded]);

    const extractPopulationData = (data) => {
        return data.map(row => {
            const lat = parseFloat(row['Latitude']);
            const lng = parseFloat(row['Longitude']);
    
            if (!isNaN(lat) && !isNaN(lng)) {
                return {
                    name: row['Ward'],
                    population2001: parseFloat(row['Population 2001']) || 0,
                    population2011: parseFloat(row['Population 2011']) || 0,
                    population2022: parseFloat(row['Population 2022']) || 0,
                    density2001: parseFloat(row['Density per Square Kilometer']) || 0,
                    density2011: parseFloat(row['Density 2011']) || 0,
                    density2022: parseFloat(row['Density 2022']) || 0,
                    lat: lat,
                    lng: lng
                };
            } else {
                return null;
            }
        }).filter(row => row !== null);
    };

    const getColor = (density) => {
        if (density > 90000) return '#FF0000';
        else if (density > 65000) return '#FF6600';
        else if (density > 40000) return '#FF9900';
        else if (density > 20000) return '#FFFF00';
        else return '#00FF00';
    };

    const findWardPolygon = (wardName, wardLayer) => {
        let polygon = null;
        wardLayer.eachLayer(function(layer) {
            const geoWardName = (layer.feature.properties.NAME || "").trim().toLowerCase();
            if (geoWardName === wardName.trim().toLowerCase()) {
                polygon = layer.feature.geometry;
            }
        });
        return polygon;
    };

    const isPointInPolygon = (point, polygonLayer) => {
        let latLngs = polygonLayer.getLatLngs();
        
        // Handle nested arrays (Leaflet 1.x Polygons/Rectangles usually return [[LatLng, ...]])
        if (Array.isArray(latLngs) && latLngs.length > 0 && Array.isArray(latLngs[0])) {
            latLngs = latLngs[0];
        }
        
        // Ensure we have an array of LatLng objects
        if (!Array.isArray(latLngs)) return false;

        // Convert to [lng, lat]
        const ring = latLngs.map(ll => [ll.lng, ll.lat]);
        
        // Close the ring if needed
        if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
            ring.push(ring[0]);
        }

        // Validate ring length (must be >= 4 for a valid polygon: 3 points + closing)
        if (ring.length < 4) return false;

        try {
            const turfPolygon = turf.polygon([ring]);
            const turfPoint = turf.point([point.lng, point.lat]);
            return turf.booleanPointInPolygon(turfPoint, turfPolygon);
        } catch (error) {
            console.warn("Turf polygon error:", error);
            return false;
        }
    };

    const isPointInCircle = (latLng, circleLayer) => {
        const circleCenter = circleLayer.getLatLng();
        const distance = mapInstanceRef.current.distance(latLng, circleCenter); // Calculate distance
        return distance <= circleLayer.getRadius();
    };

    const plotClusters = (data, selectedYear) => {
        const map = mapInstanceRef.current;
        if (!map || !layersRef.current.ward) return;

        // Remove existing markers
        if (layersRef.current.markers) {
            map.removeLayer(layersRef.current.markers);
        }

        const markers = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                var childCount = cluster.getChildCount();
                var size = 40;
                var color = '#00f2fe'; // Default small

                if (childCount < 10) {
                    size = 30;
                    color = '#00f2fe';
                } else if (childCount < 100) {
                    size = 45;
                    color = '#ff9a9e';
                } else {
                    size = 60;
                    color = '#ff0844';
                }

                return new L.DivIcon({
                    html: `<div class="person-cluster-icon">
                             <i class="fas fa-user" style="font-size: ${size}px; color: ${color};"></i>
                             <span>${childCount}</span>
                           </div>`,
                    className: 'custom-cluster-icon-wrapper', // Empty class to avoid default styles interfering
                    iconSize: new L.Point(size, size + 15) // Adjust height for the label
                });
            }
        });

        data.forEach(function(item) {
            if (!isNaN(item.lat) && !isNaN(item.lng)) {
                let population = 0;
                let density = 0;

                if (selectedYear === 2001) {
                    population = item.population2001;
                    density = item.density2001;
                } else if (selectedYear === 2011) {
                    population = item.population2011;
                    density = item.density2011;
                } else if (selectedYear === 2022) {
                    population = item.population2022;
                    density = item.density2022;
                }   
               
               const color = getColor(density);
               let numPoints = Math.min(Math.floor(population / 500)); // 1 point = 500 people

               if (numPoints > 0) {
                   let wardPolygon = findWardPolygon(item.name, layersRef.current.ward);

                   if (wardPolygon?.coordinates?.length > 0) {
                       // Turf.js randomPoint generation
                       try {
                           let randomPoints = turf.randomPoint(numPoints, { bbox: turf.bbox(wardPolygon) });
                           randomPoints.features.forEach(function(point) {
                               let latLng = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
                               if (turf.booleanPointInPolygon(point, wardPolygon)) {
                                   const marker = L.marker(latLng, {
                                       icon: L.divIcon({
                                           className: 'person-marker-wrapper',
                                           html: `<i class="fas fa-user" style="font-size: 16px; color: ${color};"></i>`,
                                           iconSize: [16, 16],
                                           iconAnchor: [8, 16] // Bottom center
                                       })
                                   }).bindPopup(`<strong>${item.name}</strong><br>Population: ${population}<br>Density: ${density}`);
                                   markers.addLayer(marker);
                               }
                           });
                       } catch (e) {
                           console.warn("Error generating points for ward:", item.name, e);
                       }
                   }
               }
           }
       });

        map.addLayer(markers);
        layersRef.current.markers = markers;
    };

    useEffect(() => {
        if (mapInstanceRef.current) return; // Initialize only once

        // Initialize Map
        const map = L.map(mapRef.current, {
            center: [19.0760, 72.8777],
            zoom: 13,
            minZoom: 12,
            maxZoom: 18,
            maxBounds: [
                [18.89, 72.75],
                [19.27, 73.0]
            ],
            maxBoundsViscosity: 1.0
        });

        mapInstanceRef.current = map;

        // Base Layer
        const baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        layersRef.current.base = baseLayer;

        // Initialize other layers (but don't add them yet)
        
        // Population Layer (Tile)
        layersRef.current.population = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Population Data &copy; OpenStreetMap contributors'
        });

        // Pollution Layer (WAQI)
        const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572";
        layersRef.current.pollution = L.tileLayer(WAQI_URL, { 
            attribution: 'Air Quality Tiles &copy; <a href="http://waqi.info">waqi.info</a>' 
        });

        // Climate Layer (Satellite)
        layersRef.current.climate = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 20,
            attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            ext: 'jpg'
        });

        // Editable Layer Group
        const editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);
        layersRef.current.editable = editableLayers;

        // Draw Control
        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polyline: { shapeOptions: { color: '#2a2a2a', weight: 10 } },
                polygon: { 
                    allowIntersection: false, 
                    drawError: { color: '#e1e100', message: '<strong>Oh snap!<strong> you can\'t draw that!' },
                    shapeOptions: { color: '#2a2a2a' } 
                },
                circle: { shapeOptions: { color: '#2a2a2a' } },
                rectangle: { shapeOptions: { color: '#2a2a2a', clickable: false } },
                marker: true
            },
            edit: {
                featureGroup: editableLayers,
                remove: false
            }
        });
        map.addControl(drawControl);

        // Handle Created Event
        map.on(L.Draw.Event.CREATED, function (e) {
            const layer = e.layer;
            const shapeID = Date.now(); // Simple ID generation
            let shapeType = 'Unknown', shapeCoordinates, shapeArea = 0, shapeAreaInSqKm = 0, populationValue = 0, populationDensity = 0;
            let markerCount = 0;
        
            editableLayers.addLayer(layer);
        
            if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                shapeType = (layer instanceof L.Rectangle) ? 'Rectangle' : 'Polygon';
                shapeCoordinates = layer.getLatLngs();
                // Calculate area using L.GeometryUtil if available, otherwise approximation or turf
                try {
                    // L.GeometryUtil.geodesicArea expects an array of LatLngs (ring)
                    // layer.getLatLngs() returns [ [LatLng, LatLng, ...] ] for simple polygons
                    let latLngs = layer.getLatLngs();
                    if (Array.isArray(latLngs) && latLngs.length > 0 && Array.isArray(latLngs[0])) {
                        latLngs = latLngs[0];
                    }
                    shapeArea = L.GeometryUtil.geodesicArea(latLngs);
                } catch (err) {
                    // Fallback to turf if L.GeometryUtil fails
                    try {
                        const geoJson = layer.toGeoJSON();
                        shapeArea = turf.area(geoJson);
                    } catch (turfErr) {
                        console.warn("Area calculation failed", turfErr);
                        shapeArea = 0;
                    }
                }
                shapeAreaInSqKm = shapeArea / 1_000_000;

                if (layersRef.current.markers) {
                    layersRef.current.markers.eachLayer(function (marker) {
                        if (isPointInPolygon(marker.getLatLng(), layer)) {
                            markerCount++;
                        }
                    });
                }

            } else if (layer instanceof L.Circle) {
                shapeType = 'Circle';
                const circleCenter = layer.getLatLng();
                const circleRadius = layer.getRadius();
                shapeCoordinates = { center: circleCenter, radius: circleRadius };
                shapeArea = Math.PI * Math.pow(circleRadius, 2);
                shapeAreaInSqKm = shapeArea / 1_000_000;

                if (layersRef.current.markers) {
                    layersRef.current.markers.eachLayer(function (marker) {
                        if (isPointInCircle(marker.getLatLng(), layer)) {
                            markerCount++;
                        }
                    });
                }
            } else if (layer instanceof L.Marker) {
                shapeType = 'Marker';
                shapeCoordinates = layer.getLatLng();
                // Markers don't have area or population analysis in this context
            } else if (layer instanceof L.Polyline) {
                shapeType = 'Line';
                shapeCoordinates = layer.getLatLngs();
                // Lines don't have area
            }

            populationValue = markerCount * 500;
            if (shapeAreaInSqKm > 0) {
                populationDensity = populationValue / shapeAreaInSqKm;
            }

            const newShape = {
                id: shapeID,
                type: shapeType,
                coordinates: shapeCoordinates,
                area: shapeAreaInSqKm || 0,
                population: populationValue || 0,
                density: populationDensity || 0
            };

            setDrawnShapes(prev => [...prev, newShape]);
        });

        // Custom Buttons
        const createCustomButton = (iconClass, title, onClick) => {
            const div = L.DomUtil.create('div', 'leafconst-bar leafconst-control leafconst-control-custom');
            div.innerHTML = `<i class="${iconClass}" aria-hidden="true" style="font-size: 18px; color: #333; padding: 5px;"></i>`;
            div.style.backgroundColor = 'white';
            div.style.padding = '5px';
            div.style.cursor = 'pointer';
            div.style.textAlign = 'center';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
            div.style.marginBottom = '5px';
            div.title = title;
            div.onclick = onClick;
            return div;
        };

        const removeLastButton = L.control({ position: 'topleft' });
        removeLastButton.onAdd = function() {
            return createCustomButton('fas fa-undo', 'Remove Last Drawing', () => {
                const layers = editableLayers.getLayers();
                if (layers.length > 0) {
                    const removedLayer = layers[layers.length - 1];
                    editableLayers.removeLayer(removedLayer);
                    setDrawnShapes(prev => prev.slice(0, -1));
                }
            });
        };
        removeLastButton.addTo(map);

        const removeAllButton = L.control({ position: 'topleft' });
        removeAllButton.onAdd = function() {
            return createCustomButton('fas fa-trash-alt', 'Remove All Drawings', () => {
                editableLayers.clearLayers();
                setDrawnShapes([]);
            });
        };
        removeAllButton.addTo(map);


        // Load Ward Map Data
        fetch('/data/WardMap.geojson')
            .then(response => response.json())
            .then(geojsonData => {
                geoJsonDataRef.current = geojsonData;
                layersRef.current.ward = L.geoJSON(geojsonData, {
                    style: function (feature) {
                        return {
                            color: "#4a4a4a",
                            weight: 1.5,
                            opacity: 0.8,
                            fillColor: '#3388ff',
                            fillOpacity: 0.05,
                            dashArray: '4'
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        let wardName = (feature.properties.NAME || "Unidentified Ward").trim();
                        layer.bindPopup("<b>Ward: </b>" + wardName);
                        
                        layer.on({
                            mouseover: function(e) {
                                var layer = e.target;
                                layer.setStyle({
                                    weight: 3,
                                    color: '#666',
                                    dashArray: '',
                                    fillOpacity: 0.2
                                });
                            },
                            mouseout: function(e) {
                                layersRef.current.ward.resetStyle(e.target);
                            }
                        });
                    }
                });

                setWardDataLoaded(true);
                // Initial load if population is active
                if (activeLayer === 'population' && layersRef.current.ward) {
                    layersRef.current.ward.addTo(map);
                }
            });

        // Initial Layer Setup
        handleLayerChange('population');

        // Cleanup
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Effect to handle layer switching
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        handleLayerChange(activeLayer);
    }, [activeLayer]);

    const handleCompare = (shape) => {
        if (selectedShapes.find(s => s.id === shape.id)) {
            alert('Shape already selected for comparison');
            return;
        }
        const newSelected = [...selectedShapes, shape];
        setSelectedShapes(newSelected);
        if (newSelected.length >= 2) {
            setShowComparison(true);
        }
    };

    const getChartData = () => {
        const labels = selectedShapes.map(s => `Shape ${s.id.toString().slice(-4)}`);
        const data = selectedShapes.map(s => {
            if (chartMetric === 'density') return s.density;
            if (chartMetric === 'population') return s.population;
            if (chartMetric === 'area') return s.area;
            return 0;
        });

        return {
            labels,
            datasets: [
                {
                    label: chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1),
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const getTemperatureColor = (temperature) => {
        if (temperature < 27) {
            return '#0000FF'; // Blue for cold
        } else if (temperature < 29) {
            return '#00FFFF'; // Cyan for mild
        } else if (temperature < 31 ) {
            return '#FFFF00'; // Yellow for warm
        } else {
            return '#FF0000'; // Red for hot
        }
    };

    const fetchWeatherData = async (lat, lon) => {
        const apiKey = '80292c7c9a0e2548d796c7b98b739b03'; 
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching weather data: ${response.statusText}`);
            }
    
            const data = await response.json();
            const temperature = data.main ? data.main.temp : null; // Get temperature in Celsius
            return { lat, lon, temperature };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    };

    const populateHeatmap = async () => {
        const map = mapInstanceRef.current;
        if (!map || !geoJsonDataRef.current) return;

        // Clear existing climate layers if they exist to refresh
        if (layersRef.current.climateWard) {
            map.removeLayer(layersRef.current.climateWard);
            layersRef.current.climateWard = null;
        }
        if (layersRef.current.climateMarkers) {
            map.removeLayer(layersRef.current.climateMarkers);
            layersRef.current.climateMarkers = null;
        }

        const coordinates = [
            [19.047, 72.8746],
            [19.04946, 72.923],
            [19.0863, 72.8888],
            [19.10861, 72.83622],
            [19.10078, 72.87462],
            [19.11074, 72.86084],
            [19.1653323, 72.922099],
            [18.96702, 72.84214],
            [19.2243333, 72.8658113],
            [19.1375, 72.915056],
            [19.2058, 72.8682],
            [19.175, 72.9419],
            [19.19709, 72.82204],
            [18.91, 72.82],
            [18.9936162, 72.8128113],
            [19.072830200195, 72.882606506348],
            [19.192056, 72.9585188],
            [18.897756, 72.81332]
        ];

        const climateData = [];

        for (const [lat, lon] of coordinates) {
            const weather = await fetchWeatherData(lat, lon);
            if (weather && weather.temperature !== null) {
                climateData.push({ lat, lon, temperature: weather.temperature });
            }
        }

        // Initialize the GeoJSON layer
        const cliWardLayer = L.geoJSON(geoJsonDataRef.current, {
            style: function (feature) {
                return {
                    color: "#ffffff",
                    weight: 1,
                    fillOpacity: 0.1
                };
            },
            onEachFeature: function (feature, layer) {
                let wardName = (feature.properties.NAME || "Unidentified Ward").trim();
                layer.bindPopup("<b>Ward: </b>" + wardName);
            }
        });

        // Add ward layer to map temporarily to use getBounds().contains()
        // Note: In React strict mode or fast updates, this might cause flicker or issues if not handled carefully,
        // but we need it added to calculate bounds/contains.
        // We will add it properly at the end if active.
        
        // However, L.geoJSON layers don't necessarily need to be on the map for getBounds() if they are initialized with data.
        // But `layer.getBounds()` works on individual features.
        
        const markersGroup = L.layerGroup();

        if (climateData.length > 0) {
            climateData.forEach(data => {
                const point = L.latLng(data.lat, data.lon);
                let temperatureColor = getTemperatureColor(data.temperature);

                // Iterate over each layer in wardLayer to determine if the point resides within the ward
                cliWardLayer.eachLayer(layer => {
                    // Simple bounding box check as per legacy code
                    if (layer.getBounds().contains(point)) {
                        layer.setStyle({
                            color: temperatureColor,
                            weight: 1,
                            fillOpacity: 0.3
                        });
                    }
                });

                // Create an invisible marker for the climate data point
                const climateMarker = L.marker(point, { opacity: 0 }) // Legacy code had opacity 1? No, wait.
                    // Legacy code: const climateMarker = L.marker(point, { opacity: 1 }).addTo(map);
                    // Wait, legacy code says opacity 1.
                    // Let's check legacy code again.
                    // "const climateMarker = L.marker(point, { opacity: 1 }).addTo(map);"
                    // But the user might want them invisible? 
                    // "Create an invisible marker" comment says invisible, but code says 1.
                    // I will stick to code: opacity 1.
                    // Actually, looking at the legacy code provided earlier:
                    // "const climateMarker = L.marker(point, { opacity: 1 }).addTo(map);"
                    // But the comment says "Create an invisible marker".
                    // I'll use opacity 1 as per code.
                
                const marker = L.marker(point, { opacity: 1 })
                    .bindPopup(`<b>Temperature:</b> ${data.temperature}°C`);
                markersGroup.addLayer(marker);
            });
        }

        layersRef.current.climateWard = cliWardLayer;
        layersRef.current.climateMarkers = markersGroup;

        if (activeLayer === 'climate' && mapInstanceRef.current) {
            cliWardLayer.addTo(mapInstanceRef.current);
            markersGroup.addTo(mapInstanceRef.current);
        }
    };

    const getAqiLevel = (aqi) => {
        if (aqi <= 50) {
            return { text: "Good", color: "green", icon: "🙂" };
        } else if (aqi <= 100) {
            return { text: "Moderate", color: "yellow", icon: "😐" };
        } else if (aqi <= 150) {
            return { text: "Unhealthy for Sensitive Groups", color: "orange", icon: "😷" };
        } else if (aqi <= 200) {
            return { text: "Unhealthy", color: "red", icon: "😵" };
        } else {
            return { text: "Very Unhealthy", color: "purple", icon: "💀" };
        }
    };

    const fetchAndDisplayMarkers = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const token = '5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572';
        const bounds = map.getBounds();
        const url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`;

        // Clear existing pollution markers from the map if they exist
        if (layersRef.current.pollutionMarkers) {
            map.removeLayer(layersRef.current.pollutionMarkers);
            layersRef.current.pollutionMarkers = null;
        }
        
        const markersGroup = L.layerGroup();

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    data.data.forEach(station => {
                        const stationUrl = `https://api.waqi.info/feed/@${station.uid}/?token=${token}`;

                        fetch(stationUrl)
                            .then(response => response.json())
                            .then(stationData => {
                                if (stationData.status === 'ok') {
                                    const pollutants = stationData.data.iaqi;
                                    const aqi = station.aqi;
                                    const aqiLevel = getAqiLevel(aqi);

                                    const popupContent = `
                                        <div style="font-family: Arial, sans-serif; padding: 10px; text-align: center;">
                                            <h3 style="margin: 5px;">${station.station.name}</h3>
                                            <div style="background-color: ${aqiLevel.color}; padding: 10px; border-radius: 5px; margin: 5px 0;">
                                                <span style="font-size: 2em;">${aqiLevel.icon}</span>
                                                <div style="font-size: 1.5em; font-weight: bold;">${aqi} - ${aqiLevel.text}</div>
                                            </div>
                                            <p style="font-size: 0.9em; color: gray;">Updated: ${new Date(stationData.data.time.s).toLocaleString()}</p>
                                            <div style="text-align: left; padding: 5px;">
                                                <div><b>PM2.5:</b> ${pollutants.pm25 ? pollutants.pm25.v : 'N/A'}</div>
                                                <div><b>PM10:</b> ${pollutants.pm10 ? pollutants.pm10.v : 'N/A'}</div>
                                                <div><b>O3:</b> ${pollutants.o3 ? pollutants.o3.v : 'N/A'}</div>
                                                <div><b>NO2:</b> ${pollutants.no2 ? pollutants.no2.v : 'N/A'}</div>
                                                <div><b>SO2:</b> ${pollutants.so2 ? pollutants.so2.v : 'N/A'}</div>
                                                <div><b>CO:</b> ${pollutants.co ? pollutants.co.v : 'N/A'}</div>
                                            </div>
                                        </div>
                                    `;

                                    const marker = L.marker([station.lat, station.lon], { opacity: 0 })
                                        .bindPopup(popupContent);
                                    markersGroup.addLayer(marker);
                                }
                            })
                            .catch(error => console.error('Error fetching station data:', error));
                    });
                    
                    // Only add to map if pollution layer is still active
                    if (mapInstanceRef.current && layersRef.current.pollution && mapInstanceRef.current.hasLayer(layersRef.current.pollution)) {
                        markersGroup.addTo(mapInstanceRef.current);
                        layersRef.current.pollutionMarkers = markersGroup;
                    }
                }
            })
            .catch(error => console.error('Error:', error));
    };

    const fetchAndDisplayPredictions = async () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const currentRequestOffset = monthOffset;

        // Clear existing pollution markers
        if (layersRef.current.pollutionMarkers) {
            map.removeLayer(layersRef.current.pollutionMarkers);
            layersRef.current.pollutionMarkers = null;
        }
        
        // Initialize or get existing prediction markers group
        let markersGroup = layersRef.current.predictionMarkers;
        if (!markersGroup) {
            markersGroup = L.layerGroup();
            markersGroup.addTo(map);
            layersRef.current.predictionMarkers = markersGroup;
        }

        // Helper to create/update marker with loading state or data
        const updateMarker = (station, aqi = null, isLoading = true) => {
            let marker = null;
            
            // Find existing marker for this station
            markersGroup.eachLayer(layer => {
                if (layer.options.stationName === station.name) {
                    marker = layer;
                }
            });

            let htmlContent;
            let bgColor = '#ccc'; // Default loading color

            if (isLoading) {
                htmlContent = `
                    <div class="prediction-marker-container">
                        <div class="prediction-marker-box" style="background-color: #f0f0f0; border-color: #f0f0f0;">
                            <div class="prediction-loader"></div>
                        </div>
                    </div>
                `;
            } else {
                const aqiLevel = getAqiLevel(aqi);
                bgColor = aqiLevel.color;
                // Adjust text color for contrast
                const textColor = (bgColor === 'yellow' || bgColor === 'orange' || bgColor === 'green') ? '#333' : 'white';
                
                htmlContent = `
                    <div class="prediction-marker-container">
                        <div class="prediction-marker-box" style="background-color: ${bgColor}; border-color: ${bgColor}; color: ${textColor}">
                            ${Math.round(aqi)}
                        </div>
                    </div>
                `;
            }

            const icon = L.divIcon({
                className: 'custom-prediction-icon', // We can use this class if we need more specific styling
                html: htmlContent,
                iconSize: [40, 40],
                iconAnchor: [20, 40] // Center bottom
            });

            if (marker) {
                marker.setIcon(icon);
                // Update popup content if not loading
                if (!isLoading && aqi !== null) {
                     const aqiLevel = getAqiLevel(aqi);
                     const popupContent = `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 250px; text-align: center;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">${station.name}</h3>
                            
                            <div style="background-color: ${aqiLevel.color}; padding: 15px; border-radius: 8px; color: ${aqiLevel.color === '#ffff00' ? '#333' : 'white'}; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <div style="font-size: 40px; margin-bottom: 5px;">${aqiLevel.icon}</div>
                                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${Math.round(aqi)}</div>
                                <div style="font-size: 16px; font-weight: 600; line-height: 1.2;">${aqiLevel.text}</div>
                            </div>

                            <div style="margin-top: 15px; text-align: left; font-size: 13px; color: #555;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px;">
                                    <strong>Predicted AQI:</strong> <span>${Math.round(aqi)}</span>
                                </div>
                                <div style="margin-top: 10px; font-size: 11px; color: #888; text-align: center;">
                                    (Monthly Average Prediction)
                                </div>
                            </div>
                        </div>
                    `;
                    marker.bindPopup(popupContent);
                }
            } else {
                // Create new marker
                marker = L.marker([station.lat, station.lon], { 
                    icon: icon,
                    stationName: station.name // Custom option to identify marker
                });
                markersGroup.addLayer(marker);
            }
        };

        // Set all markers to loading state immediately
        supportedStations.forEach(station => {
            updateMarker(station, null, true);
        });

        // Check session storage for cached predictions
        const cacheKey = `prediction_cache_${monthOffset}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
            const predictions = JSON.parse(cachedData);
            predictions.forEach(pred => {
                const { station, data } = pred;
                const { predicted_aqi } = data;
                updateMarker(station, predicted_aqi, false);
            });
        } else {
            const newPredictions = [];
            // Fetch for all stations
            const promises = supportedStations.map(async (station) => {
                if (currentRequestOffset !== latestMonthOffset.current) return;
                try {
                    const response = await axios.post('http://localhost:5000/api/predict', {
                        location: station.name,
                        months_offset: monthOffset
                    });

                    if (response.data && !response.data.error) {
                        const { predicted_aqi } = response.data;
                        // Only update if this is still the latest request
                        if (currentRequestOffset === latestMonthOffset.current) {
                            updateMarker(station, predicted_aqi, false);
                            newPredictions.push({ station, data: response.data });
                        }
                    }
                } catch (error) {
                    console.error(`Error predicting for ${station.name}:`, error);
                }
            });

            await Promise.all(promises);

            // Cache the new predictions if we have them and request is still valid
            if (newPredictions.length > 0 && currentRequestOffset === latestMonthOffset.current) {
                sessionStorage.setItem(cacheKey, JSON.stringify(newPredictions));
            }
        }
    };

    useEffect(() => {
        if (predictionMode) {
            const map = mapInstanceRef.current;
            const layers = layersRef.current;

            // Explicitly remove all potential overlay layers to ensure clean slate
            const layersToRemove = [
                layers.population, 
                layers.pollution, 
                layers.pollutionMarkers, 
                layers.climate, 
                layers.climateWard, 
                layers.climateMarkers, 
                layers.ward, 
                layers.markers
            ];

            if (map) {
                layersToRemove.forEach(layer => {
                    if (layer && map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                });

                // Ensure base layer is active (OSM)
                if (layers.base && !map.hasLayer(layers.base)) {
                    layers.base.addTo(map);
                }
            }

            fetchAndDisplayPredictions();
        } else {
            // Clear prediction markers
            if (layersRef.current.predictionMarkers && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(layersRef.current.predictionMarkers);
                layersRef.current.predictionMarkers = null;
            }
            // Restore normal pollution markers if active
            handleLayerChange(activeLayer);
        }
    }, [predictionMode, monthOffset]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const handleMoveEnd = () => {
            if (activeLayer === 'pollution' && !predictionMode) {
                fetchAndDisplayMarkers();
            }
        };

        map.on('moveend', handleMoveEnd);

        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [activeLayer, predictionMode]);

    const handleLayerChange = (layerName) => {
        const map = mapInstanceRef.current;
        const layers = layersRef.current;

        // Remove all exclusive layers
        [layers.population, layers.pollution, layers.pollutionMarkers, layers.climate, layers.climateWard, layers.climateMarkers, layers.ward, layers.markers].forEach(l => {
            if (l && map.hasLayer(l)) map.removeLayer(l);
        });

        if (predictionMode) return;

        // Add selected layer
        if (layerName === 'population') {
            if (layers.population) layers.population.addTo(map);
            if (layers.ward) layers.ward.addTo(map);
            if (populationData) plotClusters(populationData, currentYear);
        } else if (layerName === 'pollution') {
            if (layers.pollution) layers.pollution.addTo(map);
            fetchAndDisplayMarkers();
        } else if (layerName === 'climate') {
            if (layers.climate) layers.climate.addTo(map);
            populateHeatmap();
        }
    };

    // Prediction Mode Logic
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setMonthOffset(prev => {
                    if (prev >= 12) {
                        setIsPlaying(false);
                        return 12;
                    }
                    return prev + 1;
                });
            }, 1500); // 1.5 second per month step
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleMonthChange = (e) => {
        setMonthOffset(parseInt(e.target.value));
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const jumpToMonth = (offset) => {
        setMonthOffset(offset);
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
            
            {/* Prediction Mode UI */}
            {predictionMode && (
                <div className="prediction-controls-container">
                    <button className="close-prediction-mode" onClick={() => setPredictionMode(false)}>×</button>
                    <div className="prediction-header">
                        <div className="prediction-status">
                            <div className="status-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="status-text">
                                <h4>Prediction Mode</h4>
                                <span>Monthly Average</span>
                            </div>
                        </div>
                        <div className="date-display">
                            {new Date(new Date().setMonth(new Date().getMonth() + monthOffset)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="slider-container">
                        <input 
                            type="range" 
                            min="-12" 
                            max="12" 
                            value={monthOffset} 
                            onChange={handleMonthChange}
                            className="time-slider" 
                        />
                        <div className="slider-markers">
                            <span className={monthOffset === -12 ? 'marker-active' : ''}>-1 Year</span>
                            <span className={monthOffset === 0 ? 'marker-active' : ''}>Current</span>
                            <span className={monthOffset === 12 ? 'marker-active' : ''}>+1 Year</span>
                        </div>
                    </div>

                    <div className="controls-row">
                        <div className="playback-controls">
                            <button className="control-btn" onClick={() => setMonthOffset(prev => Math.max(-12, prev - 1))}>
                                <i className="fas fa-backward"></i>
                            </button>
                            <button className="control-btn play-btn" onClick={togglePlay}>
                                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                            </button>
                            <button className="control-btn" onClick={() => setMonthOffset(prev => Math.min(12, prev + 1))}>
                                <i className="fas fa-forward"></i>
                            </button>
                        </div>
                        <div className="quick-jumps">
                            <button className={`jump-btn ${monthOffset === -6 ? 'active' : ''}`} onClick={() => jumpToMonth(-6)}>-6 Months</button>
                            <button className={`jump-btn ${monthOffset === 0 ? 'active' : ''}`} onClick={() => jumpToMonth(0)}>Current</button>
                            <button className={`jump-btn ${monthOffset === 6 ? 'active' : ''}`} onClick={() => jumpToMonth(6)}>+6 Months</button>
                        </div>
                    </div>
                </div>
            )}

            {activeLayer === 'population' && (
                <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: 'auto', marginBottom: '20px', marginLeft: '10px', zIndex: 1000, position: 'absolute', bottom: '20px', left: '10px' }}>
                    <div className="leaflet-control-year-switch leaflet-control">
                        <button 
                            className="year-switch-button" 
                            onClick={() => {
                                const nextYearIndex = (years.indexOf(currentYear) + 1) % years.length;
                                setCurrentYear(years[nextYearIndex]);
                            }}
                            style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                borderRadius: '3px'
                            }}
                        >
                            Year: {currentYear}
                        </button>
                    </div>
                </div>
            )}

            {activeLayer === 'population' && drawnShapes.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '60px',
                    background: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    maxWidth: '400px'
                }}>
                    <h4 style={{margin: '0 0 10px 0'}}>Drawn Areas Analysis</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{background: '#f2f2f2'}}>
                                <th style={{ border: '1px solid #ddd', padding: '5px' }}>Type</th>
                                <th style={{ border: '1px solid #ddd', padding: '5px' }}>Area (km²)</th>
                                <th style={{ border: '1px solid #ddd', padding: '5px' }}>Pop.</th>
                                <th style={{ border: '1px solid #ddd', padding: '5px' }}>Density</th>
                                <th style={{ border: '1px solid #ddd', padding: '5px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drawnShapes.map(shape => (
                                <tr key={shape.id}>
                                    <td style={{ border: '1px solid #ddd', padding: '5px' }}>{shape.type}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '5px' }}>{shape.area ? shape.area.toFixed(2) : 'N/A'}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '5px' }}>{shape.population}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '5px' }}>{shape.density ? shape.density.toFixed(2) : 'N/A'}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '5px' }}>
                                        <button onClick={() => handleCompare(shape)} style={{cursor: 'pointer', fontSize: '10px'}}>Compare</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showComparison && (
                <div style={{
                    position: 'absolute',
                    top: '320px',
                    left: '60px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '5px',
                    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    width: '400px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <h4 style={{margin: 0}}>Comparison Chart</h4>
                        <button onClick={() => {setShowComparison(false); setSelectedShapes([]);}} style={{cursor: 'pointer'}}>Close</button>
                    </div>
                    
                    <div style={{marginBottom: '10px'}}>
                        <label style={{marginRight: '10px'}}>Metric:</label>
                        <select value={chartMetric} onChange={(e) => setChartMetric(e.target.value)} style={{marginRight: '10px'}}>
                            <option value="density">Density</option>
                            <option value="population">Population</option>
                            <option value="area">Area</option>
                        </select>
                        
                        <label style={{marginRight: '10px'}}>Type:</label>
                        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                            <option value="bar">Bar</option>
                            <option value="pie">Pie</option>
                            <option value="line">Line</option>
                        </select>
                    </div>

                    <div style={{height: '250px'}}>
                        {chartType === 'bar' && <Bar data={getChartData()} options={{maintainAspectRatio: false}} />}
                        {chartType === 'pie' && <Pie data={getChartData()} options={{maintainAspectRatio: false}} />}
                        {chartType === 'line' && <Line data={getChartData()} options={{maintainAspectRatio: false}} />}
                    </div>
                </div>
            )}

            <div className="custom-control">
                <h3>Layers</h3>
                <div className="content" style={{display: 'block'}}>
                    <form>
                        <label>
                            <input 
                                type="radio" 
                                name="layer" 
                                value="population" 
                                checked={activeLayer === 'population'} 
                                onChange={(e) => setActiveLayer(e.target.value)} 
                            /> Population
                        </label><br/>
                        <label>
                            <input 
                                type="radio" 
                                name="layer" 
                                value="pollution" 
                                checked={activeLayer === 'pollution'} 
                                onChange={(e) => setActiveLayer(e.target.value)} 
                            /> Pollution
                        </label><br/>
                        <label>
                            <input 
                                type="radio" 
                                name="layer" 
                                value="climate" 
                                checked={activeLayer === 'climate'} 
                                onChange={(e) => setActiveLayer(e.target.value)} 
                            /> Climate
                        </label><br/>
                        <hr style={{margin: '10px 0', border: '0', borderTop: '1px solid #eee'}}/>
                        <button 
                            type="button"
                            onClick={() => setPredictionMode(true)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px'
                            }}
                        >
                            <i className="fas fa-chart-line"></i> Prediction Mode
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
