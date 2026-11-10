const { cleanText } = require('./utils');

/**
 * Transforms raw product data into a standardized Keyboard entity.
 * This function acts as a "Feature Extractor" to find specific keyboard traits.
 */
function transformKeyboardSpecs(rawSpecs, productTitle) {
    // Combine title and all specs into one big lowercase string for easy searching
    const allText = (productTitle + " " + JSON.stringify(rawSpecs)).toLowerCase();

    // 1. Check for Battery mAh using Regex
    // This looks for a number followed by "mah" (e.g., "4000mah" or "3000 mah")
    const batteryMatch = allText.match(/(\d+)\s*mah/i);
    const batteryValue = batteryMatch ? parseInt(batteryMatch[1]) : 0;

    return {
        is_mechanical: allText.includes("mechanical") || allText.includes("mx switch"),
        
        is_trimode: allText.includes("tri-mode") || 
                    (allText.includes("bluetooth") && allText.includes("2.4g") && allText.includes("wired")),

        is_hotswappable: allText.includes("hot-swappable") || allText.includes("hot swap") || allText.includes("hot-swap"),

        battery_mah: batteryValue,

        has_gasket_mount: allText.includes("gasket")
    };
}

module.exports = transformKeyboardSpecs;
