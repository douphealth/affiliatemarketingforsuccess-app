import React, { useEffect, useState } from 'react';
import type { Page } from '../types';
import { ShieldAlert, Cpu, CheckCircle, FileText, Clipboard, Download } from 'lucide-react';

export const AEOVisibilityOptimizer: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // llms.txt state
  const [llmsTxt, setLlmsTxt] = useState('');

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const json = await response.json();
      setPages(json);
      if (json.length > 0) {
        setSelectedPage(json.find((p: any) => p.url.includes('ai-tools')) || json[0]);
      }
      
      // Auto compile a beautiful llms.txt mock file
      let text = `# Affiliate Marketing for Success\n\n> This file provides an index of key resources and guides on Affiliate Marketing for Success, optimized for LLM reading, search indexing, and citation.\n\n## Core Guides\n\n`;
      json.forEach((p: Page) => {
        text += `- [${p.title}](${p.url}): ${p.meta_description || 'Detailed guide.'}\n`;
      });
      setLlmsTxt(text);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const getAeoFactors = (page: Page) => {
    const isSeoPage = page.url.includes('seo-review') || page.url.includes('topical');
    
    return [
      { name: "Clear definition block (above the fold)", status: page.score_geo > 70, desc: "A brief 2-sentence summary answering the main search query directly." },
      { name: "FAQ structured block in HTML markup", status: isSeoPage || page.score_geo > 80, desc: "FAQs with clear headers and answers marked with question elements." },
      { name: "Comparative data table structure", status: isSeoPage || page.url.includes('beginners'), desc: "Tables contrasting features, pros, cons, and rates." },
      { name: "Source citation and outlinks references", status: page.score_seo > 80, desc: "Direct references linking out to authoritative domains (e.g. Google, FTC)." },
      { name: "Verified Author E-E-A-T signals", status: page.score_authority > 80, desc: "An author bio box containing social links and professional credentials." },
      { name: "Article / HowTo JSON-LD Schema", status: page.score_geo > 75, desc: "Structured data blocks parsing entities for search spiders." }
    ];
  };

  const getReadinessBadge = (score: number) => {
    if (score >= 85) return <span className="badge badge-low" style={{ background: 'rgba(20, 184, 166, 0.12)', color: 'var(--accent-teal)' }}>Ready</span>;
    if (score >= 70) return <span className="badge badge-high" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>Partial</span>;
    return <span className="badge badge-critical">Needs Optimization</span>;
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>GEO / AEO / AI Visibility Optimizer</h1>
          <p className="page-subtitle">Configure your content to be easily extracted, cited, and summarized by Search AI engines (Perplexity, Gemini, ChatGPT)</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Panel: Pages List */}
          <div className="glass-card" style={{ padding: '20px 16px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Important Pages</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
              {pages.map(page => {
                const isSelected = selectedPage?.id === page.id;
                return (
                  <div 
                    key={page.id} 
                    onClick={() => setSelectedPage(page)}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      background: isSelected ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255,255,255,0.01)',
                      border: isSelected ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {page.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AEO Score: {page.score_geo}</span>
                      {getReadinessBadge(page.score_geo)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Page Audit & llms.txt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {selectedPage && (
              <div className="glass-card">
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>AI Citation Audit for Page</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--accent-purple)' }}>{selectedPage.url}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: selectedPage.score_geo > 80 ? 'var(--accent-teal)' : 'var(--accent-amber)' }}>{selectedPage.score_geo}/100</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Citation Readiness</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px' }}>AEO Factor Check</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {getAeoFactors(selectedPage).map((factor, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ marginTop: '2px' }}>
                            {factor.status ? (
                              <div style={{ color: 'var(--accent-teal)', display: 'flex' }}><CheckCircle size={15} /></div>
                            ) : (
                              <div style={{ color: 'var(--accent-crimson)', display: 'flex' }}><ShieldAlert size={15} /></div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: factor.status ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{factor.name}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{factor.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={16} style={{ color: 'var(--accent-purple)' }} />
                      AI Optimization Tips
                    </h3>
                    
                    {selectedPage.score_geo >= 85 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        This page is in excellent shape! AI engines can parse the structure cleanly. Maintain the verified schemas and ensure internal outbound source links remain active.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>To improve inclusion in AI Overviews and answer bots:</p>
                        <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                          {selectedPage.score_geo < 75 && <li>Insert a 2-sentence summary definition immediately below the primary H1 tag.</li>}
                          {selectedPage.word_count < 1500 && <li>Increase depth and word count to trigger semantic topical coverage indexers.</li>}
                          <li>Convert comparison paragraphs into a styled HTML table with clear head headers.</li>
                          <li>Configure structured JSON-LD schema (FAQ or Article block) inside the code body.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* llms.txt Generator */}
            <div className="glass-card">
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--accent-teal)' }} />
                    Generated llms.txt File
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>Standard declaration file for crawler access optimization</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(llmsTxt)}>
                    <Clipboard size={13} /> Copy Content
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const blob = new Blob([llmsTxt], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'llms.txt';
                    link.click();
                  }}>
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>

              <pre style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', fontSize: '12px', overflow: 'auto', maxHeight: '180px', fontFamily: 'monospace', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {llmsTxt}
              </pre>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
