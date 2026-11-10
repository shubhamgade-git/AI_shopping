const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Analyst Service
 * This service takes cleaned product data and compares it against user requirements
 * using the Gemini AI model.
 */
const apiKey = process.env.GEMINI_API_KEY;
class ProductAnalyst {
    constructor(apiKey) {
        if (!apiKey) throw new Error("Gemini API Key is required");
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Compares products and generates a detailed report.
     * @param {string} userRequirement - The user's natural language request.
     * @param {Array} products - The array of normalized product objects.
     */
    async generateComparison(userRequirement, products) {
        console.log("[AI] Analyzing products against requirements...");

        // We prepare a high-signal prompt. We don't send the entire raw spec table
        // to save tokens and focus the AI on the important bits.
        const productSummary = products.map(p => ({
            title: p.title,
            price: p.price.display,
            rating: p.rating.score,
            features: p.specs.features,
            url: p.url
        }));

        const prompt = `
            You are an expert shopping assistant specializing in mechanical keyboards.
            
            User Requirement: "${userRequirement}"
            
            Available Products:
            ${JSON.stringify(productSummary, null, 2)}
            
            Your Task:
            1. Analyze each product based on the user's requirement.
            2. Rank them from "Best Match" to "Worst Match".
            3. For each product, provide:
               - A "Match Score" (0-100%).
               - A brief "Why this match" or "Why not".
               - Highlight if it actually has Tri-mode, Hot-swap, or Gasket mount as requested.
            4. Give a final "Top Recommendation" with a clear reason.

            Format your response in a clean, readable Markdown format.
            Be objective. If a product is missing a requested feature, point it out.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("[AI Error] Failed to generate comparison:", error.message);
            return "Error: AI analysis failed. Please check your API key and connection.";
        }
    }
}

module.exports = ProductAnalyst;
