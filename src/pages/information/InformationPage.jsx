import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { isPaidServiceLive } from '../../config/paidService';
import { informationSections } from '../../content/information/navigation.js';
import { getVisibleLinks, resolveInformationPath } from '../../content/information/articles.js';
import { getGuides } from '../../content/information/guides.js';
import { getConcepts } from '../../content/information/concepts.js';
import { getNews } from '../../content/information/news.js';
import { getFaq } from '../../content/information/faq.js';
import { usePublicPage } from './usePublicPage';
import './InformationPage.css';

function SectionLinks({ active, label }) {
  return <nav aria-label={label}><ul className="info-nav-list">
    {informationSections.map(section => <li key={section.id}>
      <Link to={section.path} aria-current={active === section.id ? 'page' : undefined}>{section.label}</Link>
    </li>)}
  </ul></nav>;
}

function ContentLink({ link }) {
  return link.href.startsWith('https://')
    ? <a href={link.href}>{link.label}<span aria-hidden="true"> →</span></a>
    : <Link to={link.href}>{link.label}<span aria-hidden="true"> →</span></Link>;
}

function RelatedLinks({ links }) {
  const visible = getVisibleLinks(links);
  if (!visible.length) return null;
  return <ul className="info-related">
    {visible.map(link => <li key={link.href}><ContentLink link={link} /></li>)}
  </ul>;
}

function CopyBlocks({ blocks }) {
  return blocks.map((block, index) => <section className="info-copy-block" key={block.heading || index}>
    {block.heading && <h2>{block.heading}</h2>}
    {block.type === 'keyPoint' && <aside className="info-key-point"><strong>Κρατήστε αυτό</strong><p>{block.text}</p></aside>}
    {block.type === 'simpleFormula' && <p className="info-formula">{block.text}</p>}
    {block.type === 'statGrid' && <figure className="info-stat-grid"><figcaption>{block.caption}</figcaption>
      <dl>{block.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
    </figure>}
    {block.type === 'dataTable' && <table className="info-data-table"><caption>{block.caption}</caption>
      <thead><tr>{block.headers.map((header, i) => <th scope="col" key={i}>{header}</th>)}</tr></thead>
      <tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0
        ? <th scope="row" key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody>
    </table>}
    {block.paragraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    {block.items?.length > 0 && <ul className="info-text-list">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
    <RelatedLinks links={block.links} />
  </section>);
}

const formatDate = (date) => new Intl.DateTimeFormat('el-GR', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));

function ArticleDates({ article }) {
  const dates = [['publishedAt', 'Δημοσίευση'], ['updatedAt', 'Ενημέρωση κειμένου'], ['sourcesCheckedAt', 'Έλεγχος πηγών']]
    .filter(([key]) => article[key]);
  if (!dates.length) return null;
  return <div className="info-dates">{dates.map(([key, label]) =>
    <p key={key}>{label}: <time dateTime={article[key]}>{formatDate(article[key])}</time></p>
  )}</div>;
}

function ArticleList({ section }) {
  const entries = section === 'guides' ? getGuides() : section === 'concepts' ? getConcepts() : getNews();
  if (!entries.length) return <p className="info-empty">Δεν έχουν δημοσιευθεί ακόμη ενημερώσεις σε αυτή την ενότητα.</p>;
  return <ul className="info-entry-list">
    {entries.map(entry => <li key={entry.id}>
      {(section === 'guides' || entry.category === 'guide') && <span className="info-entry-kind">{entry.kind}</span>}
      <h2><ContentLink link={{ href: entry.href, label: entry.title }} /></h2>
      <ArticleDates article={entry} /><p>{entry.summary}</p>
    </li>)}
  </ul>;
}

function SectionContent({ section }) {
  const { hash } = useLocation();
  useEffect(() => {
    if (section !== 'faq' || !['#faq-report-access', '#faq-report-retention'].includes(hash)) return;
    const frame = window.requestAnimationFrame(() => {
      const answer = document.getElementById(hash.slice(1));
      if (!answer) return;
      answer.open = true;
      answer.querySelector('summary')?.focus({ preventScroll: true });
      answer.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [section, hash]);
  if (['guides', 'concepts', 'news'].includes(section)) return <ArticleList section={section} />;
  if (section === 'faq') return <div className="info-faq">
    {getFaq(isPaidServiceLive).map(faq => <details key={faq.id} id={`faq-${faq.id}`}>
      <summary>{faq.question}</summary>
      <div className="info-faq-answer">
        {faq.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <RelatedLinks links={faq.links} />
      </div>
    </details>)}
  </div>;
  return null;
}

export default function InformationPage() {
  const { pathname } = useLocation();
  const view = resolveInformationPath(pathname);
  const isPlainLanguageArticle = ['guide', 'concept'].includes(view.article?.category);
  const title = view.kind === 'not-found' ? 'Η σελίδα δεν βρέθηκε'
    : view.article?.title || view.section.title || view.section.label;
  const description = view.kind === 'not-found' ? 'Επιστρέψτε στους οδηγούς και στις ενότητες ενημέρωσης της Sintaximou.'
    : view.article?.summary || view.section.description;
  const headingRef = usePublicPage(title, description);
  if (pathname === '/enimerosi/vasikes-ennoies') return <Navigate to="/enimerosi/me-apla-logia" replace />;
  return <div className="info-page"><div className="info-layout">
    <aside className="info-sidebar" aria-label="Ενότητες ενημέρωσης">
      <p className="info-nav-title">Ενημέρωση</p>
      <SectionLinks active={view.section?.id} label="Πλοήγηση ενημέρωσης" />
    </aside>
    <details className="info-mobile-nav" key={pathname}>
      <summary><span>Ενότητες ενημέρωσης</span><strong>{view.section?.label || 'Η σελίδα δεν βρέθηκε'}</strong></summary>
      <SectionLinks active={view.section?.id} label="Πτυσσόμενη πλοήγηση ενημέρωσης" />
    </details>
    <article className="info-content">
      <header className="info-header">
        {view.article && <Link className="info-back" to={view.section.path}>← {view.section.label}</Link>}
        <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
        <p className="info-intro">{description}</p>
        {view.article && <ArticleDates article={view.article} />}
      </header>
      {view.kind === 'not-found' ? <Link to="/enimerosi">Επιστροφή στους οδηγούς →</Link>
        : view.article ? <>
          {isPlainLanguageArticle && <aside className="info-plain-language" aria-label="Με απλά λόγια">
            <h2>Με απλά λόγια</h2>
            <p>Το άρθρο εξηγεί τη γενική εικόνα και τα βασικά σημεία με απλή γλώσσα. Δεν καλύπτει όλες τις ειδικές περιπτώσεις ή εξαιρέσεις που μπορεί να ισχύουν σε ένα συγκεκριμένο ασφαλιστικό ιστορικό.</p>
          </aside>}
          <CopyBlocks blocks={view.article.body} />
          {getVisibleLinks([view.article.primaryLink]).length > 0 && <div className="info-primary-link"><RelatedLinks links={[view.article.primaryLink]} /></div>}
          {getVisibleLinks(view.article.related).length > 0 && <section className="info-sources">
            <h2>Σχετικές σελίδες</h2><RelatedLinks links={view.article.related} />
          </section>}
        </> : <SectionContent section={view.section.id} />}
    </article>
  </div></div>;
}
