import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// This prompt acts as the "brain" for the chatbot, giving it context about the app's current data.
const SYSTEM_PROMPT = `
You are AgriClimate AI, an expert agricultural and meteorological assistant. 
You are speaking directly to a farmer who is using a climate prediction dashboard.

CURRENT CLIMATE CONTEXT (You must use this data to inform your answers):
- The overall yield risk is currently HIGH.
- There is a 92% Heat Stress risk expected in week 3.
- There is a 45% Water Stress risk (Moderate).
- The monsoon is expected to be delayed by 12-15 days.
- Highly recommended crops for this season: Drought-Resistant Sorghum, Pearl Millet (Bajra), and Chickpea.
- Recommended actions: Delay sowing by 12-15 days, use pre-dawn drip irrigation to combat heat stress, and ensure rainwater harvesting systems are ready.

INSTRUCTIONS:
1. Provide concise, friendly, and highly actionable advice.
2. Directly answer the farmer's question using the climate context provided above.
3. Keep responses relatively short (2-3 sentences max) as they will be displayed in a small chat widget.
`;

export const generateResponse = async (userMessage, language = 'en') => {
  // If the key doesn't look like a valid Google API key (starts with AIzaSy)
  // or is missing entirely, we fall back to a local simulation.
  if (!API_KEY || !API_KEY.startsWith("AIzaSy")) {
    return simulateLocalResponse(userMessage, language);
  }

  try {
    const languageInstruction = language === 'ta' 
      ? "\n\nCRITICAL INSTRUCTION: You MUST reply entirely in Tamil (தமிழ்)." 
      : "\n\nCRITICAL INSTRUCTION: You MUST reply entirely in English.";

    const fullPrompt = SYSTEM_PROMPT + languageInstruction + "\n\nFarmer says: " + userMessage;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Generation Error:", error);
    // If the real API call fails, fall back to simulation to prevent app crash
    return simulateLocalResponse(userMessage, language);
  }
};

// Local Keyword Parser for when the API Key is invalid
const simulateLocalResponse = (message, language) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerInput = message.toLowerCase();
      
      if (language === 'ta') {
        if (lowerInput.includes('rain') || lowerInput.includes('water') || lowerInput.includes('மழை') || lowerInput.includes('நீர்')) {
          resolve("எங்கள் மாதிரிகள் வரவிருக்கும் பருவமழைக்கு 20% பற்றாக்குறையை கணிக்கின்றன. மழைநீர் சேகரிப்பு அமைப்புகள் தயாராக இருப்பதை உறுதிசெய்யவும்.");
        } else if (lowerInput.includes('heat') || lowerInput.includes('hot') || lowerInput.includes('temperature') || lowerInput.includes('வெப்பம்')) {
          resolve("தற்போதைய 92% வெப்ப அழுத்த அபாயத்தின் அடிப்படையில், நீங்கள் விதைப்பதை 12-15 நாட்கள் தாமதப்படுத்தவும், அதிகாலை நேரங்களில் சொட்டு நீர் பாசனத்தைப் பயன்படுத்தவும் பரிந்துரைக்கிறேன்.");
        } else if (lowerInput.includes('crop') || lowerInput.includes('plant') || lowerInput.includes('seed') || lowerInput.includes('பயிர்') || lowerInput.includes('விதை')) {
          resolve("இந்த பருவத்திற்கு, வறட்சியைத் தாங்கும் சோளத்தை பயிரிட நான் மிகவும் பரிந்துரைக்கிறேன், ஏனெனில் இது 92% நம்பகத்தன்மை பொருத்தம் கொண்டுள்ளது.");
        } else {
          resolve("நான் தரவை பகுப்பாய்வு செய்கிறேன், ஆனால் அதற்கான குறிப்பிட்ட பதில் என்னிடம் இன்னும் இல்லை. 'மழை', 'வெப்பநிலை' அல்லது 'பயிர்கள்' பற்றி கேட்டுப் பாருங்கள்!");
        }
      } else {
        if (lowerInput.includes('rain') || lowerInput.includes('water')) {
          resolve("Our models predict a 20% deficit in rainfall for the upcoming monsoon. Ensure your rainwater harvesting systems are ready.");
        } else if (lowerInput.includes('heat') || lowerInput.includes('hot') || lowerInput.includes('temperature')) {
          resolve("Based on the current 92% Heat Stress risk, I recommend delaying your sowing by 12-15 days and using pre-dawn drip irrigation.");
        } else if (lowerInput.includes('crop') || lowerInput.includes('plant') || lowerInput.includes('seed')) {
          resolve("For this season, I highly recommend planting Drought-Resistant Sorghum, as it has a 92% viability match with our climate forecasts.");
        } else {
          resolve("I'm analyzing the data, but I don't have a specific answer for that yet. Try asking me about 'rain', 'temperature', or 'crops'!");
        }
      }
    }, 1500); // Simulate network delay
  });
};
