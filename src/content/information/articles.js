import { informationSections, articlePath } from './navigation.js';

// Vite discovers every article file; this module is used only by the lazy information area.
const articleModules = import.meta.glob('./articles/*.js', { eager: true, import: 'default' });
export const articles = Object.values(articleModules);
export const categorySections = { guide: 'guides', concept: 'concepts', news: 'news' };
const categoryLabels = { guide: 'Οδηγός', concept: 'Με απλά λόγια', news: 'Νέα & εξελίξεις' };
const hasText = value => typeof value === 'string' && value.trim().length > 0;
const validKey = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const hasCategory = value => Object.hasOwn(categorySections, value);
const optionalText = value => value === undefined || hasText(value);
const optionalArray = (value, check) => value === undefined || (Array.isArray(value) && value.every(check));
const officialDomains = ['gov.gr', 'efka.gov.gr', 'e-efka.gov.gr', 'et.gr'];

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isSafeLink(value) {
  if (!hasText(value) || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (/^#[a-z0-9-]+$/.test(value)) return true;
  try {
    const url = new URL(value, 'https://sintaximou.local');
    if (value.startsWith('/') && !value.startsWith('//')) return url.origin === 'https://sintaximou.local';
    return value.startsWith('https://') && url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

function validLink(link) {
  if (!link || typeof link !== 'object') return false;
  if (link.articleId !== undefined) return validKey(link.articleId) && optionalText(link.label) && link.href === undefined;
  return hasText(link.label) && isSafeLink(link.href);
}

function officialSource(source) {
  if (!validKey(source?.id) || !hasText(source.label) || !optionalText(source.note)
    || !isSafeLink(source.url) || !source.url.startsWith('https://')) return false;
  const url = new URL(source.url);
  return officialDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
}

export function isValidContentBlock(block, sourceIds = []) {
  if (!block || !optionalText(block.heading) || !optionalArray(block.sourceIds, id => sourceIds.includes(id))
    || !optionalArray(block.paragraphs, hasText) || !optionalArray(block.items, hasText)
    || !optionalArray(block.links, validLink)) return false;
  if (block.type === 'keyPoint' || block.type === 'simpleFormula') return hasText(block.text);
  if (block.type === 'statGrid') return hasText(block.caption) && Array.isArray(block.stats)
    && block.stats.length > 0 && block.stats.every(stat => stat && hasText(stat.label) && hasText(stat.value));
  if (block.type === 'dataTable') return hasText(block.caption) && Array.isArray(block.headers)
    && block.headers.length > 0 && block.headers.every(hasText) && Array.isArray(block.rows)
    && block.rows.length > 0 && block.rows.every(row => Array.isArray(row)
      && row.length === block.headers.length && row.every(hasText));
  return block.type === undefined && optionalArray(block.paragraphs, hasText)
    && optionalArray(block.items, hasText) && (block.paragraphs?.length > 0 || block.items?.length > 0)
    && optionalArray(block.links, validLink);
}

export function isPublishableArticle(article) {
  if (!article || article.status !== 'published' || !validKey(article.id) || !validKey(article.slug)
    || !hasCategory(article.category) || !hasText(article.title) || !hasText(article.summary)
    || !Array.isArray(article.body) || article.body.length === 0
    || !optionalArray(article.sources, officialSource)
    || !optionalArray(article.related, validLink)
    || (article.primaryLink !== undefined && !validLink(article.primaryLink))
    || !optionalArray(article.alsoListedIn, hasCategory)
    || (article.order !== undefined && !Number.isFinite(article.order))) return false;

  const sourceIds = (article.sources || []).map(source => source.id);
  if (new Set(sourceIds).size !== sourceIds.length) return false;
  if (!article.body.every(block => isValidContentBlock(block, sourceIds))) return false;

  for (const key of ['publishedAt', 'updatedAt', 'sourcesCheckedAt']) {
    if (article[key] !== undefined && !validDate(article[key])) return false;
  }
  if (article.updatedAt && article.publishedAt && article.updatedAt < article.publishedAt) return false;
  return article.category !== 'news' || (validDate(article.publishedAt) && sourceIds.length > 0);
}

export function getPublishedArticles(collection = articles) {
  // Duplicate IDs or slugs are ambiguous: expose neither entry until corrected.
  const ids = new Map();
  const slugs = new Map();
  collection.forEach(article => {
    if (!article) return;
    ids.set(article.id, (ids.get(article.id) || 0) + 1);
    slugs.set(article.slug, (slugs.get(article.slug) || 0) + 1);
  });
  return collection.filter(article => article && ids.get(article.id) === 1
    && slugs.get(article.slug) === 1 && isPublishableArticle(article));
}

export function getArticleEntries(category, collection = articles) {
  return getPublishedArticles(collection)
    .filter(article => article.category === category || article.alsoListedIn?.includes(category))
    .sort((a, b) => category === 'news'
      ? (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.slug.localeCompare(b.slug)
      : (a.order ?? 1000) - (b.order ?? 1000) || a.title.localeCompare(b.title, 'el'))
    .map(article => ({ ...article, href: articlePath(article.slug), kind: categoryLabels[article.category] }));
}

export function getVisibleLinks(links = [], collection = articles) {
  const published = getPublishedArticles(collection);
  return links.flatMap(link => {
    if (!validLink(link)) return [];
    if (link.articleId) {
      const article = published.find(item => item.id === link.articleId);
      return article ? [{ label: link.label || article.title, href: articlePath(article.slug) }] : [];
    }
    if (link.href.startsWith('/enimerosi/arthra/')) {
      const pathname = link.href.split(/[?#]/)[0];
      if (!published.some(article => articlePath(article.slug) === pathname)) return [];
    }
    return [link];
  });
}

export function resolveInformationPath(pathname, collection = articles) {
  const section = informationSections.find(item => item.path === pathname);
  if (section) return { kind: 'section', section };
  const article = getPublishedArticles(collection).find(item => articlePath(item.slug) === pathname);
  if (article) return { kind: 'article', article,
    section: informationSections.find(item => item.id === categorySections[article.category]) };
  return { kind: 'not-found', section: null };
}
