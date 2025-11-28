// Workaround for leaflet-draw ReferenceError: type is not defined
// This issue occurs in strict mode (modules) because leaflet-draw uses a global 'type' variable without declaration.
if (typeof window !== 'undefined') {
    window.type = '';
}
