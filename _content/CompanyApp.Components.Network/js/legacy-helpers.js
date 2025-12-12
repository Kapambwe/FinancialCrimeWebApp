/**
 * Global JavaScript helpers for legacy component support
 * These functions support components that haven't been migrated to use the module-based interop
 */

// Store DotNetObjectReference for network callbacks
window.networkDotNetHelper = null;

// Set the DotNet helper reference for network callbacks
window.setNetworkDotNetHelper = function(dotNetReference) {
    window.networkDotNetHelper = dotNetReference;
    console.log('Network DotNet helper set');
};

// Clear the DotNet helper reference
window.clearNetworkDotNetHelper = function() {
    if (window.networkDotNetHelper) {
        window.networkDotNetHelper.dispose();
        window.networkDotNetHelper = null;
    }
    console.log('Network DotNet helper cleared');
};

// Store DotNetObjectReference for timeline callbacks
window.timelineDotNetHelper = null;

window.setTimelineDotNetHelper = function(dotNetReference) {
    window.timelineDotNetHelper = dotNetReference;
    console.log('Timeline DotNet helper set');
};

window.clearTimelineDotNetHelper = function() {
    if (window.timelineDotNetHelper) {
        window.timelineDotNetHelper.dispose();
        window.timelineDotNetHelper = null;
    }
    console.log('Timeline DotNet helper cleared');
};

// Store DotNetObjectReference for map callbacks
window.mapDotNetHelper = null;

window.setMapDotNetHelper = function(dotNetReference) {
    window.mapDotNetHelper = dotNetReference;
    console.log('Map DotNet helper set');
};

window.clearMapDotNetHelper = function() {
    if (window.mapDotNetHelper) {
        window.mapDotNetHelper.dispose();
        window.mapDotNetHelper = null;
    }
    console.log('Map DotNet helper cleared');
};

console.log('Legacy interop helpers loaded');
