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

//Heat Map Example
function initializeMap(){ 
    var testData = [
        [19.047, 72.8746, 46],
        [19.04946, 72.923, 52],
        [19.0863, 72.8888, 53],
        [19.10861, 72.83622, 50],
        [19.10078, 72.87462, 51],
        [19.11074, 72.86084, 41],
        [19.1653323, 72.922099, 54],
        [18.96702, 72.84214, 45],
        [19.2243333, 72.8658113, 36],
        [19.1375, 72.915056, 41],
        [19.2058, 72.8682, 42],
        [19.175, 72.9419, 42],
        [19.19709, 72.82204, 94],
        [18.91, 72.82, 66],
        [18.9936162, 72.8128113, 85],
        [19.072830200195, 72.882606506348, 30],
        [19.192056, 72.9585188, 35],
        [18.897756, 72.81332, 60]
    ];

    L.heatLayer(testData, {
        radius: 50,
        blur: 45,
        maxZoom: 17,
        //gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'red'}
    }).addTo(map);
}

// Satellite layer
var satelliteLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
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
                    L.marker([station.lat, station.lon], { opacity: 0 }).addTo(map)
                        .bindPopup(`Station: ${station.station.name}<br>AQI: ${station.aqi}`);
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

let selectedAreaBounds = null; // Global variable to store the selected area bounds

// Define the selectAreaFeature control
var selectFeature = map.selectAreaFeature;
var isFeatureEnabled = false;

// Toggle button functionality
document.getElementById('toggle-select').onclick = function() {
    if (isFeatureEnabled) {
        selectFeature.disable();
        isFeatureEnabled = false;
        this.classList.remove("active");
    } else {
        selectFeature.enable();
        isFeatureEnabled = true;
        this.classList.add("active");
    }
};
// You can do the same for the clear button if needed
document.getElementById('clear-selector').onclick = function() {
    selectFeature.removeAllArea();
    document.getElementById('toggle-select').classList.remove("active");
};
// Capture selected area coordinates
map.on('areaselected', function (e) {
    console.log('Area selected event fired'); // This should appear in your console
    var coordinates = e.bounds.toBBoxString();
    document.getElementById('selected-coordinates').innerHTML = `Selected Coordinates: ${coordinates}`;
    console.log('Selected Coordinates:', e.bounds);
    sendCoordinatesToServer(e.bounds);
});

// Function to send coordinates to the terminal (or for further processing)
function sendCoordinatesToServer(bounds) {
    const boundsData = {
        northEast: bounds.getNorthEast(),
        southWest: bounds.getSouthWest()
    };

    console.log('Sending Coordinates to Server:', boundsData);

    fetch('https://your-server-endpoint.example.com/process-coordinates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(boundsData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server Response:', data);
    })
    .catch(error => {
        console.error('Error sending coordinates to server:', error);
    });
}