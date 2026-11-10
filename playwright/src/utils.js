/**
 * Utility functions for cleaning and normalizing scraped data.
 */

/**
 * Removes currency symbols and formatting to return a clean number.
 * Example: "₹4,999.00" -> 4999
 */
function cleanPrice(priceString) {
    if (!priceString) return 0;
    
    // 1. Remove commas
    const noCommas = priceString.replace(/,/g, "");
    
    // 2. Extract the numeric part (including potential decimal)
    // This regex looks for digits, optionally followed by a dot and more digits
    const match = noCommas.match(/\d+(\.\d+)?/);
    
    return match ? parseFloat(match[0]) : 0;
}

/**
 * Trims whitespace and removes extra newlines/tabs.
 */
function cleanText(text) {
    if (!text) return "";
    return text.replace(/\s+/g, " ").trim();
}

/**
 * Extracts a numeric rating from a string.
 * Example: "4.5 out of 5 stars" -> 4.5
 */
function parseRating(ratingString) {
    if (!ratingString) return 0;
    const match = ratingString.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
}

module.exports = {
    cleanPrice,
    cleanText,
    parseRating
};
