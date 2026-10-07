export const informationSections = [
  { id: 'guides', label: 'Οδηγοί', path: '/enimerosi',
    description: 'Συγκεντρωμένοι οδηγοί και εργαλεία για τις υπηρεσίες της Sintaximou.' },
  { id: 'concepts', label: 'Με απλά λόγια', path: '/enimerosi/me-apla-logia',
    description: 'Εδώ εξηγούμε τη γενική εικόνα και τα βασικά σημεία με απλή γλώσσα. Ειδικές ασφαλιστικές περιπτώσεις μπορεί να έχουν πρόσθετους κανόνες ή εξαιρέσεις.' },
  { id: 'news', label: 'Νέα & εξελίξεις', path: '/enimerosi/nea',
    description: 'Ενημερώσεις για ασφαλιστικά θέματα και συνταξιοδοτικές εξελίξεις.' },
  { id: 'faq', label: 'Συχνές Ερωτήσεις', path: '/enimerosi/sychnes-erotiseis',
    description: 'Πρακτικές απαντήσεις για τη δωρεάν εκτίμηση, τα στοιχεία σας και την Αναλυτική Έκθεση.' },
];

export const articlePath = (slug) => `/enimerosi/arthra/${slug}`;
