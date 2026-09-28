import React from 'react';

import { getDefaultEmploymentCategoryForFund } from '../data/insuranceFundWorkTypeRules';
import { UNIFORMED_BODY_GROUPS } from '../utils/uniformedBodyOptions';

const WORK_CATEGORIES = [
  {
    id: 'private',
    title: 'Ιδιωτικός τομέας',
    description: 'Μισθωτοί και ειδικές κατηγορίες ιδιωτικής απασχόλησης',
    options: [
      {
        value: 'ika',
        label: 'ΙΚΑ / e-ΕΦΚΑ μισθωτών',
        aliases: ['ΙΚΑ', 'ΕΦΚΑ', 'ιδιωτικός υπάλληλος', 'μισθωτός'],
      },
      {
        value: 'etap_mme_tattath',
        label: 'ΕΤΑΠ-ΜΜΕ / πρώην ΤΑΤΤΑΘ',
        aliases: ['ΜΜΕ', 'δημοσιογράφος', 'ΤΑΤΤΑΘ'],
      },
      {
        value: 'aviation',
        label: 'Αεροπορικές / ΥΠΑ / χειριστές',
        aliases: ['αεροπορία', 'ΥΠΑ', 'πιλότος', 'χειριστής'],
      },
      {
        value: 'artistic',
        label: 'Καλλιτεχνικές κατηγορίες',
        aliases: ['ηθοποιός', 'μουσικός', 'καλλιτέχνης'],
      },
    ],
  },
  {
    id: 'public',
    title: 'Δημόσιο',
    description: 'Δημόσιοι υπάλληλοι και ειδικά καθεστώτα ΝΠΔΔ',
    options: [
      {
        value: 'public_sector',
        label: 'Δημόσιο — γενική κατηγορία',
        aliases: [
          'δημόσιο',
          'δημόσιος υπάλληλος',
          'καθηγητής',
          'δάσκαλος',
          'εκπαιδευτικός',
        ],
      },
      {
        value: 'ika_npdd_special',
        label: 'Τακτικοί υπάλληλοι ΙΚΑ / ΝΠΔΔ ειδικού καθεστώτος',
        aliases: ['ΝΠΔΔ', 'τακτικός υπάλληλος', 'ειδικό καθεστώς'],
      },
    ],
  },
  {
    id: 'ota',
    title: 'ΟΤΑ',
    description: 'Δήμοι και υπηρεσίες καθαριότητας ή υγιεινής',
    options: [
      {
        value: 'ota',
        label: 'ΟΤΑ / υπηρεσίες καθαριότητας και υγιεινής',
        aliases: ['δήμος', 'ΟΤΑ', 'καθαριότητα', 'δημοτικός υπάλληλος'],
      },
    ],
  },
  {
    id: 'deko',
    title: 'ΔΕΚΟ',
    description: 'ΔΕΗ, ΟΤΕ, ΟΣΕ, ΕΛΤΑ, ΗΣΑΠ και άλλοι οργανισμοί',
    options: [
      {
        value: 'tap_dei',
        label: 'ΤΑΠ-ΔΕΗ',
        aliases: ['ΔΕΗ', 'ΤΑΠ ΔΕΗ'],
      },
      {
        value: 'ika_tsp_hsap',
        label: 'τ. ΤΣΠ-ΗΣΑΠ',
        aliases: ['ΗΣΑΠ', 'ΤΣΠ ΗΣΑΠ'],
      },
      {
        value: 'ika_tap_ote_ote',
        label: 'τ. ΤΑΠ-ΟΤΕ — ΟΤΕ',
        aliases: ['ΟΤΕ', 'ΤΑΠ ΟΤΕ'],
      },
      {
        value: 'ika_tap_ote_ose_elta',
        label: 'τ. ΤΑΠ-ΟΤΕ — ΟΣΕ / ΕΛΤΑ',
        aliases: ['ΟΣΕ', 'ΕΛΤΑ'],
      },
      {
        value: 'ika_tap_ote_staff',
        label: 'τ. ΤΑΠ-ΟΤΕ — υπάλληλοι τ. ΤΑΠΟΤΕ',
        aliases: ['ΤΑΠΟΤΕ', 'υπάλληλος ΤΑΠΟΤΕ'],
      },
      {
        value: 'deko',
        label: 'Άλλη ΔΕΚΟ / οργανισμός κοινής ωφέλειας',
        aliases: ['ΔΕΚΟ', 'οργανισμός κοινής ωφέλειας'],
      },
    ],
  },
  {
    id: 'banks',
    title: 'Τράπεζες',
    description: 'Τραπεζικά ταμεία και συνεταιρισμοί',
    options: [
      {
        value: 'ika_tsp_ete',
        label: 'τ. ΤΣΠ-ΕΤΕ',
        aliases: ['Εθνική Τράπεζα', 'ΕΤΕ', 'ΤΣΠ ΕΤΕ'],
      },
      {
        value: 'ika_tap_etba',
        label: 'τ. ΤΑΠ-ΕΤΒΑ',
        aliases: ['ΕΤΒΑ', 'ΤΑΠ ΕΤΒΑ'],
      },
      {
        value: 'tapae_ethniki',
        label: 'ΤΑΠΑΕ «Η Εθνική»',
        aliases: ['Η Εθνική', 'ΤΑΠΑΕ'],
      },
      {
        value: 'tseapgso',
        label: 'τ. ΤΣΕΑΠΓΣΟ',
        aliases: ['ΤΣΕΑΠΓΣΟ', 'συνεταιριστικές οργανώσεις'],
      },
      {
        value: 'banking_funds',
        label: 'Άλλο τραπεζικό ταμείο / συνεταιρισμός',
        aliases: ['τράπεζα', 'τραπεζικό ταμείο', 'συνεταιρισμός'],
      },
    ],
  },
  {
    id: 'uniformed',
    title: 'Ένστολοι',
    description: 'Στρατιωτικοί και σώματα ασφαλείας',
    options: UNIFORMED_BODY_GROUPS.flatMap((uniformedGroup) =>
      uniformedGroup.options.map((option) => ({
        value: 'uniformed',
        uniformedBody: option.value,
        groupLabel: uniformedGroup.label,
        label: option.label,
        aliases: option.aliases,
      })),
    ),
  },
  {
    id: 'seafarers',
    title: 'Ναυτικοί',
    description: 'ΝΑΤ και έμμισθοι ναυτικοί πράκτορες',
    options: [
      {
        value: 'nat',
        label: 'ΝΑΤ / ναυτικοί',
        aliases: ['ΝΑΤ', 'ναυτικός', 'πλοίο'],
      },
      {
        value: 'tanpy',
        label: 'ΤΑΝΠΥ / έμμισθοι ναυτικοί πράκτορες',
        aliases: ['ΤΑΝΠΥ', 'ναυτικός πράκτορας'],
      },
    ],
  },
  {
    id: 'farmers',
    title: 'Αγρότες',
    description: 'Αγροτική δραστηριότητα και πρώην ΟΓΑ',
    options: [
      {
        value: 'oga',
        label: 'Πρώην ΟΓΑ / αγρότης',
        aliases: ['ΟΓΑ', 'αγρότης', 'αγροτική δραστηριότητα'],
      },
    ],
  },
  {
    id: 'professionals',
    title: 'Επαγγελματίες και επιστήμονες',
    description: 'ΟΑΕΕ, ΕΤΑΑ, ΤΣΜΕΔΕ και ΤΣΑΥ',
    options: [
      {
        value: 'oaee',
        label: 'ΟΑΕΕ / ελεύθερος επαγγελματίας',
        aliases: ['ΟΑΕΕ', 'ΤΕΒΕ', 'ελεύθερος επαγγελματίας'],
      },
      {
        value: 'etaa',
        label: 'Πρώην ΕΤΑΑ',
        aliases: ['ΕΤΑΑ', 'επιστήμονας'],
      },
      {
        value: 'tsmede',
        label: 'ΤΣΜΕΔΕ',
        aliases: ['μηχανικός', 'ΤΣΜΕΔΕ'],
      },
      {
        value: 'tsay',
        label: 'ΤΣΑΥ — ελεύθερος επαγγελματίας',
        aliases: ['γιατρός', 'οδοντίατρος', 'φαρμακοποιός', 'ΤΣΑΥ'],
      },
      {
        value: 'tsay_salaried',
        label: 'ΤΣΑΥ — μισθωτός',
        aliases: ['μισθωτός γιατρός', 'μισθωτός φαρμακοποιός', 'ΤΣΑΥ'],
      },
    ],
  },
];

