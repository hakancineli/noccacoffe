import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyApnEIMPkDgkUpkCdVtLHhSnoB-iu_sVTM";

async function testKey() {
    console.log("Testing Gemini 2.0 Flash...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Trying 2.0 Flash explicitly
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });

        const result = await model.generateContent("Hello?");
        console.log("SUCCESS with 2.0 Flash:", (await result.response).text());
        return;
    } catch (e: any) {
        console.log("2.0 Flash Failed:", e.message);
    }

    console.log("\nTesting Gemini Pro...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Fallback to older stable model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent("Hello?");
        console.log("SUCCESS with Gemini Pro:", (await result.response).text());
    } catch (e: any) {
        console.log("Gemini Pro Failed:", e.message);
    }
}

testKey();
