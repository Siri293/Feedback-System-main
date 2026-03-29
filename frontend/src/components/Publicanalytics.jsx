import React, { useEffect, useState } from 'react';
import { feedbackService } from '../services/api.js';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = {
  Positive: '#10B981',
  Negative: '#EF4444',
  Neutral:  '#F59E0B'
};

function StatPill({ label, value, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: '20px 16px',
      textAlign: 'center',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `1px solid ${color}30`,
      flex: '1 1 140px'
    }}>
      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: '2rem',
        color: color
      }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function PublicAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    feedbackService.getAnalytics()
      .then(res => setAnalytics(res.data || res))
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid #E2E8F0',
          borderTopColor: '#4F46E5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px'
        }}></div>
        Loading analytics…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#EF4444', fontSize: '0.9rem' }}>
        ⚠️ {error}
      </div>
    );
  }

  const total    = Number(analytics?.total    || analytics?.total_count    || 0);
  const positive = Number(analytics?.positive || analytics?.positive_count || 0);
  const negative = Number(analytics?.negative || analytics?.negative_count || 0);
  const neutral  = Number(analytics?.neutral  || analytics?.neutral_count  || 0);

  const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0;
  const neutralPct  = total > 0 ? Math.round((neutral  / total) * 100) : 0;

  const pieData = [
    { name: 'Positive', value: positive },
    { name: 'Negative', value: negative },
    { name: 'Neutral',  value: neutral  }
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Positive', count: positive, fill: '#10B981' },
    { name: 'Negative', count: negative, fill: '#EF4444' },
    { name: 'Neutral',  count: neutral,  fill: '#F59E0B' }
  ];

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📊</div>
        <p style={{ fontSize: '0.95rem' }}>No feedback submitted yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)',
          color: '#4F46E5', fontSize: '0.78rem', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '6px 14px', borderRadius: 99, marginBottom: 14
        }}>📊 Live Analytics</div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#1E293B',
          marginBottom: 10
        }}>
          What Our Customers Say
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto' }}>
          Real-time sentiment breakdown based on {total} customer feedback{total !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
        <StatPill label="Total Reviews"      value={total}         color="#2563EB" />
        <StatPill label={`Positive (${positivePct}%)`} value={positive} color="#10B981" />
        <StatPill label={`Negative (${negativePct}%)`} value={negative} color="#EF4444" />
        <StatPill label={`Neutral (${neutralPct}%)`}   value={neutral}  color="#F59E0B" />
      </div>

      {/* Charts row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24
      }}>

        {/* Pie Chart */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9'
        }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1rem', color: '#1E293B', marginBottom: 4
          }}>🥧 Sentiment Distribution</h3>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 16 }}>
            Proportion of positive, negative & neutral reviews
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={value => [`${value} reviews`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9'
        }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1rem', color: '#1E293B', marginBottom: 4
          }}>📊 Feedback Volume</h3>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 16 }}>
            Number of reviews per sentiment category
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                formatter={(value, name) => [`${value} reviews`, name]}
                cursor={{ fill: 'rgba(79,70,229,0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map(entry => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overall verdict banner */}
      <div style={{
        marginTop: 28,
        borderRadius: 14,
        padding: '20px 24px',
        background: positivePct >= 60
          ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)'
          : positivePct >= 40
          ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
          : 'linear-gradient(135deg, #FEE2E2, #FECACA)',
        border: `1px solid ${positivePct >= 60 ? '#6EE7B7' : positivePct >= 40 ? '#FCD34D' : '#FCA5A5'}`,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '2rem' }}>
          {positivePct >= 60 ? '🎉' : positivePct >= 40 ? '🙂' : '⚠️'}
        </div>
        <div>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            color: positivePct >= 60 ? '#065F46' : positivePct >= 40 ? '#92400E' : '#991B1B',
            fontSize: '1rem', marginBottom: 4
          }}>
            {positivePct >= 60
              ? 'Customers love it! 🌟'
              : positivePct >= 40
              ? 'Mixed reviews — room to improve'
              : 'Needs attention — customer satisfaction is low'}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: positivePct >= 60 ? '#047857' : positivePct >= 40 ? '#B45309' : '#B91C1C'
          }}>
            {positivePct}% of customers left positive feedback out of {total} total reviews.
          </div>
        </div>
      </div>
    </div>
  );
}