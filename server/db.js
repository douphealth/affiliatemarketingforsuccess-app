import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

// Helper to ensure database file exists
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      sites: [],
      pages: [],
      crawls: [],
      seo_issues: [],
      content_briefs: [],
      rewrite_tasks: [],
      internal_link_suggestions: [],
      topic_clusters: [],
      affiliate_offers: [],
      recommendations: [],
      integrations: [],
      activity_log: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

// Read database
export function readDb() {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return {};
  }
}

// Write database
export function writeDb(data) {
  ensureDb();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// Activity logging helper
export function logActivity(action, message) {
  const db = readDb();
  const logEntry = {
    id: 'act_' + Math.random().toString(36).substr(2, 9),
    action,
    message,
    created_at: new Date().toISOString()
  };
  db.activity_log.unshift(logEntry);
  // Keep logs at a reasonable size
  if (db.activity_log.length > 500) {
    db.activity_log = db.activity_log.slice(0, 500);
  }
  writeDb(db);
  return logEntry;
}

// Table helper queries
export const db = {
  // Generic collection actions
  get(collectionName) {
    const dbData = readDb();
    return dbData[collectionName] || [];
  },

  getById(collectionName, id) {
    const dbData = readDb();
    const items = dbData[collectionName] || [];
    return items.find(item => item.id === id) || null;
  },

  insert(collectionName, item) {
    const dbData = readDb();
    if (!dbData[collectionName]) {
      dbData[collectionName] = [];
    }
    const newItem = {
      id: item.id || (collectionName.substr(0, 3) + '_' + Math.random().toString(36).substr(2, 9)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item
    };
    dbData[collectionName].push(newItem);
    writeDb(dbData);
    return newItem;
  },

  update(collectionName, id, updates) {
    const dbData = readDb();
    const items = dbData[collectionName] || [];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    dbData[collectionName] = items;
    writeDb(dbData);
    return items[index];
  },

  delete(collectionName, id) {
    const dbData = readDb();
    const items = dbData[collectionName] || [];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    dbData[collectionName] = items.filter(item => item.id !== id);
    writeDb(dbData);
    return true;
  },

  find(collectionName, queryFn) {
    const dbData = readDb();
    const items = dbData[collectionName] || [];
    return items.filter(queryFn);
  },

  clear(collectionName) {
    const dbData = readDb();
    dbData[collectionName] = [];
    writeDb(dbData);
    return true;
  }
};
