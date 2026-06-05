import React, { useState } from 'react';
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
  Globe 
} from 'lucide-react';
import './index.css';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewParams, setViewParams] = useState<any>(null);

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

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
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
            <span className="site-label">Monitored Web Host</span>
            <span className="site-name" title="affiliatemarketingforsuccess.com">
              affiliatemarketingforsuccess.com
            </span>
            <span className="site-status">
              <Globe size={11} />
              <span>Active scan profiles</span>
            </span>
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
