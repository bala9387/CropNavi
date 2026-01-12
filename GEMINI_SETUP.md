# 🚀 AUTOMATIC GEMINI AI SETUP GUIDE

## Step 1: Get Your FREE API Key (1 minute)

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with "AIzaSy...")

## Step 2: Add to Your Project (30 seconds)

Open this file: `.env.local` (in project root)
Paste this line:

```
GOOGLE_GENAI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE
```

Replace `AIzaSy_YOUR_ACTUAL_KEY_HERE` with your real key.

## Step 3: Restart Server (10 seconds)

In your terminal:
1. Press Ctrl+C to stop the server
2. Run: npm run dev

## ✅ Done! Test It

1. Go to http://localhost:3000/disease-detection
2. Upload a real leaf image
3. You'll see REAL AI analysis instead of fallback!

---

## 🔍 How to Verify It's Working

Check your terminal console. You should see:
```
✅ Gemini Success: [Disease Name]
```

Instead of:
```
✅ Local Fallback: [Disease Name]
```

---

## ⚠️ Troubleshooting

**If you see "API Key Missing":**
- Make sure `.env.local` is in the project ROOT directory (same level as package.json)
- Check the file name is exactly `.env.local` (with the dot at the start)
- Restart the server after adding the key

**If you see "Model Unavailable":**
- Your key might be invalid
- Go back to https://aistudio.google.com/app/apikey and create a new one

---

## 💰 Cost

**100% FREE!**
- No credit card required
- 60 requests per minute
- Perfect for development and production

---

Need help? The key should look like:
`AIzaSyABCDEFG1234567890_example-key-format`
