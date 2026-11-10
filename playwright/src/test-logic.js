const { cleanPrice, parseRating, cleanText } = require('./utils');
const transformKeyboardSpecs = require('./keyboardTransformer');

/**
 * MANUAL UNIT TESTS
 * We use these to verify our "Transform" logic without needing a browser or AI.
 */

function runTests() {
    console.log("--- STARTING LOGIC VALIDATION ---");
    let passed = 0;
    let total = 0;

    const assert = (condition, message) => {
        total++;
        if (condition) {
            passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            console.error(`❌ FAIL: ${message}`);
        }
    };

    // 1. Test Price Cleaning
    assert(cleanPrice("₹4,999.00") === 4999, "Clean INR price with decimals");
    assert(cleanPrice("Rs. 1,200") === 1200, "Clean 'Rs.' format");
    assert(cleanPrice("") === 0, "Handle empty price");

    // 2. Test Text Cleaning
    assert(cleanText("  Hello\nWorld  ") === "Hello World", "Trim and collapse whitespace");

    // 3. Test Rating Parsing
    assert(parseRating("4.2 out of 5 stars") === 4.2, "Parse standard Amazon rating");
    assert(parseRating("3.0") === 3, "Parse simple float");

    // 4. Test Keyboard Feature Extraction
    const mockSpecs = {
        "Connectivity": "Bluetooth 5.0, 2.4GHz Wireless, Wired Type-C",
        "Switch Type": "Mechanical Red",
        "Mounting": "Gasket Mount Design"
    };
    const mockTitle = "Custom Mechanical Keyboard 3000mAh Battery";
    
    const features = transformKeyboardSpecs(mockSpecs, mockTitle);
    
    assert(features.is_mechanical === true, "Identify Mechanical from specs");
    assert(features.is_trimode === true, "Identify Tri-mode from multi-connection string");
    assert(features.battery_mah === 3000, "Extract battery capacity using regex");
    assert(features.has_gasket_mount === true, "Identify Gasket mount from text");
    assert(features.is_hotswappable === false, "Correctly identify missing hot-swap");

    console.log(`\n--- TEST SUMMARY: ${passed}/${total} PASSED ---`);
    
    if (passed === total) {
        console.log("🚀 CORE LOGIC IS STABLE. READY FOR INTEGRATION.");
    } else {
        console.warn("⚠️ LOGIC ERRORS DETECTED. FIX BEFORE RUNNING SCRAPER.");
    }
}

runTests();
