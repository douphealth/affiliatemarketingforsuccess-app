import React, { useEffect, useState } from 'react';
import { GrowthCommandCenter } from './modules/GrowthCommandCenter';
import { WordPressSiteAuditor } from './modules/WordPressSiteAuditor';
import { Top10RewritePrioritizer } from './modules/Top10RewritePrioritizer';
import { AEOVisibilityOptimizer } from './modules/AEOVisibilityOptimizer';
import { TopicalAuthorityMapper } from './modules/TopicalAuthorityMapper';
import { InternalLinkBuilder } from './modules/InternalLinkBuilder';
import { AffiliateMonetizationOptimizer } from './modules/AffiliateMonetizationOptimizer';
import { ContentEditor } from './modules/ContentEditor';
import { Integrations } from './modules/Integrations';
import { ActivityHistory } from './modules/ActivityHistory';

import { 
  LayoutDashboard, 
  ShieldAlert, 
  Sparkles, 
  Cpu, 
  Map, 
  Link2, 
  DollarSign, 
  Edit3, 
  Settings, 
  Activity, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import './index.css';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewParams, setViewParams] = useState<any>(null);
  
  // Site connection states
  const [siteConnected, setSiteConnected] = useState<boolean>(false);
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Connection form states
  const [inputUrl, setInputUrl] = useState<string>('');
  const [scanMethod, setScanMethod] = useState<'simulate' | 'live'>('simulate');
  const [connecting, setConnecting] = useState<boolean>(false);

  const checkConnectedSite = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const json = await response.json();
      if (json.site_connected) {
        setSiteConnected(true);
        setSiteUrl(json.url);
        setSiteName(json.name);
      } else {
        setSiteConnected(false);
      }
    } catch (err) {
      console.error("Error checking connected site:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectedSite();
  }, []);

  const handleConnectSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    setConnecting(true);
    let targetUrl = inputUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          simulate: scanMethod === 'simulate'
        })
      });
      await response.json();
      
      // Wait briefly to simulate progress
      setTimeout(async () => {
        await checkConnectedSite();
        setConnecting(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setConnecting(false);
    }
  };

  const navigateTo = (view: string, params: any = null) => {
    setCurrentView(view);
    setViewParams(params);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <GrowthCommandCenter onNavigate={navigateTo} />;
      case 'auditor':
        return <WordPressSiteAuditor onNavigate={navigateTo} />;
      case 'rewrites':
        return <Top10RewritePrioritizer onNavigate={navigateTo} />;
      case 'aeo':
        return <AEOVisibilityOptimizer />;
      case 'topical':
        return <TopicalAuthorityMapper />;
      case 'links':
        return <InternalLinkBuilder onNavigate={navigateTo} />;
      case 'monetization':
        return <AffiliateMonetizationOptimizer />;
      case 'editor':
        return <ContentEditor pageId={viewParams?.pageId} onNavigate={navigateTo} />;
      case 'integrations':
        return <Integrations />;
      case 'history':
        return <ActivityHistory />;
      default:
        return <GrowthCommandCenter onNavigate={navigateTo} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
    { id: 'auditor', label: 'WP Site Auditor', icon: <ShieldAlert size={18} /> },
    { id: 'rewrites', label: 'Rewrite Prioritizer', icon: <Sparkles size={18} /> },
    { id: 'aeo', label: 'AEO / AI Visibility', icon: <Cpu size={18} /> },
    { id: 'topical', label: 'Topical Authority', icon: <Map size={18} /> },
    { id: 'links', label: 'Internal Linker', icon: <Link2 size={18} /> },
    { id: 'monetization', label: 'Monetization Booster', icon: <DollarSign size={18} /> },
    { id: 'editor', label: 'Content Editor', icon: <Edit3 size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Settings size={18} /> },
    { id: 'history', label: 'Activity Log', icon: <Activity size={18} /> }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
        <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
      </div>
    );
  }

  // If no site is connected, show setup onboarding splash page
  if (!siteConnected) {
    return (
      <div className="setup-overlay">
        <div className="glass-card setup-card" style={{ maxWidth: '600px', padding: '40px' }}>
          <div className="setup-header">
            <div className="logo-icon" style={{ width: '48px', height: '48px', fontSize: '24px', margin: '0 auto 16px auto' }}>A</div>
            <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>AMFS Growth OS</h1>
            <p style={{ color: 'var(--accent-purple)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Sponsored by Affiliate Marketing for Success
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Analyze your site's SEO diagnostics, AI search citations readiness, internal link distributions, and affiliate monetization layout gaps in 60 seconds.
            </p>
          </div>

          <form onSubmit={handleConnectSite} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>Enter Your Website URL</label>
              <input 
                type="text" 
                placeholder="e.g. mytravelblog.com" 
                value={inputUrl} 
                onChange={e => setInputUrl(e.target.value)} 
                className="form-input" 
                style={{ padding: '12px 16px', fontSize: '15px' }}
                required 
                disabled={connecting}
              />
            </div>

            <div className="form-group">
              <label>Auditing Diagnostic Method</label>
              <select 
                value={scanMethod} 
                onChange={e => setScanMethod(e.target.value as any)} 
                className="form-input"
                style={{ padding: '10px 14px', fontSize: '14.5px', background: '#000', cursor: 'pointer' }}
                disabled={connecting}
              >
                <option value="simulate">Simulated Sandbox Diagnostics (Instant)</option>
                <option value="live">Live Outbound Sitemap Scraper (Axios + Cheerio)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }} disabled={connecting}>
              {connecting ? (
                <>Analyzing Website...</>
              ) : (
                <>Run Growth Audit <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Promotion block back to affiliatemarketingforsuccess.com */}
          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Need help starting or optimizing your blog for high conversions?
            </p>
            <a 
              href="https://affiliatemarketingforsuccess.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              <BookOpen size={13} style={{ color: 'var(--accent-purple)' }} />
              Visit Affiliate Marketing for Success Masterclass
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigateTo('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">A</div>
          <span className="logo-text">AMFS Growth OS</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="sidebar-menu">
            {menuItems.map(item => (
              <li 
                key={item.id} 
                className={`sidebar-item ${currentView === item.id || (item.id === 'editor' && currentView === 'editor') ? 'active' : ''}`}
              >
                <button onClick={() => navigateTo(item.id)}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer Site Selector */}
        <div className="sidebar-footer">
          <div className="sidebar-site-info">
            <span className="site-label">Connected Domain</span>
            <span className="site-name" title={siteUrl}>
              {siteName}
            </span>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setSiteConnected(false)} 
              style={{ padding: '4px 8px', fontSize: '10px', marginTop: '8px', border: '1px dashed var(--border-color)', width: '100%' }}
            >
              Analyze Another Site
            </button>
          </div>
          
          {/* Permanent promotion button back to AMFS */}
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <a 
              href="https://affiliatemarketingforsuccess.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600' }}
            >
              <BookOpen size={12} style={{ color: 'var(--accent-purple)' }} />
              AMFS Tutorials Hub
            </a>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Screen */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default App;
