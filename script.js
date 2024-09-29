// Initialize the map centered on Mumbai
const map = L.map('map', {
    center: [19.0760, 72.8777],
    zoom: 13,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: [
        [18.89, 72.75], // Southwest corner
        [19.27, 73.0]   // Northeast corner
    ],
    maxBoundsViscosity: 1.0
});

// Add base tile layer
const baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Population Layer
const populationLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Population Data &copy; OpenStreetMap contributors'
});

// WAQI Pollution Layer
const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572";
const WAQI_ATTR = 'Air Quality Tiles &copy; <a href="http://waqi.info">waqi.info</a>';
const waqiLayer = L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR });

// OSM Climate (DE) Layer (Example using a different tile layer)
const climateLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

// OpenWeatherMap API key (replace with your own key)
const apiKey = '80292c7c9a0e2548d796c7b98b739b03'; // Your OpenWeatherMap API key

// Fetch weather data for different locations
async function fetchWeatherData(lat, lon) {
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
}

// Helper function to get color based on temperature
function getTemperatureColor(temperature) {
    // Use a color gradient from blue (cold) to red (hot)
    if (temperature < 25) {
        return '#0000FF'; // Blue for cold
    } else if (temperature < 26) {
        return '#00FFFF'; // Cyan for mild
    } else if (temperature < 28) {
        return '#FFFF00'; // Yellow for warm
    } else {
        return '#FF0000'; // Red for hot
    }
}

// Populate heatmap data from weather API and fill wards based on climate data
async function populateHeatmap() {
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

    // Load ward map data
    const geojsonData = await fetch('data/WardMap.geojson').then(response => response.json());

    // Initialize the GeoJSON layer
    const wardLayer = L.geoJSON(geojsonData, {
        style: function (feature) {
            return {
                color: "#ff0000",
                weight: 1,
                fillOpacity: 0.2
            };
        },
        onEachFeature: function (feature, layer) {
            let wardName = (feature.properties.NAME || "Unidentified Ward").trim();
            layer.bindPopup("<b>Ward: </b>" + wardName);
        }
    });

    // Add ward layer to map to make it possible to use the contains method
    wardLayer.addTo(map);

    if (climateData.length > 0) {
        climateData.forEach(data => {
            const point = L.latLng(data.lat, data.lon);
            let temperatureColor = getTemperatureColor(data.temperature);

            // Iterate over each layer in wardLayer to determine if the point resides within the ward
            wardLayer.eachLayer(layer => {
                if (layer.getBounds().contains(point)) {
                    // If the point resides in the ward, change the style of the ward
                    layer.setStyle({
                        color: temperatureColor,
                        weight: 1,
                        fillOpacity: 0.6
                    });
                }
            });

            // Create an invisible marker for the climate data point
            const climateMarker = L.marker(point, { opacity: 0 }).addTo(map);
            climateMarker.bindPopup(`<b>Temperature:</b> ${data.temperature}°C`);
        });
    } else {
        console.error("No data available for climate visualization.");
    }
}


// Call the function to populate the heatmap
populateHeatmap();


// Update the switchLayer function to include the climate data visualization
function switchLayer() {
    map.eachLayer(function (layer) {
        if (layer !== baseLayer && layer !== editableLayers) {
            map.removeLayer(layer);
        }
    });

    if (document.getElementById('population').checked) {
        populationLayer.addTo(map);
        plotClusters(populationData);
        map.addLayer(wardLayer);
    } else if (document.getElementById('pollution').checked) {
        waqiLayer.addTo(map);
        fetchAndDisplayMarkers(); // Fetch and display pollution markers
        map.addLayer(wardLayer);
    } else if (document.getElementById('climate').checked) {
        // Add ward layer and populate heatmap
        map.addLayer(wardLayer);
        populateHeatmap();
    } else if (document.getElementById('dark').checked) {
        darkLayer.addTo(map);
        map.addLayer(wardLayer);
    }
    map.addLayer(editableLayers);
}

// Dark Layer 
const darkLayer = L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=V2sjOIE1X0a8eylOLVh2T5KsxwTLmusfEXqGlpImHRkjATJAH2rYw9ACYCLjo4bd', {
	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	accessToken: 'V2sjOIE1X0a8eylOLVh2T5KsxwTLmusfEXqGlpImHRkjATJAH2rYw9ACYCLjo4bd'
});

// Load wardmap data
let wardLayer;
// Load ward map data and store it in wardLayer
fetch('data/WardMap.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // Initialize the GeoJSON layer
        wardLayer = L.geoJSON(geojsonData, {
            style: function (feature) {
                return {
                    color: "#ff0000",
                    weight: 1,
                    fillOpacity: 0.2
                };
            },
            onEachFeature: function (feature, layer) {
                let wardName = (feature.properties.NAME || "Unidentified Ward").trim();
                layer.bindPopup("<b>Ward: </b>" + wardName);
            }
        });
    });