const CONTRIBUTION_BASED_FUNDS = new Set([
  'oaee',
  'etaa',
  'tsmede',
  'tsay',
  'oga',
]);

function FreeInsuranceCategoryWizard({
  group,
  groupNumber,
  canRemove,
  onInsurancePeriodGroupChange,
  onFundSelected,
  onRemove,
}) {
  const [openCategoryId, setOpenCategoryId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [helpVisible, setHelpVisible] = React.useState(false);

  function selectFund(selection) {
    const fund =
      typeof selection === 'string' ? selection : selection?.value || '';
    const uniformedBody =
      fund === 'uniformed' && typeof selection === 'object'
        ? selection.uniformedBody || ''
        : '';

    onInsurancePeriodGroupChange(group.id, 'fund', fund);
    onInsurancePeriodGroupChange(
      group.id,
      'uniformedBody',
      uniformedBody
    );
    onInsurancePeriodGroupChange(
      group.id,
      'nonSalariedEarningsInputMode',
      ''
    );
    onInsurancePeriodGroupChange(
      group.id,
      'tsaySinglePensionerStatus',
      ''
    );
    onInsurancePeriodGroupChange(
      group.id,
      'uniformedSpecialTimeDraft',
      createEmptyUniformedSpecialTimeDraft()
    );

    if (CONTRIBUTION_BASED_FUNDS.has(fund)) {
      onInsurancePeriodGroupChange(
        group.id,
        'insuredType',
        'not_applicable'
      );
    } else {
      onInsurancePeriodGroupChange(group.id, 'insuredType', '');
    }

    onInsurancePeriodGroupChange(
      group.id,
      'employmentCategory',
      getDefaultEmploymentCategoryForFund(fund)
    );

    onFundSelected(fund);
  }

  function clearSelectedFund() {
    onInsurancePeriodGroupChange(group.id, 'fund', '');
    onInsurancePeriodGroupChange(group.id, 'uniformedBody', '');
    onInsurancePeriodGroupChange(
      group.id,
      'nonSalariedEarningsInputMode',
      ''
    );
    onInsurancePeriodGroupChange(
      group.id,
      'tsaySinglePensionerStatus',
      ''
    );
    onInsurancePeriodGroupChange(
      group.id,
      'uniformedSpecialTimeDraft',
      createEmptyUniformedSpecialTimeDraft()
    );
    onInsurancePeriodGroupChange(group.id, 'insuredType', '');
    onInsurancePeriodGroupChange(
      group.id,
      'employmentCategory',
      ''
    );
  }

  function openCategory(categoryId) {
    const category = WORK_CATEGORIES.find(
      (candidate) => candidate.id === categoryId
    );

    if (!category) {
      return;
    }

    setHelpVisible(false);
    setSearchQuery('');

    if (category.options.length === 1) {
      selectFund(category.options[0]);
      return;
    }

    const currentFundBelongsToCategory = category.options.some(
      (option) =>
        option.value === group.fund &&
        (!option.uniformedBody || option.uniformedBody === group.uniformedBody)
    );

    if (group.fund && !currentFundBelongsToCategory) {
      clearSelectedFund();
    }

    setOpenCategoryId(categoryId);
  }

  function showCategoryList() {
    setOpenCategoryId('');
    setSearchQuery('');
    setHelpVisible(false);
  }

  function getSearchResults() {
    const normalizedQuery = normalizeSearchText(searchQuery);

    if (!normalizedQuery) {
      return [];
    }

    return WORK_CATEGORIES.flatMap((category) =>
      category.options
        .filter((option) => {
          const searchableText = [
            category.title,
            category.description,
            option.label,
            ...(option.aliases || []),
          ]
            .map(normalizeSearchText)
            .join(' ');

          return searchableText.includes(normalizedQuery);
        })
        .map((option) => ({
          ...option,
          categoryTitle: category.title,
        }))
    );
  }

  const openCategoryData = WORK_CATEGORIES.find(
    (category) => category.id === openCategoryId
  );
  const searchResults = getSearchResults();

  return (
    <div>
      <div className="pf-selector-header">
        <div>
          <strong>
            {groupNumber === 1
              ? 'Πρώτη ασφαλιστική περίοδος'
              : 'Δεύτερη ασφαλιστική περίοδος'}
          </strong>
          <p className="pf-help">
            Πού ή με ποια ιδιότητα εργαζόσασταν;
          </p>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="pf-destructive"
          >
            Αφαίρεση
          </button>
        )}
      </div>

      {!openCategoryData ? (
        <>
          <label htmlFor={`insuranceCategorySearch-${group.id}`}>
            Αναζήτηση με επάγγελμα, εργοδότη ή ταμείο
          </label>
          <input
            id={`insuranceCategorySearch-${group.id}`}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="π.χ. ΔΕΗ, καθηγητής, μηχανικός, ΟΓΑ"
            className="pf-category-search"
          />

          {searchQuery.trim() && (
            <div className="pf-search-results">
              <strong>Πιθανές κατηγορίες</strong>

              {searchResults.length > 0 ? (
                <div className="pf-option-grid">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.categoryTitle}-${result.value}-${result.uniformedBody || 'general'}`}
                      type="button"
                      onClick={() => selectFund(result)}
                      className="pf-category-option"
                    >
                      <span className="pf-caption">
                        {result.categoryTitle}
                      </span>
                      <span>{result.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="pf-help">
                  Δεν βρέθηκε σχετική κατηγορία.
                </p>
              )}
            </div>
          )}

          <div className="pf-category-grid">
            {WORK_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => openCategory(category.id)}
                className="pf-category-tile"
              >
                <span className="pf-tile-title">
                  {category.title}
                </span>
                <span className="pf-tile-description">
                  {category.description}
                </span>
                <span className="pf-tile-more">
                  Εμφάνιση υποκατηγοριών
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHelpVisible((current) => !current)}
            className="pf-help-button"
          >
            Δεν βρίσκω την κατηγορία μου
          </button>

          {helpVisible && (
            <div className="pf-notice pf-notice-info">
              Δοκιμάστε την αναζήτηση με το επάγγελμα, τον εργοδότη
              ή την κοινή ονομασία του ταμείου. Αν η περίπτωση δεν
              εμφανίζεται, μπορεί να απαιτεί την πλήρη έκδοση.
            </div>
          )}
        </>
      ) : (
        <>
          <div className="pf-selected-category">
            <div className="pf-selected-category-text">
              <span className="pf-caption">
                Επιλεγμένη γενική κατηγορία
              </span>
              <strong>{openCategoryData.title}</strong>
              <span>{openCategoryData.description}</span>
            </div>

            <button
              type="button"
              onClick={showCategoryList}
              className="pf-secondary"
            >
              Αλλαγή γενικής κατηγορίας
            </button>
          </div>

          <div className="pf-suboptions">
            <div className="pf-suboptions-heading">
              <strong>Επιλέξτε ασφαλιστικό φορέα</strong>
              <span>
                Επιλέξτε τον ακριβή φορέα ή την κατηγορία.
              </span>
            </div>

            {openCategoryData.id === 'uniformed' ? (
              <div className="pf-uniformed-groups">
                {UNIFORMED_BODY_GROUPS.map((uniformedGroup) => (
                  <div key={uniformedGroup.value}>
                    <strong className="pf-uniformed-title">
                      {uniformedGroup.label}
                    </strong>
                    <div className="pf-suboption-grid">
                      {openCategoryData.options
                        .filter(
                          (option) =>
                            option.groupLabel === uniformedGroup.label
                        )
                        .map((option) => (
                          <button
                            key={option.uniformedBody}
                            type="button"
                            onClick={() => selectFund(option)}
                            className="pf-secondary"
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pf-suboption-grid">
                {openCategoryData.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectFund(option)}
                    className="pf-secondary"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('el-GR');
}

function createEmptyUniformedSpecialTimeDraft() {
  return {
    insuranceRegime: '',
    article36ACategory: '',
    combatFiveYearService: {
      status: 'none',
      years: '',
      months: '',
      days: '',
      recognitionPeriod: '',
      paidAmount: '',
      contributionRatePercent: '',
      explicitPensionableEarningsBase: '',
      earningsReferenceYear: '',
    },
    specialSemesters: {
      status: 'none',
      specialSemestersType: '',
      semestersCount: '',
      milestoneCompletionYear: '',
      recognitionPeriod: '',
      paidAmount: '',
      contributionRatePercent: '',
      explicitPensionableEarningsBase: '',
      earningsReferenceYear: '',
    },
  };
}

export default FreeInsuranceCategoryWizard;
