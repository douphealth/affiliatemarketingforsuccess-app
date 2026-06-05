import React, { useEffect, useState } from 'react';
import type { Integration } from '../types';
import { Link, Settings } from 'lucide-react';
import { apiClient } from '../apiClient';

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  // WordPress form credentials
  const [wpUrl, setWpUrl] = useState('https://affiliatemarketingforsuccess.com');
  const [wpUser, setWpUser] = useState('');
  const [wpPass, setWpPass] = useState('');

  const fetchIntegrations = async () => {
    try {
      const json = await apiClient.getIntegrations();
      setIntegrations(json);
      
      const wp = json.find((i: any) => i.id === 'int_wp');
      if (wp && wp.credentials_encrypted) {
        const creds = JSON.parse(wp.credentials_encrypted);
        setWpUrl(creds.url || 'https://affiliatemarketingforsuccess.com');
        setWpUser(creds.username || '');
        setWpPass('********');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnectWp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpUser || !wpPass) return;
    
    try {
      await apiClient.updateIntegration(
        'int_wp',
        'Connected',
        JSON.stringify({ url: wpUrl, username: wpUser })
      );
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await apiClient.updateIntegration(id, 'Disconnected', null);
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickConnect = async (id: string) => {
    try {
      await apiClient.updateIntegration(
        id,
        'Connected',
        JSON.stringify({ key: `mock_active_key_${id}` })
      );
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>System Integrations</h1>
          <p className="page-subtitle">Hook up WordPress APIs and analytic profiles (App works in crawl-only mode when disconnected)</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          
          {/* Main List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* WordPress setup box */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} style={{ color: 'var(--accent-purple)' }} />
                  WordPress REST API Connection
                </h3>
                {integrations.find(i => i.id === 'int_wp')?.status === 'Connected' ? (
                  <span className="badge badge-low">Connected</span>
                ) : (
                  <span className="badge badge-neutral">Disconnected</span>
                )}
              </div>

              <form onSubmit={handleConnectWp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>WordPress Site Base URL</label>
                  <input type="text" value={wpUrl} onChange={e => setWpUrl(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label>REST API Username</label>
                  <input type="text" value={wpUser} onChange={e => setWpUser(e.target.value)} className="form-input" placeholder="e.g. admin" required />
                </div>
                <div className="form-group">
                  <label>Application Password (16 Characters)</label>
                  <input type="password" value={wpPass} onChange={e => setWpPass(e.target.value)} className="form-input" placeholder="xxxx xxxx xxxx xxxx" required />
                </div>
                
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Verify & Connect WordPress
                  </button>
                  {integrations.find(i => i.id === 'int_wp')?.status === 'Connected' && (
                    <button type="button" className="btn btn-secondary" onClick={() => handleDisconnect('int_wp')} style={{ color: 'var(--accent-crimson)' }}>
                      Disconnect
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Other services */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px' }}>Analytics & Core Tools</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {integrations.filter(i => i.id !== 'int_wp').map(int => (
                  <div key={int.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px 18px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{int.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {int.status === 'Connected' ? 'Integrating data profiles' : 'API Key connection missing'}
                      </div>
                    </div>
                    <div>
                      {int.status === 'Connected' ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDisconnect(int.id)} style={{ color: 'var(--accent-crimson)' }}>
                          Disconnect
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => handleQuickConnect(int.id)}>
                          Connect Setup
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Crawler sidebar details */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Link size={16} style={{ color: 'var(--accent-teal)' }} />
              Crawl-Only Status
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              If you don't connect your WordPress REST API, AMFS Growth OS operates in **Crawl-Only Mode**.
            </p>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: 'var(--accent-teal)' }}>✓ Can audit sitemaps and pages</div>
              <div style={{ color: 'var(--accent-teal)' }}>✓ Can perform semantic mapping</div>
              <div style={{ color: 'var(--accent-teal)' }}>✓ Can write AI rewrite content drafts</div>
              <div style={{ color: 'var(--text-muted)' }}>✗ Cannot push drafts to WordPress backend</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
