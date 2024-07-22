// Define the bounds for Mumbai
var mumbaiBounds = [
    [18.89, 72.75], // Southwest corner
    [19.23, 73.0]   // Northeast corner
];

// Initialize the map and set its view to the coordinates of Mumbai and zoom level
var map = L.map('map', {
    center: [19.0760, 72.8777],
    zoom: 13,
    minZoom: 13, // Minimum zoom level to prevent zooming out too far
    maxBounds: mumbaiBounds, // Restrict panning to the defined bounds
    maxBoundsViscosity: 1.0 // Bounce back when the user tries to pan outside the bounds
});

// Add a tile layer to the map, which provides the map tiles from OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a marker to the map at the specified coordinates (CSMT, Mumbai)
L.marker([18.9398, 72.8355]).addTo(map)
    // Bind a popup to the marker with the specified HTML content
    .bindPopup('Chhatrapati Shivaji Maharaj Terminus (CSMT).<br> A historic railway station in Mumbai.')
    // Automatically open the popup when the marker is added
    .openPopup();
