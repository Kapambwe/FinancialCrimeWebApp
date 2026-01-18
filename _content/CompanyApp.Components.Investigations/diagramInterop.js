// Export diagram functionality (simplified - in a real app you might use a library like html2canvas)
function exportOwnershipDiagram(title) {
    // This is a placeholder - implement actual export logic based on your requirements
    const element = document.querySelector('.ownership-flow');
    if (element) {
        alert(`Exporting ownership diagram for ${title}`);
        // Real implementation might:
        // 1. Use html2canvas to capture the diagram
        // 2. Convert to PNG/PDF
        // 3. Trigger download
    } else {
        alert('No diagram element found');
    }
}