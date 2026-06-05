import axios from 'axios';
import * as cheerio from 'cheerio';
import { db, logActivity } from './db.js';

// Helper to check if a URL is valid
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Check if a link is broken (HTTP status probe)
async function isLinkBroken(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 3000, 
      headers: { 'User-Agent': 'AMFS-GrowthOS-Bot/1.0' } 
    });
    return response.status >= 400;
  } catch (err) {
    // If HEAD fails, try GET since some servers block HEAD
    try {
      const response = await axios.get(url, { 
        timeout: 3000, 
        headers: { 'User-Agent': 'AMFS-GrowthOS-Bot/1.0' },
        validateStatus: () => true 
      });
      return response.status >= 400;
    } catch (_) {
      return true; // Connection failed, treat as broken
    }
  }
}

// Main crawl execution
export async function crawlSite(siteUrl, simulate = false) {
  const crawlId = 'crl_' + Math.random().toString(36).substr(2, 9);
  
  db.insert('crawls', {
    id: crawlId,
    site_id: 'site_amfs',
    started_at: new Date().toISOString(),
    completed_at: null,
    status: 'Running',
    pages_crawled: 0,
    issues_found: 0
  });

  logActivity('Crawl Started', `Crawl ${crawlId} started for ${siteUrl}. Mode: ${simulate ? 'Simulation' : 'Live'}`);

  if (simulate) {
    // Wait for a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // We already have seed data, let's mark the crawl as completed and count issues
    const pages = db.get('pages');
    const issues = db.get('seo_issues');
    
    db.update('crawls', crawlId, {
      status: 'Completed',
      completed_at: new Date().toISOString(),
      pages_crawled: pages.length,
      issues_found: issues.length
    });

    db.update('sites', 'site_amfs', {
      last_crawled_at: new Date().toISOString()
    });

    logActivity('Crawl Completed', `Crawl ${crawlId} finished successfully (Simulated). Crawled ${pages.length} pages, detected ${issues.length} issues.`);
    return { crawlId, pagesCrawled: pages.length, issuesFound: issues.length };
  }

  // Live crawling
  let pagesToCrawl = [];
  try {
    // 1. Fetch Sitemap
    let sitemapUrl = siteUrl.endsWith('/') ? `${siteUrl}sitemap.xml` : `${siteUrl}/sitemap.xml`;
    logActivity('Sitemap Fetch', `Fetching sitemap from ${sitemapUrl}`);
    
    let response;
    try {
      response = await axios.get(sitemapUrl, {
        headers: { 'User-Agent': 'AMFS-GrowthOS-Bot/1.0' },
        timeout: 5000
      });
    } catch (e) {
      // Try default alternative sitemap path
      sitemapUrl = siteUrl.endsWith('/') ? `${siteUrl}sitemap_index.xml` : `${siteUrl}/sitemap_index.xml`;
      logActivity('Sitemap Retry', `Trying alternative sitemap: ${sitemapUrl}`);
      response = await axios.get(sitemapUrl, {
        headers: { 'User-Agent': 'AMFS-GrowthOS-Bot/1.0' },
        timeout: 5000
      });
    }

    if (response && response.data) {
      const $ = cheerio.load(response.data, { xmlMode: true });
      $('loc').each((_, elem) => {
        const url = $(elem).text().trim();
        if (isValidUrl(url) && url.startsWith(siteUrl)) {
          pagesToCrawl.push(url);
        }
      });
    }
  } catch (err) {
    logActivity('Sitemap Error', `Failed to crawl sitemap: ${err.message}. Falling back to crawling home page directly.`);
    pagesToCrawl.push(siteUrl);
  }

  // Ensure unique list
  pagesToCrawl = [...new Set(pagesToCrawl)].slice(0, 8); // Limit to 8 pages for safety and speed in the MVP

  if (pagesToCrawl.length === 0) {
    pagesToCrawl.push(siteUrl);
  }

  // Empty existing pages and issues in database to perform a fresh crawl (optional - let's preserve them and append/update)
  // Let's clear SEO issues before a fresh live crawl
  db.clear('seo_issues');
  
  let crawledCount = 0;
  let issueCount = 0;

  for (const url of pagesToCrawl) {
    try {
      logActivity('Page Scan', `Crawling page: ${url}`);
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'AMFS-GrowthOS-Bot/1.0' },
        timeout: 6000
      });
      
      const html = response.data;
      const $ = cheerio.load(html);

      // Extract details
      const title = $('title').text().trim() || 'Missing Title';
      const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
      
      // Calculate word count of body text
      const bodyText = $('body').text() || '';
      const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

      // Extract outgoing links
      const outlinks = [];
      $('a[href]').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href && (href.startsWith('http') || href.startsWith('//'))) {
          outlinks.push(href);
        }
      });

      // Find Schema
      let hasSchema = false;
      $('script[type="application/ld+json"]').each((_, elem) => {
        const text = $(elem).text();
        if (text.includes('@context') && text.includes('schema.org')) {
          hasSchema = true;
        }
      });

      // Find Affiliate Links
      const affiliateKeywords = ['?ref=', 'amzn.to', 'affiliate', 'clickbank', 'shareasale', 'commission', 'pxf.io', 'sjv.io'];
      const hasAffiliateLinks = outlinks.some(link => affiliateKeywords.some(kw => link.includes(kw)));
      const hasDisclosure = bodyText.toLowerCase().includes('disclosure') || bodyText.toLowerCase().includes('affiliate link');

      // Create or update page in database
      let existingPage = db.find('pages', p => p.url === url)[0];
      
      // Calculate default placeholder scores based on audit parameters
      const score_seo = metaDescription ? (title.length > 10 && title.length < 70 ? 90 : 70) : 60;
      const score_technical = wordCount > 2500 ? 80 : 90; // mock tech speed
      const score_monetization = hasAffiliateLinks ? (hasDisclosure ? 85 : 40) : 50;
      const score_geo = hasSchema ? 80 : 50;
      const score_authority = wordCount > 1500 ? 85 : 60;
      const score_quality = wordCount > 800 ? 85 : 50;

      const pageData = {
        site_id: 'site_amfs',
        url,
        title,
        meta_description: metaDescription,
        word_count: wordCount,
        publish_date: existingPage?.publish_date || new Date().toISOString(),
        traffic_estimate: existingPage?.traffic_estimate || Math.floor(Math.random() * 2000) + 100,
        status: 'Indexed',
        score_seo,
        score_geo,
        score_monetization,
        score_authority,
        score_technical,
        score_quality,
        content_html: html.substring(0, 10000) // Store slice of HTML
      };

      let pageId;
      if (existingPage) {
        db.update('pages', existingPage.id, pageData);
        pageId = existingPage.id;
      } else {
        const inserted = db.insert('pages', pageData);
        pageId = inserted.id;
      }

      crawledCount++;

      // Detect issues
      // Issue 1: Missing Meta Description
      if (!metaDescription) {
        db.insert('seo_issues', {
          page_id: pageId,
          issue_type: 'missing_meta',
          priority: 'Medium',
          details: {
            problem: 'Missing Meta Description tag.',
            evidence: `The page ${url} does not have a meta description in its HTML head.`,
            why_it_matters: 'Search engines display meta descriptions in search results. A missing description means they will generate one automatically, which reduces user click-through rate (CTR).',
            exact_fix: 'Add a high-quality, targeted meta description (120-155 characters) summarizing the page content.',
            expected_upside: 'Boosts organic Click-Through-Rate by 10-20%.',
            confidence: '95%', effort: 'Low (3 mins)', risk: 'None',
            steps: `1. Open your SEO plugin (RankMath/Yoast).\n2. Navigate to the meta snippet editor.\n3. Write a description featuring your target keyword.\n4. Save.`,
            validation: 'Re-crawl page to verify meta description exists.'
          },
          status: 'Active'
        });
        issueCount++;
      }

      // Issue 2: Thin content
      if (wordCount < 800) {
        db.insert('seo_issues', {
          page_id: pageId,
          issue_type: 'thin_content',
          priority: 'High',
          details: {
            problem: 'Thin content (under 800 words).',
            evidence: `Word count is only ${wordCount} words.`,
            why_it_matters: 'Thin content is penalized by Google\'s helpful content filters because it usually does not answer search queries comprehensively.',
            exact_fix: 'Expand the article to at least 1,500 words by adding deep research, headings, and detailed descriptions.',
            expected_upside: 'Improves rankings and increases internal link pass equity.',
            confidence: '85%', effort: 'High (3 hours)', risk: 'Low',
            steps: '1. Research primary search queries.\n2. Draft new sections covering questions.\n3. Publish updates.',
            validation: 'Confirm word count exceeds 1,500.'
          },
          status: 'Active'
        });
        issueCount++;
      }

      // Issue 3: Missing schema
      if (!hasSchema) {
        db.insert('seo_issues', {
          page_id: pageId,
          issue_type: 'missing_schema',
          priority: 'Medium',
          details: {
            problem: 'Missing structured Schema Markup (JSON-LD).',
            evidence: 'No JSON-LD structured script found in the HTML document.',
            why_it_matters: 'Schema markup helps search engines parse page context. It is essential for getting rich snippet features, AI Overview inclusions, and voice answers.',
            exact_fix: 'Incorporate structured Article or Product schema markup to the page template.',
            expected_upside: 'Enables SERP rich features and increases eligibility for AI overview citations.',
            confidence: '90%', effort: 'Medium (15 mins)', risk: 'None',
            steps: '1. Go to SEO plugins panel.\n2. Turn on Schema option.\n3. Configure default Article / Guide schema options.\n4. Update page.',
            validation: 'Test page in Google Structured Data Testing Tool.'
          },
          status: 'Active'
        });
        issueCount++;
      }

      // Issue 4: Missing affiliate disclosures
      if (hasAffiliateLinks && !hasDisclosure) {
        db.insert('seo_issues', {
          page_id: pageId,
          issue_type: 'missing_disclosure',
          priority: 'High',
          details: {
            problem: 'Missing Affiliate Disclosure banner.',
            evidence: 'Outbound tracked links detected but no legal compliance text found.',
            why_it_matters: 'Failing to include clear, conspicuous disclosures violates FTC compliance regulations. This can result in legal action or banishment from affiliate networks.',
            exact_fix: 'Add an FTC disclosure banner above the fold of your article.',
            expected_upside: 'Full compliance with regulations, protecting your site from legal issues and maintaining network status.',
            confidence: '100%', effort: 'Low (2 mins)', risk: 'None',
            steps: '1. Add a standard disclosure block in your WordPress editor.\n2. Position it at the top of the post body.\n3. Save changes.',
            validation: 'Confirm disclosure text appears at the top of the page.'
          },
          status: 'Active'
        });
        issueCount++;
      }

      // Check outbound links for broken status (Only test first 3 links per page to save network time)
      const testOutlinks = [...new Set(outlinks)].slice(0, 3);
      for (const link of testOutlinks) {
        if (link.includes('facebook.com') || link.includes('twitter.com') || link.includes('linkedin.com')) continue; // Skip social platforms
        const broken = await isLinkBroken(link);
        if (broken) {
          db.insert('seo_issues', {
            page_id: pageId,
            issue_type: 'broken_link',
            priority: 'Critical',
            details: {
              problem: 'Broken outgoing link.',
              evidence: `Link pointing to ${link} returned a non-200 response or failed to resolve.`,
              why_it_matters: 'Broken links create a poor user experience, raise bounce rates, and leak search crawl budget.',
              exact_fix: `Update the hyperlink target to a valid live URL or remove the link altogether.`,
              expected_upside: 'Improves page navigation quality score and keeps user sessions active.',
              confidence: '95%', effort: 'Low (2 mins)', risk: 'None',
              steps: `1. Open post edit screen.\n2. Locate text containing anchor pointing to ${link}.\n3. Update target URL.\n4. Update post.`,
              validation: 'Test link directly in browser to confirm it loads successfully.'
            },
            status: 'Active'
          });
          issueCount++;
        }
      }

      // Update progress in database
      db.update('crawls', crawlId, {
        pages_crawled: crawledCount,
        issues_found: issueCount
      });

    } catch (err) {
      logActivity('Page Scan Error', `Failed to crawl page ${url}: ${err.message}`);
    }
  }

  db.update('crawls', crawlId, {
    status: 'Completed',
    completed_at: new Date().toISOString()
  });

  db.update('sites', 'site_amfs', {
    last_crawled_at: new Date().toISOString()
  });

  logActivity('Crawl Completed', `Crawl ${crawlId} finished. Crawled ${crawledCount} pages, found ${issueCount} issues.`);
  return { crawlId, pagesCrawled: crawledCount, issuesFound: issueCount };
}
