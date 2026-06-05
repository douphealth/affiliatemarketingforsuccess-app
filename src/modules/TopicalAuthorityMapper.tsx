import React, { useEffect, useState } from 'react';
import type { TopicCluster } from '../types';
import { GitPullRequest, LayoutGrid } from 'lucide-react';

export const TopicalAuthorityMapper: React.FC = () => {
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [nextActions, setNextActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/clusters');
      const json = await response.json();
      setClusters(json.clusters);
      setNextActions(json.nextActions);
      if (json.clusters.length > 0) {
        setSelectedClusterId(json.clusters[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const selectedCluster = clusters.find(c => c.id === selectedClusterId);

  const getPriorityBadge = (p: string) => {
    if (p === 'High') return <span className="badge badge-high">High</span>;
    return <span className="badge badge-medium">Medium</span>;
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Topical Authority Mapper</h1>
          <p className="page-subtitle">Visual hub-spoke semantic cluster maps for <strong>affiliatemarketingforsuccess.com</strong></p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Panel: Clusters List */}
          <div className="glass-card" style={{ padding: '20px 16px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Topic Clusters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clusters.map(cluster => {
                const isSelected = selectedClusterId === cluster.id;
                return (
                  <div 
                    key={cluster.id}
                    onClick={() => setSelectedClusterId(cluster.id)}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255,255,255,0.01)',
                      border: isSelected ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '13.5px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {cluster.name}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {cluster.articles?.length || 0} Pages
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      {cluster.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Hub-Spoke detail & next Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {selectedCluster && (
              <div className="glass-card">
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
                  <span className="badge badge-neutral" style={{ marginBottom: '4px' }}>Cluster Map View</span>
                  <h2 style={{ margin: 0 }}>{selectedCluster.name} Semantic Map</h2>
                </div>

                {/* Hub representation */}
                <div style={{ background: 'rgba(168, 85, 247, 0.03)', border: '2px dashed rgba(168, 85, 247, 0.3)', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-10px', left: '16px', background: 'var(--bg-surface)', padding: '0 8px', fontSize: '10px', color: 'var(--accent-purple)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Hub Page (Pillar Content)
                  </span>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedCluster.hub_title || 'Direct Index Hub'}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedCluster.hub_url}</div>
                </div>

                {/* Spokes representation */}
                <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Spoke Pages (Sub-topics)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {selectedCluster.articles?.map(art => {
                    // Score evaluation color
                    let scoreColor = 'good';
                    if (art.score < 80) scoreColor = 'warning';
                    if (art.score < 70) scoreColor = 'poor';

                    return (
                      <div key={art.id} className="node-item">
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', fontWeight: '600' }} title={art.title}>
                          {art.title}
                        </div>
                        <span className={`node-score ${scoreColor}`}>
                          {art.score} SEO
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Merge Candidate Detection */}
            <div className="glass-card">
              <h3 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitPullRequest size={16} style={{ color: 'var(--accent-amber)' }} />
                Cannibalization & Merge Suggestions
              </h3>
              <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '6px', color: 'var(--accent-amber)' }}>
                  <GitPullRequest size={18} />
                </div>
                <div style={{ flex: 1, fontSize: '13.5px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Suggested Merge: Topical Authority & SEO Strategy overlap</div>
                  <p style={{ margin: '4px 0 10px 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Pages `/topical-authority-seo-guide/` and `/seo-tips-for-success/` target similar keyword scopes. Merging them into a single comprehensive resource will aggregate link equity and prevent self-cannibalization.
                  </p>
                  <button className="btn btn-secondary btn-sm">
                    Configure Redirect Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Publish backlog */}
            <div className="glass-card">
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutGrid size={16} style={{ color: 'var(--accent-teal)' }} />
                Next 20 Content Actions (Gap Backlog)
              </h3>
              <div className="table-wrapper" style={{ margin: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Action Target Title</th>
                      <th>Category</th>
                      <th>Cluster</th>
                      <th>Priority</th>
                      <th>SEO Score Upside</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nextActions.map((action, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700' }}>{action.title}</td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'none' }}>{action.type}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{action.cluster}</td>
                        <td>{getPriorityBadge(action.priority)}</td>
                        <td style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>+{action.score_impact} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
