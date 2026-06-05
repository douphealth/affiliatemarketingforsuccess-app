import express from 'express';
import cors from 'cors';
import { db, logActivity } from './db.js';
import { crawlSite } from './crawler.js';
import { seedDatabase } from './seedData.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Database on Startup
seedDatabase();

// 1. General Site Stats & Dashboard Scores
app.get('/api/dashboard', (req, res) => {
  const pages = db.get('pages');
  const issues = db.get('seo_issues');
  const recommendations = db.get('recommendations');

  if (pages.length === 0) {
    return res.json({
      site_connected: false,
      scores: {
        growth: 0,
        seo: 0,
        geo: 0,
        authority: 0,
        monetization: 0,
        technical: 0,
        quality: 0
      },
      recommendations: []
    });
  }

  // Calculate average scores across all crawled pages
  const sum = (field) => pages.reduce((acc, p) => acc + (p[field] || 0), 0);
  const avg = (field) => Math.round(sum(field) / pages.length);

  const seo = avg('score_seo');
  const geo = avg('score_geo');
  const monetization = avg('score_monetization');
  const authority = avg('score_authority');
  const technical = avg('score_technical');
  const quality = avg('score_quality');

  // Growth score is a weighted composite of all categories
  const growth = Math.round((seo * 0.25) + (geo * 0.15) + (monetization * 0.20) + (authority * 0.15) + (technical * 0.10) + (quality * 0.15));

  // Get active recommendations, sorted by priority (implied by insertion)
  const activeRecs = recommendations.filter(r => r.status === 'Active').slice(0, 5);

  res.json({
    site_connected: true,
    url: 'https://affiliatemarketingforsuccess.com/',
    scores: { growth, seo, geo, authority, monetization, technical, quality },
    recommendations: activeRecs
  });
});

// 2. Crawler trigger
app.post('/api/crawl', async (req, res) => {
  const { simulate } = req.body;
  const siteUrl = 'https://affiliatemarketingforsuccess.com/';
  
  // Run async crawl to avoid blocking response
  crawlSite(siteUrl, simulate)
    .then(result => {
      console.log("Crawl completed background:", result);
    })
    .catch(err => {
      logActivity('Crawl Failed', `Background crawl error: ${err.message}`);
      console.error("Crawl error:", err);
    });

  res.json({ message: 'Crawl launched in background', status: 'Running' });
});

// Get crawl logs / history
app.get('/api/crawls', (req, res) => {
  res.json(db.get('crawls'));
});

// 3. WordPress Site Auditor Pages & Issues
app.get('/api/pages', (req, res) => {
  res.json(db.get('pages'));
});

