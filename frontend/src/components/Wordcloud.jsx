import React, { useMemo } from 'react';

// Stop words to exclude from word cloud
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','it','its','was','are','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall',
  'i','me','my','we','our','you','your','he','she','they','their','this',
  'that','these','those','not','no','so','if','as','by','from','up','about',
  'into','than','then','there','when','where','who','which','what','how',
  'very','just','more','also','really','quite','much','well','get','got'
]);

function buildWordFrequency(feedbacks) {
  const freq = {};
  feedbacks.forEach(fb => {
    const words = (fb.message || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w));

    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));
}

const PALETTE = [
  '#2563EB','#10B981','#EF4444','#F59E0B','#8B5CF6',
  '#EC4899','#06B6D4','#84CC16','#F97316','#6366F1'
];

export default function WordCloud({ feedbacks }) {
  const words = useMemo(() => buildWordFrequency(feedbacks), [feedbacks]);

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>☁️</div>
        <p style={{ fontSize: '0.9rem' }}>Submit feedback to see the word cloud</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
        <p style={{ fontSize: '0.9rem' }}>Not enough word data yet</p>
      </div>
    );
  }

  const maxCount = words[0].count;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', minHeight: 160 }}>
      {words.map(({ word, count }, i) => {
        const ratio     = count / maxCount;
        const fontSize  = 0.75 + ratio * 1.6;   // 0.75rem → 2.35rem
        const opacity   = 0.55 + ratio * 0.45;
        const color     = PALETTE[i % PALETTE.length];

        return (
          <span
            key={word}
            title={`"${word}" — ${count} mention${count > 1 ? 's' : ''}`}
            style={{
              fontSize: `${fontSize}rem`,
              fontWeight: ratio > 0.6 ? 800 : ratio > 0.3 ? 700 : 600,
              color,
              opacity,
              cursor: 'default',
              transition: 'transform 0.2s, opacity 0.2s',
              display: 'inline-block',
              lineHeight: 1.2,
              fontFamily: "'Syne', sans-serif"
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = String(opacity); e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}