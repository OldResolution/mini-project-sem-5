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
    if (temperature < 27) {
        return '#0000FF'; // Blue for cold
    } else if (temperature < 29) {
        return '#00FFFF'; // Cyan for mild
    } else if (temperature < 31 ) {
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
            const climateMarker = L.marker(point, { opacity: 1 }).addTo(map);
            climateMarker.bindPopup(`<b>Temperature:</b> ${data.temperature}°C`);
        });
    } else {
        console.error("No data available for climate visualization.");
    }
}


// Dark Layer 
const darkLayer = L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=V2sjOIE1X0a8eylOLVh2T5KsxwTLmusfEXqGlpImHRkjATJAH2rYw9ACYCLjo4bd', {
	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	accessToken: 'V2sjOIE1X0a8eylOLVh2T5KsxwTLmusfEXqGlpImHRkjATJAH2rYw9ACYCLjo4bd'
});

// Get color based on AQI on ward areas
function getColorAQI(AQI) {
    return AQI > 300 ? '#7E0023' :    // Hazardous
           AQI > 200 ? '#99004C' :    // Very Unhealthy
           AQI > 150 ? '#FF0000' :    // Unhealthy
           AQI > 100 ? '#FF7E00' :    // Unhealthy for Sensitive Groups
           AQI > 50  ? '#FFFF00' :    // Moderate
           AQI > 25  ? '#00E400' :    // Good
                       '#00ffff'  ;
}


// Load Cloropeth data
let CLiwardLayer;
// Load ward map data and store it in wardLayer
fetch('data/WardMap.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // Initialize the GeoJSON layer
        CLiwardLayer = L.geoJSON(geojsonData, {
            style: function (feature) {
                return {
                    fillColor: getColorAQI(feature.properties.AQI),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.2
                };
            },
            onEachFeature: function (feature, layer) {
                let wardName = (feature.properties.NAME || "Unidentified Ward").trim();
                layer.bindPopup("<b>Ward: </b>" + wardName);
            }
        });
    });

    // Load wardmap data
let wardLayer;

fetch('data/WardMap.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // Initialize the GeoJSON layer but don't add it to the map
        wardLayer = L.geoJSON(geojsonData, {
            style: function (feature) {
                return {
                    color: "#ff7800",
                    weight: 2,
                    opacity: 1
                };
            },
            onEachFeature: function (feature, layer) {
                console.log(feature.properties);  // Log the properties to check the structure
                let wardName = (feature.properties.NAME || "Unidentified Ward").trim();
                layer.bindPopup("<b>Ward: </b>" + wardName);
            }
        })
    });

// Add a marker for CSMT with a popup
L.marker([18.9398, 72.8355]).addTo(map)
    .bindPopup('Chhatrapati Shivaji Maharaj Terminus (CSMT).<br> A historic railway station in Mumbai.')
    .openPopup();

    function switchLayer() {
        map.eachLayer(function(layer) {
            if (layer !== baseLayer && layer !== editableLayers) {
                map.removeLayer(layer);
            }
        });
    
        const switchYearButton = document.querySelector('.leaflet-control-year-switch');
        const populationDataTable = document.getElementById('populationDataTable');
        const comparisonTableContainer = document.getElementById('comparisonTableContainer');
        const minimizedComparisonTable = document.getElementById('minimizedComparisonTable');
    
        // Hide tables and year button by default
        if (switchYearButton) {
            switchYearButton.style.display = 'none';
        }
    
        if (populationDataTable) {
            populationDataTable.style.display = 'none';
        }
    
        if (comparisonTableContainer) {
            comparisonTableContainer.style.display = 'none';
        }
    
        if (minimizedComparisonTable) {
            minimizedComparisonTable.style.display = 'none';
        }
    
        // Check which layer is selected
        if (document.getElementById('population').checked) {
            populationLayer.addTo(map);
            plotClusters(populationData, years[currentYearIndex]); // Plot for the current year
            map.addControl(yearSwitchControl);
            map.addLayer(wardLayer);
    
            // Show population-related UI elements
            if (switchYearButton) {
                switchYearButton.style.display = 'block';
            }
    
            if (populationDataTable) {
                populationDataTable.style.display = 'table';
            }
    
            if (minimizedComparisonTable) {
                minimizedComparisonTable.style.display = 'block';
            }
        } else if (document.getElementById('pollution').checked) {
            waqiLayer.addTo(map);
            fetchAndDisplayMarkers();
            map.addLayer(PopwardLayer);
        } else if (document.getElementById('climate').checked) {
            climateLayer.addTo(map);
            populateHeatmap();
            map.addLayer(CliwardLayer);
        } else if (document.getElementById('dark').checked) {
            darkLayer.addTo(map);
        }
    
        // Always add editableLayers back
        map.addLayer(editableLayers);
    }
    

