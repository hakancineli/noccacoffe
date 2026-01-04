import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
    try {
        console.log('Checking with API version v1...');
        const resV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
        const dataV1 = await resV1.json();
        console.log('V1 Models:', JSON.stringify(dataV1, null, 2));

        console.log('\nChecking with API version v1beta...');
        const resV1beta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const dataV1beta = await resV1beta.json();
        console.log('V1beta Models:', JSON.stringify(dataV1beta, null, 2));
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

listModels();
