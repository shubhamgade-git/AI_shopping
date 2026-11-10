const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
});
console.log("Gemini Key:", process.env.GEMINI_API_KEY);
const launchBrowser = require("./browser");
const searchAmazon = require("./searchAmazon");
const extractProduct = require("./extractProduct");
const saveJson = require("./saveJson");
const ProductAnalyst = require("./compareAI");

(async () => {
    console.log("=== AI SHOPPING ASSISTANT: START ===");

    const userRequirement = "I want a Tri-mode mechanical keyboard with red switches and hot-swappable keys under ₹3000. Battery should be good.";

    // 1. Initialize Services
    const { browser, context } = await launchBrowser();
    const page = await context.newPage();
    const analyst = new ProductAnalyst(process.env.GEMINI_API_KEY);

    try {
        // 2. Extraction Phase (Amazon)
        // Note: In production, we'd extract the search query from the userRequirement using AI too!
        // But for now, we'll keep it focused.
        const productsBrief = await searchAmazon(page, "Tri-mode mechanical keyboard red switches");

        const results = [];
        for (const product of productsBrief) {
            const normalizedProduct = await extractProduct(page, product);
            if (normalizedProduct) results.push(normalizedProduct);
            await page.waitForTimeout(1000); 
        }

        // 3. Transformation Phase (Save local data)
        saveJson(results);

        // 4. Intelligence Phase (AI Comparison)
        if (results.length > 0) {
            const report = await analyst.generateComparison(userRequirement, results);
            
            console.log("\n" + "=".repeat(50));
            console.log("AI COMPARISON REPORT");
            console.log("=".repeat(50));
            console.log(report);
            console.log("=".repeat(50));
        } else {
            console.warn("No products found to analyze.");
        }

    } catch (error) {
        console.error("FATAL ERROR:", error);
    } finally {
        await browser.close();
        console.log("=== PROCESS COMPLETE ===");
    }
})();
