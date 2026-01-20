// @ts-ignore - Vercel node types
import { VercelRequest, VercelResponse } from '@vercel/node';

const { GoogleGenAI } = require('@google/genai');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    const origin = (process.env as any).VERCEL_URL ? `https://${(process.env as any).VERCEL_URL}` : 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { prompt } = req.body;

    if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
    }

    const apiKey = (process.env as any).GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        res.status(200).json({
            text: response.text,
            model: 'gemini-2.0-flash'
        });
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate content',
            details: error.error?.message || error.toString()
        });
    }
}
