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
    console.log('[AI API] GEMINI_API_KEY status:', apiKey ? `present (${apiKey.length} chars)` : 'MISSING');
    console.log('[AI API] API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) : 'N/A');

    if (!apiKey || apiKey.trim() === '') {
        console.error('[AI API] API Key validation failed: empty or missing');
        res.status(500).json({ error: 'GEMINI_API_KEY not configured or empty' });
        return;
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.error('[AI API] Prompt validation failed: empty or invalid type');
        res.status(400).json({ error: 'Prompt must be a non-empty string' });
        return;
    }

    try {
        // Validate API key is set and not empty
        if (!apiKey || apiKey.trim() === '') {
            console.error('[AI API] API Key is empty or undefined');
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        const trimmedKey = apiKey.trim();
        console.log('[AI API] Initializing GoogleGenAI with API key length:', trimmedKey.length);

        // Initialize SDK with explicit params object
        const ai = new GoogleGenAI({
            apiKey: trimmedKey,
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/'
        });

        console.log('[AI API] GoogleGenAI initialized');
        console.log('[AI API] Calling generateContent');

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ]
        });

        console.log('[AI API] Success, response text length:', response.text?.length || 0);
        return res.status(200).json({
            text: response.text,
            model: 'gemini-2.0-flash'
        });
    } catch (error: any) {
        console.error('[AI API] FULL ERROR:', {
            message: error.message,
            name: error.name,
            code: error.code,
            status: error.status
        });
        return res.status(500).json({
            error: error.message || 'Failed to generate content',
            errorType: error.name
        });
    }
}
