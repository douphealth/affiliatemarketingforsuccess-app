import type { Site, Page, TopicCluster, SEOIssue, RewriteTask, ContentBrief, InternalLinkSuggestion, AffiliateOffer, Recommendation, Integration, ActivityLog } from './types';
import { localDb, getStore, setStore, logActivityLocal } from './utils/localDb';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  // 1. Dashboard calculations
  async getDashboard() {
    await delay(150);
    const sites = getStore<Site[]>('amfs_sites', []);
    if (sites.length === 0) {
      return {
        site_connected: false,
        scores: { growth: 0, seo: 0, geo: 0, authority: 0, monetization: 0, technical: 0, quality: 0 },
        recommendations: []
      };
    }

    const site = sites[0];
    const pages = getStore<Page[]>('amfs_pages', []);
    const recommendations = getStore<Recommendation[]>('amfs_recommendations', []);

    if (pages.length === 0) {
      return {
        site_connected: true,
        url: site.url,
        name: site.name,
        scores: { growth: 0, seo: 0, geo: 0, authority: 0, monetization: 0, technical: 0, quality: 0 },
        recommendations: []
      };
    }

    // Calculate composites
    const sum = (field: keyof Page) => pages.reduce((acc, p) => acc + (Number(p[field]) || 0), 0);
    const avg = (field: keyof Page) => Math.round(sum(field) / pages.length);

    const seo = avg('score_seo');
    const geo = avg('score_geo');
    const monetization = avg('score_monetization');
    const authority = avg('score_authority');
    const technical = avg('score_technical');
    const quality = avg('score_quality');
    const growth = Math.round((seo * 0.25) + (geo * 0.15) + (monetization * 0.20) + (authority * 0.15) + (technical * 0.10) + (quality * 0.15));

    const activeRecs = recommendations.filter(r => r.status === 'Active').slice(0, 5);

    return {
      site_connected: true,
      url: site.url,
      name: site.name,
      scores: { growth, seo, geo, authority, monetization, technical, quality },
      recommendations: activeRecs
    };
  },

  // 2. Crawler
  async triggerCrawl(url: string, simulate: boolean) {
    await delay(1200);
    localDb.seedForSite(url);

    // Create crawl log
    const crawls = getStore<any[]>('amfs_crawls', []);
    const pages = getStore<Page[]>('amfs_pages', []);
    const issues = getStore<SEOIssue[]>('amfs_issues', []);

    const newCrawl = {
      id: 'crl_' + Math.random().toString(36).substr(2, 9),
      site_id: 'site_user',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'Completed' as const,
      pages_crawled: pages.length,
      issues_found: issues.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    crawls.unshift(newCrawl);
    setStore('amfs_crawls', crawls);

    logActivityLocal('Diagnostics Scan', `Completed growth diagnostics scan for ${url}. Mode: ${simulate ? 'Simulation' : 'Live Crawl'}.`);
    return { success: true };
  },

  // 3. Page list & Auditor
  async getPages() {
    await delay(100);
    return getStore<Page[]>('amfs_pages', []);
  },

  async getPageDetails(id: string) {
    await delay(100);
    const pages = getStore<Page[]>('amfs_pages', []);
    const page = pages.find(p => p.id === id) || null;
    
    if (!page) return { page: null, issues: [], brief: null, task: null };

    const issues = getStore<SEOIssue[]>('amfs_issues', []).filter(i => i.page_id === id);
    const briefs = getStore<ContentBrief[]>('amfs_briefs', []);
    const brief = briefs.find(b => b.page_id === id) || null;
    
    const tasks = getStore<RewriteTask[]>('amfs_tasks', []);
    const task = tasks.find(t => t.page_id === id) || null;

    return { page, issues, brief, task };
  },

  async getIssues() {
    await delay(100);
    const issues = getStore<SEOIssue[]>('amfs_issues', []);
    const pages = getStore<Page[]>('amfs_pages', []);

    return issues.map(issue => {
      const page = pages.find(p => p.id === issue.page_id);
      return {
        ...issue,
        page_url: page ? page.url : 'Unknown',
        page_title: page ? page.title : 'Unknown'
      };
    });
  },

  // 4. Top 10 Rewrite Prioritizer
  async getRewrites() {
    await delay(100);
    const tasks = getStore<RewriteTask[]>('amfs_tasks', []);
    const pages = getStore<Page[]>('amfs_pages', []);

    return tasks.map(task => {
      const page = pages.find(p => p.id === task.page_id);
      return {
        ...task,
        url: page ? page.url : 'Unknown',
        title: page ? page.title : 'Unknown',
        word_count: page ? page.word_count : 0,
        traffic_estimate: page ? page.traffic_estimate : 0,
        score_quality: page ? page.score_quality : 0,
        score_seo: page ? page.score_seo : 0
      };
    }).sort((a, b) => (b.upside_score || 0) - (a.upside_score || 0));
  },

  async getBrief(pageId: string) {
    await delay(100);
    const briefs = getStore<ContentBrief[]>('amfs_briefs', []);
    const brief = briefs.find(b => b.page_id === pageId);
    
    if (brief) return brief;

    // Generate fallback brief
    const pages = getStore<Page[]>('amfs_pages', []);
    const page = pages.find(p => p.id === pageId);
    
    const newBrief: ContentBrief = {
      id: 'brf_' + Math.random().toString(36).substr(2, 9),
      page_id: pageId,
      target_intent: 'Informational - users searching for optimization answers.',
      entities: ['SEO strategy', 'content optimization', 'Google search indexing'],
      faqs: [{ q: 'How does optimization work?', a: 'By structuring pages, schemas, and answers accurately.' }],
      internal_links_suggested: ['/'],
      affiliate_opportunities: [],
      schema_json: {},
      title_proposal: `${page ? page.title : 'Guide'} - Upgraded Guide`,
      meta_proposal: `Improve your website traffic with our upgraded resource. Read the full guide.`,
      intro_proposal: 'Let\'s optimize our methods to get higher search engine rankings.',
      outline_json: [{ heading: 'Introduction', subheadings: ['Overview', 'Key terms'] }],
      upgrade_checklist: ['Add introductory definitions', 'Check internal link coverage'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    briefs.push(newBrief);
    setStore('amfs_briefs', briefs);
    return newBrief;
  },

  async saveBrief(pageId: string, briefData: any) {
    await delay(100);
    const briefs = getStore<ContentBrief[]>('amfs_briefs', []);
    const idx = briefs.findIndex(b => b.page_id === pageId);
    if (idx !== -1) {
      briefs[idx] = { ...briefs[idx], ...briefData, updated_at: new Date().toISOString() };
      setStore('amfs_briefs', briefs);
      logActivityLocal('Brief Saved', `Updated content brief parameters for page ${pageId}`);
    }
  },

  async saveDraft(pageId: string, draftData: any) {
    await delay(150);
    const tasks = getStore<RewriteTask[]>('amfs_tasks', []);
    const idx = tasks.findIndex(t => t.page_id === pageId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...draftData, updated_at: new Date().toISOString() };
      setStore('amfs_tasks', tasks);
      logActivityLocal('Draft Saved', `Saved local writing draft for page ${pageId}`);
    }
  },

  // 5. Internal Links
  async getInternalLinks() {
    await delay(100);
    const links = getStore<InternalLinkSuggestion[]>('amfs_links', []);
    const pages = getStore<Page[]>('amfs_pages', []);

    return links.map(link => {
      const source = pages.find(p => p.id === link.source_page_id);
      const target = pages.find(p => p.id === link.target_page_id);
      return {
        ...link,
        source_url: source ? source.url : 'Unknown',
        source_title: source ? source.title : 'Unknown',
        target_url: target ? target.url : 'Unknown',
        target_title: target ? target.title : 'Unknown'
      };
    });
  },

  async approveLink(id: string, status: 'Suggested' | 'Approved' | 'Added' | 'Rejected') {
    await delay(100);
    const links = getStore<InternalLinkSuggestion[]>('amfs_links', []);
    const idx = links.findIndex(l => l.id === id);
    if (idx !== -1) {
      links[idx].status = status;
      links[idx].updated_at = new Date().toISOString();
      setStore('amfs_links', links);
      logActivityLocal('Link Approved', `Internal link suggestion set to status "${status}".`);
    }
  },

  // 6. Topical Clusters
  async getClusters() {
    await delay(100);
    const clusters = getStore<TopicCluster[]>('amfs_clusters', []);
    const pages = getStore<Page[]>('amfs_pages', []);

    const joinedClusters = clusters.map(cluster => {
      const hub = pages.find(p => p.id === cluster.hub_page_id);
      const articles = pages.filter(p => {
        const url = p.url.toLowerCase();
        if (cluster.id === 'c_blog') return url.includes('hosting') || url.includes('home');
        if (cluster.id === 'c_seo') return url.includes('seo') || url.includes('tools');
        if (cluster.id === 'c_mon') return url.includes('monetize') || url.includes('hosting');
        return false;
      }).map(p => ({ id: p.id, title: p.title, url: p.url, score: p.score_seo }));

      return {
        ...cluster,
        hub_url: hub ? hub.url : '',
        hub_title: hub ? hub.title : '',
        articles
      };
    });

    const nextActions = [
      { title: 'Choosing the right blogging niche for monetization', type: 'New Post', cluster: 'Blogging & Setup', priority: 'High', difficulty: 'Medium', score_impact: 18 },
      { title: 'Google Helpful Content updates checklist', type: 'New Post', cluster: 'SEO & Visibility', priority: 'High', difficulty: 'Medium', score_impact: 15 },
      { title: 'High commission affiliate networks comparison', type: 'New Post', cluster: 'Affiliate Monetization', priority: 'High', difficulty: 'Hard', score_impact: 16 },
      { title: 'Yoast vs RankMath XML Sitemaps setup guide', type: 'Refresh Post', cluster: 'SEO & Visibility', priority: 'Medium', difficulty: 'Low', score_impact: 12 }
    ];

    return { clusters: joinedClusters, nextActions };
  },

  // 7. Affiliate Monetization
  async getMonetization() {
    await delay(100);
    const pages = getStore<Page[]>('amfs_pages', []);
    const offers = getStore<AffiliateOffer[]>('amfs_offers', []);

    const reviews = pages.filter(p => p.url.includes('review') || p.url.includes('best') || p.url.includes('how-to-monetize'))
      .map(p => ({
        id: p.id,
        title: p.title,
        url: p.url,
        score_monetization: p.score_monetization,
        word_count: p.word_count,
        traffic_estimate: p.traffic_estimate,
        has_disclosure: p.score_monetization > 50,
        has_table: p.word_count > 2000,
        has_cta: p.score_monetization > 70
      }));

    return { reviews, offers };
  },

  // 8. Integrations
  async getIntegrations() {
    await delay(100);
    return getStore<Integration[]>('amfs_integrations', []);
  },

  async updateIntegration(id: string, status: 'Connected' | 'Disconnected', credentials_encrypted: string | null) {
    await delay(100);
    const integrations = getStore<Integration[]>('amfs_integrations', []);
    const idx = integrations.findIndex(i => i.id === id);
    if (idx !== -1) {
      integrations[idx].status = status;
      integrations[idx].credentials_encrypted = credentials_encrypted;
      integrations[idx].updated_at = new Date().toISOString();
      setStore('amfs_integrations', integrations);
      logActivityLocal('Integration Updated', `Integration "${integrations[idx].name}" set to "${status}".`);
    }
  },

  // 9. WordPress sync
  async pushToWordPress(pageId: string, content: string, title: string, metaDescription: string) {
    await delay(1000);
    const pages = getStore<Page[]>('amfs_pages', []);
    const page = pages.find(p => p.id === pageId);
    
    if (!page) return { success: false, error: 'Page not found' };

    logActivityLocal('WordPress Sync', `Successfully pushed draft update to WordPress for page: ${page.url} (Draft ID: wp_draft_${Math.floor(Math.random() * 100000)}). Title: "${title}". Meta: "${metaDescription}". Content length: ${content.length} characters.`);
    
    // Update task status in localStorage
    const tasks = getStore<RewriteTask[]>('amfs_tasks', []);
    const idx = tasks.findIndex(t => t.page_id === pageId);
    if (idx !== -1) {
      tasks[idx].status = 'Exported';
      tasks[idx].updated_at = new Date().toISOString();
      setStore('amfs_tasks', tasks);
    }

    return { 
      success: true, 
      wp_post_id: Math.floor(Math.random() * 10000) + 1000,
      status: 'Draft Created' 
    };
  },

  // 10. Logs
  async getLogs() {
    await delay(100);
    return getStore<ActivityLog[]>('amfs_logs', []);
  }
};
