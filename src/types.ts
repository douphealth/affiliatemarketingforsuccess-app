export interface Site {
  id: string;
  url: string;
  name: string;
  created_at: string;
  last_crawled_at: string;
}

export interface Page {
  id: string;
  site_id: string;
  url: string;
  title: string;
  meta_description: string;
  word_count: number;
  publish_date: string;
  traffic_estimate: number;
  status: string;
  score_seo: number;
  score_geo: number;
  score_monetization: number;
  score_authority: number;
  score_technical: number;
  score_quality: number;
  content_html?: string;
  created_at: string;
  updated_at: string;
}

export interface Crawl {
  id: string;
  site_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'Pending' | 'Running' | 'Completed';
  pages_crawled: number;
  issues_found: number;
  created_at: string;
  updated_at: string;
}

export interface SEOIssue {
  id: string;
  page_id: string;
  page_url?: string;
  page_title?: string;
  issue_type: 'broken_link' | 'redirect_chain' | 'missing_meta' | 'thin_content' | 'cannibalization' | 'no_schema' | 'missing_disclosure' | 'slow_page' | 'missing_schema' | string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  details: {
    problem: string;
    evidence: string;
    why_it_matters: string;
    exact_fix: string;
    expected_upside: string;
    confidence: string;
    effort: string;
    risk: string;
    steps: string;
    validation: string;
  };
  status: 'Active' | 'Resolved' | 'Ignored';
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface OutlineItem {
  heading: string;
  subheadings: string[];
}

export interface ContentBrief {
  id: string;
  page_id: string;
  target_intent: string;
  entities: string[];
  faqs: FAQ[];
  internal_links_suggested: string[];
  affiliate_opportunities: string[];
  schema_json: any;
  title_proposal: string;
  meta_proposal: string;
  intro_proposal: string;
  outline_json: OutlineItem[];
  upgrade_checklist: string[];
  created_at: string;
  updated_at: string;
}

export interface RewriteTask {
  id: string;
  page_id: string;
  url?: string;
  title?: string;
  word_count?: number;
  traffic_estimate?: number;
  score_quality?: number;
  score_seo?: number;
  status: 'Analyze' | 'Recommend' | 'Draft' | 'Review' | 'Approved' | 'Exported';
  draft_content: string;
  revision_history: Array<{ date: string; editor: string }>;
  rollback_notes: string;
  upside_score?: number;
  decay_rate?: string;
  reasons?: string;
  created_at: string;
  updated_at: string;
}

export interface InternalLinkSuggestion {
  id: string;
  source_page_id: string;
  source_url?: string;
  source_title?: string;
  target_page_id: string;
  target_url?: string;
  target_title?: string;
  anchor_text: string;
  sentence_context: string;
  reason: string;
  status: 'Suggested' | 'Approved' | 'Added' | 'Rejected';
  created_at: string;
  updated_at: string;
}

export interface TopicCluster {
  id: string;
  name: string;
  hub_page_id: string;
  hub_url?: string;
  hub_title?: string;
  description: string;
  volume_estimate?: number;
  articles?: Array<{ id: string; title: string; url: string; score: number }>;
  created_at: string;
  updated_at: string;
}

export interface AffiliateOffer {
  id: string;
  name: string;
  merchant: string;
  redirect_url: string;
  status: 'Active' | 'Paused';
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  site_id: string;
  page_id: string;
  title: string;
  description: string;
  details_json: {
    problem: string;
    evidence: string;
    why_it_matters: string;
    exact_fix: string;
    expected_upside: string;
    confidence: string;
    effort: string;
    risk: string;
    steps: string[];
    validation: string;
  };
  status: 'Active' | 'Approved' | 'Dismissed';
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  credentials_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  message: string;
  created_at: string;
}
