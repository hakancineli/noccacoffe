import { GoogleGenerativeAI } from '@google/generative-ai';

// New account key
const API_KEY = "AIzaSyApnEIMPkDgkUpkCdVtLHhSnoB-iu_sVTM";

async function testKey() {
    console.log("Testing NEW ACCOUNT Key:", API_KEY.substring(0, 10) + "...");

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Using standard gemini-1.5-flash as it is the most stable free tier model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Attempting to generate content...");
        const result = await model.generateContent("Hello, are you ready?");
        const response = await result.response;
        console.log("SUCCESS! Data received:", response.text());
    } catch (error: any) {
        console.error("Test Failed!");
        console.error("Error:", error.message);
    }
}

testKey();
