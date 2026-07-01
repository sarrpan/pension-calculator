
import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

function EtaaExtraBenefitInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  insurancePeriodGroups,
  value,
  onChange,
}) {
  const fundPresence = getEtaaFundPresence({
    insurancePeriodsInputMode,
    simpleFundInput,
    insurancePeriodGroups,
  });

  if (!fundPresence.hasAny) {
    return null;
  }

  const safeValue = normalizeEtaaExtraBenefitDraft(value);

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Πρόσθετη παροχή πρώην ΕΤΑΑ</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Η Ειδική Προσαύξηση ΤΣΜΕΔΕ υπολογίζεται χωριστά από τη βασική
        ανταποδοτική σύνταξη και προστίθεται στο τελικό ποσό της κύριας
        σύνταξης. Ο Κλάδος Μονοσυνταξιούχων ΤΣΑΥ δηλώνεται πλέον μέσα στην
        αντίστοιχη ασφαλιστική περίοδο.
      </p>

      {fundPresence.tsmede && (
        <TsmedeFields
          value={safeValue.tsmede}
          onChange={(field, fieldValue) => {
            onChange('tsmede', field, fieldValue);
          }}
        />
      )}

    </fieldset>
  );
}

function TsmedeFields({ value, onChange }) {
  const isActive = value.status === 'yes';
  const hasHigherRate = value.hasHigherSalariedRateBefore2007 === 'yes';
  const hasAdditionalTwoPercent = value.hasAdditionalTwoPercent === 'yes';
  const hasRecognizedTime = value.hasRecognizedTime === 'yes';

  return (
    <div style={benefitBoxStyle}>
      <h3 style={{ marginTop: 0 }}>ΤΣΜΕΔΕ — Ειδική Προσαύξηση</h3>

      <SelectWithLabel
        id="tsmedeSpecialIncreaseStatus"
        label="Υπήρχε υπαγωγή στην Ειδική Προσαύξηση ΤΣΜΕΔΕ;"
        value={value.status}
        onChange={(fieldValue) => onChange('status', fieldValue)}
        options={YES_NO_OPTIONS}
      />

      {isActive && (
        <>
          <div style={noticeStyle}>
            Η μέση μηνιαία βάση θα ληφθεί αυτόματα από τις συντάξιμες
            αποδοχές της ανταποδοτικής σύνταξης. Ο βασικός χρόνος θα προκύψει
            αυτόματα από τον δηλωμένο χρόνο ΤΣΜΕΔΕ έως 31/12/2015 και θα
            υπολογιστεί με 12 μονάδες εισφοράς.
          </div>

          <div style={subBoxStyle}>
            <SelectWithLabel
              id="tsmedeHigherSalariedRateBefore2007"
              label="Καταβλήθηκε υψηλότερο ασφάλιστρο ως έμμισθος πριν από 1/1/2007;"
              value={value.hasHigherSalariedRateBefore2007}
              onChange={(fieldValue) =>
                onChange('hasHigherSalariedRateBefore2007', fieldValue)
              }
              options={YES_NO_OPTIONS}
            />

            {hasHigherRate && (
              <>
                <div style={gridStyle}>
                  <TextInputWithLabel
                    id="tsmedeHigherRateYears"
                    label="Έτη με το υψηλότερο ασφάλιστρο"
                    value={value.higherRateYears}
                    onChange={(fieldValue) =>
                      onChange('higherRateYears', fieldValue)
                    }
                    placeholder="π.χ. 5"
                  />

                  <TextInputWithLabel
                    id="tsmedeHigherRateMonths"
                    label="Μήνες με το υψηλότερο ασφάλιστρο"
                    value={value.higherRateMonths}
                    onChange={(fieldValue) =>
                      onChange('higherRateMonths', fieldValue)
                    }
                    placeholder="0 έως 11"
                  />

                  <TextInputWithLabel
                    id="tsmedeHigherRateTotalContributionRatePercent"
                    label="Συνολικό ποσοστό ασφαλίστρου"
                    value={value.higherRateTotalContributionRatePercent}
                    onChange={(fieldValue) =>
                      onChange(
                        'higherRateTotalContributionRatePercent',
                        fieldValue,
                      )
                    }
                    placeholder="π.χ. 19,33"
                  />
                </div>

                <p style={helpTextStyle}>
                  Η εφαρμογή αφαιρεί αυτόματα το βασικό 12% και χρησιμοποιεί
                  μόνο την πρόσθετη διαφορά ως επιπλέον μονάδες εισφοράς.
                </p>
              </>
            )}
          </div>

          <div style={subBoxStyle}>
            <SelectWithLabel
              id="tsmedeAdditionalTwoPercent"
              label="Καταβλήθηκε η πρόσθετη εισφορά 2% από 1/7/2011 έως 31/12/2015;"
              value={value.hasAdditionalTwoPercent}
              onChange={(fieldValue) =>
                onChange('hasAdditionalTwoPercent', fieldValue)
              }
              options={YES_NO_OPTIONS}
            />

            {hasAdditionalTwoPercent && (
              <p style={helpTextStyle}>
                Ο χρόνος της πρόσθετης εισφοράς 2% θα προκύψει αυτόματα από
                την επικάλυψη των δηλωμένων περιόδων ΤΣΜΕΔΕ με το διάστημα
                1/7/2011–31/12/2015.
              </p>
            )}
          </div>

          <div style={subBoxStyle}>
            <SelectWithLabel
              id="tsmedeRecognizedTime"
              label="Υπάρχει αναγνωρισμένος χρόνος που προσμετράται στην Ειδική Προσαύξηση;"
              value={value.hasRecognizedTime}
              onChange={(fieldValue) =>
                onChange('hasRecognizedTime', fieldValue)
              }
              options={YES_NO_OPTIONS}
            />

            {hasRecognizedTime && (
              <>
                <div style={gridStyle}>
                  <TextInputWithLabel
                    id="tsmedeRecognizedTimeYears"
                    label="Έτη αναγνωρισμένου χρόνου"
                    value={value.recognizedTimeYears}
                    onChange={(fieldValue) =>
                      onChange('recognizedTimeYears', fieldValue)
                    }
                    placeholder="π.χ. 2"
                  />

                  <TextInputWithLabel
                    id="tsmedeRecognizedTimeMonths"
                    label="Μήνες αναγνωρισμένου χρόνου"
                    value={value.recognizedTimeMonths}
                    onChange={(fieldValue) =>
                      onChange('recognizedTimeMonths', fieldValue)
                    }
                    placeholder="0 έως 11"
                  />
                </div>

                <div style={warningNoticeStyle}>
                  Ο αναγνωρισμένος χρόνος προστίθεται με 12 μονάδες. Αν η
                  επίσημη πράξη αναγνώρισης μετά το 2002 ορίζει διαφορετική
                  βάση από τις συντάξιμες αποδοχές της κύριας σύνταξης,
                  απαιτείται ο αναλυτικός υπολογισμός της πλήρους έκδοσης.
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TsayFields({ value, onChange }) {
  const isActive = value.status === 'yes';

  return (
    <div style={benefitBoxStyle}>
      <h3 style={{ marginTop: 0 }}>ΤΣΑΥ — Κλάδος Μονοσυνταξιούχων</h3>

      <SelectWithLabel
        id="tsaySinglePensionerStatus"
        label="Υπήρχε υπαγωγή στον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ;"
        value={value.status}
        onChange={(fieldValue) => onChange('status', fieldValue)}
        options={YES_NO_OPTIONS}
      />

      {isActive && (
        <>
          <div style={gridStyle}>
            <TextInputWithLabel
              id="tsayExtraBenefitBaseAmount"
              label="Μέση μηνιαία βάση της πρόσθετης εισφοράς"
              value={value.baseAmount}
              onChange={(fieldValue) => onChange('baseAmount', fieldValue)}
              placeholder="π.χ. 1800,50"
            />

            <TextInputWithLabel
              id="tsayContributionYears"
              label="Έτη καταβολής εισφοράς Μονοσυνταξιούχων"
              value={value.contributionYears}
              onChange={(fieldValue) => onChange('contributionYears', fieldValue)}
              placeholder="π.χ. 25"
            />

            <TextInputWithLabel
              id="tsayContributionMonths"
              label="Επιπλέον μήνες"
              value={value.contributionMonths}
              onChange={(fieldValue) => onChange('contributionMonths', fieldValue)}
              placeholder="0 έως 11"
            />
          </div>

          <p style={helpTextStyle}>
            Δηλώνονται μόνο τα έτη για τα οποία καταβλήθηκε η πρόσθετη εισφορά
            του Κλάδου, μαζί με τυχόν εξαγορασμένο χρόνο για τον οποίο
            καταβλήθηκε και το αντίστοιχο πρόσθετο ασφάλιστρο.
          </p>

          <div style={noticeStyle}>
            Ο υπολογισμός θα γίνει με 10 επιπλέον μονάδες εισφοράς, σύμφωνα
            με την τρέχουσα διοικητική πρακτική του e-ΕΦΚΑ. Στο αποτέλεσμα θα
            εμφανιστεί ενημέρωση ότι η χρήση των 10 μονάδων αμφισβητείται
            δικαστικά και ότι υπάρχει νομολογία υπέρ των πραγματικών
            ιστορικών ποσοστών.
          </div>
        </>
      )}
    </div>
  );
}

function getEtaaFundPresence({
  insurancePeriodsInputMode,
  simpleFundInput,
  insurancePeriodGroups,
}) {
  const funds = [];

  if (insurancePeriodsInputMode === 'simple') {
    funds.push(simpleFundInput);
  }

  if (insurancePeriodsInputMode === 'multiple') {
    for (const group of Array.isArray(insurancePeriodGroups)
      ? insurancePeriodGroups
      : []) {
      funds.push(group?.fund);
    }
  }

  const presence = {
    tsmede: funds.includes('tsmede'),
  };

  return {
    ...presence,
    hasAny: presence.tsmede,
  };
}

function normalizeEtaaExtraBenefitDraft(value) {
  const defaultValue = {
    tsmede: {
      status: '',
      baseAmount: '',
      contributionYears: '',
      contributionMonths: '',
      hasHigherSalariedRateBefore2007: 'no',
      higherRateYears: '',
      higherRateMonths: '',
      higherRateTotalContributionRatePercent: '',
      additionalPointsAboveTwelve: '',
      hasAdditionalTwoPercent: 'no',
      additionalTwoPercentYears: '',
      additionalTwoPercentMonths: '',
      hasRecognizedTime: 'no',
      recognizedTimeYears: '',
      recognizedTimeMonths: '',
    },
    tsay: {
      status: '',
      baseAmount: '',
      contributionYears: '',
      contributionMonths: '',
    },
  };

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  const rawTsmede = value.tsmede || {};
  const legacyAdditionalPoints = parseOptionalDecimal(
    rawTsmede.additionalPointsAboveTwelve,
  );
  const higherRateTotalContributionRatePercent = String(
    rawTsmede.higherRateTotalContributionRatePercent || '',
  ).trim()
    ? rawTsmede.higherRateTotalContributionRatePercent
    : legacyAdditionalPoints !== null
      ? String(12 + legacyAdditionalPoints)
      : '';

  return {
    tsmede: {
      ...defaultValue.tsmede,
      ...rawTsmede,
      higherRateTotalContributionRatePercent,
    },
    tsay: {
      ...defaultValue.tsay,
      ...(value.tsay || {}),
    },
  };
}

function parseOptionalDecimal(value) {
  const normalizedValue = String(value || '')
    .trim()
    .replace(',', '.');

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    return null;
  }

  return Number(normalizedValue);
}

function SelectWithLabel({ id, label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>
      <br />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInputWithLabel({ id, label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const YES_NO_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'yes', label: 'Ναι' },
  { value: 'no', label: 'Όχι' },
];

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: '0.75rem',
};

const benefitBoxStyle = {
  marginTop: '1rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '1rem',
  background: '#f8fafc',
};

const subBoxStyle = {
  marginTop: '0.75rem',
  paddingTop: '0.75rem',
  borderTop: '1px solid #e2e8f0',
};

const helpTextStyle = {
  color: '#475569',
  marginTop: 0,
};

const noticeStyle = {
  marginTop: '0.5rem',
  marginBottom: '0.75rem',
  padding: '0.75rem',
  border: '1px solid #60a5fa',
  borderRadius: '6px',
  background: '#eff6ff',
  color: '#1e3a8a',
};

const warningNoticeStyle = {
  marginTop: '0.5rem',
  padding: '0.75rem',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  background: '#fffbeb',
  color: '#78350f',
};

const selectStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '300px',
  maxWidth: '100%',
};

const inputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '220px',
  maxWidth: '100%',
};

export default EtaaExtraBenefitInputSection;
