const vader = require('vader-sentiment');

/**
 * Analyzes the sentiment of a given text using the VADER algorithm.
 * VADER (Valence Aware Dictionary and sEntiment Reasoner) is specifically
 * attuned to sentiments expressed in social media and general text.
 *
 * @param {string} text - The feedback text to analyze
 * @returns {object} - Sentiment scores and classification label
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      positive: 0,
      negative: 0,
      neutral: 1,
      compound: 0,
      label: 'Neutral',
      error: 'No text provided'
    };
  }

  // Run VADER sentiment analysis
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);

  const positive = parseFloat(intensity.pos.toFixed(4));
  const negative = parseFloat(intensity.neg.toFixed(4));
  const neutral = parseFloat(intensity.neu.toFixed(4));
  const compound = parseFloat(intensity.compound.toFixed(4));

  // Classification rules:
  // compound >= 0.05  → Positive
  // compound <= -0.05 → Negative
  // otherwise         → Neutral
  let label;
  if (compound >= 0.05) {
    label = 'Positive';
  } else if (compound <= -0.05) {
    label = 'Negative';
  } else {
    label = 'Neutral';
  }

  return {
    positive,
    negative,
    neutral,
    compound,
    label
  };
}

module.exports = { analyzeSentiment };