// Add event listeners to switch between layers
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

// Sequential ID generator, starting from 1
let currentID = 1;

function generateUUID() {
    if (currentID > 100000) {
        console.error("Maximum ID limit of 100000 reached.");
        return null;  // Return null if limit is reached
    }
    return currentID++;
}

// Handle the creation of new shapes and retrieve their coordinates
map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    const shapeID = generateUUID(); // Generate unique shape ID
    let shapeType, shapeCoordinates, shapeArea, shapeAreaInSqKm, populationValue = 0, populationDensity = 0;
    let markerCount = 0; // Initialize marker count
  
    editableLayers.addLayer(layer); // Add drawn layer to the editable layer group
  
    // Handle different shape types
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        shapeType = (layer instanceof L.Polygon) ? 'Polygon' : 'Rectangle';
        shapeCoordinates = layer.getLatLngs(); // Get coordinates for polygon/rectangle
        shapeArea = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]); // Calculate area in square meters
        shapeAreaInSqKm = shapeArea / 1_000_000; // Convert area to square kilometers
        console.log(`${shapeType} Coordinates:`, shapeCoordinates);
        console.log(`${shapeType} Area (sq/km):`, shapeAreaInSqKm);

        // Check population markers within polygon/rectangle
        populationMarkers.eachLayer(function (marker) {
            const latLng = marker.getLatLng();
            if (isPointInPolygon(latLng, layer)) { // Custom function to check if point is inside polygon
                markerCount++;
            }
        });

    } else if (layer instanceof L.Circle) {
        shapeType = 'Circle';
        const circleCenter = layer.getLatLng();
        const circleRadius = layer.getRadius();
        shapeCoordinates = { center: circleCenter, radius: circleRadius }; // Store center and radius
        shapeArea = Math.PI * Math.pow(circleRadius, 2); // Area of the circle in square meters
        shapeAreaInSqKm = shapeArea / 1_000_000; // Convert to square kilometers
        console.log('Circle Center:', circleCenter);
        console.log('Circle Radius:', circleRadius);
        console.log('Circle Area (sq/km):', shapeAreaInSqKm);

        // Check population markers within the circle
        populationMarkers.eachLayer(function (marker) {
            const latLng = marker.getLatLng();
            if (isPointInCircle(latLng, layer)) { // Custom function to check if point is inside the circle
                markerCount++;
            }
        });
    }

    // Calculate population value (number of markers * 500)
    populationValue = markerCount * 500;

    // Calculate population density (population per square kilometer)
    if (shapeAreaInSqKm > 0) {
        populationDensity = populationValue / shapeAreaInSqKm;
    }

    // Display the population data in a table
    displayPopulationInTable(shapeID, shapeType, shapeCoordinates, shapeAreaInSqKm, populationValue, populationDensity);
});
// Function to remove the last drawing and clear the comparison data
function removeLastDrawing() {
    const layers = editableLayers.getLayers();
    if (layers.length > 0) {
        const removedLayer = layers[layers.length - 1];
        editableLayers.removeLayer(removedLayer);
        
        // Remove corresponding shape data if it exists
        selectedShapes = selectedShapes.filter(shape => shape.shapeID !== removedLayer._id);
        updateComparisonTable();
    }
}

