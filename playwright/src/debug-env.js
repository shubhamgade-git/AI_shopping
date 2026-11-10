const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log("=== Environment Debugger ===");
console.log("Current Working Directory:", process.cwd());
console.log("Looking for .env at:", path.join(process.cwd(), '.env'));

if (fs.existsSync(path.join(process.cwd(), '.env'))) {
    console.log("✅ .env file EXISTS in the current directory.");
    
    // Check if key exists in process.env
    if (process.env.GEMINI_API_KEY) {
        console.log("✅ GEMINI_API_KEY is found in process.env.");
        console.log("   Key Length:", process.env.GEMINI_API_KEY.length);
        console.log("   First 3 chars:", process.env.GEMINI_API_KEY.substring(0, 3) + "...");
    } else {
        console.error("❌ GEMINI_API_KEY is MISSING in process.env.");
        console.log("--- Content of .env (keys only) ---");
        const content = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
        content.split('\n').forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                console.log("Found Key:", line.split('=')[0].trim());
            }
        });
    }
} else {
    console.error("❌ .env file NOT FOUND in the current directory.");
    console.log("Check if you are running the script from the root folder: D:\\work\\AI shopping\\playwright");
}
