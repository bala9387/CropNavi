
'use server';

/**
 * @fileOverview A flow for translating multiple pieces of text content in a single batch.
 *
 * - translatePageContent - A function that translates an array of text content to a target language.
 */

import {ai} from '@/ai/genkit';
import {
  TranslatePageContentInput,
  TranslatePageContentOutput,
  TranslatePageContentInputSchema,
  TranslatePageContentOutputSchema,
} from './translate-page-content.schemas';

// A simple dictionary for dummy translations
const translationsDb: Record<string, Record<string, string>> = {
  hindi: {
    // Get Started Page
    'AI Crop Recommendation for Farmers': 'किसानों के लिए एआई फसल सिफारिश',
    'Get Started': 'शुरू हो जाओ',
    'Translate Page...': 'पेज का अनुवाद करें...',

    // Login Page
    'Back to Get Started': 'शुरुआत पर वापस जाएं',
    'Welcome to CropNavi': 'क्रॉपनवी में आपका स्वागत है',
    'Sign in to continue to your dashboard.': 'अपने डैशबोर्ड पर जाने के लिए साइन इन करें।',
    'Or continue with': 'या इसके साथ जारी रखें',
    'Email': 'ईमेल',
    'Password': 'पासवर्ड',
    'Forgot your password?': 'क्या आप अपना पासवर्ड भूल गए?',
    'Sign In': 'साइन इन करें',
    "Don't have an account?": 'क्या आपका खाता नहीं है?',
    'Sign up': 'साइन अप करें',
    "By continuing, you agree to CropNavi's": 'जारी रखकर, आप क्रॉपनवी की',
    'Terms of Service': 'सेवा की शर्तें',
    'and': 'और',
    'Privacy Policy': 'गोपनीयता नीति',

    // Dashboard & Sidebar
    'Welcome, Farmer!': 'किसान, आपका स्वागत है!',
    'Here are the tools to help you grow smarter.': 'यहां वे उपकरण हैं जो आपको बेहतर ढंग से विकसित होने में मदद करेंगे।',
    'AI Crop Recommendation': 'एआई फसल सिफारिश',
    'Get AI-driven crop suggestions based on your soil and climate.': ' अपनी मिट्टी और जलवायु के आधार पर एआई-संचालित फसल सुझाव प्राप्त करें।',
    'AI Disease Detection': 'एआई रोग पहचान',
    'Upload a photo to diagnose plant diseases instantly.': 'पौधों की बीमारियों का तुरंत निदान करने के लिए एक फोटो अपलोड करें।',
    'Market Analysis': 'बाजार विश्लेषण',
    'Analyze market trends and prices for your crops.': ' अपनी फसलों के लिए बाजार के रुझान और कीमतों का विश्लेषण करें।',
    'Sustainability Score': 'संवहनीयता स्कोर',
    'Calculate and improve your farm’s sustainability rating.': 'अपने खेत की संवहनीयता रेटिंग की गणना करें और सुधार करें।',
    'Community Forum': 'सामुदायिक मंच',
    'Connect with other farmers, ask questions, and share knowledge.': 'अन्य किसानों से जुड़ें, प्रश्न पूछें और ज्ञान साझा करें।',
    'Achievements': 'उपलब्धियां',
    'Track your progress and earn badges for your farming skills.': ' अपनी प्रगति को ट्रैक करें और अपने कृषि कौशल के लिए बैज अर्जित करें।',
    'Dashboard': 'डैशबोर्ड',
    'Crop Recommendation': 'फसल सिफारिश',
    'Disease Detection': 'रोग पहचान',
    'Educational Modules': 'शैक्षिक मॉड्यूल',
    
    // Crop Rec Page
    'Enter coordinates manually or use your GPS to fetch soil data. Then, describe your farm, and our AI will suggest the best crops for you.': 'मिट्टी का डेटा प्राप्त करने के लिए निर्देशांक मैन्युअल रूप से दर्ज करें या अपने जीपीएस का उपयोग करें। फिर, अपने खेत का वर्णन करें, और हमारा एआई आपके लिए सर्वोत्तम फसलों का सुझाव देगा।',
    '1. Location for Soil Analysis': '1. मिट्टी विश्लेषण के लिए स्थान',
    'Latitude (e.g., 23.610)': 'अक्षांश (जैसे, 23.610)',
    'Longitude (e.g., 85.279)': 'देशांतर (जैसे, 85.279)',
    'Fetch Data for Coordinates': 'निर्देशांक के लिए डेटा प्राप्त करें',
    'Detect My Location & Fetch Data': 'मेरा स्थान पहचानें और डेटा प्राप्त करें',
    'The AI will use the fetched soil data as its primary source for recommendations.': 'एआई सिफारिशों के लिए अपने प्राथमिक स्रोत के रूप में प्राप्त मिट्टी के डेटा का उपयोग करेगा।',
    '2. Farm & Climate Details': '2. खेत और जलवायु विवरण',
    'Annual Rainfall': 'वार्षिक वर्षा',
    'Primary Soil Type': 'प्राथमिक मिट्टी का प्रकार',
    'Primary Goal': 'प्राथमिक लक्ष्य',
    'Risk Tolerance': 'जोखिम सहनशीलता',
    'Field Size': 'खेत का आकार',
    'Total Budget (₹)': 'कुल बजट (₹)',
    'Total Budget (e.g., 50000)': 'कुल बजट (जैसे, 50000)',
    'Fertilizer Preference': 'उर्वरक वरीयता',
    'Irrigation Method': 'सिंचाई विधि',
    'Crop History': 'फसल इतिहास',
    'Most Recent Crop': 'सबसे हालिया फसल',
    'Harvest Year': 'फसल का साल',
    'What was the most recent crop grown on this field?': 'इस खेत में उगाई गई सबसे हालिया फसल कौन सी थी?',
    'Recommend Crops': 'फसलों की सिफारिश करें',
    'AI-Powered Recommendations': 'एआई-संचालित सिफारिशें',
    'Based on your input, here are our top suggestions.': 'आपके इनपुट के आधार पर, यहां हमारे शीर्ष सुझाव दिए गए हैं।',
    'SoilGrids Data Preview': 'सॉइलग्रिड्स डेटा पूर्वावलोकन',
    "This is the scientific soil data fetched from SoilGrids.org for your location. Review the data and visual maps. Click 'Use This Data' when done.": "यह आपके स्थान के लिए SoilGrids.org से प्राप्त वैज्ञानिक मिट्टी डेटा है। डेटा और विज़ुअल मानचित्रों की समीक्षा करें। हो जाने पर 'इस डेटा का उपयोग करें' पर क्लिक करें।",
    'Table Data': 'तालिका डेटा',
    'Interactive Map': 'इंटरैक्टिव मानचित्र',
    'Raw Data': 'कच्चा डेटा',
    'View on Google Maps': 'Google मानचित्र पर देखें',
    'Use This Data': 'इस डेटा का उपयोग करें',
    'Cancel': 'रद्द करना',
    'Our AI is analyzing your farm data...': 'हमारा एआई आपके खेत के डेटा का विश्लेषण कर रहा है...',
    'Recommended Crops': 'अनुशंसित फसलें',
    'Reasoning': 'तर्क',
    'Your Recommendations Await': 'आपकी सिफारिशें प्रतीक्षित हैं',
    'totalBudgetPlaceholder': 'जैसे, 50000',
    'latitudePlaceholder': 'अक्षांश (जैसे, 23.610)',
    'longitudePlaceholder': 'देशांतर (जैसे, 85.279)',
    'fertilizerPrefLabel': 'उर्वरक वरीयता',
    'irrigationMethodLabel': 'सिंचाई विधि',
    'harvestYearLabel': 'फसल का साल',
    'resultTitle': 'एआई-संचालित सिफारिशें',
    'resultDescription': 'आपके इनपुट के आधार पर, यहां हमारे शीर्ष सुझाव दिए गए हैं।',
    'soilDialogTitle': 'सॉइलग्रिड्स डेटा पूर्वावलोकन',
    'soilDialogDescription': "यह आपके स्थान के लिए SoilGrids.org से प्राप्त वैज्ञानिक मिट्टी डेटा है। डेटा और विज़ुअल मानचित्रों की समीक्षा करें। हो जाने पर 'इस डेटा का उपयोग करें' पर क्लिक करें।",
    'tableTab': 'तालिका डेटा',
    'mapsTab': 'इंटरैक्टिव मानचित्र',
    'rawTab': 'कच्चਾ डेटा',
    'googleMapsButton': 'Google मानचित्र पर देखें',
    'useDataButton': 'इस डेटा का उपयोग करें',
    'cancelButton': 'रद्द करना',
    'placeholderDescription': 'हमारा एआई आपके खेत के डेटा का विश्लेषण कर रहा है...',
    'recommendedCropsLabel': 'अनुशंसित फसलें',
    'reasoningLabel': 'तर्क',
    'placeholderTitle': 'आपकी सिफारिशें प्रतीक्षित हैं',
    'farmDetailsLabel': 'खेत और जलवायु विवरण',
    'annualRainfallLabel': 'वार्षिक वर्षा',
    'soilTypeLabel': 'प्राथमिक मिट्टी का प्रकार',
    'primaryGoalLabel': 'प्राथमिक लक्ष्य',
    'riskToleranceLabel': 'जोखिम सहनशीलता',
    'fieldSizeLabel': 'खेत का आकार',
    'totalBudgetLabel': 'कुल बजट (₹)',
    'recentCropLabel': 'सबसे हालिया फसल',
    'cropHistoryDescription': 'इस खेत में उगाई गई सबसे हालिया फसल कौन सी थी?',
    'locationDescription': 'एआई सिफारिशों के लिए अपने प्राथमिक स्रोत के रूप में प्राप्त मिट्टी के डेटा का उपयोग करेगा।',
    'detectLocationButton': 'मेरा स्थान पहचानें और डेटा प्राप्त करें',
    'fetchCoordsButton': 'निर्देशांक के लिए डेटा प्राप्त करें',
    'locationLabel': 'मिट्टी विश्लेषण के लिए स्थान',
    'description': 'मिट्टी का डेटा प्राप्त करने के لیے निर्देशांक मैन्युअल रूप से दर्ज करें या अपने जीपीएस का उपयोग करें। फिर, अपने खेत का वर्णन करें, और हमारा एआई आपके लिए सर्वोत्तम फसलों का सुझाव देगा।',
    'title': 'एआई फसल सिफारिश',
    'cropHistoryLabel': 'फसल इतिहास',

    // Disease Detection
    "AI Disease Detection": "एआई रोग का पता लगाना",
    "Use your camera or upload a photo of an affected plant leaf to get an AI-powered diagnosis.": "एआई-संचालित निदान प्राप्त करने के लिए अपने कैमरे का उपयोग करें या प्रभावित पौधे की पत्ती की तस्वीर अपलोड करें।",
    "Live Camera": "लाइव कैमरा",
    "Upload File": "फाइल अपलोड करें",
    "Camera Access Required": "कैमरा एक्सेस आवश्यक है",
    "Please allow camera access in your browser settings to use this feature.": "इस सुविधा का उपयोग करने के लिए कृपया अपनी ब्राउज़र सेटिंग्स में कैमरा एक्सेस की अनुमति दें।",
    "Capture & Diagnose": "कैप्चर और निदान करें",
    "Plant Photo": "पौधे की तस्वीर",
    "Upload a clear image of the affected plant part. Max 5MB.": "प्रभावित पौधे के हिस्से की एक स्पष्ट छवि अपलोड करें। अधिकतम 5MB।",
    "Diagnose": "निदान",
    "Image to Analyze": "विश्लेषण के लिए छवि",
    "Scanning for diseases...": "बीमारियों के लिए स्कैनिंग...",
    "Diagnosis Result": "निदान परिणाम",
    "Confidence": "आत्मविश्वास",
    "Description & Treatment": "विवरण और उपचार",
    "Looks Healthy!": "स्वस्थ लग रहा है!",
    "No significant disease was detected in the image.": "छवि में कोई महत्वपूर्ण बीमारी का पता नहीं चला।",
    "Use your camera or upload an image and your diagnosis will appear here.": "अपने कैमरे का उपयोग करें या एक छवि अपलोड करें और आपका निदान यहां दिखाई देगा।",
    
    // Market Analysis
    "Market Price Visualization": "बाजार मूल्य विज़ुअलाइज़ेशन",
    "Select filters to see live price trends from Agmarknet for a crop in your market.": "अपने बाजार में फसल के लिए एगमार्कनेट से लाइव मूल्य रुझान देखने के लिए फ़िल्टर चुनें।",
    "Select Commodity": "कमोडिटी चुनें",
    "Select State": "राज्य चुनें",
    "Select District": "जिला चुनें",
    "Enter Market Name": "बाजार का नाम दर्ज करें",
    "From Date": "से तिथि",
    "To Date": "तिथि तक",
    "Clear All Filters": "सभी फ़िल्टर साफ़ करें",
    "Using Sample Data": "नमूना डेटा का उपयोग करना",
    "Live data from Agmarknet is currently unavailable. Displaying sample data instead.": "एगमार्कनेट से लाइव डेटा वर्तमान में अनुपलब्ध है। इसके बजाय नमूना डेटा प्रदर्शित हो रहा है।",
    "Could Not Fetch Data": "डेटा प्राप्त नहीं किया जा सका",
    "No market data found for this crop/region.": "इस फसल/क्षेत्र के लिए कोई बाजार डेटा नहीं मिला।",
    "Please select filters to view price data from Agmarknet.": "एगमार्कनेट से मूल्य डेटा देखने के लिए कृपया फ़िल्टर चुनें।",
    "Generate Market & Profit Analysis": "बाजार और लाभ विश्लेषण उत्पन्न करें",
    "Filter for market data above, then add your costs to get an AI-powered financial summary.": "ऊपर बाजार डेटा के लिए फ़िल्टर करें, फिर एआई-संचालित वित्तीय सारांश प्राप्त करने के लिए अपनी लागत जोड़ें।",
    "Market Data (per Ton)": "बाजार डेटा (प्रति टन)",
    "This will be auto-filled with data from the chart above. You can also paste your own.": "यह ऊपर दिए गए चार्ट से डेटा के साथ स्वतः भर जाएगा। आप अपना खुद का भी पेस्ट कर सकते हैं।",
    "Your Expenditures": "आपके व्यय",
    "e.g., Seeds: ₹2000, Fertilizer: ₹3500, Labor: ₹5000": "जैसे, बीज: ₹2000, उर्वरक: ₹3500, श्रम: ₹5000",
    "Analyze Now": "अभी विश्लेषण करें",
    "Generating analysis...": "विश्लेषण उत्पन्न हो रहा है...",
    "AI-Generated Analysis": "एआई-जनित विश्लेषण",
    "Market Summary": "बाजार सारांश",
    "Profit & Loss Analysis": "लाभ और हानि विश्लेषण",
    "Your market analysis and profit/loss summary will appear here.": "आपका बाजार विश्लेषण और लाभ/हानि सारांश यहां दिखाई देगा।",
    "Using Dummy Data": "डमी डेटा का उपयोग करना",
    "Live API keys for Agmarknet are not configured. Displaying dummy data instead.": "एगमार्कनेट के लिए लाइव एपीआई कुंजी कॉन्फ़िगर नहीं हैं। इसके बजाय डमी डेटा प्रदर्शित हो रहा है।",

    // Sustainability Score
    "Provide details about your farm to get an AI-calculated sustainability rating.": "एआई-गणना वाली स्थिरता रेटिंग प्राप्त करने के लिए अपने खेत के बारे में विवरण प्रदान करें।",
    "Soil Health": "मृदा स्वास्थ्य",
    "Nitrogen (kg/ha)": "नाइट्रोजन (किग्रा/हेक्टेयर)",
    "Phosphorus (kg/ha)": "फास्फोरस (किग्रा/हेक्टेयर)",
    "Potassium (kg/ha)": "पोटेशियम (किग्रा/हेक्टेयर)",
    "Soil pH": "मिट्टी का पीएच",
    "Moisture (%)": "नमी (%)",
    "Farming Practices": "खेती के तरीके",
    "Irrigation": "सिंचाई",
    "Tillage": "जुताई",
    "Pesticides": "कीटनाशक",
    "Crop History & Rotation": "फसल इतिहास और रोटेशन",
    "Describe your rotation for the last 2-3 seasons.": "पिछले 2-3 मौसमों के लिए अपने रोटेशन का वर्णन करें।",
    "Market & Financials": "बाजार और वित्तीय",
    "Describe price trends and your costs.": "मूल्य प्रवृत्तियों और अपनी लागतों का वर्णन करें।",
    "Calculate Score": "स्कोर की गणना करें",
    "Calculating your score...": "आपके स्कोर की गणना हो रही है...",
    "Your Sustainability Score": "आपका स्थिरता स्कोर",
    "out of 100": "100 में से",
    "Rationale & Recommendations": "तर्क और सिफारिशें",
    "Your sustainability score and insights will appear here.": "आपका स्थिरता स्कोर और अंतर्दृष्टि यहां दिखाई देगी।",

    // Community Forum
    "Connect with farmers, share, and learn.": "किसानों से जुड़ें, साझा करें और सीखें।",
    "Start New Discussion": "नई चर्चा शुरू करें",
    "replies": "जवाब",
    "likes": "पसंद",
    "Back to Forum": "फोरम पर वापस",
    "Posted by": "द्वारा पोस्ट किया गया",
    "Like": "पसंद",
    "Replies": "जवाब",
    "Share": "शेयर करें",
    "Post a Reply": "एक उत्तर पोस्ट करें",
    "Write your reply here...": "अपना जवाब यहां लिखें...",
    "Submit Reply": "उत्तर जमा करें",

    // Profile
    "Farmer": "किसान",
    "Edit Profile": "प्रोफ़ाइल संपादित करें",
    "Save Changes": "बदलाव सहेजें",
    "Cancel": "रद्द करें",
    "About": "के बारे में",
    "Details": "विवरण",
    "Farming since": "से खेती",
    "farm size": "खेत का आकार",
    "Primary Crops": "मुख्य फसलें",
    "The main crops cultivated on the farm.": "खेत पर उगाई जाने वाली मुख्य फसलें।",
    "Enter crops separated by commas.": "अल्पविराम से अलग करके फसलें दर्ज करें।",
    "Interests": "रूचियाँ",
    "Topics and techniques of interest.": "ब्याज के विषय और तकनीकें।",
    "Enter interests separated by commas.": "अल्पविराम से अलग करके रुचियां दर्ज करें।",

    // Achievements
    "Track your progress, earn badges, and become a top farmer!": "अपनी प्रगति को ट्रैक करें, बैज अर्जित करें, और एक शीर्ष किसान बनें!",
    "My Badges": "मेरे बैज",
    "Work in Progress": "कार्य प्रगति पर है",
    "Leaderboard": "लीडरबोर्ड",
    "Rank": "पद",
    "Score": "स्कोर",
    "Keep up the great work!": "बहुत अच्छा काम करते रहें!",
    "Top 5 farmers by Sustainability Score": "स्थिरता स्कोर के अनुसार शीर्ष 5 किसान",

    // Placeholders
    "This feature is coming soon! Get ready to earn badges and showcase your farming skills.": "यह सुविधा जल्द ही आ रही है! बैज अर्जित करने और अपने कृषि कौशल का प्रदर्शन करने के लिए तैयार हो जाइए।",
    "Our library of tutorials, guides, and quizzes is being curated. Check back soon to expand your farming knowledge.": "हमारे ट्यूटोरियल, गाइड और क्विज़ की लाइब्रेरी क्यूरेट की जा रही है। अपने कृषि ज्ञान का विस्तार करने के लिए जल्द ही वापस देखें।",
    
    // Chatbot
    "Chat with AI": "एआई के साथ बातचीत",
    "CropNavi Assistant": "क्रॉपनवी असिस्टेंट",
    "Online": "ऑनलाइन",
    "Hello! I'm the CropNavi Assistant. How can I help you today?": "नमस्ते! मैं क्रॉपनवी असिस्टेंट हूं। मैं आज आपकी कैसे मदद कर सकता हूं?",
    "Ask a question...": "एक सवाल पूछें..."
  }
};


export async function translatePageContent(
  input: TranslatePageContentInput
): Promise<TranslatePageContentOutput> {

  const lang = input.targetLanguage.toLowerCase().split(' ')[0];
  const dictionary = translationsDb[lang] || {};

  // Dummy implementation: uses the dictionary and returns original text if not found.
  const dummyTranslations = input.texts.map(text => {
     return dictionary[text] || text;
  });

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    translations: dummyTranslations,
  };
}

const translatePageContentFlow = ai.defineFlow(
  {
    name: 'translatePageContentFlow',
    inputSchema: TranslatePageContentInputSchema,
    outputSchema: TranslatePageContentOutputSchema,
  },
  translatePageContent
);

    
