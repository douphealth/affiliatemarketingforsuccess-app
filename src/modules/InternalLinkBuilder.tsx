import React, { useEffect, useState } from 'react';
import type { InternalLinkSuggestion } from '../types';
import { Link2, Check, X, Clipboard } from 'lucide-react';
import { apiClient } from '../apiClient';

interface InternalLinkBuilderProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const InternalLinkBuilder: React.FC<InternalLinkBuilderProps> = ({ onNavigate }) => {
  const [links, setLinks] = useState<InternalLinkSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Suggested' | 'Approved' | 'Added'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      const json = await apiClient.getInternalLinks();
      setLinks(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleApprove = async (id: string, newStatus: 'Approved' | 'Added' | 'Rejected') => {
    try {
      await apiClient.approveLink(id, newStatus);
      fetchLinks();
    } catch (err) {
      console.error(err);
    }
  };

  const copyHtml = (link: InternalLinkSuggestion) => {
    const htmlCode = `<a href="${link.target_url}">${link.anchor_text}</a>`;
    navigator.clipboard.writeText(htmlCode);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper to render the sentence with anchor text highlighted
  const renderSentenceContext = (link: InternalLinkSuggestion) => {
    const text = link.sentence_context;
    const anchor = link.anchor_text;
    const index = text.toLowerCase().indexOf(anchor.toLowerCase());
    
    if (index === -1) return <span>{text}</span>;

    const start = text.substring(0, index);
    const middle = text.substring(index, index + anchor.length);
    const end = text.substring(index + anchor.length);

    return (
      <span>
        {start}
        <strong style={{ color: 'var(--accent-purple)', textDecoration: 'underline', background: 'rgba(168, 85, 247, 0.08)', padding: '2px 4px', borderRadius: '4px' }}>
          {middle}
        </strong>
        {end}
      </span>
    );
  };

  const filteredLinks = links.filter(l => statusFilter === 'All' || l.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Added': return <span className="badge badge-low">Added</span>;
      case 'Approved': return <span className="badge badge-medium">Approved (Draft)</span>;
      default: return <span className="badge badge-neutral">Suggested</span>;
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Internal Link Builder</h1>
          <p className="page-subtitle">Suggest semantic internal links to route link juice to high-converting post nodes</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Filter by Status:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Suggested', 'Approved', 'Added'].map((status) => (
              <button 
                key={status} 
                onClick={() => setStatusFilter(status as any)}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredLinks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Link2 size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3>No internal link suggestions found.</h3>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Source Page (Add Link Here)</th>
                    <th>Target Page (Destination)</th>
                    <th>Context Sentence & Anchor Text</th>
                    <th>Action Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr key={link.id}>
                      <td style={{ width: '120px' }}>{getStatusBadge(link.status)}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '600' }}>{link.source_title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {link.source_url ? new URL(link.source_url).pathname : '/'}
                        </div>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '600', color: 'var(--accent-teal)' }}>{link.target_title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {link.target_url ? new URL(link.target_url).pathname : '/'}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '350px' }}>
                        <div style={{ marginBottom: '6px' }}>{renderSentenceContext(link)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Reason: {link.reason}</div>
                      </td>
                      <td style={{ width: '200px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => copyHtml(link)} 
                            title="Copy A-tag HTML Code to Clipboard"
                          >
                            {copiedId === link.id ? 'Copied!' : <Clipboard size={13} />}
                          </button>

                          {link.status === 'Suggested' && (
                            <>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleApprove(link.id, 'Approved')}
                                style={{ padding: '6px 10px' }}
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => handleApprove(link.id, 'Rejected')}
                                style={{ padding: '6px 10px', color: 'var(--accent-crimson)' }}
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}

                          {link.status === 'Approved' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => onNavigate('editor', { pageId: link.source_page_id })}
                              style={{ width: '100%', fontSize: '11px' }}
                            >
                              Insert in Editor
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
