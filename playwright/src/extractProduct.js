const { cleanText, cleanPrice, parseRating } = require("./utils");
const transformKeyboardSpecs = require("./keyboardTransformer");

/**
 * Extracts product details from an Amazon product page and normalizes them.
 * @param {import('playwright').Page} page - The Playwright page instance.
 * @param {{name: string, url: string}} product - The product brief containing the URL.
 * @returns {Promise<Object>} The cleaned and normalized product details.
 */
async function extractProduct(page, product) {
    console.log(`[Amazon] Extracting: ${product.name.substring(0, 40)}...`);

    try {
        await page.goto(product.url);
        // Wait for title to ensure page is loaded
        await page.waitForSelector("#productTitle");

        // 1. Extract Raw Data
        const rawTitle = await page.locator("span#productTitle").textContent();
        
        let rawPrice = "";
        const priceLocator = page.locator(".a-price .a-offscreen").first();
        if (await priceLocator.count()) {
            rawPrice = await priceLocator.textContent();
        }

        let rawRating = "";
        const ratingLocator = page.locator("#acrPopover").first();
        if (await ratingLocator.count()) {
            rawRating = await ratingLocator.getAttribute("title") || await ratingLocator.textContent();
        }

        let rawBrand = "";
        const brandLocator = page.locator("#bylineInfo").first();
        if (await brandLocator.count()) {
            rawBrand = await brandLocator.textContent();
        }

        // Extract specifications table
        const rawSpecs = {};
        const rows = page.locator("table tr");
        const rowCount = await rows.count();

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cells = row.locator("td, th");

            if (await cells.count() !== 2) continue;

            const key = (await cells.nth(0).textContent()).trim();
            const value = (await cells.nth(1).textContent()).trim();
            rawSpecs[key] = value;
        }

        // 2. Clean Basics (The "Transform" Step)
        const title = cleanText(rawTitle);
        const priceAmount = cleanPrice(rawPrice);
        const ratingScore = parseRating(rawRating);
        const brand = cleanText(rawBrand);

        // 3. Extract Advanced Features (Keyboard Heuristics)
        const keyboardSpecs = transformKeyboardSpecs(rawSpecs, title);

        // 4. Return Normalized Object
        return {
            id: `amazon_${product.url.split("/dp/")[1]?.substring(0, 10)}`, // Unique ID
            source: "amazon",
            title,
            url: product.url,
            price: {
                amount: priceAmount,
                currency: "INR",
                display: `₹${priceAmount.toLocaleString()}`
            },
            rating: {
                score: ratingScore,
                // In a production app, we would also extract rating count
            },
            brand,
            specs: {
                ...rawSpecs, // Keep raw specs for backup/AI details
                features: keyboardSpecs // Add our structured keyboard features
            }
        };

    } catch (error) {
        console.error(`[Amazon Error] Failed to extract ${product.url}:`, error.message);
        return null; // Return null so the orchestrator can skip this product but continue
    }
}

module.exports = extractProduct;
