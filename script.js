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

// Population Layer (Example using a tile layer)
var populationLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Population Data &copy; OpenStreetMap contributors'
});

// WAQI Pollution Layer
var WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=5cf7bdb4e7c9de6a6c85ab64cfa39d086f9e7572";
var WAQI_ATTR = 'Air Quality Tiles &copy; <a href="http://waqi.info">waqi.info</a>';
var waqiLayer = L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR });

// Climate Layer (Example using a different tile layer)
var climateLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Climate Data &copy; OpenStreetMap contributors'
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
        climateLayer.addTo(map);
    }
}

document.getElementById('population').addEventListener('change', switchLayer);
document.getElementById('pollution').addEventListener('change', switchLayer);
document.getElementById('climate').addEventListener('change', switchLayer);

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