app.get('/api/pages/:id', (req, res) => {
  const page = db.getById('pages', req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  
  const issues = db.find('seo_issues', i => i.page_id === page.id);
  const brief = db.find('content_briefs', b => b.page_id === page.id)[0] || null;
  const task = db.find('rewrite_tasks', t => t.page_id === page.id)[0] || null;

  res.json({ page, issues, brief, task });
});

app.get('/api/issues', (req, res) => {
  const issues = db.get('seo_issues');
  const pages = db.get('pages');
  
  // Join issues with page URLs for dashboard tables
  const joinedIssues = issues.map(issue => {
    const page = pages.find(p => p.id === issue.page_id);
    return {
      ...issue,
      page_url: page ? page.url : 'Unknown',
      page_title: page ? page.title : 'Unknown'
    };
  });

  res.json(joinedIssues);
});

// 4. Top 10 Rewrite Prioritizer
app.get('/api/rewrites', (req, res) => {
  const tasks = db.get('rewrite_tasks');
  const pages = db.get('pages');
  
  const priorities = tasks.map(task => {
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

  res.json(priorities);
});

app.get('/api/rewrites/:pageId/brief', (req, res) => {
  const brief = db.find('content_briefs', b => b.page_id === req.params.pageId)[0];
  if (!brief) {
    // Generate an automatic brief if one doesn't exist yet
    const page = db.getById('pages', req.params.pageId);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const newBrief = db.insert('content_briefs', {
      page_id: page.id,
      target_intent: 'Informational - users searching for optimization answers.',
      entities: ['SEO strategy', 'content optimization', 'Google search indexing'],
      faqs: [{ q: 'How does optimization work?', a: 'By structuring pages, schemas, and answers accurately.' }],
      internal_links_suggested: ['/'],
      affiliate_opportunities: [],
      schema_json: {},
      title_proposal: `${page.title} - Upgraded Guide`,
      meta_proposal: `Improve your website traffic with our upgraded resource on ${page.title}. Read the full guide.`,
      intro_proposal: 'Let\'s optimize our methods to get higher search engine rankings.',
      outline_json: [{ heading: 'Introduction', subheadings: ['Overview', 'Key terms'] }],
      upgrade_checklist: ['Add introductory definitions', 'Check internal link coverage']
    });
    return res.json(newBrief);
  }
  res.json(brief);
});

// Save content brief edits
app.post('/api/rewrites/:pageId/brief', (req, res) => {
  const brief = db.find('content_briefs', b => b.page_id === req.params.pageId)[0];
  if (!brief) return res.status(404).json({ error: 'Brief not found' });

  const updated = db.update('content_briefs', brief.id, req.body);
  logActivity('Brief Updated', `Content brief for page id ${req.params.pageId} was modified.`);
  res.json(updated);
});

// Save write draft content
app.post('/api/rewrites/:pageId/draft', (req, res) => {
  const task = db.find('rewrite_tasks', t => t.page_id === req.params.pageId)[0];
  if (!task) return res.status(404).json({ error: 'Rewrite task not found' });

  const { draft_content, status, rollback_notes } = req.body;
  const updates = {};
  if (draft_content !== undefined) updates.draft_content = draft_content;
  if (status !== undefined) updates.status = status;
  if (rollback_notes !== undefined) updates.rollback_notes = rollback_notes;

  const updated = db.update('rewrite_tasks', task.id, updates);
  logActivity('Draft Updated', `Draft for page id ${req.params.pageId} updated to status "${status || task.status}".`);
  res.json(updated);
});

// 5. Internal Link Suggestions
app.get('/api/internal-links', (req, res) => {
  const links = db.get('internal_link_suggestions');
  const pages = db.get('pages');

  const joinedLinks = links.map(link => {
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

  res.json(joinedLinks);
});

app.post('/api/internal-links/:id/approve', (req, res) => {
  const { status } = req.body; // Approved, Added, Rejected
  const updated = db.update('internal_link_suggestions', req.params.id, { status });
  
  if (updated) {
    logActivity('Link Approved', `Internal link suggestion from ${updated.source_page_id} to ${updated.target_page_id} set to "${status}".`);
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Suggestion not found' });
  }
});

// 6. Topical Authority Mapping
app.get('/api/clusters', (req, res) => {
  const clusters = db.get('topic_clusters');
  const pages = db.get('pages');

  // Join clusters with their articles
  const joinedClusters = clusters.map(cluster => {
    const hub = pages.find(p => p.id === cluster.hub_page_id);
    // Find all pages that belong to this cluster (mocked logic - based on URL matches or titles)
    const articles = pages.filter(p => {
      const url = p.url.toLowerCase();
      const name = cluster.name.toLowerCase().replace(' guides', '').replace(' & core vitals', '');
      
      if (cluster.id === 'cluster_aff') return url.includes('affiliate') || url.includes('amazon');
      if (cluster.id === 'cluster_blog') return url.includes('blog') || url.includes('make-money');
      if (cluster.id === 'cluster_seo') return url.includes('seo') || url.includes('speed') || url.includes('rankmath');
      if (cluster.id === 'cluster_ai') return url.includes('ai');
      if (cluster.id === 'cluster_email') return url.includes('email');
      return false;
    }).map(p => ({ id: p.id, title: p.title, url: p.url, score: p.score_seo }));

    return {
      ...cluster,
      hub_url: hub ? hub.url : '',
      hub_title: hub ? hub.title : '',
      articles
    };
  });

  // Next 20 content actions (mock list based on gaps)
  const nextActions = [
    { title: 'Best AI writing assistants for SEO comparison', type: 'New Post', cluster: 'AI Blogging Tools', priority: 'High', difficulty: 'Medium', score_impact: 18 },
    { title: 'How to monetize blog posts through digital products', type: 'New Post', cluster: 'Blogging Guides', priority: 'High', difficulty: 'Hard', score_impact: 15 },
    { title: 'Ahrefs vs Semrush SEO audit tools review', type: 'New Post', cluster: 'SEO & Core Vitals', priority: 'Medium', difficulty: 'Medium', score_impact: 12 },
    { title: 'Amazon Associates affiliate link cloaking tutorial', type: 'Refresh Post', cluster: 'Affiliate Marketing', priority: 'High', difficulty: 'Low', score_impact: 14 },
    { title: 'Newsletter growth strategies: how to get first 1000 subs', type: 'New Post', cluster: 'Email Marketing', priority: 'Medium', difficulty: 'Medium', score_impact: 10 },
    { title: 'RankMath setup tutorial for WordPress SEO settings', type: 'Refresh Post', cluster: 'SEO & Core Vitals', priority: 'High', difficulty: 'Low', score_impact: 13 }
  ];

  res.json({ clusters: joinedClusters, nextActions });
});

// 7. Affiliate Monetization
app.get('/api/monetization', (req, res) => {
  const pages = db.get('pages');
  const offers = db.get('affiliate_offers');

  // Identify review or comparison posts
  const reviews = pages.filter(p => p.url.includes('review') || p.url.includes('best') || p.url.includes('alternatives') || p.url.includes('vs-'))
    .map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      score_monetization: p.score_monetization,
      word_count: p.word_count,
      traffic_estimate: p.traffic_estimate,
      has_disclosure: p.score_monetization > 50,
      has_table: p.word_count > 2500, // mock comparison tables
      has_cta: p.score_monetization > 70
    }));

  res.json({ reviews, offers });
});

// 8. Integrations settings endpoint
app.post('/api/integrations', (req, res) => {
  const { id, status, credentials_encrypted } = req.body;
  const updated = db.update('integrations', id, { status, credentials_encrypted });
  
  if (updated) {
    logActivity('Integration Modified', `Integration "${updated.name}" set to status "${status}".`);
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Integration not found' });
  }
});

app.get('/api/integrations', (req, res) => {
  res.json(db.get('integrations'));
});

// 9. WordPress sync simulation
app.post('/api/wordpress/push', (req, res) => {
  const { pageId, draftContent, title, metaDescription } = req.body;
  
  const page = db.getById('pages', pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  // Simulate pushing to WordPress API
  logActivity('WordPress Sync', `Successfully pushed draft update to WordPress for page: ${page.url} (Draft ID: wp_draft_${Math.floor(Math.random() * 100000)}).`);
  
  // Update task status in DB
  const task = db.find('rewrite_tasks', t => t.page_id === page.id)[0];
  if (task) {
    db.update('rewrite_tasks', task.id, { status: 'Exported' });
  }

  res.json({ 
    success: true, 
    message: 'Draft successfully pushed to WordPress REST API', 
    wp_post_id: Math.floor(Math.random() * 10000) + 1000,
    status: 'Draft Created' 
  });
});

// 10. Activity Log feed
app.get('/api/logs', (req, res) => {
  res.json(db.get('activity_log'));
});

app.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
});
