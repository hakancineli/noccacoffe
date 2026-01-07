import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyBJWY4txtxdpUO9_xhUCmMGxSPPqvnBYog";

async function testKey() {
    console.log("Testing API Key with Gemini 1.5 Flash...");

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Switching to 'gemini-1.5-flash' which is often more available on free tiers
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Attempting to generate content...");
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log("Success! AI Response:", response.text());
    } catch (error: any) {
        console.error("Test Failed with 1.5-flash!");
        console.error("Error Message:", error.message);
    }
}

testKey();