// Add a marker for CSMT with a popup
L.marker([18.9398, 72.8355]).addTo(map)
    .bindPopup('Chhatrapati Shivaji Maharaj Terminus (CSMT).<br> A historic railway station in Mumbai.')
    .openPopup();

function switchLayer() {
    map.eachLayer(function (layer) {
        if (layer !== baseLayer && layer !== editableLayers) {
            map.removeLayer(layer);
        }
    });

    if (document.getElementById('population').checked) {
        populationLayer.addTo(map);
        plotClusters(populationData);   
        map.addLayer(wardLayer);
    } else if (document.getElementById('pollution').checked) {
        waqiLayer.addTo(map);
        fetchAndDisplayMarkers(); // Fetch and display pollution markers
        map.addLayer(wardLayer);
    } else if (document.getElementById('climate').checked) {
        climateLayer.addTo(map);
        populateHeatmap();
        map.addLayer(wardLayer);
    } else if (document.getElementById('dark').checked) {
        darkLayer.addTo(map);
        map.addLayer(wardLayer);
    }
    map.addLayer(editableLayers);
}

document.getElementById('population').addEventListener('change', switchLayer);
document.getElementById('pollution').addEventListener('change', switchLayer);
document.getElementById('climate').addEventListener('change', switchLayer);
document.getElementById('dark').addEventListener('change', switchLayer);

// Toggle content visibility
const toggleControl = document.querySelector('.custom-control h3');
const content = document.querySelector('.custom-control .content');

toggleControl.addEventListener('click', function () {
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
});


// Fetch air quality data and add invisible markers to the map
const token = '5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572'; // Replace with your actual token

function fetchAndDisplayMarkers() {
    const bounds = map.getBounds();
    const url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                data.data.forEach(station => {
                    // Fetch detailed station data to get pollutants information
                    const stationUrl = `https://api.waqi.info/feed/@${station.uid}/?token=${token}`;

                    fetch(stationUrl)
                        .then(response => response.json())
                        .then(stationData => {
                            if (stationData.status === 'ok') {
                                const pollutants = stationData.data.iaqi; // Individual Air Quality Index

                                // Build a popup content with pollutants data
                                const popupContent = `
                                    <b>Station:</b> ${station.station.name}<br>
                                    <b>AQI:</b> ${station.aqi}<br>
                                    <b>PM2.5:</b> ${pollutants.pm25 ? pollutants.pm25.v : 'N/A'}<br>
                                    <b>PM10:</b> ${pollutants.pm10 ? pollutants.pm10.v : 'N/A'}<br>
                                    <b>O3:</b> ${pollutants.o3 ? pollutants.o3.v : 'N/A'}<br>
                                    <b>NO2:</b> ${pollutants.no2 ? pollutants.no2.v : 'N/A'}<br>
                                    <b>SO2:</b> ${pollutants.so2 ? pollutants.so2.v : 'N/A'}<br>
                                    <b>CO:</b> ${pollutants.co ? pollutants.co.v : 'N/A'}
                                `;

                                L.marker([station.lat, station.lon], { opacity: 0 }).addTo(map)
                                    .bindPopup(popupContent);
                            } else {
                                console.error('Error fetching station data:', stationData);
                            }
                        })
                        .catch(error => console.error('Error fetching station data:', error));
                });
            } else {
                console.error('Error fetching data:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}


map.on('moveend', function() {
    if (document.getElementById('pollution').checked) {
        fetchAndDisplayMarkers();
    }
});
fetchAndDisplayMarkers(); // Initial load

// Initialize FeatureGroup to store editable layers
const editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

// Set up draw control options with darker lines
const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        polyline: {
            shapeOptions: {
                color: '#2a2a2a', // Darker line color for polylines
                weight: 10
            }
        },
        polygon: {
            allowIntersection: false,
            drawError: {
                color: '#e1e100',
                message: '<strong>Oh snap!<strong> you can\'t draw that!'
            },
            shapeOptions: {
                color: '#2a2a2a'     // Darker line color for polygons
            }
        },
        circle: {
            shapeOptions: {
                color: '#2a2a2a' // Darker line color for circles
            }
        },
        rectangle: {
            shapeOptions: {
                color: '#2a2a2a', // Darker line color for rectangles
                clickable: false
            }
        },
        marker: true // Default marker icon
    },
    edit: {
        featureGroup: editableLayers,
        remove: false
    }
});

// Add draw control to the map
map.addControl(drawControl);

// Handle the creation of new shapes and retrieve their coordinates
map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    editableLayers.addLayer(layer);

    // Retrieve the exact coordinates
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        console.log('Coordinates:', layer.getLatLngs());
    } else if (layer instanceof L.Circle) {
        console.log('Center:', layer.getLatLng());
        console.log('Radius:', layer.getRadius());
    } else if (layer instanceof L.Marker) {
        console.log('Marker Coordinates:', layer.getLatLng());
    }
});

