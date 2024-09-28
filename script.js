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

// Populate heatmap data from weather API
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

    const heatmapData = [];

    for (const [lat, lon] of coordinates) {
        const weather = await fetchWeatherData(lat, lon);
        if (weather && weather.temperature !== null) {
            heatmapData.push([weather.lat, weather.lon, weather.temperature]);
        }
    }

    if (heatmapData.length > 0) {
        L.heatLayer(heatmapData, {
            radius: 50,
            blur: 45,
            maxZoom: 17,
        }).addTo(map);
    } else {
        console.error("No data available for heatmap.");
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
                    fillOpacity: 0.7
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

// Update the switchLayer function to display the year-switch button only when population layer is active
function switchLayer() {
    map.eachLayer(function(layer) {
        if (layer !== baseLayer && layer !== editableLayers) {
            map.removeLayer(layer);
        }
    });

    // Check which layer is selected
    if (document.getElementById('population').checked) {
        populationLayer.addTo(map);
        plotClusters(populationData, years[currentYearIndex]); // Plot for the current year
        map.addControl(yearSwitchControl);
        map.addLayer(wardLayer)
    } else if (document.getElementById('pollution').checked) {
        waqiLayer.addTo(map);
        fetchAndDisplayMarkers(); // Fetch and display pollution markers
        map.addLayer(CLiwardLayer);
        switchYearButton.style.display = 'none'; // Hide year button
    } else if (document.getElementById('climate').checked) {
        climateLayer.addTo(map);
        populateHeatmap();
        switchYearButton.style.display = 'none'; // Hide year button
        map.addLayer(wardLayer)
    } else if (document.getElementById('dark').checked) {
        darkLayer.addTo(map);
        switchYearButton.style.display = 'none'; // Hide year button
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
// Initialize global variables
let populationMarkers = null; // Global variable to store parsed CSV data
let currentYearIndex = 0; // Start with the year 2001
const years = [2001, 2011, 2022]; // Array to hold the years for switching

// Get the switch year button
const switchYearButton = document.getElementById('switchYearButton');

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
