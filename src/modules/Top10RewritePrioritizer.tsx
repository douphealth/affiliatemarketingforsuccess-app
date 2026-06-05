import React, { useEffect, useState } from 'react';
import type { RewriteTask, ContentBrief } from '../types';
import { TrendingDown, Sparkles, Edit3, ArrowRight, Clipboard, ShieldCheck } from 'lucide-react';
import { apiClient } from '../apiClient';

interface Top10RewritePrioritizerProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const Top10RewritePrioritizer: React.FC<Top10RewritePrioritizerProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<RewriteTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<RewriteTask | null>(null);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [activeTab, setActiveTab] = useState<'meta' | 'entities' | 'outline' | 'schema' | 'checklist'>('meta');

  const fetchRewrites = async () => {
    try {
      const json = await apiClient.getRewrites();
      setTasks(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewrites();
  }, []);

  const openBrief = async (task: RewriteTask) => {
    setSelectedTask(task);
    setLoadingBrief(true);
    setActiveTab('meta');
    try {
      const json = await apiClient.getBrief(task.page_id);
      setBrief(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBrief(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Top 10 Rewrite Prioritizer</h1>
          <p className="page-subtitle">Blog posts identified with the highest rank improvement and conversion upside</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tasks.slice(0, 10).map((task, idx) => (
            <div key={task.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 220px', gap: '20px', alignItems: 'center' }}>
              
              {/* Index and Upside composite score circle */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Rank #{idx + 1}</div>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.12)', 
                  border: '1px solid rgba(168, 85, 247, 0.25)', 
                  color: 'var(--accent-purple)',
                  width: '56px', height: '56px', borderRadius: '50%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', fontWeight: '800', fontSize: '18px'
                }}>
                  {task.upside_score}
                  <span style={{ fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', marginTop: '-2px' }}>Upside</span>
                </div>
              </div>

              {/* Main content body details */}
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px' }}>{task.title}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-crimson)', fontWeight: '600' }}>
                    <TrendingDown size={14} /> {task.decay_rate}
                  </span>
                  <span>•</span>
                  <span>Traffic: ~{task.traffic_estimate} monthly visits</span>
                  <span>•</span>
                  <span>Word count: {task.word_count} words</span>
                  <span>•</span>
                  <span>Quality Score: {task.score_quality}/100</span>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <strong>Opportunity focus:</strong> {task.reasons}
                </p>
              </div>

              {/* Action operations side */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openBrief(task)}>
                  <Sparkles size={13} /> Generate Rewrite Brief
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('editor', { pageId: task.page_id })}>
                  <Edit3 size={13} /> Open Content Editor
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Rewrite Brief Generation Popup */}
      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <button className="modal-close" onClick={() => setSelectedTask(null)}>Close</button>
            
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <span className="badge badge-medium" style={{ marginBottom: '8px' }}>AI Overview & AEO Optimizer Ready</span>
              <h2 style={{ margin: 0 }}>Content Refresh Brief</h2>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedTask.title}</p>
            </div>

            {loadingBrief ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
              </div>
            ) : brief ? (
              <div>
                {/* Tabs bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', gap: '8px' }}>
                  <button 
                    onClick={() => setActiveTab('meta')} 
                    className="btn" 
                    style={{ border: 'none', borderBottom: activeTab === 'meta' ? '2px solid var(--accent-purple)' : 'none', color: activeTab === 'meta' ? 'var(--accent-purple)' : 'var(--text-secondary)', padding: '8px 12px', fontSize: '13px', borderRadius: 0 }}
                  >
                    Target & Meta
                  </button>
                  <button 
                    onClick={() => setActiveTab('entities')} 
                    className="btn" 
                    style={{ border: 'none', borderBottom: activeTab === 'entities' ? '2px solid var(--accent-purple)' : 'none', color: activeTab === 'entities' ? 'var(--accent-purple)' : 'var(--text-secondary)', padding: '8px 12px', fontSize: '13px', borderRadius: 0 }}
                  >
                    Entities & FAQs
                  </button>
                  <button 
                    onClick={() => setActiveTab('outline')} 
                    className="btn" 
                    style={{ border: 'none', borderBottom: activeTab === 'outline' ? '2px solid var(--accent-purple)' : 'none', color: activeTab === 'outline' ? 'var(--accent-purple)' : 'var(--text-secondary)', padding: '8px 12px', fontSize: '13px', borderRadius: 0 }}
                  >
                    Outline Proposal
                  </button>
                  <button 
                    onClick={() => setActiveTab('schema')} 
                    className="btn" 
                    style={{ border: 'none', borderBottom: activeTab === 'schema' ? '2px solid var(--accent-purple)' : 'none', color: activeTab === 'schema' ? 'var(--accent-purple)' : 'var(--text-secondary)', padding: '8px 12px', fontSize: '13px', borderRadius: 0 }}
                  >
                    Schema JSON-LD
                  </button>
                  <button 
                    onClick={() => setActiveTab('checklist')} 
                    className="btn" 
                    style={{ border: 'none', borderBottom: activeTab === 'checklist' ? '2px solid var(--accent-purple)' : 'none', color: activeTab === 'checklist' ? 'var(--accent-purple)' : 'var(--text-secondary)', padding: '8px 12px', fontSize: '13px', borderRadius: 0 }}
                  >
                    Upgrades Checklist
                  </button>
                </div>

                {/* Tab content area */}
                <div style={{ minHeight: '260px', paddingBottom: '20px' }}>
                  
                  {/* Meta tab */}
                  {activeTab === 'meta' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label>Target Audience Search Intent</label>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px' }}>
                          {brief.target_intent}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Proposed Upgraded Title Tag (120-155 characters)</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input type="text" readOnly value={brief.title_proposal} className="form-input" style={{ flex: 1 }} />
                          <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(brief.title_proposal)}><Clipboard size={14} /></button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Proposed Upgraded Meta Description</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <textarea readOnly value={brief.meta_proposal} className="form-input" style={{ flex: 1, resize: 'none', height: '60px' }} />
                          <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(brief.meta_proposal)}><Clipboard size={14} /></button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Suggested Answer Block Intro Paragraph (AEO target)</label>
                        <div style={{ background: 'rgba(20,184,166,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(20,184,166,0.15)', fontSize: '13.5px', fontStyle: 'italic' }}>
                          "{brief.intro_proposal}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Entities & FAQs tab */}
                  {activeTab === 'entities' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Semantic Entities to Cover (LSI / AI Relevance)</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {brief.entities.map((ent, idx) => (
                            <span key={idx} className="badge badge-neutral" style={{ textTransform: 'none', fontSize: '12px', padding: '4px 10px', background: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.15)' }}>
                              {ent}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Suggested FAQ Content Blocks</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {brief.faqs.map((faq, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                              <div style={{ fontWeight: '700', fontSize: '13.5px', marginBottom: '4px', color: 'var(--text-primary)' }}>Q: {faq.q}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>A: {faq.a}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outline tab */}
                  {activeTab === 'outline' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Recommended Post Skeleton</h4>
                      {brief.outline_json.map((section, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent-purple)' }}>H2: {section.heading}</div>
                          <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {section.subheadings.map((sub, sidx) => (
                              <li key={sidx} style={{ margin: '4px 0' }}>H3: {sub}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Schema tab */}
                  {activeTab === 'schema' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Structured JSON-LD Schema (Article/HowTo/FAQ)</h4>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(brief.schema_json, null, 2))}>
                          <Clipboard size={14} /> Copy Schema
                        </button>
                      </div>
                      <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px', fontSize: '12px', overflow: 'auto', maxHeight: '200px', fontFamily: 'monospace', color: 'var(--accent-teal)' }}>
                        {JSON.stringify(brief.schema_json, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Upgrade checklist tab */}
                  {activeTab === 'checklist' && (
                    <div>
                      <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Critical Elements Upgrade List</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {brief.upgrade_checklist.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', color: 'var(--accent-teal)' }}><ShieldCheck size={16} /></div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button className="btn btn-primary" onClick={() => { setSelectedTask(null); onNavigate('editor', { pageId: selectedTask.page_id }); }} style={{ flex: 1 }}>
                    Approve Brief & Open Content Editor <ArrowRight size={14} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => setSelectedTask(null)}>
                    Close Brief
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>Brief details missing.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