// Function to remove the last drawing
function removeLastDrawing() {
    const layers = editableLayers.getLayers();
    if (layers.length > 0) {
        editableLayers.removeLayer(layers[layers.length - 1]);
    }
}

// Function to remove all drawings
function removeAllDrawings() {
    editableLayers.clearLayers();
}

// Create buttons and add them to the map
const removeLastButton = L.control({ position: 'topleft' });
removeLastButton.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leafconst-bar leafconst-control leafconst-control-custom');
    div.innerHTML = '<button title="Remove Last Drawing">Remove Last</button>';
    div.style.backgroundColor = 'white';
    div.style.padding = '5px';
    div.style.cursor = 'pointer';

    div.onclick = function() {
        removeLastDrawing();
    };

    return div;
};
removeLastButton.addTo(map);

const removeAllButton = L.control({ position: 'topleft' });
removeAllButton.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leafconst-bar leafconst-control leafconst-control-custom');
    div.innerHTML = '<button title="Remove All Drawings">Remove All</button>';
    div.style.backgroundColor = 'white';
    div.style.padding = '5px';
    div.style.cursor = 'pointer';

    div.onclick = function() {
        removeAllDrawings();
    };

    return div;
};
removeAllButton.addTo(map);

//population map working

// Population Data Parsing and Plotting
let populationData = []; // Declare populationData globally

// Use PapaParse to load and parse the CSV file
Papa.parse('data/Population_Density_Scaled_2011_2022.csv', {
    download: true,
    header: true,
    complete: function(results) {
        // Parse and extract the relevant data
        populationData = extractPopulationData(results.data); // Save to global variable
        
        console.log(populationData); // Check the parsed data
        if (document.getElementById('population').checked) {
            plotClusters(populationData); // Call function to plot clusters on map if population layer is active
        }
    }
});

// Function to extract population data from CSV
function extractPopulationData(data) {
    return data.map(row => {
        const lat = parseFloat(row['Latitude']);
        const lng = parseFloat(row['Longitude']);

        if (!isNaN(lat) && !isNaN(lng)) {
            return {
                name: row['Ward'],
                population: parseFloat(row['Population 2001']) || 0, // Ensure population is a number
                density: parseFloat(row['Density per Square Kilometer']) || 0, // Ensure density is a number
                lat: lat,
                lng: lng
            };
        } else {
            return null; // Exclude invalid entries
        }
    }).filter(row => row !== null); // Filter out invalid entries
}

// Plot clusters on the population map
function plotClusters(populationData) {
    var markers = L.markerClusterGroup();

    populationData.forEach(function(item) {
        if (!isNaN(item.lat) && !isNaN(item.lng)) { // Check if lat and lng are valid
            var color = getColor(item.density);

            // Generate random points based on population
            let numPoints = Math.floor(item.population / 100); // Scale random points (1 point per 100 people)

            if (numPoints > 0) {
                // Find the corresponding ward polygon from GeoJSON by matching the ward name
                let wardPolygon = findWardPolygon(item.name, wardLayer);

                if (wardPolygon && wardPolygon.coordinates && wardPolygon.coordinates.length > 0) {
                    // Only proceed if valid polygon data is present
                    let randomPoints = turf.randomPoint(numPoints, { bbox: turf.bbox(wardPolygon) });
                
                    randomPoints.features.forEach(function (point) {
                        let latLng = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
                
                        // Ensure the random point is within the polygon
                        if (turf.booleanPointInPolygon(point, wardPolygon)) {
                            var marker = L.circleMarker(latLng, {
                                radius: 5, // Adjust marker size
                                fillColor: color,
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).bindPopup(`<strong>${item.name}</strong><br>Population: ${item.population}<br>Density: ${item.density}`);
                            
                            markers.addLayer(marker);
                        }
                    });                
                } else {
                    console.warn(`Ward polygon not found for ${item.name}`);
                }
            }
        }
    });

    map.addLayer(markers); // Add markers to the map
}

function findWardPolygon(wardName, wardLayer) {
    let polygon = null;

    // Loop through GeoJSON layers and find the matching ward
    wardLayer.eachLayer(function(layer) {
        const geoWardName = (layer.feature.properties.NAME || "").trim().toLowerCase();
        
        if (geoWardName === wardName.trim().toLowerCase()) {
            polygon = layer.feature.geometry; // Extract the polygon geometry
        }
    });

    return polygon;
}
// Get color based on population density
function getColor(density) {
    if (density > 1000) return '#FF0000'; // Red for high density
    else if (density > 500) return '#FF9900'; // Orange for medium density
    else return '#00FF00'; // Green for low density
}