// Function to remove all drawings and clear the comparison data
function removeAllDrawings() {
    editableLayers.clearLayers();
    selectedShapes = []; // Clear selected shapes
    existingComparisons.clear(); // Clear existing comparisons
    updateComparisonTable();
}

// Function to update tables after removing a shape
function updateTablesAfterRemoval(removedLayer) {
    const shapeID = removedLayer.options.id; // Assuming each layer has an id in options
    const comparisonTableBody = document.querySelector('#comparisonDataTable tbody');
    
    // Remove corresponding rows in the population data table
    const rows = document.querySelectorAll('#populationDataTable tbody tr');
    rows.forEach(row => {
        if (row.querySelector('.compare-button').dataset.id === shapeID) {
            row.remove(); // Remove the row for the deleted shape
        }
    });

    // Remove corresponding rows in the comparison data table
    const comparisonRows = comparisonTableBody.querySelectorAll('tr');
    comparisonRows.forEach(row => {
        if (row.innerHTML.includes(shapeID)) {
            row.remove(); // Remove the comparison row for the deleted shape
        }
    });
}

// Function to clear all tables
function clearAllTables() {
    const populationTableBody = document.querySelector('#populationDataTable tbody');
    const comparisonTableBody = document.querySelector('#comparisonDataTable tbody');
    
    // Clear population data table
    while (populationTableBody.firstChild) {
        populationTableBody.removeChild(populationTableBody.firstChild);
    }

    // Clear comparison data table
    while (comparisonTableBody.firstChild) {
        comparisonTableBody.removeChild(comparisonTableBody.firstChild);
    }
}

