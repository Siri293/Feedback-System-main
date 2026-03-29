/* eslint-env node */
'use strict';

/**
 * Aicontroller.js
 * Uses Node built-in https — NO npm package needed.
 * Model: gemini-1.5-flash-latest (free, 1500 req/day)
 */

const https = require('https');

exports.generateSummary = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not set. Get free key at aistudio.google.com/app/apikey'
      });
    }

    const { feedbacks } = req.body;
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(400).json({ success: false, error: 'No feedback data provided.' });
    }

    const total    = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment_label === 'Positive').length;
    const negative = feedbacks.filter(f => f.sentiment_label === 'Negative').length;
    const neutral  = total - positive - negative;

    const feedbackText = feedbacks
      .slice(0, 40)
      .map((f, i) => `${i + 1}. [${f.sentiment_label}] ${f.message}`)
      .join('\n');

    const prompt = `You are a customer feedback analyst. Analyze these ${total} feedback entries.
Stats: ${positive} Positive, ${negative} Negative, ${neutral} Neutral.

Feedback entries:
${feedbackText}

Write exactly 3 plain sentences (no bullets, no numbers, no markdown):
Sentence 1: Overall sentiment trend with key statistics.
Sentence 2: Main positive theme customers appreciate.
Sentence 3: Key area for improvement from negative feedback.`;

    const summary = await callGemini(apiKey, prompt);
    return res.json({ success: true, summary });

  } catch (err) {
    console.error('Gemini AI Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate AI summary.'
    });
  }
};

function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      // ✅ gemini-1.5-flash-latest is the correct working free-tier model name
      path: `/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => (data += chunk));
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(
              `Gemini API error ${parsed.error.code}: ${parsed.error.message}`
            ));
          }
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Empty response from Gemini. Check your API key.'));
          resolve(text.trim());
        } catch (e) {
          reject(new Error('Failed to parse Gemini response: ' + e.message));
        }
      });
    });

    req.on('error', err => reject(new Error('Network error: ' + err.message)));
    req.write(body);
    req.end();
  });
}