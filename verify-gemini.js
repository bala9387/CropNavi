require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function verify() {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) {
        console.error("❌ GOOGLE_GENAI_API_KEY not found in .env.local");
        return;
    }
    console.log("🔑 Key found:", key.substring(0, 8) + "...");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("🔄 Testing gemini-1.5-flash with text...");
        const result = await model.generateContent("Explain photosynthesis in 1 sentence.");
        console.log("✅ Text Response:", result.response.text());

        // Test with image if possible? No, need image data.
        // But if text works, the key is valid and model is accessible.

    } catch (error) {
        console.error("❌ Gemini Error:", error.message);
        if (error.message.includes("API key not valid")) {
            console.log("⚠️ The API Key appears to be invalid.");
        }
    }
}

verify();
