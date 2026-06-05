import React, { useEffect, useState } from 'react';
import type { SEOIssue } from '../types';
import { AlertCircle, Filter, RefreshCw, Search, ArrowRight } from 'lucide-react';

interface WordPressSiteAuditorProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const WordPressSiteAuditor: React.FC<WordPressSiteAuditorProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [crawling, setCrawling] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<SEOIssue | null>(null);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      const json = await response.json();
      setIssues(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const triggerCrawl = async () => {
    setCrawling(true);
    try {
      await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: true })
      });
      setTimeout(() => {
        fetchIssues();
        setCrawling(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setCrawling(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical': return <span className="badge badge-critical">Critical</span>;
      case 'High': return <span className="badge badge-high">High</span>;
      case 'Medium': return <span className="badge badge-medium">Medium</span>;
      default: return <span className="badge badge-low">Low</span>;
    }
  };

  const formatType = (t: string) => {
    return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      (issue.page_url && issue.page_url.toLowerCase().includes(search.toLowerCase())) ||
      (issue.details?.problem && issue.details.problem.toLowerCase().includes(search.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'All' || issue.priority === priorityFilter;
    const matchesType = typeFilter === 'All' || issue.issue_type === typeFilter;

    return matchesSearch && matchesPriority && matchesType;
  });

  // Unique issue types for filters
  const uniqueTypes = [...new Set(issues.map(i => i.issue_type))];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>WordPress Site Auditor</h1>
          <p className="page-subtitle">Priority queues for structural, internal linking, and meta fixes</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={triggerCrawl} disabled={crawling}>
          <RefreshCw size={14} className={crawling ? 'spinner' : ''} />
          {crawling ? 'Crawling...' : 'Recrawl Diagnostic'}
        </button>
      </div>

      {/* Filter and search toolbar */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by URL or issue name..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="form-input" 
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Priority:</span>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="form-input" style={{ padding: '6px 12px', fontSize: '13px', background: '#000' }}>
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Category:</span>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input" style={{ padding: '6px 12px', fontSize: '13px', background: '#000' }}>
                <option value="All">All Categories</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{formatType(type)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3>No matching audit issues found.</h3>
              <p>Try clearing your filters or running a new diagnostics crawl.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Issue Category</th>
                    <th>Page / Affected URL</th>
                    <th>Problem Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td style={{ width: '100px' }}>{getPriorityBadge(issue.priority)}</td>
                      <td style={{ fontWeight: '600', width: '180px', color: 'var(--text-primary)' }}>
                        {formatType(issue.issue_type)}
                      </td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={issue.page_url}>
                        {issue.page_url ? (
                          <>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {new URL(issue.page_url).hostname.replace('www.', '')}
                            </span>
                            {new URL(issue.page_url).pathname}
                          </>
                        ) : '/'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{issue.details?.problem}</td>
                      <td style={{ width: '120px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIssue(issue)}>
                          Analyze Fix
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detailed Diagnostics Fix Overlay */}
      {selectedIssue && (
        <div className="modal-backdrop" onClick={() => setSelectedIssue(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedIssue(null)}>Close</button>
            
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {getPriorityBadge(selectedIssue.priority)}
                <span className="badge badge-neutral">{formatType(selectedIssue.issue_type)}</span>
              </div>
              <h2 style={{ margin: 0 }}>Fix Diagnostics Details</h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Page: <a href={selectedIssue.page_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>{selectedIssue.page_url}</a>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--accent-crimson)', marginBottom: '6px', fontSize: '13px', textTransform: 'uppercase' }}>Detected Failure Code</h4>
                <div style={{ fontSize: '13.5px', lineHeight: '1.5', background: 'rgba(244, 63, 94, 0.05)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.15)', fontFamily: 'monospace' }}>
                  {selectedIssue.details.evidence}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px', fontSize: '13px' }}>Why It Harms Your Rankings</h4>
                <p style={{ fontSize: '13.5px', lineHeight: '1.4', color: 'var(--text-secondary)' }}>{selectedIssue.details.why_it_matters}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Effort</span>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent-teal)' }}>{selectedIssue.details.effort}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk</span>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent-amber)' }}>{selectedIssue.details.risk}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Impact Upside</span>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent-purple)' }}>{selectedIssue.details.expected_upside}</div>
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--accent-teal)', marginBottom: '6px', fontSize: '13px', textTransform: 'uppercase' }}>Exact WordPress Actionable Fix</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.5', background: 'rgba(20, 184, 166, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontWeight: '600' }}>
                  {selectedIssue.details.exact_fix}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px', fontSize: '13px' }}>Step-by-Step Resolution Guide</h4>
                <div style={{ fontSize: '13.5px', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                  {selectedIssue.details.steps}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '2px', fontSize: '12px' }}>AI Confidence</h4>
                  <div style={{ fontSize: '13.5px', fontWeight: '600' }}>{selectedIssue.details.confidence}</div>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '2px', fontSize: '12px' }}>Post Validation Check</h4>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{selectedIssue.details.validation}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button className="btn btn-primary" onClick={() => { setSelectedIssue(null); onNavigate('editor', { pageId: selectedIssue.page_id }); }} style={{ flex: 1 }}>
                  Open Content Editor <ArrowRight size={14} />
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedIssue(null)}>
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
