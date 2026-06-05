import React, { useEffect, useState } from 'react';
import { ShieldCheck, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { apiClient } from '../apiClient';

export const AffiliateMonetizationOptimizer: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const fetchMonetization = async () => {
    try {
      const json = await apiClient.getMonetization();
      setData(json);
      if (json.reviews.length > 0) {
        setSelectedReviewId(json.reviews[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonetization();
  }, []);

  const selectedReview = data?.reviews.find((r: any) => r.id === selectedReviewId);

  const getMonetizationScoreBadge = (score: number) => {
    if (score >= 80) return <span className="badge badge-low" style={{ background: 'rgba(20, 184, 166, 0.12)', color: 'var(--accent-teal)' }}>{score} Good</span>;
    if (score >= 60) return <span className="badge badge-high" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>{score} Med</span>;
    return <span className="badge badge-critical">{score} Weak</span>;
  };

  const getConversionChecklist = (review: any) => {
    return [
      { label: "Visible Legal FTC Affiliate Disclosure", status: review.has_disclosure, fix: "Insert standard disclosure block above any active product link." },
      { label: "Above-the-Fold Primary CTA Button", status: review.score_monetization > 70, fix: "Insert a high-contrast 'Check Price' button in the intro section." },
      { label: "Product Summary Box (Brief specs)", status: review.word_count > 3000, fix: "Create an styled box summarizing features, pros, cons, and rating." },
      { label: "Interactive Comparison Table (Features/Pricing)", status: review.has_table, fix: "Build a comparison table contrasting competitor features." },
      { label: "Affiliate Link Sub-tag Tracking (GSC/GA4 tracking)", status: review.score_monetization > 60, fix: "Append unique campaign trackers (?utm_source=amfs_os) for conversion attribution." },
      { label: "Alternatives & Pros/Cons breakdown", status: true, fix: "Done." }
    ];
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Affiliate Monetization Optimizer</h1>
          <p className="page-subtitle">Increase conversion rates and commissions on commercial review pages without inflating statements or fabricating earnings</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Panel: Review pages list and Detail Audits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Commercial Posts Table */}
            <div className="glass-card">
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: 'var(--accent-amber)' }} />
                Commercial / Review Articles
              </h3>
              <div className="table-wrapper" style={{ margin: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Commercial Article Title</th>
                      <th>Traffic Est</th>
                      <th>Monetization Score</th>
                      <th>Disclosure</th>
                      <th>CTA Blocks</th>
                      <th>Features Table</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.reviews.map((rev: any) => (
                      <tr key={rev.id} style={{ background: selectedReviewId === rev.id ? 'rgba(255,255,255,0.02)' : 'none' }}>
                        <td style={{ fontWeight: '700' }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => setSelectedReviewId(rev.id)}>{rev.title}</span>
                        </td>
                        <td>{rev.traffic_estimate} /mo</td>
                        <td>{getMonetizationScoreBadge(rev.score_monetization)}</td>
                        <td>
                          {rev.has_disclosure ? <span style={{ color: 'var(--accent-teal)' }}>Yes</span> : <span style={{ color: 'var(--accent-crimson)' }}>Missing</span>}
                        </td>
                        <td>
                          {rev.has_cta ? <span style={{ color: 'var(--accent-teal)' }}>Yes</span> : <span style={{ color: 'var(--accent-amber)' }}>Add CTA</span>}
                        </td>
                        <td>
                          {rev.has_table ? <span style={{ color: 'var(--accent-teal)' }}>Yes</span> : <span style={{ color: 'var(--text-muted)' }}>Missing</span>}
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReviewId(rev.id)}>
                            Inspect Audits
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Post Conversion Audits */}
            {selectedReview && (
              <div className="glass-card">
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>Monetization Conversion Checklist</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--accent-purple)' }}>{selectedReview.title}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {getConversionChecklist(selectedReview).map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.status ? (
                          <div style={{ color: 'var(--accent-teal)', display: 'flex' }}><ShieldCheck size={16} /></div>
                        ) : (
                          <div style={{ color: 'var(--accent-amber)', display: 'flex' }}><AlertCircle size={16} /></div>
                        )}
                        <span style={{ fontSize: '13px', fontWeight: '700', color: item.status ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {item.label}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {item.status ? (
                          <span style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>Passed check</span>
                        ) : (
                          <div>
                            <span style={{ color: 'var(--accent-amber)', fontWeight: '600' }}>Action Fix: </span>
                            {item.fix}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Affiliate Networks Setup */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={16} style={{ color: 'var(--accent-teal)' }} />
              Merchant Affiliate Offers
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Tracked program redirection targets configured for `affiliatemarketingforsuccess.com`:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.offers.map((offer: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '13.5px' }}>{offer.name}</span>
                    <span className="badge badge-low" style={{ fontSize: '9px' }}>{offer.status}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Merchant: {offer.merchant}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-purple)', wordBreak: 'break-all', marginTop: '6px', fontFamily: 'monospace' }}>
                    {offer.redirect_url}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
