# Εργαλεία και Ενημέρωση

## Πλοήγηση και όρια της αλλαγής

Το `src/config/toolsNavigation.js` ορίζει τα τρία εργαλεία και τις διαδρομές τους για ToolsBar, Navbar και Footer. Η ToolsBar είναι sticky κάτω από το Navbar (72px desktop / 62px έως 1180px), με ύψος 44px. Έως 900px εμφανίζει native button με aria-expanded, dropdown, Escape/focus return και κλείσιμο στην αλλαγή διαδρομής. Εξαιρείται το admin.

Στον Free calculator εμφανίζεται μόνο η contextual ToolsBar: υπάρχων σύνδεσμος αλλαγής κατηγορίας με αμετάβλητο categoryReturnState και τα άλλα δύο εργαλεία. Το /replacement-rate είναι μόνο UI, με δύο ανεξάρτητα input modes και ανενεργό υπολογισμό. Δεν προστέθηκε τύπος υπολογισμού, αποτέλεσμα, engine helper ή backend request. Η AverageSalaryPage έχει μόνο προσαρμογή CSS στα sticky offsets.

## Περιεχόμενο

Η lazy περιοχή `/enimerosi/*` έχει τέσσερις ενότητες: Οδηγοί, Με απλά λόγια, Νέα & εξελίξεις, Συχνές Ερωτήσεις. Το παλιό `/enimerosi/vasikes-ennoies` ανακατευθύνει στο `/enimerosi/me-apla-logia`. Η Μεθοδολογία και ο δημόσιος κατάλογος πηγών αφαιρέθηκαν. Οι FAQ και οι Συνεργασίες διατηρήθηκαν.

Οι Οδηγοί περιέχουν ακριβώς τρεις καταχωρίσεις:

- Υπάρχουσα παραπομπή στον οδηγό PDF (`guides.js`, `/pdf-guide`).
- `articles/stoixeia-gia-ektimisi-syntaxis.js`.
- `articles/pos-chrisimopoio-meso-syntaximo-mistho.js`.

Το «Με απλά λόγια» περιέχει οκτώ άρθρα:

- `articles/mesos-syntaximos-misthos.js` — διατηρήθηκε το slug, μεταφέρθηκε από τους Οδηγούς.
- `articles/prosyntaxiodotiki-vevaiosi.js`.
- `articles/asfalistiko-istoriko.js`.
- `articles/plasmatikos-chronos.js`.
- `articles/kyria-syntaxi.js`.
- `articles/ethniki-syntaxi.js`.
- `articles/antapodotiki-syntaxi.js`.
- `articles/pososto-anaplirosis.js`.

Τα Νέα παραμένουν κενά. Τα `ektimisi-kai-dikaioma.js`, `asfalistiki-periodos.js` και `proetoimasia-prin-aitisi-syntaxis.js` διατηρούνται ως drafts, χωρίς δημόσια λίστα ή άρθρο. Όλα τα παραπάνω paths έχουν βάση `src/content/information/`.

## Προσθήκη άρθρου

Ένα αρχείο ανά άρθρο στο `src/content/information/articles/`, με default export plain-data αντικειμένου. Η ανακάλυψη γίνεται αυτόματα με Vite glob. Δεν προσθέτουμε route, JSX, CSS ή δεύτερο registry ανά άρθρο.

```js
export default {
  id: 'neo-arthro', slug: 'neo-arthro',
  title: 'Τίτλος', summary: 'Σύντομη περιγραφή.',
  category: 'concept', // guide | concept | news
  status: 'draft', // draft | published
  order: 10,
  body: [{ heading: 'Ενότητα', paragraphs: ['Κείμενο.'], items: ['Σημείο.'] }],
  related: [{ articleId: 'mesos-syntaximos-misthos' }],
};
```

Το `published` δηλώνει ορατότητα στην εφαρμογή που εκτελεί τον κώδικα, όχι δημόσιο deployment. Διπλά IDs/slugs, μη έγκυρα blocks ή drafts δεν εμφανίζονται. Τα drafts μπορούν να περιλαμβάνονται στο bundle και δεν είναι χώρος αποθήκευσης εμπιστευτικών πληροφοριών.

## Κοινά content blocks

Ο renderer δέχεται κείμενο, χωρίς arbitrary HTML ή dangerouslySetInnerHTML:

```js
{ type: 'keyPoint', text: 'Το βασικό συμπέρασμα.' }
{ type: 'simpleFormula', text: 'Κύρια σύνταξη = Εθνική + Ανταποδοτική' }
{ type: 'statGrid', caption: 'Πλήρες ποσό', stats: [
  { label: '2025', value: '436,40 €' }, { label: '2026', value: '446,87 €' }
] }
{ type: 'dataTable', caption: 'Πίνακας', headers: ['Χρόνος', 'Ποσοστό'], rows: [['0–15', '0,77%']] }
```

Το heading είναι προαιρετικό σε κάθε block. Τα strings γίνονται escaped από React. Τα rows πρέπει να έχουν το ίδιο πλήθος κελιών με τα headers. Τα links ελέγχονται πριν εμφανιστούν. Το statGrid και ο πίνακας χωρούν στα 320px. Ο πίνακας αναπλήρωσης είναι στατικό περιεχόμενο άρθρου, χωρίς σύνδεση στη φόρμα υπολογισμού.

## Πηγές και ημερομηνίες

Τα `sources` και `sourceIds` παραμένουν εσωτερικά δεδομένα επιμέλειας σε όλες τις κατηγορίες, συμπεριλαμβανομένων των Νέων. Δεν αποδίδονται δημόσια citation blocks ή source links. Κάθε πηγή έχει id, label, επίσημο HTTPS URL και προαιρετικό note. Επίσημα domains: gov.gr, efka.gov.gr, e-efka.gov.gr, et.gr και υποτομείς τους.

Τα `publishedAt`, `updatedAt`, `sourcesCheckedAt` συμπληρώνονται μόνο με πραγματικές ημερομηνίες YYYY-MM-DD. Τα νέα απαιτούν publishedAt και επίσημη πηγή. Δεν προστέθηκαν εικονικές ημερομηνίες δημοσίευσης.

Το περιεχόμενο προέρχεται από το εγκεκριμένο κείμενο του αιτήματος. Ελέγχθηκαν οι σχετικές επίσημες FAQ για τα ποσά εθνικής σύνταξης, την προσυνταξιοδοτική βεβαίωση και τις αναγνωρίσεις χρόνων. Η εσωτερική παραπομπή του πίνακα αναπλήρωσης οδηγεί στο ΦΕΚ Α΄43/2020, άρθρο 24, πίνακας 2. Η επαλήθευση λειτουργίας/rendering δεν αποτελεί νομική πιστοποίηση περιεχομένου.

## Έλεγχοι

- npm run test:information
- npm run test:tools
- npm run test:free-handoff
- npm run test:free-insurance
- npm run test:average-salary
- npm run build
- git diff --check, μαζί με έλεγχο νέων untracked αρχείων.

Browser: Home, average salary, free estimation, calculator, replacement rate, Οδηγοί, Με απλά λόγια, άρθρα κύριας/εθνικής/αναπλήρωσης και Footer σε 1440px, 768px και 320px. Ελέγχονται menu/Escape, sticky offsets, category salary handoff, στατιστικά και πίνακας. Μικρή διόρθωση στο ήδη υπάρχον mobile grid της αρχικής επιτρέπει συρρίκνωση στήλης και αναδίπλωση μακρών λέξεων χωρίς οριζόντια κύλιση.
