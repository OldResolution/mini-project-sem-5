// Initialize the map centered on Mumbai
var map = L.map('map', {
    center: [19.0760, 72.8777],
    zoom: 13,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: [
        [18.89, 72.75], // Southwest corner
        [19.23, 73.0]   // Northeast corner
    ],
    maxBoundsViscosity: 1.0
});

// Add base tile layer
var baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Population Layer
var populationLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Population Data &copy; OpenStreetMap contributors'
});

// WAQI Pollution Layer
var WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572";
var WAQI_ATTR = 'Air Quality Tiles &copy; <a href="http://waqi.info">waqi.info</a>';
var waqiLayer = L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR });

// OSM Climate (DE) Layer (Example using a different tile layer)
var deLayer = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

    let heatmapData = [];

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

// Satellite layer
var satelliteLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

// Dark Layer 
var darkLayer = L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=V2sjOIE1X0a8eylOLVh2T5KsxwTLmusfEXqGlpImHRkjATJAH2rYw9ACYCLjo4bd', {
	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	accessToken: 'V2sjOIE1X0a8eylOLVh2T5KsxwTLmusfEXqGlpImHRkjATJAH2rYw9ACYCLjo4bd'
});

// Add a marker for CSMT with a popup
L.marker([18.9398, 72.8355]).addTo(map)
    .bindPopup('Chhatrapati Shivaji Maharaj Terminus (CSMT).<br> A historic railway station in Mumbai.')
    .openPopup();

function switchLayer() {
    map.eachLayer(function (layer) {
        if (layer !== baseLayer) {
            map.removeLayer(layer);
        }
    });

    if (document.getElementById('population').checked) {
        populationLayer.addTo(map);
    } else if (document.getElementById('pollution').checked) {
        waqiLayer.addTo(map);
        fetchAndDisplayMarkers(); // Fetch and display pollution markers
    } else if (document.getElementById('climate').checked) {
        deLayer.addTo(map);
        populateHeatmap();
        initializeMap();
    } else if (document.getElementById('satellite').checked) {
        satelliteLayer.addTo(map); 
    } else if (document.getElementById('dark').checked) {
        darkLayer.addTo(map);
}

}

document.getElementById('population').addEventListener('change', switchLayer);
document.getElementById('pollution').addEventListener('change', switchLayer);
document.getElementById('climate').addEventListener('change', switchLayer);
document.getElementById('satellite').addEventListener('change', switchLayer);
document.getElementById('dark').addEventListener('change', switchLayer);

// Toggle content visibility
var toggleControl = document.querySelector('.custom-control h3');
var content = document.querySelector('.custom-control .content');

toggleControl.addEventListener('click', function () {
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
});


// Fetch air quality data and add invisible markers to the map
var token = '5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572'; // Replace with your actual token

function fetchAndDisplayMarkers() {
    var bounds = map.getBounds();
    var url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                data.data.forEach(station => {
                    // Fetch detailed station data to get pollutants information
                    var stationUrl = `https://api.waqi.info/feed/@${station.uid}/?token=${token}`;

                    fetch(stationUrl)
                        .then(response => response.json())
                        .then(stationData => {
                            if (stationData.status === 'ok') {
                                var pollutants = stationData.data.iaqi; // Individual Air Quality Index

                                // Build a popup content with pollutants data
                                var popupContent = `
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
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

// Set up draw control options with darker lines
var drawControl = new L.Control.Draw({
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
                color: '#2a2a2a' // Darker line color for polygons
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
    var layer = e.layer;
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
    var layers = editableLayers.getLayers();
    if (layers.length > 0) {
        editableLayers.removeLayer(layers[layers.length - 1]);
    }
}

// Function to remove all drawings
function removeAllDrawings() {
    editableLayers.clearLayers();
}

// Create buttons and add them to the map
var removeLastButton = L.control({ position: 'topleft' });
removeLastButton.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
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

var removeAllButton = L.control({ position: 'topleft' });
removeAllButton.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
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