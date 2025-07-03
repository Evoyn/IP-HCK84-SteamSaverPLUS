const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with your API key
const { GOOGLE_API_KEY } = process.env;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function generateContent(prompt, modelName = "gemini-2.5-flash") {
  // Default to 2.5 Flash
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: modelName });

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

// Example usage:
// generateContent("Tell me a story about a dragon.", "gemini-2.0-flash");
// generateContent("Summarize this article:", "gemini-2.5-flash");

module.exports = {
  generateContent,
};
