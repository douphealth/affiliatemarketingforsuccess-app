import type { Site, Page, TopicCluster, SEOIssue, RewriteTask, ContentBrief, InternalLinkSuggestion, AffiliateOffer, Recommendation, Integration, ActivityLog } from '../types';

// Helper to retrieve data from localStorage
function getStore<T>(key: string, defaultValue: T): T {
  const val = localStorage.getItem(key);
  if (!val) return defaultValue;
  try {
    return JSON.parse(val) as T;
  } catch (_) {
    return defaultValue;
  }
}

// Helper to write data to localStorage
function setStore<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Log activities in localStorage
export function logActivityLocal(action: string, message: string): ActivityLog {
  const logs = getStore<ActivityLog[]>('amfs_logs', []);
  const newLog: ActivityLog = {
    id: 'l_' + Math.random().toString(36).substr(2, 9),
    action,
    message,
    created_at: new Date().toISOString()
  };
  logs.unshift(newLog);
  setStore('amfs_logs', logs.slice(0, 200)); // Limit to 200 logs
  return newLog;
}

export const localDb = {
  // Clear all database
  clearAll() {
    const keys = [
      'amfs_sites', 'amfs_pages', 'amfs_crawls', 'amfs_issues', 
      'amfs_briefs', 'amfs_tasks', 'amfs_links', 'amfs_clusters', 
      'amfs_offers', 'amfs_recommendations', 'amfs_integrations', 'amfs_logs'
    ];
    keys.forEach(k => localStorage.removeItem(k));
  },

  // Seed dynamic analysis data for entered domain name
  seedForSite(siteUrl: string) {
    this.clearAll();

    const cleanUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
    const domain = new URL(cleanUrl).hostname;

    // 1. Sites
    const site: Site = {
      id: 'site_user',
      url: cleanUrl,
      name: domain,
      created_at: new Date().toISOString(),
      last_crawled_at: new Date().toISOString()
    };
    setStore('amfs_sites', [site]);

    // 2. Default Integrations
    const integrations: Integration[] = [
      { id: 'int_wp', name: 'WordPress REST API', status: 'Disconnected', credentials_encrypted: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'int_gsc', name: 'Google Search Console', status: 'Connected', credentials_encrypted: '{"profile": "AMFS Search Console"}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'int_ga4', name: 'Google Analytics 4', status: 'Connected', credentials_encrypted: '{"property": "GA4-Dynamic-Property"}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'int_psi', name: 'PageSpeed Insights', status: 'Connected', credentials_encrypted: '{"apiKey": "mock_api_key_123"}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    setStore('amfs_integrations', integrations);

    // 3. Dynamic Pages for user website URL
    const pages: Page[] = [
      {
        id: 'p_user_home', site_id: site.id, url: cleanUrl,
        title: `${domain} - Growth and Niche Marketing Blog`,
        meta_description: `Learn how we grow our business and increase conversions at ${domain}. Read our latest posts.`,
        word_count: 1120, publish_date: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
        traffic_estimate: 2400, status: 'Indexed', score_seo: 78, score_geo: 65, score_monetization: 50,
        score_authority: 70, score_technical: 75, score_quality: 70,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        content_html: `<h1>Welcome to ${domain}</h1><p>We share our business growth tips and product recommendations...</p>`
      },
      {
        id: 'p_user_review', site_id: site.id, url: `${cleanUrl}best-hosting-services-review/`,
        title: `Honest Comparison: Best Hosting Services for Blogging`,
        meta_description: `Comparing the top web hosting services on price, speed, uptime, and customer support. Find the best option for your website.`,
        word_count: 2850, publish_date: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        traffic_estimate: 5100, status: 'Indexed', score_seo: 80, score_geo: 55, score_monetization: 75,
        score_authority: 78, score_technical: 68, score_quality: 60,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        content_html: `<h1>Best Hosting Services Review</h1><p>Choosing the right host is critical. Let's compare providers...</p>`
      },
      {
        id: 'p_user_guide', site_id: site.id, url: `${cleanUrl}how-to-monetize-a-blog/`,
        title: `How to Monetize a Blog in 2026: Step-by-Step Guide`,
        meta_description: `Want to earn passive income from your writing? Here is a complete guide to blog monetization through affiliate links and sponsorship.`,
        word_count: 720, publish_date: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
        traffic_estimate: 950, status: 'Indexed', score_seo: 60, score_geo: 45, score_monetization: 52,
        score_authority: 60, score_technical: 82, score_quality: 45,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        content_html: `<h1>How to Monetize a Blog</h1><p>Monetizing your traffic is simple. You can place display ads or sign up for affiliate programs...</p>`
      },
      {
        id: 'p_user_seo', site_id: site.id, url: `${cleanUrl}seo-tips-for-beginners/`,
        title: `SEO Tips for Beginners: Double Your Search Engine Traffic`,
        meta_description: `Unlock organic growth with these easy search engine optimization tips. Learn keyword research, title tags, and link building.`,
        word_count: 1450, publish_date: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
        traffic_estimate: 1200, status: 'Indexed', score_seo: 88, score_geo: 72, score_monetization: 35,
        score_authority: 80, score_technical: 90, score_quality: 82,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        content_html: `<h1>SEO Tips for Beginners</h1><p>Search engine optimization doesn't have to be complicated. Start with keywords...</p>`
      },
      {
        id: 'p_user_tools', site_id: site.id, url: `${cleanUrl}top-marketing-tools-we-use/`,
        title: `Top Marketing Tools for Small Business Growth`,
        meta_description: `A list of the best marketing tools and plugins we use to run our business, write content, and track search engine rankings.`,
        word_count: 1950, publish_date: new Date(Date.now() - 3600000 * 24 * 120).toISOString(),
        traffic_estimate: 1100, status: 'Indexed', score_seo: 82, score_geo: 78, score_monetization: 45,
        score_authority: 68, score_technical: 40, score_quality: 80,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        content_html: `<h1>Top Marketing Tools We Use</h1><p>Using the right plugins can save you hundreds of hours. Here are our favorites...</p>`
      }
    ];
    setStore('amfs_pages', pages);

    // 4. Topic Clusters
    const clusters: TopicCluster[] = [
      { id: 'c_blog', name: 'Blogging & Setup', hub_page_id: 'p_user_home', description: `Hosting comparisons, domain selections, and blogging setup guides.`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c_seo', name: 'SEO & Visibility', hub_page_id: 'p_user_seo', description: `On-page SEO checklists, search engine guidelines, and page speed diagnostics.`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c_mon', name: 'Affiliate Monetization', hub_page_id: 'p_user_guide', description: `Affiliate signup structures, conversion rate setups, and product review disclaimers.`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    setStore('amfs_clusters', clusters);

    // 5. SEO Issues (Promoting affiliatemarketingforsuccess.com guides)
    const issues: SEOIssue[] = [
      {
        id: 'iss_1', page_id: 'p_user_review', issue_type: 'missing_disclosure', priority: 'Critical',
        details: {
          problem: 'Missing FTC Affiliate Disclosure declaration.',
          evidence: `Outbound tracked links detected on ${cleanUrl}best-hosting-services-review/ without legal disclosure above the fold.`,
          why_it_matters: 'Failing to declare sponsored affiliate relationships violates FTC guidelines and can get your site penalized or removed from affiliate networks (like Amazon or Impact).',
          exact_fix: 'Insert a visible disclosure banner right below the post H1 title: "Disclosure: This post contains affiliate links. We may earn a commission if you purchase through them."',
          expected_upside: 'Guarantees legal safety compliance and builds trust with your visitors.',
          confidence: '100%', effort: 'Low (2 mins)', risk: 'None',
          steps: `1. Open your WordPress editor for this post.\n2. Add a Paragraph block above the fold.\n3. Paste the FTC disclosure statement.\n4. Style in italics and publish.`,
          validation: 'Verify that the disclosure statement displays above any outbound affiliate link.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'iss_2', page_id: 'p_user_guide', issue_type: 'thin_content', priority: 'High',
        details: {
          problem: 'Thin Content (Under 800 Words).',
          evidence: `Word count on your monetization guide is only 720 words. Competitor average is 2,400 words.`,
          why_it_matters: 'Google\'s Helpful Content System filters out short, surface-level articles that do not satisfy user search queries comprehensively.',
          exact_fix: 'Expand the article to 2,000+ words covering sponsorship pricing grids, digital product options, and consulting packages.',
          expected_upside: 'Drastically improves organic keyword rankings and increases topical trust metrics.',
          confidence: '90%', effort: 'High (3 hours)', risk: 'Low',
          steps: '1. Research primary monetization sub-topics.\n2. Draft new sections on "Direct sponsors" and "Sales funnels".\n3. Save updates in WordPress.',
          validation: 'Confirm total word count exceeds 1,800 words.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'iss_3', page_id: 'p_user_tools', issue_type: 'slow_page', priority: 'Medium',
        details: {
          problem: 'Poor Mobile Page Speed (Core Web Vitals LCP exceeds 4.0s).',
          evidence: `PageSpeed Insights score is 40/100 on Mobile for the Tools page. Largest Contentful Paint is 4.6 seconds.`,
          why_it_matters: 'Google uses page loading speed as a direct ranking signal for mobile index files.',
          exact_fix: 'Install a cache pre-loading plugin, compress marketing graphics to WebP formats, and defer render-blocking script tasks.',
          expected_upside: 'Raises Core Web Vitals score to green (>85) and reduces page load latency to under 2.0s.',
          confidence: '95%', effort: 'Medium (45 mins)', risk: 'Low',
          steps: '1. Add a WordPress caching plugin.\n2. Convert tool screenshots to WebP.\n3. Turn on defer settings for Javascript files.',
          validation: 'Verify mobile loading speed using PageSpeed diagnostics.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'iss_4', page_id: 'p_user_home', issue_type: 'missing_meta', priority: 'Medium',
        details: {
          problem: 'Missing Meta Description tag.',
          evidence: `The homepage does not have a <meta name="description"> tag declared in its HTML head.`,
          why_it_matters: 'Missing meta tags force search engines to generate random text snippets in search results, which drastically decreases your organic Click-Through-Rate (CTR).',
          exact_fix: 'Write a compelling 120-155 character description summarizing your value proposition and target keywords.',
          expected_upside: 'Improves SERP click popularity and organic CTR by 15-30%.',
          confidence: '95%', effort: 'Low (3 mins)', risk: 'None',
          steps: '1. Open RankMath or Yoast in WordPress.\n2. Click Edit Snippet on Homepage.\n3. Write your description and save.',
          validation: 'Inspect home page source and confirm meta tag is present.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }
    ];
    setStore('amfs_issues', issues);

    // 6. Rewrite Tasks
    const tasks: RewriteTask[] = [
      {
        id: 'tsk_1', page_id: 'p_user_guide', status: 'Recommend', draft_content: '', revision_history: [],
        rollback_notes: 'Original post contains thin text of 720 words.', upside_score: 92,
        decay_rate: '15% search drop-off', reasons: 'Thin content length, missing comparison table, lacks conversational definition box.',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'tsk_2', page_id: 'p_user_review', status: 'Draft',
        draft_content: '<h2>Upgraded: Best Hosting Services Comparison</h2><p>Here is our comprehensive guide to top hosting platforms...</p>',
        revision_history: [{ date: new Date().toISOString(), editor: 'AMFS Growth OS' }],
        rollback_notes: 'Staged draft contains new disclosure statement and hosting pricing tables.',
        upside_score: 87, decay_rate: 'Stagnant at page 2 keywords',
        reasons: 'Missing FTC disclosure banner, hosting pricing lists, lacks product specs.',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }
    ];
    setStore('amfs_tasks', tasks);

    // 7. Content Briefs
    const briefs: ContentBrief[] = [
      {
        id: 'brf_1', page_id: 'p_user_guide', target_intent: 'Commercial & Informational - Users comparing host prices and features.',
        entities: ['Web hosting', 'WordPress setup', 'Pricing plans', 'Uptime metrics', 'Site speed', 'Domain signup'],
        faqs: [
          { q: 'How much does blogging cost to start?', a: 'Basic web hosting costs $2.95 to $6.95 per month. Domains cost around $10-$15 per year.' },
          { q: 'Which host is best for WordPress?', a: 'We recommend host platforms that are officially endorsed by WordPress.org and offer built-in caching.' }
        ],
        internal_links_suggested: [`${cleanUrl}how-to-monetize-a-blog/`],
        affiliate_opportunities: ['Host recommended plans', 'Domain registrations'],
        schema_json: { '@context': 'https://schema.org', '@type': 'Product', 'name': 'Web Hosting Services' },
        title_proposal: 'Best Hosting Services for Blogging: Honest Uptime Comparison (2026)',
        meta_proposal: 'We compare the best web hosting services for WordPress blogs on uptime, server speeds, and monthly pricing. Find your perfect host now.',
        intro_proposal: 'Choosing a web host is the single most important decision for your site speed. In this upgraded guide, we compare top hosts to see who wins.',
        outline_json: [
          { heading: '1. What to Look for in a Web Host', subheadings: ['Server response time', 'Customer support channels'] },
          { heading: '2. Top Host Providers Compared', subheadings: ['Features breakdown', 'Pricing plans comparison'] }
        ],
        upgrade_checklist: [
          'Add interactive features comparison table',
          'Insert FTC disclosure block above the first link',
          'Create product spec boxes for top 3 hosts'
        ],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }
    ];
    setStore('amfs_briefs', briefs);

    // 8. Internal Link suggestions
    const links: InternalLinkSuggestion[] = [
      {
        id: 'lnk_1', source_page_id: 'p_user_home', target_page_id: 'p_user_seo',
        anchor_text: 'easy SEO tips for beginners',
        sentence_context: 'Growing a blog requires consistent traffic, and applying easy SEO tips for beginners is the fastest way to get indexed by Google.',
        reason: 'Connects your home page authority directly to your SEO optimization guide.',
        status: 'Suggested', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'lnk_2', source_page_id: 'p_user_seo', target_page_id: 'p_user_guide',
        anchor_text: 'monetize a blog guide',
        sentence_context: 'Once you rank for your target keywords, you should immediately read our monetize a blog guide to plan your conversion channels.',
        reason: 'Routes informational search traffic directly to your high-intent money page.',
        status: 'Suggested', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }
    ];
    setStore('amfs_links', links);

    // 9. Merchant Offers
    const offers: AffiliateOffer[] = [
      { id: 'off_1', name: 'Amazon Associates', merchant: 'Amazon', redirect_url: 'https://associates.amazon.com', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'off_2', name: 'ShareASale Network', merchant: 'ShareASale', redirect_url: 'https://shareasale.com', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'off_3', name: 'Impact Radius', merchant: 'Impact', redirect_url: 'https://impact.com', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    setStore('amfs_offers', offers);

    // 10. Recommendations (Dashboard Today's 5 actions)
    const recommendations: Recommendation[] = [
      {
        id: 'rec_1', site_id: site.id, page_id: 'p_user_review',
        title: 'Insert FTC disclosure statement above the fold',
        description: 'Your hosting comparison page has active affiliate tracking links but lacks a visible legal disclosure, violating FTC guidelines.',
        details_json: {
          problem: 'Outbound tracked links detected on a review post without an above-the-fold legal disclosure.',
          evidence: `Found 6 active affiliate tracks, but no disclosure statement text at the top of ${cleanUrl}best-hosting-services-review/.`,
          why_it_matters: 'The FTC requires affiliate disclosures to be clear and conspicuous. Failing to do so puts your website at risk of legal fines or removal from affiliate networks.',
          exact_fix: 'Insert an FTC disclosure paragraph right below the main header.',
          expected_upside: 'Achieves 100% legal compliance and improves buyer trust.',
          confidence: 'High (100%)', effort: 'Low (2 mins)', risk: 'None',
          steps: ['1. Go to post editor.', '2. Insert standard disclosure block above any link.', '3. Style it with italics.', '4. Update post.'],
          validation: 'Verify the disclosure displays immediately on the page above any commercial link.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'rec_2', site_id: site.id, page_id: 'p_user_guide',
        title: 'Expand thin monetization content to boost rankings',
        description: 'Your monetization post is only 720 words, which is too brief to rank against competitor articles averaging 2,400 words.',
        details_json: {
          problem: 'Thin content length below topical competition averages.',
          evidence: `Article contains 720 words, compared to industry average of 2,400 words for "how to monetize a blog".`,
          why_it_matters: 'Google\'s Helpful Content system filters out brief posts that do provide comprehensive solutions.',
          exact_fix: 'Expand the article to 2,000+ words adding sections on Sponsorship kits and Digital product sales.',
          expected_upside: 'Page 1 organic positions, bringing an estimated +800 monthly visits.',
          confidence: 'High (90%)', effort: 'High (3 hours)', risk: 'Low',
          steps: ['1. Open Content Editor.', '2. Add outline sections for Sponsor pricing and Course sales.', '3. Write new sections.', '4. Push to WordPress draft.'],
          validation: 'Verify word count exceeds 1,800 words.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'rec_3', site_id: site.id, page_id: 'p_user_tools',
        title: 'Optimize mobile PageSpeed score to pass Core Web Vitals',
        description: 'Slow loading times on mobile are dragging down your overall domain search authority.',
        details_json: {
          problem: 'Mobile loading speed is poor (PageSpeed Score: 40).',
          evidence: 'Largest Contentful Paint is 4.6 seconds, exceeding Google\'s 2.5s threshold.',
          why_it_matters: 'Google uses page loading speed as a direct ranking signal for mobile index files.',
          exact_fix: 'Compress images to WebP formats, install a caching plugin, and defer unused Javascript tasks.',
          expected_upside: 'Raises Mobile score to 85+, reducing bounce rates and boosting positions.',
          confidence: 'High (95%)', effort: 'Medium (45 mins)', risk: 'Low',
          steps: ['1. Convert images to .webp.', '2. Install caching plugin.', '3. Turn on asset defer settings.'],
          validation: 'Verify LCP is under 2.5 seconds using PageSpeed diagnostics.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      },
      {
        id: 'rec_4', site_id: site.id, page_id: 'p_user_home',
        title: 'Insert a compelling Meta Description for your homepage',
        description: 'Your homepage lacks a custom meta description, forcing search engines to generate random body text snippets.',
        details_json: {
          problem: 'Missing homepage meta description tag.',
          evidence: 'HTML head contains no <meta name="description"> declaration.',
          why_it_matters: 'Compelling meta descriptions act as ad copy in Google search results, driving user clicks and boosting CTR.',
          exact_fix: 'Write and insert a 120-155 character meta description featuring your primary business keywords.',
          expected_upside: 'Improves organic Click-Through-Rate by 15-20%.',
          confidence: 'High (95%)', effort: 'Low (3 mins)', risk: 'None',
          steps: ['1. Open your WordPress SEO plugins settings.', '2. Write a meta description summarizing your homepage value proposition.', '3. Click update.'],
          validation: 'Confirm description meta tag appears in the HTML source.'
        },
        status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }
    ];
    setStore('amfs_recommendations', recommendations);

    logActivityLocal('Site Setup Seeding', `Successfully seeded diagnostics data in local storage for: ${domain}.`);
  }
};
export { getStore, setStore };
