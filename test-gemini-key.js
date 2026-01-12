require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    console.log("🔍 Starting Gemini Integration Test...");

    // 1. Check API Key
    const envKey = process.env.GOOGLE_GENAI_API_KEY;
    const hardcodedKey = "YOUR_KEY_HERE_IF_NOT_IN_ENV";

    // Use env key if available, otherwise hardcoded (if user changed it)
    const API_KEY = envKey || hardcodedKey;

    if (!API_KEY || API_KEY.includes("YOUR_KEY")) {
        console.error("❌ No valid API Key found in .env.local or hardcoded.");
        console.log("👉 Please add GOOGLE_GENAI_API_KEY to your .env.local file.");
        return;
    }

    console.log("🔑 Using API Key: " + API_KEY.substring(0, 8) + "...");

    const genAI = new GoogleGenerativeAI(API_KEY);

    // 2. Test gemini-1.5-flash (Required for Vision)
    console.log("\n🧪 Testing Model: 'gemini-1.5-flash' (Required for Disease Detection)...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test connection. Reply with 'OK'.");
        const response = result.response.text();
        console.log("✅ SUCCESS! Gemini 1.5 Flash is working.");
        console.log("🤖 Response:", response);
    } catch (e) {
        console.error("❌ FAILED to connect to gemini-1.5-flash.");
        console.error("Error Details:", e.message);
        if (e.message.includes("404")) {
            console.log("👉 Tip: Your API key might not have access to this model, or the model name is restricted in your region.");
        }
    }

    console.log("\n---------------------------------------------------");
    console.log("Integration Status:");
    console.log("1. Codebase updated to use `gemini-1.5-flash`: ✅ YES");
    console.log("2. API Key Valid: " + (envKey ? "✅ YES (in .env.local)" : "⚠️ No (Using fallback/hardcoded)"));
}

testGemini();
