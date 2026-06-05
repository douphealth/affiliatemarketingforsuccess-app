import React, { useEffect, useState } from 'react';
import type { Page, ContentBrief, RewriteTask } from '../types';
import { ShieldAlert, Save, CheckCircle, Clipboard } from 'lucide-react';
import '../components/Gauges.css';
import { apiClient } from '../apiClient';

interface ContentEditorProps {
  pageId?: string;
  onNavigate?: (view: string, extraData?: any) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ pageId }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  
  // Loaded page stats
  const [page, setPage] = useState<Page | null>(null);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [task, setTask] = useState<RewriteTask | null>(null);
  
  // Editor state
  const [content, setContent] = useState('');
  const [titleProposal, setTitleProposal] = useState('');
  const [metaProposal, setMetaProposal] = useState('');
  const [rollbackNotes, setRollbackNotes] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeWidget, setActiveWidget] = useState<string>('brief');

  const fetchPagesList = async () => {
    try {
      const json = await apiClient.getPages();
      setPages(json);
      if (json.length > 0) {
        const initialId = pageId || json[0].id;
        setSelectedPageId(initialId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPageDetails = async (id: string) => {
    try {
      const json = await apiClient.getPageDetails(id);
      setPage(json.page);
      setBrief(json.brief);
      setTask(json.task);
      
      // Seed editor body
      setContent(json.task?.draft_content || json.page?.content_html || '');
      setTitleProposal(json.brief?.title_proposal || json.page?.title || '');
      setMetaProposal(json.brief?.meta_proposal || json.page?.meta_description || '');
      setRollbackNotes(json.task?.rollback_notes || 'Original HTML text backed up. Custom upgrades structured.');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPagesList();
  }, [pageId]);

  useEffect(() => {
    if (selectedPageId) {
      fetchPageDetails(selectedPageId);
    }
  }, [selectedPageId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveDraft = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await apiClient.saveDraft(page.id, {
        draft_content: content,
        status: 'Draft',
        rollback_notes: rollbackNotes
      });
      showToast("Draft successfully saved locally!");
    } catch (err) {
      console.error(err);
      showToast("Failed to save draft.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePushToWordPress = async () => {
    if (!page) return;
    if (!rollbackNotes.trim()) {
      showToast("Safety Error: Rollback notes are required before syncing changes.", "error");
      return;
    }
    setPublishing(true);
    try {
      const json = await apiClient.pushToWordPress(
        page.id,
        content,
        titleProposal,
        metaProposal
      );
      if (json.success) {
        showToast(`Draft pushed to WordPress as Draft ID: wp_${json.wp_post_id}!`);
        // Refresh local details to update task status tag
        fetchPageDetails(page.id);
      } else {
        showToast("WordPress push failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("WordPress connection failed.", "error");
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const handleCopyWpHtml = () => {
    const fullHtml = `<!-- AMFS Growth OS Content Refresh Title: ${titleProposal} -->\n<!-- Meta Description: ${metaProposal} -->\n\n${content}`;
    copyToClipboard(fullHtml, "WordPress full HTML body");
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>AI Content Optimizer Workspace</h1>
          <p className="page-subtitle">Refining and reviewing page optimizations before staging WordPress drafts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'center' }}>Select Page:</span>
          <select 
            value={selectedPageId} 
            onChange={e => setSelectedPageId(e.target.value)} 
            className="form-input" 
            style={{ width: '280px', padding: '6px 12px', background: '#000' }}
          >
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {toast && (
        <div style={{ 
          position: 'fixed', top: '24px', right: '24px', 
          background: toast.type === 'success' ? 'var(--accent-teal)' : 'var(--accent-crimson)',
          color: '#fff', padding: '12px 20px', borderRadius: '8px', 
          boxShadow: 'var(--shadow-premium)', zIndex: 100, 
          fontWeight: '700', fontSize: '14px',
          animation: 'rotate 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {page ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top warning / metadata strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className="badge badge-neutral">Status: {task?.status || 'Analyze'}</span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Original Scores: SEO {page.score_seo} • AEO {page.score_geo} • Monetization {page.score_monetization}
              </span>
            </div>
            
            <button className="btn btn-secondary" onClick={handleCopyWpHtml}>
              <Clipboard size={14} /> Copy full WP HTML
            </button>
          </div>

          {/* Side-by-side editing interface */}
          <div className="editor-workspace">
            
            {/* Left Hand: Writing Canvas */}
            <div className="editor-main">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>SEO Title Tag</label>
                  <input 
                    type="text" 
                    value={titleProposal} 
                    onChange={e => setTitleProposal(e.target.value)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label>Meta Description</label>
                  <input 
                    type="text" 
                    value={metaProposal} 
                    onChange={e => setMetaProposal(e.target.value)} 
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Post HTML Body</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{content.split(/\s+/).length} Words</span>
                </label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  className="editor-textarea"
                  placeholder="Paste or write your WordPress code draft here..." 
                />
              </div>
            </div>

            {/* Right Hand: AI Optimization Widgets sidebar */}
            <div className="editor-sidebar">
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  AI Optimizations Inspector
                </h3>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Widget 1: SEO Brief details */}
                  <div className="accordion-tab">
                    <div className="accordion-header" onClick={() => setActiveWidget(activeWidget === 'brief' ? '' : 'brief')}>
                      <span>1. Target Brief Outlines</span>
                      <span>{activeWidget === 'brief' ? '▼' : '►'}</span>
                    </div>
                    {activeWidget === 'brief' && brief && (
                      <div className="accordion-body">
                        <strong>Target Intent:</strong>
                        <p style={{ margin: '4px 0 10px 0', fontSize: '12px' }}>{brief.target_intent}</p>
                        <strong>Upgrade Skeleton:</strong>
                        <ul style={{ paddingLeft: '14px', margin: '4px 0 10px 0', fontSize: '12px' }}>
                          {brief.outline_json.map((o, idx) => (
                            <li key={idx}>{o.heading}</li>
                          ))}
                        </ul>
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => copyToClipboard(brief.outline_json.map(o => `## ${o.heading}`).join('\n'), 'outline draft')}>
                          Copy Proposed Outline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Widget 2: Featured Snippet Block */}
                  <div className="accordion-tab">
                    <div className="accordion-header" onClick={() => setActiveWidget(activeWidget === 'snippet' ? '' : 'snippet')}>
                      <span>2. Featured Snippet Block (AEO)</span>
                      <span>{activeWidget === 'snippet' ? '▼' : '►'}</span>
                    </div>
                    {activeWidget === 'snippet' && brief && (
                      <div className="accordion-body">
                        <p style={{ background: 'rgba(20,184,166,0.05)', padding: '10px', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', marginBottom: '10px' }}>
                          "{brief.intro_proposal}"
                        </p>
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => copyToClipboard(brief.intro_proposal, 'Snippet intro paragraph')}>
                          Copy Snippet Block HTML
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Widget 3: FAQ Block */}
                  <div className="accordion-tab">
                    <div className="accordion-header" onClick={() => setActiveWidget(activeWidget === 'faq' ? '' : 'faq')}>
                      <span>3. FAQ Block Builder</span>
                      <span>{activeWidget === 'faq' ? '▼' : '►'}</span>
                    </div>
                    {activeWidget === 'faq' && brief && (
                      <div className="accordion-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                          {brief.faqs.map((faq, fidx) => (
                            <div key={fidx} style={{ background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontWeight: '700', fontSize: '11px' }}>Q: {faq.q}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>A: {faq.a}</div>
                            </div>
                          ))}
                        </div>
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => {
                          const html = brief.faqs.map(f => `<h3>${f.q}</h3>\n<p>${f.a}</p>`).join('\n\n');
                          copyToClipboard(html, 'FAQ HTML Block');
                        }}>
                          Copy FAQ HTML Block
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Widget 4: Schema JSON */}
                  <div className="accordion-tab">
                    <div className="accordion-header" onClick={() => setActiveWidget(activeWidget === 'schema' ? '' : 'schema')}>
                      <span>4. Structured JSON-LD Schema</span>
                      <span>{activeWidget === 'schema' ? '▼' : '►'}</span>
                    </div>
                    {activeWidget === 'schema' && brief && (
                      <div className="accordion-body">
                        <pre style={{ fontSize: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px', overflow: 'auto', maxHeight: '120px', borderRadius: '4px', marginBottom: '10px' }}>
                          {JSON.stringify(brief.schema_json, null, 2)}
                        </pre>
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => copyToClipboard(JSON.stringify(brief.schema_json, null, 2), 'JSON-LD Schema')}>
                          Copy Schema JSON
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Widget 5: Affiliate CTA Block */}
                  <div className="accordion-tab">
                    <div className="accordion-header" onClick={() => setActiveWidget(activeWidget === 'cta' ? '' : 'cta')}>
                      <span>5. Affiliate CTA & Table HTML</span>
                      <span>{activeWidget === 'cta' ? '▼' : '►'}</span>
                    </div>
                    {activeWidget === 'cta' && (
                      <div className="accordion-body">
                        <p style={{ fontSize: '11px', marginBottom: '10px' }}>Pre-designed, clean CSS button block configured for conversions:</p>
                        <textarea 
                          readOnly 
                          value={`<div class="amfs-cta-container" style="background:#131520; border:1px solid #2a2c3a; padding:20px; border-radius:8px; text-align:center; margin:20px 0;">\n  <h3>Special Program Recommendation</h3>\n  <p>Start blogging today with our top-rated host platform.</p>\n  <a href="https://bluehost.sjv.io/amfs" target="_blank" rel="nofollow noopener" style="background:#8b5cf6; color:#fff; padding:10px 24px; border-radius:6px; font-weight:700; text-decoration:none; display:inline-block; margin-top:10px;">Sign Up Now</a>\n</div>`}
                          className="form-input" 
                          style={{ height: '80px', fontSize: '11px', width: '100%', fontFamily: 'monospace', resize: 'none', marginBottom: '10px' }}
                        />
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => copyToClipboard(`<div class="amfs-cta-container"...`, 'Affiliate CTA HTML')}>
                          Copy CTA HTML Block
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Publishing workflows & rollback safety */}
          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', fontSize: '13px' }}>
                <ShieldAlert size={16} />
                <strong>Staging & Safety Warning:</strong>
                <span>Rollback notes must be documented. Ensure changes do not break live layouts.</span>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Rollback / Version Notes (Required)</label>
                <input 
                  type="text" 
                  value={rollbackNotes} 
                  onChange={e => setRollbackNotes(e.target.value)} 
                  className="form-input" 
                  placeholder="Example: Backed up 2024 pricing links. Inserted FTC banner above line 10."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={saving} style={{ flex: 1 }}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button className="btn btn-primary" onClick={handlePushToWordPress} disabled={publishing} style={{ flex: 1.5 }}>
                <CheckCircle size={14} /> {publishing ? 'Pushing...' : 'Sync to WordPress'}
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>Select a page to open the editor canvas.</div>
      )}
    </div>
  );
};