// Function to clear the comparison chart
function clearComparisonChart() {
    // Safely destroy the chart if it exists
    if (window.comparisonChart instanceof Chart) {
        window.comparisonChart.destroy();
    }

    // Hide the chart container and buttons
    document.getElementById('chartContainer').style.display = 'none';
    document.getElementById('chartButtons').style.display = 'none';
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

// Function to check if a point is inside the polygon
function isPointInPolygon(point, polygonLayer) {
    const latLngs = polygonLayer.getLatLngs()[0];
    if (latLngs[0] !== latLngs[latLngs.length - 1]) {
        latLngs.push(latLngs[0]); // Close the polygon
    }
    const turfPolygon = turf.polygon([latLngs.map(latLng => [latLng.lng, latLng.lat])]);
    const turfPoint = turf.point([point.lng, point.lat]);
    return turf.booleanPointInPolygon(turfPoint, turfPolygon);
}

// Function to check if a point is inside a circle
function isPointInCircle(latLng, circleLayer) {
    const circleCenter = circleLayer.getLatLng();
    const distance = map.distance(latLng, circleCenter); // Calculate distance
    return distance <= circleLayer.getRadius();
}
let selectedShapes = []; // Store the selected shapes for comparison
let existingComparisons = new Set(); // Track existing comparisons

// Function to display population data and add comparison button
function displayPopulationInTable(shapeID, shapeType, shapeCoordinates, shapeAreaInSqKm, populationValue, populationDensity) {
    const tableBody = document.querySelector('#populationDataTable tbody');

    if (!tableBody) {
        console.error("Table not found or not properly referenced.");
        return;
    }

    // Add a new row with the shape data
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${shapeID}</td> <!-- Shape ID -->
        <td>${shapeType}</td> <!-- Shape Type -->
        <td>${JSON.stringify(shapeCoordinates)}</td> <!-- Shape Coordinates -->
        <td>${shapeAreaInSqKm.toFixed(2)} sq/km</td> <!-- Shape Area with sq/km -->
        <td>${populationValue}</td> <!-- Total Population -->
        <td>${populationDensity.toFixed(2)} per sq/km</td> <!-- Population Density with sq/km -->
        <td><button class="compare-button" data-id="${shapeID}" data-population="${populationValue}" data-density="${populationDensity}" onclick="selectShapeForComparison('${shapeID}', ${populationValue}, ${populationDensity})">Compare</button></td>
    `;
    tableBody.appendChild(row);
}

// Function to select shapes for comparison
function selectShapeForComparison(shapeID, populationValue, populationDensity) {
    const shapeArea = document.querySelector(`[data-id="${shapeID}"]`).closest('tr').querySelector('td:nth-child(4)').textContent.replace(' sq/km', '');

    // Check if the shape has already been selected
    const shapeExists = selectedShapes.find(shape => shape.shapeID === shapeID);
    if (!shapeExists) {
        selectedShapes.push({ shapeID, populationValue, populationDensity, shapeArea: parseFloat(shapeArea) });
        generateComparisonResults(); // Populate the comparison table with the selected shape
    } else {
        alert(`${shapeID} is already selected for comparison.`);
    }
}

// Function to compare two selected shapes
function compareShapes(shape1, shape2) {
    const populationDiff = Math.abs(shape1.populationValue - shape2.populationValue);
    const densityDiff = parseFloat(Math.abs(shape1.populationDensity - shape2.populationDensity).toFixed(3));
    const populationPercentageDiff = ((populationDiff / Math.max(shape1.populationValue, shape2.populationValue)) * 100).toFixed(2);
    const densityPercentageDiff = ((densityDiff / Math.max(shape1.populationDensity, shape2.populationDensity)) * 100).toFixed(2);

    const comparisonKey = [shape1.shapeID, shape2.shapeID].sort().join(' vs ');

    if (!existingComparisons.has(comparisonKey)) {
        displayComparisonResults(shape1, shape2, populationDiff, densityDiff, populationPercentageDiff, densityPercentageDiff);
        existingComparisons.add(comparisonKey);
    }
}

// Function to populate the comparison table
function generateComparisonResults() {
    const comparisonTableBody = document.querySelector('#comparisonDataTable tbody');
    comparisonTableBody.innerHTML = ''; // Clear previous entries

    selectedShapes.forEach((shape, index) => {
        // Only compare if there are at least two shapes
        if (index < selectedShapes.length - 1) {
            compareShapes(shape, selectedShapes[index + 1]);
        }
    });
    
    // Automatically show the comparison table and add generate chart button
    comparisonTableContainer.style.display = 'block';
    addGenerateChartButton();
}


// Create a custom control for the collapsible/minimizable comparison table
const comparisonTableContainer = document.createElement('div');
comparisonTableContainer.id = 'comparisonTableContainer';
comparisonTableContainer.style.display = 'none'; // Hidden by default

// Define the comparison table HTML structure
comparisonTableContainer.innerHTML = `
    <div id="comparisonTableHeader">
        <span>Comparison Data</span>
        <div>
            <button id="minimizeComparisonBtn">_</button>
            <button id="collapseComparisonBtn">X</button>
        </div>
    </div>
    <div id="comparisonTableBody">
        <table id="comparisonDataTable">
            <thead>
                <tr>
                    <th>Shape Comparison</th>
                    <th>Population Diff</th>
                    <th>Density Diff</th>
                    <th>Population % Diff</th>
                    <th>Density % Diff</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <div id="resizeHandle"></div> <!-- Resizable corner -->
`;
document.getElementById('map').appendChild(comparisonTableContainer);

// Function to display the comparison results in the comparison table
function displayComparisonResults(shape1, shape2, populationDiff, densityDiff, populationPercentageDiff, densityPercentageDiff) {
    const comparisonTableBody = document.querySelector('#comparisonDataTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${shape1.shapeID} vs ${shape2.shapeID}</td>
        <td>${populationDiff}</td>
        <td>${densityDiff}</td>
        <td>${populationPercentageDiff}%</td>
        <td>${densityPercentageDiff}%</td>
        <td><button class="create-chart-button" onclick="generateComparisonChart()">Create Chart</button></td>
    `;
    comparisonTableBody.appendChild(row);
}

// Function to update the comparison table after removing shapes
function updateComparisonTable() {
    const comparisonTableBody = document.querySelector('#comparisonDataTable tbody');
    comparisonTableBody.innerHTML = ''; // Clear previous comparison results
    comparisonTableContainer.style.display = 'none'; // Hide comparison table
}


// Function to add the button to generate charts
function addGenerateChartButton() {
    const comparisonTableBody = document.querySelector('#comparisonDataTable tbody');
    
    // Check if there's already a button to generate the chart
    if (!document.getElementById('generateChartBtn')) {
        const buttonRow = document.createElement('tr');
        buttonRow.innerHTML = `
            <td colspan="6">
                <button id="generateChartBtn" onclick="generateComparisonChart()">Generate Comparison Chart</button>
            </td>
        `;
        comparisonTableBody.appendChild(buttonRow);
    }
}

// Handle collapsible/minimizable functionality
document.getElementById('collapseComparisonBtn').onclick = function() {
    comparisonTableContainer.style.display = 'none';
    minimizedComparisonTable.style.display = 'block'; // Show the minimized window
};
document.getElementById('minimizeComparisonBtn').onclick = function() {
    const tableBody = document.getElementById('comparisonTableBody');
    tableBody.style.display = tableBody.style.display === 'none' ? 'block' : 'none';
};

// Enable dragging of the entire table container
let isDragging = false, offsetX, offsetY;

comparisonTableContainer.onmousedown = function(e) {
    // Only allow dragging if the click happens in the header or container, but not on the collapse button
    if (e.target !== document.getElementById('collapseComparisonBtn') && e.target !== document.getElementById('minimizeComparisonBtn')) {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    }
};

document.onmousemove = function(e) {
    if (isDragging) {
        comparisonTableContainer.style.left = (e.clientX - offsetX) + 'px';
        comparisonTableContainer.style.top = (e.clientY - offsetY) + 'px';
    }
};

document.onmouseup = function() {
    isDragging = false;
};

// Enable resizing of the comparison table container
let isResizing = false;
const resizeHandle = document.getElementById('resizeHandle');
resizeHandle.onmousedown = function(e) {
    isResizing = true;
    document.body.style.cursor = 'nwse-resize';
};

document.onmousemove = function(e) {
    if (isResizing) {
        const newWidth = e.clientX - comparisonTableContainer.offsetLeft;
        const newHeight = e.clientY - comparisonTableContainer.offsetTop;
        comparisonTableContainer.style.width = newWidth + 'px';
        comparisonTableContainer.style.height = newHeight + 'px';
    }
};

document.onmouseup = function() {
    isResizing = false;
    document.body.style.cursor = 'default';
};

// Create the minimized version of the comparison table
const minimizedComparisonTable = document.createElement('div');
minimizedComparisonTable.id = 'minimizedComparisonTable';
minimizedComparisonTable.innerHTML = 'Show Comparison Table';
minimizedComparisonTable.style.display = 'none'; // Initially hidden
document.getElementById('map').appendChild(minimizedComparisonTable);

// Restore full view when the minimized button is clicked
minimizedComparisonTable.onclick = function() {
    comparisonTableContainer.style.display = 'block';
    minimizedComparisonTable.style.display = 'none'; // Hide the minimized button
};

let currentColumn = 'area'; // Default column is 'area'
let currentChartType = 'bar'; // Default chart type is 'bar'

// Function to generate comparison chart
// Function to generate the comparison chart with multiple shapes
function generateComparisonChart() {
    if (selectedShapes.length < 2) {
        alert('Please select at least two shapes for comparison');
        return;
    }

    const labels = selectedShapes.map(shape => shape.shapeID);
    let data = [];

    // Determine the data based on the currently selected column (area, population, or density)
    if (currentColumn === 'area') {
        data = selectedShapes.map(shape => shape.shapeArea);
    } else if (currentColumn === 'population') {
        data = selectedShapes.map(shape => shape.populationValue);
    } else if (currentColumn === 'density') {
        data = selectedShapes.map(shape => shape.populationDensity);
    }

    // Get the chart context from the existing canvas element
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Safely destroy the previous chart instance if it exists and is a Chart instance
    if (window.comparisonChart instanceof Chart) {
        window.comparisonChart.destroy();
    }

    // Create the new chart
    window.comparisonChart = new Chart(ctx, {
        type: currentChartType,
        data: {
            labels: labels,
            datasets: [{
                label: currentColumn === 'area' ? 'Shape Area (sq/km)' : 
                        currentColumn === 'population' ? 'Total Population' : 
                        'Population Density (per sq/km)',
                data: data,
                backgroundColor: currentChartType === 'pie' ? selectedShapes.map((_, i) => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`) : 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: currentChartType === 'pie' ? {} : {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Make sure the chart and buttons are visible
    document.getElementById('chartContainer').style.display = 'block';
    document.getElementById('chartButtons').style.display = 'block';
}

// Event listeners for chart type and column switches
document.getElementById('barChartBtn').addEventListener('click', () => {
    currentChartType = 'bar';
    generateComparisonChart();
});
document.getElementById('pieChartBtn').addEventListener('click', () => {
    currentChartType = 'pie';
    generateComparisonChart();
});
document.getElementById('lineChartBtn').addEventListener('click', () => {
    currentChartType = 'line';
    generateComparisonChart();
});
document.getElementById('switchToAreaBtn').addEventListener('click', () => {
    currentColumn = 'area'; // Switch to area comparison
    generateComparisonChart();
});
document.getElementById('switchToPopulationBtn').addEventListener('click', () => {
    currentColumn = 'population'; // Switch to population comparison
    generateComparisonChart();
});
document.getElementById('switchToDensityBtn').addEventListener('click', () => {
    currentColumn = 'density'; // Switch to density comparison
    generateComparisonChart();
});

//population map working    

// Population Data Parsing and Plotting
// Initialize global variables
let populationMarkers = null; // Global variable to store parsed CSV data
let currentYearIndex = 0; // Start with the year 2001
const years = [2001, 2011, 2022]; // Array to hold the years for switching

// Function to toggle between years for population data
function switchPopulationYear() {
    currentYearIndex = (currentYearIndex + 1) % years.length; // Cycle through the years: 2001 -> 2011 -> 2022
    const selectedYear = years[currentYearIndex];
    
    switchYearButton.innerText = `Switch Year (Current: ${selectedYear})`; // Update button text

    // Re-plot clusters with the selected year's data
    plotClusters(populationData, selectedYear);
}

// Custom control for switching years
L.Control.YearSwitch = L.Control.extend({
    onAdd: function(map) {
        let div = L.DomUtil.create('div', 'leaflet-control-year-switch');
        
        let button = L.DomUtil.create('button', 'year-switch-button', div);
        button.innerHTML = `Year: ${years[currentYearIndex]}`;
        
        // Prevent map panning when clicking the button
        L.DomEvent.disableClickPropagation(button);
        
        // Handle the button click event to switch between years
        L.DomEvent.on(button, 'click', function() {
            // Cycle through the years
            currentYearIndex = (currentYearIndex + 1) % years.length;
            button.innerHTML = `Year: ${years[currentYearIndex]}`;
            
            // Plot the population data for the selected year
            if (document.getElementById('population').checked) {
                plotClusters(populationData, years[currentYearIndex]); // Update the map with the new year data
            }
        });
        
        return div;
    },
    onRemove: function(map) {
        // Nothing to remove here
    }
});

let yearSwitchControl = new L.Control.YearSwitch({ position: 'bottomleft' });

// Use PapaParse to load and parse the CSV file
Papa.parse('data/Population_Density_Scaled_2011_2022.csv', {
    download: true,
    header: true,
    complete: function(results) {
        // Parse and extract the relevant data
        populationData = extractPopulationData(results.data); // Save to global variable
        
        console.log(populationData); // Check the parsed data
        
        if (document.getElementById('population').checked) {
            plotClusters(populationData, 2001); // Call function to plot clusters on map for the default year (2001)
        }
    }
});

// Extend the extractPopulationData function to handle different years
function extractPopulationData(data) {
    return data.map(row => {
        const lat = parseFloat(row['Latitude']);
        const lng = parseFloat(row['Longitude']);

        if (!isNaN(lat) && !isNaN(lng)) {
            return {
                name: row['Ward'],
                population2001: parseFloat(row['Population 2001']) || 0, // Population for 2001
                population2011: parseFloat(row['Population 2011']) || 0, // Population for 2011
                population2022: parseFloat(row['Population 2022']) || 0, // Population for 2022
                density2001: parseFloat(row['Density per Square Kilometer']) || 0, // Density for 2001
                density2011: parseFloat(row['Density 2011']) || 0, // Density for 2011
                density2022: parseFloat(row['Density 2022']) || 0, // Density for 2022
                lat: lat,
                lng: lng
            };
        } else {
            return null; // Exclude invalid entries
        }
    }).filter(row => row !== null); // Filter out invalid entries
}

// Updated plotClusters function to handle population and density based on the selected year
function plotClusters(populationData, selectedYear) {
     // Remove previous markers if they exist
     if (populationMarkers) {
        map.removeLayer(populationMarkers); // Remove the existing marker cluster group from the map
    }
    const markers = L.markerClusterGroup(); // Create a new marker cluster group

    populationData.forEach(function(item) {
        if (!isNaN(item.lat) && !isNaN(item.lng)) {
            let population = 0;
            let density = 0;

            // Determine population and density based on the selected year
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
           // Update color based on density
           const color = getColor(density);

           let numPoints = Math.min(Math.floor(population / 500)); // A single point represents 500 people

           if (numPoints > 0) {
               let wardPolygon = findWardPolygon(item.name, wardLayer);

               if (wardPolygon?.coordinates?.length > 0) {
                   let randomPoints = turf.randomPoint(numPoints, { bbox: turf.bbox(wardPolygon) });

                   randomPoints.features.forEach(function(point) {
                       let latLng = [point.geometry.coordinates[1], point.geometry.coordinates[0]];

                       if (turf.booleanPointInPolygon(point, wardPolygon)) {
                           const marker = L.circleMarker(latLng, {
                               radius: 5,
                               fillColor: color,
                               color: "#000",
                               weight: 1,
                               opacity: 1,
                               fillOpacity: 0.8
                           }).bindPopup(`<strong>${item.name}</strong><br>Population: ${population}<br>Density: ${density}`);

                           markers.addLayer(marker);
                       }
                   });
               }
           }
       }
   });

    // Add the new marker cluster group to the map
    map.addLayer(markers);

    // Save the marker cluster group to the global variable so it can be removed later
    populationMarkers = markers;

    return markers; // Return the marker cluster group so it can be managed if needed
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
    if (density > 2000) return '#FF0000'; // Red for very high density
    else if (density > 1000) return '#FF6600'; // Orange-red for high density
    else if (density > 500) return '#FF9900'; // Orange for medium density
    else if (density > 100) return '#FFFF00'; // Yellow for low density
    else return '#00FF00'; // Green for very low density
}
