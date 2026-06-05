import { db, logActivity } from './db.js';

export function seedDatabase() {
  const existingSites = db.get('sites');
  if (existingSites.length > 0) {
    console.log("Database already has data. Skipping seed.");
    return;
  }

  console.log("Seeding database with affiliatemarketingforsuccess.com mock data...");

  // 1. Site entry
  const site = db.insert('sites', {
    id: 'site_amfs',
    url: 'https://affiliatemarketingforsuccess.com/',
    name: 'Affiliate Marketing for Success',
    last_crawled_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  });

  // 2. Integrations
  db.insert('integrations', { id: 'int_wp', name: 'WordPress REST API', status: 'Disconnected', credentials_encrypted: null });
  db.insert('integrations', { id: 'int_gsc', name: 'Google Search Console', status: 'Connected', credentials_encrypted: '{"profile": "AMFS Search Profile"}' });
  db.insert('integrations', { id: 'int_ga4', name: 'Google Analytics 4', status: 'Connected', credentials_encrypted: '{"property": "AMFS-GA4-Property"}' });
  db.insert('integrations', { id: 'int_psi', name: 'PageSpeed Insights', status: 'Connected', credentials_encrypted: '{"apiKey": "mock_psi_api_key_12345"}' });

  // 3. Pages
  const pages = [
    {
      id: 'page_home',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/',
      title: 'Affiliate Marketing for Success - Passive Income Blogging Guides',
      meta_description: 'Discover proven affiliate marketing strategies, blogging guides, and SEO tips to turn your website into a passive income generator. Start your growth journey today.',
      word_count: 1250,
      publish_date: '2024-01-15T00:00:00.000Z',
      traffic_estimate: 4200,
      status: 'Indexed',
      score_seo: 88,
      score_geo: 75,
      score_monetization: 60,
      score_authority: 90,
      score_technical: 82,
      score_quality: 85,
      content_html: '<h1>Affiliate Marketing for Success</h1><p>Welcome to the ultimate resource to grow your blogging business.</p>'
    },
    {
      id: 'page_beginners',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/best-affiliate-marketing-programs-for-beginners/',
      title: '12 Best Affiliate Marketing Programs for Beginners (No Experience)',
      meta_description: 'Looking to start affiliate marketing? Here are the best affiliate marketing programs for beginners with easy approval, high commissions, and great resources.',
      word_count: 3450,
      publish_date: '2024-05-10T00:00:00.000Z',
      traffic_estimate: 8500,
      status: 'Indexed',
      score_seo: 82,
      score_geo: 65,
      score_monetization: 78,
      score_authority: 85,
      score_technical: 74,
      score_quality: 70,
      content_html: '<h1>12 Best Affiliate Marketing Programs for Beginners</h1><p>If you want to start earning passive income, affiliate programs are the best path...</p>'
    },
    {
      id: 'page_start_blog',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/how-to-start-a-blog-and-make-money/',
      title: 'How to Start a Blog and Make Money: Step-by-Step Guide',
      meta_description: 'Learn how to start a self-hosted WordPress blog from scratch, configure basic settings, design your page, and start monetization. Easy setup.',
      word_count: 5120,
      publish_date: '2023-03-20T00:00:00.000Z',
      traffic_estimate: 12500,
      status: 'Indexed',
      score_seo: 76,
      score_geo: 55,
      score_monetization: 82,
      score_authority: 92,
      score_technical: 68,
      score_quality: 65,
      content_html: '<h1>How to Start a Blog and Make Money</h1><p>Starting a blog changed my life. In this complete tutorial, I\'ll show you how to buy hosting, install WordPress...</p>'
    },
    {
      id: 'page_ai_tools',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/ai-tools-for-blogging-productivity/',
      title: '9 Best AI Tools for Blogging Productivity (Writing, SEO, Graphics)',
      meta_description: 'Explore the top AI tools for bloggers to speed up writing, optimize for SEO, generate custom images, and double your output with zero quality loss.',
      word_count: 2200,
      publish_date: '2025-06-01T00:00:00.000Z',
      traffic_estimate: 1800,
      status: 'Indexed',
      score_seo: 90,
      score_geo: 88,
      score_monetization: 52,
      score_authority: 70,
      score_technical: 85,
      score_quality: 91,
      content_html: '<h1>9 Best AI Tools for Blogging Productivity</h1><p>AI isn\'t here to replace you; it\'s here to supercharge your workflow. Let\'s look at tools like ChatGPT, Claude, and Jasper...</p>'
    },
    {
      id: 'page_seo_review',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/rankmath-vs-yoast-seo-review/',
      title: 'RankMath vs Yoast SEO: Honest Comparison for WordPress',
      meta_description: 'Which SEO plugin is best for your WordPress blog? We compare RankMath and Yoast SEO features, indexing speeds, schema support, and pricing models.',
      word_count: 2850,
      publish_date: '2024-11-12T00:00:00.000Z',
      traffic_estimate: 3100,
      status: 'Indexed',
      score_seo: 92,
      score_geo: 78,
      score_monetization: 45,
      score_authority: 80,
      score_technical: 90,
      score_quality: 80,
      content_html: '<h1>RankMath vs Yoast SEO: Honest Comparison</h1><p>Choosing an SEO plugin can make or break your on-page SEO. Today, we put Yoast and RankMath head-to-head...</p>'
    },
    {
      id: 'page_email_marketing',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/email-marketing-for-affiliates/',
      title: 'Email Marketing for Affiliates: The Missing Link to Success',
      meta_description: 'Learn how to build an email list of passionate subscribers, design high-converting autoresponders, and insert affiliate links without spamming.',
      word_count: 1950,
      publish_date: '2024-02-18T00:00:00.000Z',
      traffic_estimate: 1500,
      status: 'Indexed',
      score_seo: 80,
      score_geo: 60,
      score_monetization: 68,
      score_authority: 75,
      score_technical: 78,
      score_quality: 74,
      content_html: '<h1>Email Marketing for Affiliates</h1><p>If you are only sending traffic to blog posts, you are leaving money on the table. You need email subscribers...</p>'
    },
    {
      id: 'page_money_no_ads',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/make-money-blogging-without-ads/',
      title: 'How to Make Money Blogging Without Ads (5 Alternative Methods)',
      meta_description: 'Think you need millions of pageviews to make money blogging? Here are 5 ways to monetize a small blog without annoying display ads.',
      word_count: 750, // Thin content!
      publish_date: '2023-08-05T00:00:00.000Z',
      traffic_estimate: 800,
      status: 'Indexed',
      score_seo: 65,
      score_geo: 40,
      score_monetization: 70,
      score_authority: 68,
      score_technical: 88,
      score_quality: 50, // Low content quality!
      content_html: '<h1>How to Make Money Blogging Without Ads</h1><p>Display ads ruin user experience. Here are some quick tips to sell products, consult, and do affiliate marketing...</p>'
    },
    {
      id: 'page_amazon_alts',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/amazon-associates-alternatives/',
      title: '7 Amazon Associates Alternatives for Higher Commission Rates',
      meta_description: 'Tired of tiny Amazon payouts? Check out these 7 affiliate networks and programs that offer much higher commission rates and longer cookie durations.',
      word_count: 3100,
      publish_date: '2024-08-30T00:00:00.000Z',
      traffic_estimate: 5400,
      status: 'Indexed',
      score_seo: 85,
      score_geo: 72,
      score_monetization: 85,
      score_authority: 80,
      score_technical: 76,
      score_quality: 79,
      content_html: '<h1>7 Amazon Associates Alternatives</h1><p>Amazon cut commissions again. Now is the best time to migrate your links to higher-paying affiliate networks...</p>'
    },
    {
      id: 'page_speed_opt',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/wordpress-speed-optimization/',
      title: 'WordPress Speed Optimization: Step-by-Step Core Web Vitals Fix',
      meta_description: 'Is your blog loading slow? Learn how to pass Google\'s Core Web Vitals with cache plugins, image compression, database cleanups, and hosting choice.',
      word_count: 2400,
      publish_date: '2023-10-04T00:00:00.000Z',
      traffic_estimate: 2200,
      status: 'Indexed',
      score_seo: 80,
      score_geo: 70,
      score_monetization: 40,
      score_authority: 85,
      score_technical: 45, // Slow speed!
      score_quality: 82,
      content_html: '<h1>WordPress Speed Optimization Guide</h1><p>Slow load times destroy your rankings and double bounce rates. Let\'s optimize your site caching...</p>'
    },
    {
      id: 'page_topical_authority',
      site_id: site.id,
      url: 'https://affiliatemarketingforsuccess.com/topical-authority-seo-guide/',
      title: 'Topical Authority SEO: How to Dominate Search Engine Results',
      meta_description: 'What is topical authority and how do you build it? Learn how to map keyword clusters, write semantic content, and establish E-E-A-T niche expertise.',
      word_count: 2900,
      publish_date: '2025-01-20T00:00:00.000Z',
      traffic_estimate: 1100,
      status: 'Indexed',
      score_seo: 86,
      score_geo: 85,
      score_monetization: 30,
      score_authority: 88,
      score_technical: 80,
      score_quality: 88,
      content_html: '<h1>Topical Authority SEO</h1><p>Google doesn\'t just rank individual pages; it ranks sites based on their domain authority in specific areas...</p>'
    }
  ];

  pages.forEach(p => db.insert('pages', p));

  // 4. Topic Clusters
  const clusters = [
    { id: 'cluster_aff', name: 'Affiliate Marketing', hub_page_id: 'page_home', description: 'Strategies, network selections, and disclosure rules.' },
    { id: 'cluster_blog', name: 'Blogging Guides', hub_page_id: 'page_start_blog', description: 'Hosting, configuration, setup, and blogging fundamentals.' },
    { id: 'cluster_seo', name: 'SEO & Core Vitals', hub_page_id: 'page_topical_authority', description: 'Plugin comparisons, PageSpeed improvements, schema structure, and topical coverage.' },
    { id: 'cluster_ai', name: 'AI Blogging Tools', hub_page_id: 'page_ai_tools', description: 'AI generation frameworks, writing assistance, prompts, and compliance.' },
    { id: 'cluster_email', name: 'Email Marketing', hub_page_id: 'page_email_marketing', description: 'Newsletter lists, conversion flows, newsletter monetization.' }
  ];
  clusters.forEach(c => db.insert('topic_clusters', c));

  // 5. SEO Issues
  const issues = [
    {
      page_id: 'page_beginners',
      issue_type: 'broken_link',
      priority: 'Critical',
      details: {
        problem: 'Broken affiliate network link in body text.',
        evidence: 'Link to https://expired-affiliate-network.com/join returned HTTP 404 (Not Found).',
        why_it_matters: 'Broken links disrupt user experience, cause loss of commissions, and leak page rank back to search bots.',
        exact_fix: 'Replace URL with the updated signup link: https://shareasale.com/ or remove the expired merchant section.',
        expected_upside: 'Restores user click-through rate, reclaims leaked outbound page authority, and restores commission potentials.',
        confidence: '95%', effort: 'Low (5 mins)', risk: 'None',
        steps: '1. Open the post editor.\n2. Navigate to line #142.\n3. Replace expired-affiliate-network.com link with ShareASale URL.\n4. Click Save.',
        validation: 'Re-crawl the page or run an HTTP status check on the new link.'
      },
      status: 'Active'
    },
    {
      page_id: 'page_seo_review',
      issue_type: 'missing_disclosure',
      priority: 'High',
      details: {
        problem: 'Missing Affiliate Disclosure declaration.',
        evidence: 'No semantic disclosure block found in the viewport (top 15% of HTML page text structure). Outbound links to RankMath/Yoast contain tracking parameters (?ref=).',
        why_it_matters: 'FTC guidelines require affiliate disclosures to be clear and conspicuous before any affiliate link is clicked. Failure to comply can lead to legal penalties and removal from affiliate networks.',
        exact_fix: 'Add the standard FTC disclosure text at the beginning of the post body, above the fold.',
        expected_upside: 'Achieves full FTC legal compliance and builds transparency and trust with human readers.',
        confidence: '100%', effort: 'Low (2 mins)', risk: 'None',
        steps: '1. Select the top block of the post in WordPress.\n2. Insert a reusable block with the text: "Disclosure: This post contains affiliate links. If you buy through them, we may earn a commission at no extra cost to you."\n3. Set CSS formatting to a clean italic tag.',
        validation: 'Confirm the disclosure renders instantly on the page above any commercial call to action.'
      },
      status: 'Active'
    },
    {
      page_id: 'page_start_blog',
      issue_type: 'redirect_chain',
      priority: 'High',
      details: {
        problem: '3-Step Redirect Chain for internal links.',
        evidence: 'Links targeting /start-blog redirect to /blogging-setup, which redirects to /how-to-start-a-blog-and-make-money/.',
        why_it_matters: 'Redirect chains waste crawl budget, increase page load time, and leak link equity (PageRank). Directing internal links straight to the target preserves crawl efficiency.',
        exact_fix: 'Change all internal link references targeting /start-blog and /blogging-setup to point directly to /how-to-start-a-blog-and-make-money/.',
        expected_upside: 'Saves 250ms latency for crawling and ensures 100% link equity passes to the hub post.',
        confidence: '90%', effort: 'Medium (15 mins)', risk: 'Very Low',
        steps: '1. Run a search for all references to "/start-blog" in the database.\n2. Update internal anchors to href="/how-to-start-a-blog-and-make-money/".\n3. Save updates.',
        validation: 'Re-test internal link redirect responses. They must return HTTP 200 directly.'
      },
      status: 'Active'
    },
    {
      page_id: 'page_money_no_ads',
      issue_type: 'thin_content',
      priority: 'High',
      details: {
        problem: 'Thin Content (Under 800 Words).',
        evidence: 'Total word count is 750 words. Subject topic "Make Money Blogging Without Ads" requires comprehensive explanations of alternative networks.',
        why_it_matters: 'Thin posts rarely rank in top positions due to lack of comprehensive entity coverage. Google\'s helpful content guidelines penalize brief posts that do not satisfy search intent.',
        exact_fix: 'Expand the article to 2,000+ words covering sponsorship models, digital product sales, and consulting services, with real-world earnings case studies.',
        expected_upside: 'Increases organic traffic by up to 250% and improves the page quality score from 50 to 90.',
        confidence: '85%', effort: 'High (3 hours)', risk: 'Low',
        steps: '1. Generate a content gap analysis outline.\n2. Add subsections on "Sponsorship outreach scripts" and "Selling courses".\n3. Integrate E-E-A-T tables detailing case studies.\n4. Update WordPress post.',
        validation: 'Confirm word count exceeds 2,000 words and semantic entities match top ranking sites.'
      },
      status: 'Active'
    },
    {
      page_id: 'page_speed_opt',
      issue_type: 'slow_page',
      priority: 'Medium',
      details: {
        problem: 'Slow Core Web Vitals on Mobile (PageSpeed Score: 45).',
        evidence: 'Largest Contentful Paint (LCP) is 4.8s (exceeds 2.5s limit) and Cumulative Layout Shift (CLS) is 0.28.',
        why_it_matters: 'Google uses Core Web Vitals as a direct ranking signal. Slow loading speeds increase bounce rate and harm search index priority.',
        exact_fix: 'Implement local image webp conversion, defer non-critical Javascript, and configure cache page preloading.',
        expected_upside: 'Improves LCP to under 1.8s and raises mobile PageSpeed score to 85+, leading to positive ranking boosts.',
        confidence: '90%', effort: 'Medium (1 hour)', risk: 'Low',
        steps: '1. Compress all hero images and convert to .webp formats.\n2. Defer third-party scripts (e.g., ad tags/analytics) until user interaction.\n3. Turn on page pre-caching.',
        validation: 'Run PageSpeed API test again to confirm Mobile scores enter the green range (>80).'
      },
      status: 'Active'
    },
    {
      page_id: 'page_email_marketing',
      issue_type: 'missing_meta',
      priority: 'Medium',
      details: {
        problem: 'Missing Meta Description tag.',
        evidence: 'HTML head tag has no `<meta name="description">` declared. Browsers extract random body snippet.',
        why_it_matters: 'Meta descriptions are the primary sales pitch in Google search results. Missing ones lead to automated snippet generation, which reduces Click-Through-Rate (CTR).',
        exact_fix: 'Write and insert a compelling meta description of 120-155 characters featuring keyword targets and user CTAs.',
        expected_upside: 'Improves Search Engine Result CTR by an estimated 15-25%.',
        confidence: '95%', effort: 'Low (3 mins)', risk: 'None',
        steps: '1. Open the post inside WordPress.\n2. Write: "Learn how to build a profitable email list from scratch, create automated campaigns, and insert high-paying affiliate links ethically. Read the guide!" in RankMath.\n3. Publish changes.',
        validation: 'Inspect page source code and check for `<meta name="description" content="..."`.'
      },
      status: 'Active'
    }
  ];

  issues.forEach(i => db.insert('seo_issues', i));

  // 6. Rewrite Tasks & Content Briefs (Seed Top 10 Rewrite Priorities)
  const rewrites = [
    {
      page_id: 'page_start_blog',
      status: 'Recommend',
      draft_content: '',
      revision_history: [],
      rollback_notes: 'Original text version saved in backup sitemaps.',
      upside_score: 94, // Out of 100
      decay_rate: '22% Traffic loss since last year',
      reasons: 'Outdated hosting pricing (refers to 2023 plans), weak entity connection to "AI blogging plugin", missing comparison table for hosting providers.'
    },
    {
      page_id: 'page_beginners',
      status: 'Draft',
      draft_content: '<h2>Updated: Best Beginner Affiliate Networks</h2><p>Here is an upgraded directory of top beginner-friendly platforms...</p>',
      revision_history: [{ date: new Date().toISOString(), editor: 'AMFS Growth OS System' }],
      rollback_notes: 'Staged draft contains new tables.',
      upside_score: 89,
      decay_rate: '12% organic drop-off',
      reasons: 'Broken links, outdated affiliate commission listings, missing FTC compliance declarations.'
    },
    {
      page_id: 'page_money_no_ads',
      status: 'Recommend',
      draft_content: '',
      revision_history: [],
      rollback_notes: 'Original post contains thin text of 750 words.',
      upside_score: 87,
      decay_rate: 'Stagnant at page 3 rankings',
      reasons: 'Thin content length, missing visual comparison structures, lacks high-intent affiliate offers.'
    },
    {
      page_id: 'page_email_marketing',
      status: 'Recommend',
      draft_content: '',
      revision_history: [],
      rollback_notes: '',
      upside_score: 74,
      decay_rate: '4% decay',
      reasons: 'Missing meta descriptions, low CTAs, lacks conversational answer blocks for AEO search.'
    }
  ];

  rewrites.forEach(r => {
    const task = db.insert('rewrite_tasks', r);
    // Create matching Content Brief
    db.insert('content_briefs', {
      page_id: task.page_id,
      target_intent: 'Commercial Investigation & Transactional - Users looking for host platforms and setup guidance.',
      entities: ['WordPress hosting', 'Bluehost signup', 'niche site selection', 'affiliate monetization setup', 'Domain registration', 'SSL certificates'],
      faqs: [
        { q: 'How much money can you make blogging?', a: 'Beginners make $500-$2,000/month in their first year, while established authority blogs can make over $50,000/month.' },
        { q: 'Do I need hosting to make money?', a: 'Yes, self-hosted WordPress (.org) is required to freely customize affiliate networks and ads.' }
      ],
      internal_links_suggested: ['/best-affiliate-marketing-programs-for-beginners/', '/email-marketing-for-affiliates/'],
      affiliate_opportunities: ['Bluehost hosting ($65 per referral)', 'Namecheap domain registrations ($2 commission)'],
      schema_json: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': 'How to Start a Blog',
        'step': [
          { '@type': 'HowToStep', 'name': 'Register domain' },
          { '@type': 'HowToStep', 'name': 'Install WordPress' }
        ]
      },
      title_proposal: 'How to Start a Blog and Make Money: Step-by-Step Guide (2026)',
      meta_proposal: 'Step-by-step guide to starting a successful self-hosted blog. Learn domain setup, hosting configuration, and how to monetize for passive income.',
      intro_proposal: 'Want to build a blog that makes money while you sleep? In this upgraded guide, I break down the exact steps to go from zero to your first $1,000/month.',
      outline_json: [
        { heading: 'Step 1: Choose Your Blog Niche', subheadings: ['Why passion is not enough', 'Profitable niche categories'] },
        { heading: 'Step 2: Get Domain & Web Hosting', subheadings: ['Why we recommend self-hosted', 'Step-by-step setup with Bluehost'] }
      ],
      upgrade_checklist: [
        'Add interactive hosting price comparison table',
        'Update outdated pricing snapshots',
        'Add FTC disclosure banner above post fold',
        'Incorporate structured HowTo Schema markup'
      ]
    });
  });

  // 7. Internal Link Suggestions
  const internalLinks = [
    {
      source_page_id: 'page_start_blog',
      target_page_id: 'page_beginners',
      anchor_text: 'beginner-friendly affiliate programs',
      sentence_context: 'Once your blog is set up, the next logical step is to sign up for beginner-friendly affiliate programs to start generating commissions.',
      reason: 'Connects the high-traffic blogging guide to the primary commercial offer recommendations page.',
      status: 'Suggested'
    },
    {
      source_page_id: 'page_ai_tools',
      target_page_id: 'page_seo_review',
      anchor_text: 'plugins like RankMath and Yoast',
      sentence_context: 'For search optimization, many AI-driven writing suites integrate directly with plugins like RankMath and Yoast to streamline SEO writing.',
      reason: 'Passes topical relevance from the trending AI post to the search engine plugin comparison post.',
      status: 'Suggested'
    },
    {
      source_page_id: 'page_money_no_ads',
      target_page_id: 'page_email_marketing',
      anchor_text: 'nurture list through email marketing',
      sentence_context: 'Selling digital goods directly requires a connection tool; you should build a warm audience and nurture list through email marketing tools.',
      reason: 'Directs readers on the monetization page to learn email lead capturing.',
      status: 'Suggested'
    },
    {
      source_page_id: 'page_home',
      target_page_id: 'page_topical_authority',
      anchor_text: 'topical authority strategies',
      sentence_context: 'Our modern approach emphasizes building topical authority strategies rather than writing thin, disjointed review posts.',
      reason: 'Ensures homepage readers discover the core SEO philosophy guide.',
      status: 'Approved'
    }
  ];

  internalLinks.forEach(l => db.insert('internal_link_suggestions', l));

  // 8. Recommendations (Growth Command Center "Today's 5 highest-impact actions")
  const recommendations = [
    {
      site_id: site.id,
      page_id: 'page_beginners',
      title: 'Fix broken affiliate link on beginners guide',
      description: 'A key signup URL returns a 404 error, costing you active reader commissions.',
      details_json: {
        problem: 'Broken affiliate network signup link in body content.',
        evidence: 'Link to https://expired-affiliate-network.com/join returns HTTP 404.',
        why_it_matters: 'The beginners page generates 8,500 monthly views. A broken link leads to direct loss of conversions and hurts trust.',
        exact_fix: 'Replace the href attribute on line #142 with ShareASale signup URL.',
        expected_upside: 'Restores commission capture and improves user outbound link trust.',
        confidence: 'High (95%)',
        effort: 'Low (5 mins)',
        risk: 'None',
        steps: ['1. Go to posts list.', '2. Search "12 Best Affiliate Marketing Programs".', '3. Find and replace expired link with ShareASale URL.', '4. Save Draft.'],
        validation: 'Confirm the link now redirects successfully to ShareASale.'
      },
      status: 'Active'
    },
    {
      site_id: site.id,
      page_id: 'page_seo_review',
      title: 'Insert FTC disclosure statement above the fold',
      description: 'The product comparison page has active affiliate links but lacks a visible legal disclosure.',
      details_json: {
        problem: 'Lack of visible affiliate disclosure at the top of a commercial post.',
        evidence: 'Found 14 outbound tracked links, but no disclosure statement above the first link.',
        why_it_matters: 'Violates FTC guidelines, putting the site at risk of penalization by search engines and affiliate network programs.',
        exact_fix: 'Insert standard disclosure banner: "Disclosure: This post contains affiliate links..." right below the main header.',
        expected_upside: 'Full compliance with consumer protection laws and improved buyer transparency.',
        confidence: 'High (100%)',
        effort: 'Low (2 mins)',
        risk: 'None',
        steps: ['1. Go to post editor.', '2. Add disclosure block to top template.', '3. Style it with custom italic class.', '4. Update post.'],
        validation: 'Verify disclosure displays clearly before any commercial product link.'
      },
      status: 'Active'
    },
    {
      site_id: site.id,
      page_id: 'page_money_no_ads',
      title: 'Expand thin content length to improve SERP rankings',
      description: 'The ad-free monetization post is only 750 words, making it too short to compete for high-volume keywords.',
      details_json: {
        problem: 'Thin content length below competition averages.',
        evidence: 'Article contains 750 words, compared to competitor averages of 2,200 words.',
        why_it_matters: 'Thin pages are filtered out of search engine indices because they lack topical authority and comprehensive user answers.',
        exact_fix: 'Expand the article to 2,000+ words adding sections on Sponsor kits, Courses, and Digital Sales.',
        expected_upside: 'Page 1 search engine positions and an estimated +1,200 monthly pageviews.',
        confidence: 'Medium (85%)',
        effort: 'High (3 hours)',
        risk: 'Low',
        steps: ['1. View the rewrite brief.', '2. Add case study sections.', '3. Draft content updates.', '4. Push to WordPress draft.'],
        validation: 'Check word count is above 2,000 and confirm keywords rank higher.'
      },
      status: 'Active'
    },
    {
      site_id: site.id,
      page_id: 'page_speed_opt',
      title: 'Optimize Mobile Core Web Vitals (LCP & CLS)',
      description: 'Slow loading speed on mobile is dragging down your search rankings.',
      details_json: {
        problem: 'Mobile speed performance is poor (PageSpeed Score: 45).',
        evidence: 'Largest Contentful Paint is 4.8 seconds.',
        why_it_matters: 'Google penalizes slow mobile layouts in favor of faster web assets.',
        exact_fix: 'Compress images to WebP, defer unused JS, and configure cache page assets.',
        expected_upside: 'Score rises to 85+, LCP drops to 1.8s, leading to higher domain rankings.',
        confidence: 'High (90%)',
        effort: 'Medium (1 hour)',
        risk: 'Low',
        steps: ['1. Install a compression plugin.', '2. Convert banners to WebP.', '3. Defer render-blocking JS files.'],
        validation: 'Run a new PageSpeed metrics check.'
      },
      status: 'Active'
    },
    {
      site_id: site.id,
      page_id: 'page_start_blog',
      title: 'Eliminate internal link redirect chains',
      description: 'Internal links are routing through multiple redirects, slowing down user browsing and leaking search value.',
      details_json: {
        problem: 'Internal link redirect chains (e.g. /start-blog redirects twice).',
        evidence: 'Anchor pointing to /start-blog redirects to /blogging-setup, which redirects to /how-to-start-a-blog-and-make-money/.',
        why_it_matters: 'Increases bounce rate for users and wastes crawler scan budgets.',
        exact_fix: 'Change all site internal links targeting /start-blog to point directly to /how-to-start-a-blog-and-make-money/.',
        expected_upside: 'Saves 200ms user page load and keeps 100% link authority on the target hub.',
        confidence: 'High (90%)',
        effort: 'Medium (15 mins)',
        risk: 'None',
        steps: ['1. Search all database posts for href="/start-blog".', '2. Replace with href="/how-to-start-a-blog-and-make-money/".', '3. Update posts.'],
        validation: 'Test links return a clean HTTP 200 instantly.'
      },
      status: 'Active'
    }
  ];

  recommendations.forEach(r => db.insert('recommendations', r));

  // 9. Affiliate Offers
  const offers = [
    { name: 'Bluehost Hosting', merchant: 'Bluehost / Impact', redirect_url: 'https://bluehost.sjv.io/amfs', status: 'Active' },
    { name: 'RankMath SEO Pro', merchant: 'RankMath', redirect_url: 'https://rankmath.com/?ref=amfs', status: 'Active' },
    { name: 'ConvertKit Newsletter', merchant: 'ConvertKit', redirect_url: 'https://convertkit.com/?lmref=amfs', status: 'Active' },
    { name: 'Namecheap Domains', merchant: 'Namecheap / Impact', redirect_url: 'https://namecheap.pxf.io/amfs', status: 'Active' }
  ];
  offers.forEach(o => db.insert('affiliate_offers', o));

  logActivity('Database Seeded', 'Successfully seeded database with real example data for affiliatemarketingforsuccess.com.');
  console.log("Database seeded successfully.");
}
