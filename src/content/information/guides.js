import { getArticleEntries } from './articles.js';

// A reference to an existing page, not a second copy of its content.
const existingGuides = [
  { id: 'existing-pdf-guide', title: 'Πώς κατεβάζω το ασφαλιστικό ιστορικό μου από τον e-ΕΦΚΑ',
    kind: 'Υπάρχων οδηγός', href: '/pdf-guide',
    summary: 'Βήματα για να κατεβάσετε το Αναλυτικό Ιστορικό Ασφάλισης από την επίσημη πλατφόρμα του e-ΕΦΚΑ.' },
];

export const getGuides = () => [...existingGuides, ...getArticleEntries('guide')];
