const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 200
    });

    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });

    const page = await context.newPage();

    await page.goto("https://www.amazon.in");

    await page.fill("#twotabsearchtextbox", "Mechanical Keyboard");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000);

    const links = page.getByRole("link");

    const count = await links.count();

    console.log("Links:", count);

    const products = [];
    const seen = new Set();

    for (let i = 0; i < count; i++) {

        const link = links.nth(i);

        const href = await link.getAttribute("href");

        if (!href)
            continue;

        if (!href.includes("/dp/"))
            continue;

        const name = (await link.innerText()).trim();

        if (name.length < 15)
            continue;

        let url = href;

        if (url.startsWith("/"))
            url = "https://www.amazon.in" + url;

        if (seen.has(url))
            continue;

        seen.add(url);

        products.push({
            name,
            url
        });

        if (products.length === 5)
            break;
    }

    console.log(products);

    const detail = await context.newPage();

    const results = [];

    for (const product of products) {

        console.log("Opening", product.name);

        await detail.goto(product.url);

        await detail.waitForTimeout(3000);

        const title = await detail.locator("#productTitle").textContent();

        let price = "";

        const priceLocator = detail.locator(".a-price .a-offscreen").first();

        if (await priceLocator.count())
            price = (await priceLocator.textContent()).trim();

        let rating = "";

        const ratingLocator = detail.locator("#acrPopover").first();

        if (await ratingLocator.count())
            rating = (await ratingLocator.textContent()).trim();

        let brand = "";

        const brandLocator = detail.locator("#bylineInfo").first();

        if (await brandLocator.count())
            brand = (await brandLocator.textContent()).trim();

        const specifications = {};

        const rows = detail.locator("table tr");

        const rowCount = await rows.count();

        for (let i = 0; i < rowCount; i++) {

            const row = rows.nth(i);

            const cells = row.locator("td, th");

            if (await cells.count() !== 2)
                continue;

            const key = (await cells.nth(0).textContent()).trim();
            const value = (await cells.nth(1).textContent()).trim();

            specifications[key] = value;
        }

        results.push({
            title,
            url: product.url,
            price,
            rating,
            brand,
            specifications
        });
    }

    fs.writeFileSync(
        "products.json",
        JSON.stringify(results, null, 2)
    );

    console.log("Saved", results.length, "products");

    await browser.close();

})();