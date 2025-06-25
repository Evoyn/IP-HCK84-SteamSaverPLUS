const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with your API key
const { GOOGLE_API_KEY } = process.env;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function generateContent(prompt) {
  try {
    // Get the generative model - using gemini-1.5-flash for free tier
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

module.exports = {
  generateContent,
};
