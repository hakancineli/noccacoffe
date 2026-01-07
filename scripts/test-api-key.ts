import { GoogleGenerativeAI } from '@google/generative-ai';

// User's new key specifically
const API_KEY = "AIzaSyBJWY4txtxdpUO9_xhUCmMGxSPPqvnBYog";

async function testKey() {
    console.log("Testing API Key:", API_KEY.substring(0, 10) + "...");

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });

        console.log("Attempting to generate content...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Success! AI Response:", response.text());
    } catch (error: any) {
        console.error("Test Failed!");
        console.error("Error Message:", error.message);

        if (error.message.includes("API key not valid")) {
            console.log("Diagnosis: Anahtar hatalı veya silinmiş.");
        } else if (error.message.includes("403 Forbidden")) {
            console.log("Diagnosis: Anahtarın izinleri eksik veya proje kısıtlaması var.");
        } else {
            console.log("Diagnosis: Bilinmeyen bir bağlantı sorunu.");
        }
    }
}

testKey();
