import React, { useEffect, useState } from 'react';
import { ScoreGauge } from '../components/ScoreGauge';
import type { Recommendation } from '../types';
import { Play, Sparkles, Check, CheckCircle2, ChevronRight, HelpCircle, BookOpen } from 'lucide-react';
import { apiClient } from '../apiClient';

interface GrowthCommandCenterProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const GrowthCommandCenter: React.FC<GrowthCommandCenterProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [crawlMode, setCrawlMode] = useState<'live' | 'simulate'>('simulate');

  const fetchDashboardData = async () => {
    try {
      const json = await apiClient.getDashboard();
      setData(json);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerCrawl = async () => {
    if (!data?.url) return;
    setCrawling(true);
    try {
      await apiClient.triggerCrawl(data.url, crawlMode === 'simulate');
      // Poll dashboard stats after launch
      setTimeout(() => {
        fetchDashboardData();
        setCrawling(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setCrawling(false);
    }
  };

  const approveRecommendation = async (rec: Recommendation) => {
    setApprovingId(rec.id);
    try {
      // Simulate API sync by calling local db helper
      await apiClient.getInternalLinks();
      
      // Let's create an activity log entry or just alert
      setTimeout(() => {
        setSelectedRec(null);
        setApprovingId(null);
        // Refresh dashboard data
        fetchDashboardData();
        // Redirect to Content Editor for the page
        onNavigate('editor', { pageId: rec.page_id });
      }, 1000);
    } catch (err) {
      console.error(err);
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
      </div>
    );
  }

  const scores = data?.scores || { growth: 0, seo: 0, geo: 0, authority: 0, monetization: 0, technical: 0, quality: 0 };
  const recs = data?.recommendations || [];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Growth Command Center</h1>
          <p className="page-subtitle">Daily strategy and scores for <strong>{data?.name || 'your domain'}</strong></p>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '16px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scan Method:</span>
            <select 
              value={crawlMode} 
              onChange={(e) => setCrawlMode(e.target.value as 'live' | 'simulate')}
              className="form-input" 
              style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', background: '#000' }}
            >
              <option value="simulate">Simulate Sandbox (Recommended)</option>
              <option value="live">Live Outbound Scrape</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={triggerCrawl} disabled={crawling}>
            <Play size={14} />
            {crawling ? 'Crawling Site...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>

      {/* Score overview gauges grid */}
      <div className="dashboard-grid">
        <ScoreGauge score={scores.growth} title="Composite Growth" colorClass="purple" />
        <ScoreGauge score={scores.seo} title="SEO Health" colorClass="teal" />
        <ScoreGauge score={scores.geo} title="GEO/AEO Visibility" colorClass="cyan" />
        <ScoreGauge score={scores.authority} title="Topical Authority" colorClass="purple" />
        <ScoreGauge score={scores.monetization} title="Monetization" colorClass="amber" />
        <ScoreGauge score={scores.technical} title="Technical Health" colorClass="crimson" />
        <ScoreGauge score={scores.quality} title="Content Quality" colorClass="teal" />
      </div>

      {/* Main split: Today's Actions (Left) and Safety checklist (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-purple)' }} />
              Today's 5 Highest-Impact Actions
            </h2>
            <span className="badge badge-high">Priority Queue</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--accent-teal)', marginBottom: '16px' }} />
                <h3>All Diagnostics Clean!</h3>
                <p>No critical recommendations pending. Run a new crawl diagnostics scan to check for updates.</p>
              </div>
            ) : (
              recs.map((rec: Recommendation, idx: number) => {
                // Determine color indicators based on index
                const badgeColors = ['badge-critical', 'badge-high', 'badge-high', 'badge-medium', 'badge-low'];
                const badgeLabels = ['Critical', 'High', 'High', 'Medium', 'Medium'];
                
                return (
                  <div key={rec.id} className="action-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedRec(rec)}>
                    <div className="action-number">{idx + 1}</div>
                    <div className="action-content">
                      <div className="action-title">{rec.title}</div>
                      <div className="action-desc">{rec.description}</div>
                      <div className="action-footer">
                        <span className={`badge ${badgeColors[idx]}`}>{badgeLabels[idx]} Priority</span>
                        <span className="badge badge-neutral">Upside: {rec.details_json.expected_upside}</span>
                        <span className="badge badge-neutral">Effort: {rec.details_json.effort}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-teal)' }} />
            Safety Shield
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            AMFS Growth OS operates with a strict <strong>human-in-the-loop validation gate</strong>. Changes are never automatically published.
          </p>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
              <div style={{ color: 'var(--accent-teal)', display: 'flex' }}><Check size={16} /></div>
              <span>Safe Sandbox analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
              <div style={{ color: 'var(--accent-teal)', display: 'flex' }}><Check size={16} /></div>
              <span>WordPress REST draft sync</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
              <div style={{ color: 'var(--accent-teal)', display: 'flex' }}><Check size={16} /></div>
              <span>FTC disclosure checking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <div style={{ color: 'var(--accent-teal)', display: 'flex' }}><Check size={16} /></div>
              <span>Schema markup validation</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('history')} style={{ marginTop: '10px' }}>
            View Action History
          </button>
        </div>
      </div>

      {/* Recommendation Detailed Modal */}
      {selectedRec && (
        <div className="modal-backdrop" onClick={() => setSelectedRec(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <button className="modal-close" onClick={() => setSelectedRec(null)}>Close</button>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-critical">Action recommendation</span>
                <span className="badge badge-neutral">Confidence: {selectedRec.details_json.confidence}</span>
              </div>
              <h2 style={{ margin: 0 }}>{selectedRec.title}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--accent-crimson)', marginBottom: '6px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Problem Description</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.5', background: 'rgba(244, 63, 94, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                  {selectedRec.details_json.problem}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Evidence</h4>
                  <p style={{ fontSize: '13.5px', lineHeight: '1.4' }}>{selectedRec.details_json.evidence}</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Why It Matters</h4>
                  <p style={{ fontSize: '13.5px', lineHeight: '1.4' }}>{selectedRec.details_json.why_it_matters}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Effort Required</span>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--accent-teal)' }}>{selectedRec.details_json.effort}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Level</span>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--accent-amber)' }}>{selectedRec.details_json.risk}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Upside</span>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--accent-purple)' }}>{selectedRec.details_json.expected_upside}</div>
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--accent-teal)', marginBottom: '6px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proposed Fix</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.5', background: 'rgba(20, 184, 166, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontWeight: '600' }}>
                  {selectedRec.details_json.exact_fix}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '13px' }}>Implementation Steps</h4>
                <ol style={{ paddingLeft: '20px', fontSize: '13.5px', lineHeight: '1.6' }}>
                  {selectedRec.details_json.steps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Validation Method</h4>
                <p style={{ fontSize: '13.5px' }}>{selectedRec.details_json.validation}</p>
              </div>

              {/* Contextual Affiliate Marketing for Success Masterclass Tutorial Guide Link */}
              <div style={{ marginTop: '8px', background: 'rgba(168, 85, 247, 0.04)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.12)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <BookOpen size={16} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong>Need Help?</strong> Read the step-by-step masterclass tutorial on <a href="https://affiliatemarketingforsuccess.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', fontWeight: '700', textDecoration: 'underline' }}>Affiliate Marketing for Success</a> to implement this fix successfully.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button className="btn btn-primary" onClick={() => approveRecommendation(selectedRec)} disabled={approvingId !== null} style={{ flex: 1 }}>
                  {approvingId ? 'Initiating Draft...' : 'Approve & Optimize in Content Editor'}
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedRec(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
