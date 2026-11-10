const fs = require("fs");
const path = require("path");

/**
 * Searches Amazon.in for a query and returns a list of product URLs/names.
 * @param {import('playwright').Page} page - The Playwright page instance.
 * @param {string} query - The search query.
 * @returns {Promise<Array<{name: string, url: string}>>}
 */
async function searchAmazon(page, query) {
    console.log(`[Amazon] Searching for: "${query}"`);
    
    await page.goto("https://www.amazon.in");

    // Check if we hit a CAPTCHA page
    const content = await page.content();
    if (content.includes("captcha") || content.includes("Robot Check") || await page.locator("input#captchacharacters").count() > 0) {
        console.warn("[Amazon Warning] Detected CAPTCHA / Bot Mitigation!");
        const screenshotPath = path.join(__dirname, "..", "screenshots", "captcha.png");
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved CAPTCHA screenshot to: ${screenshotPath}`);
        throw new Error("Amazon search blocked by CAPTCHA. Solve it manually in headed mode or use rotating proxies.");
    }

    await page.fill("#twotabsearchtextbox", query);
    await page.keyboard.press("Enter");

    // Wait for real product cards (which have data-asin attributes) to load
    try {
        await page.waitForSelector("div[data-asin]", { timeout: 10000 });
        // Hydration Buffer: Amazon pages hydrate content dynamically. 
        // A brief 2-second wait ensures links are fully bound and readable.
        await page.waitForTimeout(2000);
    } catch (e) {
        console.warn("[Amazon Warning] Timeout waiting for product cards selector 'div[data-asin]'");
        const screenshotPath = path.join(__dirname, "..", "screenshots", "search_timeout.png");
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved timeout screenshot to: ${screenshotPath}`);
    }

    const links = page.locator("a"); // Use generic anchor tag locator
    const count = await links.count();
    
    const products = [];
    const seen = new Set();
    let dpCount = 0;

    for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute("href");

        if (!href) continue;
        if (!href.includes("/dp/")) continue; 
        
        dpCount++;

        const name = (await link.innerText()).trim();
        if (name.length < 15) continue; 

        let url = href;
        if (url.startsWith("/")) {
            url = "https://www.amazon.in" + url;
        }

        const cleanUrl = url.split("?")[0];

        if (seen.has(cleanUrl)) continue;
        seen.add(cleanUrl);

        products.push({
            name,
            url: cleanUrl
        });

        if (products.length === 5) break; 
    }

    console.log(`[Amazon Info] Evaluated ${count} links. Found ${dpCount} product links. Extracted ${products.length} unique candidates.`);

    if (products.length === 0) {
        console.warn("[Amazon Warning] 0 products found. Capturing diagnostic screenshot...");
        const screenshotPath = path.join(__dirname, "..", "screenshots", "zero_products.png");
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved diagnostic screenshot to: ${screenshotPath}`);
    }

    return products;
}

module.exports = searchAmazon;
