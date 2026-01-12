
'use server';

/**
 * Robust AI Disease Detection System with 3-Layer Fallback:
 * 1. Gemini Pro (Most Accurate, requires API Key)
 * 2. Hugging Face (Free ML, no key needed)
 * 3. Knowledge Base (Instant fallback if ML fails)
 * 
 * FIXED: Deterministic disease selection (same image = same result)
 * FIXED: Case-insensitive crop matching
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  AIDiseaseDetectionInput,
  AIDiseaseDetectionOutput,
  AIDiseaseDetectionInputSchema,
  AIDiseaseDetectionOutputSchema,
} from './ai-disease-detection.schemas';

// Helper function to create simple hash from string
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 200); i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// --- Layer 3: Comprehensive Knowledge Base (Fallback) ---
const DISEASE_DATABASE: Record<string, AIDiseaseDetectionOutput[]> = {
  // 1. Tomato
  'Tomato': [
    {
      diseaseName: 'Early Blight (Alternaria solani)',
      confidence: 0.85,
      description: 'Fungal disease causing target-like concentric rings on leaves. Usually starts on lower leaves.',
      symptoms: ['Dark brown spots with concentric rings', 'Yellowing of lower leaves', 'Bullseye pattern lesions'],
      causes: ['Alternaria solani fungus', 'Warm humid weather', 'Stress from poor nutrition'],
      organicControl: ['Remove infected leaves', 'Neem oil spray', 'Mulching'],
      chemicalControl: ['Mancozeb', 'Chlorothalonil', 'Copper fungicides'],
      prevention: ['Crop rotation', 'Proper spacing', 'Drip irrigation']
    },
    {
      diseaseName: 'Late Blight (Phytophthora infestans)',
      confidence: 0.88,
      description: 'Serious disease causing water-soaked lesions and white mold. Rapidly destructive.',
      symptoms: ['Water-soaked dark spots', 'White fungal growth on undersides', 'Rapid browning & wilting'],
      causes: ['Phytophthora infestans', 'Cool wet weather', 'High humidity'],
      organicControl: ['Copper sprays', 'Remove infected plants', 'Avoid overhead watering'],
      chemicalControl: ['Metalaxyl', 'Cymoxanil', 'Mancozeb'],
      prevention: ['Certified seed', 'Hill up tubers', 'Destroy cull piles']
    }
  ],
  // 2. Potato
  'Potato': [
    {
      diseaseName: 'Late Blight (Phytophthora infestans)',
      confidence: 0.88,
      description: 'Serious disease causing water-soaked lesions and white mold. Can destroy crops rapidly.',
      symptoms: ['Water-soaked dark spots', 'White fungal growth on undersides', 'Rapid browning & wilting'],
      causes: ['Phytophthora infestans', 'Cool wet weather', 'High humidity'],
      organicControl: ['Copper sprays', 'Remove infected plants', 'Avoid overhead watering'],
      chemicalControl: ['Metalaxyl', 'Cymoxanil', 'Mancozeb'],
      prevention: ['Certified seed', 'Hill up tubers', 'Destroy cull piles']
    },
    {
      diseaseName: 'Early Blight (Alternaria solani)',
      confidence: 0.80,
      description: 'Causes brown spots with concentric rings on leaves and tuber rot.',
      symptoms: ['Target-board spots on leaves', 'Brown dry rot in tubers', 'Leaf yellowing'],
      causes: ['Alternaria solani', 'Warm humid conditions', 'Plant stress'],
      organicControl: ['Copper fungicides', 'Remove infected debris'],
      chemicalControl: ['Chlorothalonil', 'Mancozeb'],
      prevention: ['Crop rotation', 'Adequate nitrogen', 'Water management']
    }
  ],
  // 3. Rice
  'Rice': [
    {
      diseaseName: 'Rice Blast (Magnaporthe oryzae)',
      confidence: 0.82,
      description: 'Fungal disease causing diamond-shaped lesions. Affects leaves, nodes, and panicles.',
      symptoms: ['Diamond/spindle shaped spots', 'Gray center with brown margin', 'Panicle breakage'],
      causes: ['Magnaporthe oryzae', 'High nitrogen', 'Cloudy skies'],
      organicControl: ['Pseudomonas fluorescens', 'Balanced nutrition', 'Avoid excess N'],
      chemicalControl: ['Tricyclazole', 'Isoprothiolane', 'Carbendazim'],
      prevention: ['Resistant varieties', 'Seed treatment', 'Clean cultivation']
    },
    {
      diseaseName: 'Brown Spot (Bipolaris oryzae)',
      confidence: 0.75,
      description: 'Fungal disease causing round to oval brown spots. Often associated with poor soil nutrition.',
      symptoms: ['Round/oval brown spots', 'Grey center in larger spots', 'Grain discoloration'],
      causes: ['Bipolaris oryzae', 'Potassium deficiency', 'Water stress'],
      organicControl: ['Proper fertilization', 'Seed treatment with hot water'],
      chemicalControl: ['Mancozeb', 'Propiconazole'],
      prevention: ['Balanced fertilization (NPK)', 'Resistant varieties']
    }
  ],
  // 4. Wheat
  'Wheat': [
    {
      diseaseName: 'Leaf Rust (Puccinia triticina)',
      confidence: 0.85,
      description: 'Fungal disease appearing as small, round, orange-red pustules on leaves.',
      symptoms: ['Orange-red pustules', 'Yellowing of leaves', 'Reduced grain weight'],
      causes: ['Puccinia triticina', 'Moist mild weather'],
      organicControl: ['Sulfur dust', 'Neem oil'],
      chemicalControl: ['Propiconazole', 'Tebuconazole'],
      prevention: ['Resistant varieties', 'Remove volunteer wheat']
    }
  ],
  // 5. Cotton
  'Cotton': [
    {
      diseaseName: 'Bacterial Blight (Xanthomonas citri)',
      confidence: 0.80,
      description: 'Bacterial infection causing angular water-soaked spots on leaves and bolls.',
      symptoms: ['Angular water-soaked spots', 'Black arm lesions on stems', 'Boll rot'],
      causes: ['Xanthomonas citri', 'Rain splash', 'Infected seed'],
      organicControl: ['Copper oxychloride', 'Remove infected debris'],
      chemicalControl: ['Streptocycline + Copper Oxychloride'],
      prevention: ['Acid delinted seeds', 'Resistant varieties', 'Crop rotation']
    }
  ],
  // 6. Sugarcane
  'Sugarcane': [
    {
      diseaseName: 'Red Rot (Colletotrichum falcatum)',
      confidence: 0.85,
      description: 'Serious fungal disease causing internal reddening of canes and alcohol smell.',
      symptoms: ['Reddening of internal tissues', 'White patches across red areas', 'Alcoholic smell'],
      causes: ['Colletotrichum falcatum', 'Waterlogging', 'Infected setts'],
      organicControl: ['Trichoderma viride', 'Healthy seed selection'],
      chemicalControl: ['Carbendazim sett treatment'],
      prevention: ['Use disease-free setts', 'Crop rotation', 'Improve drainage']
    }
  ],
  // 7. Mango
  'Mango': [
    {
      diseaseName: 'Anthracnose (Colletotrichum gloeosporioides)',
      confidence: 0.80,
      description: 'Causes dark spots on leaves, flowers, and fruits. Major post-harvest issue.',
      symptoms: ['Black sunken spots on fruit', 'Leaf blight', 'Flower cleaning/dropping'],
      causes: ['High humidity', 'Rain during flowering'],
      organicControl: ['Neem oil', 'Pruning infected branches'],
      chemicalControl: ['Carbendazim', 'Mancozeb'],
      prevention: ['Field sanitation', 'Pre-harvest fungicide spray']
    }
  ],
  // 8. Chili
  'Chili': [
    {
      diseaseName: 'Leaf Curl Virus',
      confidence: 0.85,
      description: 'Viral disease transmitted by whiteflies causing curling and stunting.',
      symptoms: ['Upward curling of leaves', 'Stunted growth', 'Yellowing', 'Reduced fruiting'],
      causes: ['Begomovirus', 'Whitefly vector'],
      organicControl: ['Neem oil for vector control', 'Yellow sticky traps'],
      chemicalControl: ['Imidacloprid (for vector)', 'Acetamiprid'],
      prevention: ['Resistant varieties', 'Control whitefly population', 'Remove infected plants']
    }
  ],
  // 9. Maize
  'Maize': [
    {
      diseaseName: 'Turcicum Leaf Blight',
      confidence: 0.80,
      description: 'Fungal disease causing long, cigar-shaped gray-green lesions.',
      symptoms: ['Long cigar-shaped lesions', 'Gray/green centers', 'Premature leaf drying'],
      causes: ['Exserohilum turcicum', 'Cool humid weather'],
      organicControl: ['Crop rotation', 'Compost tea'],
      chemicalControl: ['Mancozeb', 'Zineb'],
      prevention: ['Resistant hybrids', 'Timely sowing']
    }
  ],
  // 10. Soybean
  'Soybean': [
    {
      diseaseName: 'Soybean Rust',
      confidence: 0.85,
      description: 'Aggressive fungal disease causing tan to reddish-brown lesions.',
      symptoms: ['Small tan spots', 'Premature yellowing', 'Defoliation'],
      causes: ['Phakopsora pachyrhizi', 'Prolonged leaf wetness'],
      organicControl: ['Sulfur fungicides', 'Remove infected leaves'],
      chemicalControl: ['Azoxystrobin', 'Tebuconazole'],
      prevention: ['Sentinel plot monitoring', 'Timely fungicide application']
    }
  ],
  // 11. Hibiscus
  'Hibiscus': [
    {
      diseaseName: 'Leaf Spot (Cercospora)',
      confidence: 0.75,
      description: 'Fungal spots with grayish centers and dark borders.',
      symptoms: ['Circular spots', 'Gray centers', 'Leaf yellowing'],
      causes: ['Cercospora spp.', 'High humidity'],
      organicControl: ['Remove infected leaves', 'Copper soap'],
      chemicalControl: ['Chlorothalonil'],
      prevention: ['Water at base', 'Good air circulation']
    }
  ],
  // 12. Brinjal (Eggplant)
  'Brinjal': [
    {
      diseaseName: 'Little Leaf of Brinjal',
      confidence: 0.82,
      description: 'Phytoplasma disease transmitted by leafhoppers causing severe stunting.',
      symptoms: ['Very small leaves', 'Bushy appearance', 'Failure to set fruit'],
      causes: ['Phytoplasma', 'Leafhopper vector'],
      organicControl: ['Remove infected plants', 'Neem oil for vector'],
      chemicalControl: ['Dimethoate (for vector)'],
      prevention: ['Use resistant varieties', 'Control leafhoppers']
    }
  ],
  // 13. Okra
  'Okra': [
    {
      diseaseName: 'Yellow Vein Mosaic Virus',
      confidence: 0.88,
      description: 'Viral disease causing yellow network of veins in leaves.',
      symptoms: ['Yellow veins', 'Green islands', 'Stunted growth', 'Yellow fruits'],
      causes: ['Begomovirus', 'Whitefly vector'],
      organicControl: ['Remove infected plants', 'Neem oil'],
      chemicalControl: ['Imidacloprid (vector control)'],
      prevention: ['Resistant varieties like Arka Anamika', 'Control whiteflies']
    }
  ],
  // 14. Groundnut
  'Groundnut': [
    {
      diseaseName: 'Tikka Disease (Leaf Spot)',
      confidence: 0.85,
      description: 'Common fungal disease causing dark spots surrounded by yellow halos.',
      symptoms: ['Dark brown spots', 'Yellow halo around spots', 'Defoliation'],
      causes: ['Cercospora arachidicola', 'Humid weather'],
      organicControl: ['Neem seed kernel extract', 'Crop rotation'],
      chemicalControl: ['Mancozeb', 'Carbendazim'],
      prevention: ['Deep plowing', 'Resistant varieties']
    }
  ],
  // 15. Coconut
  'Coconut': [
    {
      diseaseName: 'Bud Rot',
      confidence: 0.80,
      description: 'Fatal fungal disease causing rotting of the central bud.',
      symptoms: ['Yellowing of young leaves', 'Rotting internal tissue', 'Foul smell'],
      causes: ['Phytophthora palmivora', 'High humidity'],
      organicControl: ['Remove infected crown', 'Bordeaux paste'],
      chemicalControl: ['Copper oxychloride'],
      prevention: ['Prophylactic fungicidal spray', 'Field sanitation']
    }
  ],
  // 16. Banana
  'Banana': [
    {
      diseaseName: 'Sigatoka Leaf Spot',
      confidence: 0.85,
      description: 'Fungal disease causing yellow/brown streaks on leaves.',
      symptoms: ['Yellow streaks', 'Necrotic spots with gray center', 'Leaf drying'],
      causes: ['Mycosphaerella fijiensis', 'Warm wet weather'],
      organicControl: ['Remove infected leaves', 'Mineral oil spray'],
      chemicalControl: ['Propiconazole', 'Mancozeb'],
      prevention: ['Proper drainage', 'Plant density management']
    }
  ],
  // 17. Turmeric
  'Turmeric': [
    {
      diseaseName: 'Leaf Spot (Colletotrichum)',
      confidence: 0.78,
      description: 'Fungal spots affecting leaf photosynthesis.',
      symptoms: ['Elliptical brown spots', 'Yellow halos', 'Leaf drying'],
      causes: ['Colletotrichum capsici', 'High moisture'],
      organicControl: ['Rhizome treatment', 'Neem cake'],
      chemicalControl: ['Mancozeb', 'Carbendazim'],
      prevention: ['Shade management', 'Healthy rhizomes']
    }
  ],
  // 18. Onion
  'Onion': [
    {
      diseaseName: 'Purple Blotch',
      confidence: 0.82,
      description: 'Fungal disease causing purple-centered lesions on leaves/stalks.',
      symptoms: ['Purple colored lesions', 'Yellowing borders', 'Tip burn'],
      causes: ['Alternaria porri', 'High humidity'],
      organicControl: ['Trichoderma', 'Good drainage'],
      chemicalControl: ['Mancozeb', 'Chlorothalonil'],
      prevention: ['Crop rotation', 'Avoid excess irrigation']
    }
  ],
  // 19. Garlic
  'Garlic': [
    {
      diseaseName: 'Rust',
      confidence: 0.80,
      description: 'Fungal disease appearing as reddish pustules on leaves.',
      symptoms: ['Small orange/yellow pustules', 'Leaf distortion', 'Stunting'],
      causes: ['Puccinia allii', 'Cool humid weather'],
      organicControl: ['Sulfur dust', 'Remove infected leaves'],
      chemicalControl: ['Tebuconazole'],
      prevention: ['Clean seed cloves', 'Rotation with non-alliums']
    }
  ],
  // 20. Ginger
  'Ginger': [
    {
      diseaseName: 'Soft Rot (Rhizome Rot)',
      confidence: 0.85,
      description: 'Devastating disease causing rotting of rhizomes and yellowing shoots.',
      symptoms: ['Yellowing of lower leaves', 'Base of stem becomes watery', 'Foul smell'],
      causes: ['Pythium spp.', 'Waterlogging'],
      organicControl: ['Bio-agents (Trichoderma)', 'Hot water treatment'],
      chemicalControl: ['Metalaxyl', 'Copper oxychloride'],
      prevention: ['Raised beds', 'Good drainage', 'Healthy seed rhizomes']
    }
  ],
  // 21. Papaya
  'Papaya': [
    {
      diseaseName: 'Papaya Ringspot Virus',
      confidence: 0.90,
      description: 'Viral disease causing ring spots on fruit and extensive leaf distortion.',
      symptoms: ['Ring spots on fruit', 'Shoestring leaves', 'Stunting', 'Water soaked streaks on stem'],
      causes: ['Papaya Ringspot Virus (PRSV)', 'Aphid vector'],
      organicControl: ['Remove infected plants', 'Netting (to stop aphids)'],
      chemicalControl: ['Insecticides for aphids (vector control only)'],
      prevention: ['Use resistant varieties', 'Isolation from infected fields', 'Roguing']
    }
  ],
  // 22. Pomegranate
  'Pomegranate': [
    {
      diseaseName: 'Bacterial Blight (Oily Spot)',
      confidence: 0.88,
      description: 'Serious bacterial disease causing oily spots on leaves and fruit.',
      symptoms: ['Oily water-soaked spots', 'Cracking of fruit', 'Leaf drop'],
      causes: ['Xanthomonas axonopodis', 'Rain splash'],
      organicControl: ['Bordeaux mixture', 'Remove infected fruits'],
      chemicalControl: ['Streptocycline + Copper Oxychloride'],
      prevention: ['Clean planting material', 'Orchard sanitation', 'Proper pruning']
    }
  ]
};

// --- Layer 1: Gemini Setup ---
const detectionPrompt = ai.definePrompt({
  name: 'diseaseDetection',
  input: { schema: AIDiseaseDetectionInputSchema },
  output: { schema: AIDiseaseDetectionOutputSchema },
  // Changed to gemini-1.5-flash for vision support
  model: googleAI.model('gemini-1.5-flash'),
  config: { temperature: 0.1 },
  prompt: `You are an expert plant pathologist. Analyze this plant leaf image.

1. Identify the specific disease name (e.g., "Early Blight", "Powdery Mildew").
2. If healthy, say "Healthy".
3. Provide confidence (0-1).

Image: {{media url=photoDataUri}}`,
});

// --- Layer 2: Hugging Face Setup ---
async function analyzeWithHuggingFace(base64Image: string): Promise<AIDiseaseDetectionOutput | null> {
  try {
    const HF_MODEL = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification";
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: base64Image }),
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (Array.isArray(results) && results.length > 0) {
      const best = results[0];
      const name = best.label.replace(/_/g, ' ').replace(/-/g, ' ');
      return {
        diseaseName: name.replace(/\b\w/g, (c: string) => c.toUpperCase()),
        confidence: best.score,
        description: `Visual analysis detected ${name} with ${(best.score * 100).toFixed(0)}% confidence.`,
        symptoms: ['Visual match with disease patterns'],
        causes: ['Identified by ML visual analysis'],
        organicControl: ['Consult local guide for specific organic treatments'],
        chemicalControl: ['Consult local guide for specific chemical treatments'],
        prevention: ['Standard disease prevention practices']
      };
    }
  } catch (e) {
    console.error("HF API Error:", e);
  }
  return null;
}


// --- Main Flow ---
const aiDiseaseDetectionFlow = ai.defineFlow(
  {
    name: 'aiDiseaseDetectionFlow',
    inputSchema: AIDiseaseDetectionInputSchema,
    outputSchema: AIDiseaseDetectionOutputSchema,
  },
  async (input) => {
    console.log("🌱 [Disease Detection] Starting Analysis...");
    console.log(`🌾 Crop: ${input.cropType || 'Unknown'}`);

    // DEBUG: Check API Key presence (do not log the actual key)
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    console.log(`🔑 API Key Status: ${apiKey ? `Present (Starts with ${apiKey.substring(0, 4)}...)` : 'MISSING'}`);

    let geminiError = "Unknown Error";

    // 1. Try Gemini (Primary)
    try {
      console.log("🔄 Layer 1: Attempting Gemini AI (gemini-1.5-flash)...");
      if (!apiKey) throw new Error("API Key is missing in environment");

      const { output } = await detectionPrompt(input);
      if (output && output.diseaseName) {
        console.log(`✅ Gemini Success: ${output.diseaseName}`);
        return output;
      }
    } catch (e: any) {
      console.error(`❌ Gemini Error Details:`, e);
      geminiError = e.message || "Model failed";
      if (geminiError.includes('404')) geminiError += " (Model potentially not found or key invalid)";
      console.log(`⚠️ Gemini failed: ${geminiError}`);
    }

    // 2. Try Hugging Face (Secondary - Free)
    try {
      console.log("🔄 Layer 2: Attempting Hugging Face ML...");
      if (input.photoDataUri && input.photoDataUri.length > 100) {
        const hfResult = await analyzeWithHuggingFace(input.photoDataUri);
        if (hfResult) {
          console.log(`✅ Hugging Face Success: ${hfResult.diseaseName}`);

          // Enrich HF result with local data if available
          const crop = input.cropType?.trim();
          if (crop && DISEASE_DATABASE[crop]) {
            const localMatch = DISEASE_DATABASE[crop].find(d =>
              hfResult.diseaseName.toLowerCase().includes(d.diseaseName.toLowerCase().split('(')[0].trim().toLowerCase()) ||
              d.diseaseName.toLowerCase().includes(hfResult.diseaseName.toLowerCase())
            );
            if (localMatch) {
              return { ...localMatch, confidence: hfResult.confidence };
            }
          }
          return hfResult;
        }
      } else {
        console.log("⚠️ Invalid photo data for HF");
      }
    } catch (e) {
      console.log("⚠️ Hugging Face failed");
    }

    // 3. Fallback to Local Knowledge Base (FIXED: Now deterministic and case-insensitive)
    console.log("🔄 Layer 3: Using Local Knowledge Base Fallback...");
    const crop = input.cropType?.trim() || '';
    console.log(`📝 Looking up crop: "${crop}"`);

    // Case-insensitive crop lookup
    let cropDiseases = DISEASE_DATABASE[crop];
    let matchedCrop = crop;

    if (!cropDiseases && crop) {
      const matchedKey = Object.keys(DISEASE_DATABASE).find(
        key => key.toLowerCase() === crop.toLowerCase()
      );
      if (matchedKey) {
        console.log(`✅ Matched "${crop}" to database key "${matchedKey}"`);
        cropDiseases = DISEASE_DATABASE[matchedKey];
        matchedCrop = matchedKey;
      } else {
        console.log(`❌ No match found for "${crop}". Available: ${Object.keys(DISEASE_DATABASE).slice(0, 5).join(', ')}...`);
      }
    }

    if (cropDiseases && cropDiseases.length > 0) {
      // FIXED: Deterministic selection based on image hash (same image = same disease)
      const imageHash = simpleHash(input.photoDataUri || crop);
      const index = imageHash % cropDiseases.length;
      const fallback = cropDiseases[index];

      console.log(`✅ Local Fallback: ${fallback.diseaseName} (deterministic selection ${index + 1}/${cropDiseases.length})`);
      return {
        ...fallback,
        description: `${fallback.description} [System Note: AI Analysis Failed (${geminiError}). Showing fallback diagnosis for ${matchedCrop}.]`,
        confidence: 0.68
      };
    }

    // 4. Ultimate Fail
    console.log(`❌ No disease data available for crop: "${crop}"`);
    return {
      diseaseName: 'Crop Not Supported',
      confidence: 0,
      description: `No disease database for "${crop}". Supported crops: ${Object.keys(DISEASE_DATABASE).slice(0, 10).join(', ')}, and 12 more.`,
      symptoms: [],
      causes: [],
      organicControl: [],
      chemicalControl: [],
      prevention: []
    };
  }
);

export async function aiDiseaseDetection(
  input: AIDiseaseDetectionInput
): Promise<AIDiseaseDetectionOutput> {
  return await aiDiseaseDetectionFlow(input);
}
