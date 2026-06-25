import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

function PlasticYearsInputSection({
  calculatorEdition = 'professional',
  value,
  onChange,
}) {
  const safeValue = normalizePlasticYearsDraft(value);
  const maxEntries = calculatorEdition === 'free' ? 1 : 10;

  function updateStatus(status) {
    onChange({
      ...safeValue,
      status,
      entries:
        status === 'yes' && safeValue.entries.length === 0
          ? [createEmptyPlasticYearEntry()]
          : safeValue.entries,
    });
  }

  function updateEntry(entryId, field, fieldValue) {
    const entries = safeValue.entries.map((entry) => {
      if (entry.id !== entryId) {
        return entry;
      }

      const nextEntry = {
        ...entry,
        [field]: fieldValue,
      };

      if (field === 'recognitionStatus' && fieldValue === 'planned') {
        nextEntry.financialInputMode = 'monthly_base';
        nextEntry.buyoutAmount = '';
        nextEntry.contributionRatePercent = '';
      }

      if (field === 'recognitionMode' && fieldValue === 'free') {
        nextEntry.financialInputMode = '';
        nextEntry.monthlyPensionableBase = '';
        nextEntry.buyoutAmount = '';
        nextEntry.contributionRatePercent = '';
        nextEntry.applicationDate = '';
      }

      if (field === 'recognitionMode' && fieldValue === 'paid') {
        nextEntry.financialInputMode =
          nextEntry.recognitionStatus === 'planned'
            ? 'monthly_base'
            : nextEntry.financialInputMode;
      }

      if (field === 'financialInputMode') {
        if (fieldValue === 'monthly_base') {
          nextEntry.buyoutAmount = '';
          nextEntry.contributionRatePercent = '';
        } else {
          nextEntry.monthlyPensionableBase = '';
        }
      }

      return nextEntry;
    });

    onChange({
      ...safeValue,
      entries,
    });
  }

  function addEntry() {
    if (safeValue.entries.length >= maxEntries) {
      return;
    }

    onChange({
      ...safeValue,
      entries: [
        ...safeValue.entries,
        createEmptyPlasticYearEntry(),
      ],
    });
  }

  function removeEntry(entryId) {
    const remainingEntries = safeValue.entries.filter(
      (entry) => entry.id !== entryId
    );

    onChange({
      ...safeValue,
      entries:
        remainingEntries.length > 0
          ? remainingEntries
          : [createEmptyPlasticYearEntry()],
    });
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Γενικά πλασματικά χρόνια</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Εδώ δηλώνεται μόνο ο χρόνος που δεν έχει ήδη καταχωριστεί στις
        ασφαλιστικές περιόδους. Δεν ζητείται το είδος του πλασματικού χρόνου,
        επειδή δεν αλλάζει τον υπολογισμό του ποσού.
      </p>

      <SelectWithLabel
        id="plasticYearsStatus"
        label="Υπάρχει πλασματικός χρόνος που πρέπει να εξεταστεί;"
        value={safeValue.status}
        onChange={updateStatus}
        options={PLASTIC_YEARS_STATUS_OPTIONS}
      />

      {safeValue.status === 'yes' && (
        <div style={{ marginTop: '1rem' }}>
          {safeValue.entries.map((entry, index) => {
            const isPaid = entry.recognitionMode === 'paid';
            const hasDecision = entry.recognitionStatus === 'recognized';
            const isPlanned = entry.recognitionStatus === 'planned';

            return (
              <div key={entry.id} style={entryBoxStyle}>
                <div style={entryHeaderStyle}>
                  <h3 style={{ margin: 0 }}>
                    Πλασματικός χρόνος {index + 1}
                  </h3>

                  {safeValue.entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      style={removeButtonStyle}
                    >
                      Αφαίρεση
                    </button>
                  )}
                </div>

                <div style={gridStyle}>
                  <SelectWithLabel
                    id={`plasticYear${index}RecognitionStatus`}
                    label="Κατάσταση"
                    value={entry.recognitionStatus}
                    onChange={(fieldValue) =>
                      updateEntry(
                        entry.id,
                        'recognitionStatus',
                        fieldValue
                      )
                    }
                    options={RECOGNITION_STATUS_OPTIONS}
                  />

                  <SelectWithLabel
                    id={`plasticYear${index}RecognitionMode`}
                    label="Έγινε ή θα γίνει εξαγορά;"
                    value={entry.recognitionMode}
                    onChange={(fieldValue) =>
                      updateEntry(entry.id, 'recognitionMode', fieldValue)
                    }
                    options={RECOGNITION_MODE_OPTIONS}
                  />

                  <TextInputWithLabel
                    id={`plasticYear${index}Years`}
                    label="Έτη"
                    value={entry.years}
                    onChange={(fieldValue) =>
                      updateEntry(entry.id, 'years', fieldValue)
                    }
                    placeholder="π.χ. 3"
                  />

                  <TextInputWithLabel
                    id={`plasticYear${index}Months`}
                    label="Μήνες"
                    value={entry.months}
                    onChange={(fieldValue) =>
                      updateEntry(entry.id, 'months', fieldValue)
                    }
                    placeholder="0 έως 11"
                  />

                  <TextInputWithLabel
                    id={`plasticYear${index}Days`}
                    label="Ημέρες"
                    value={entry.days}
                    onChange={(fieldValue) =>
                      updateEntry(entry.id, 'days', fieldValue)
                    }
                    placeholder="0 έως 24"
                  />

                  {isPaid && (
                    <TextInputWithLabel
                      id={`plasticYear${index}ApplicationDate`}
                      label={
                        hasDecision
                          ? 'Ημερομηνία αίτησης / αναγνώρισης'
                          : 'Πιθανή ημερομηνία αίτησης εξαγοράς'
                      }
                      value={entry.applicationDate}
                      onChange={(fieldValue) =>
                        updateEntry(
                          entry.id,
                          'applicationDate',
                          fieldValue
                        )
                      }
                      placeholder="π.χ. 15/03/2025"
                    />
                  )}
                </div>

                {isPaid && hasDecision && (
                  <div style={subBoxStyle}>
                    <SelectWithLabel
                      id={`plasticYear${index}FinancialInputMode`}
                      label="Ποιο οικονομικό στοιχείο αναγράφεται στην πράξη;"
                      value={entry.financialInputMode}
                      onChange={(fieldValue) =>
                        updateEntry(
                          entry.id,
                          'financialInputMode',
                          fieldValue
                        )
                      }
                      options={FINANCIAL_INPUT_MODE_OPTIONS}
                    />

                    {entry.financialInputMode === 'monthly_base' && (
                      <TextInputWithLabel
                        id={`plasticYear${index}MonthlyBase`}
                        label="Μηνιαία ασφαλιστέα / συντάξιμη βάση της πράξης"
                        value={entry.monthlyPensionableBase}
                        onChange={(fieldValue) =>
                          updateEntry(
                            entry.id,
                            'monthlyPensionableBase',
                            fieldValue
                          )
                        }
                        placeholder="π.χ. 1850,40"
                      />
                    )}

                    {entry.financialInputMode === 'buyout_amount_and_rate' && (
                      <div style={gridStyle}>
                        <TextInputWithLabel
                          id={`plasticYear${index}BuyoutAmount`}
                          label="Συνολικό ποσό εξαγοράς"
                          value={entry.buyoutAmount}
                          onChange={(fieldValue) =>
                            updateEntry(
                              entry.id,
                              'buyoutAmount',
                              fieldValue
                            )
                          }
                          placeholder="π.χ. 7200"
                        />

                        <TextInputWithLabel
                          id={`plasticYear${index}ContributionRate`}
                          label="Ποσοστό εισφοράς της εξαγοράς (%)"
                          value={entry.contributionRatePercent}
                          onChange={(fieldValue) =>
                            updateEntry(
                              entry.id,
                              'contributionRatePercent',
                              fieldValue
                            )
                          }
                          placeholder="π.χ. 20"
                        />
                      </div>
                    )}
                  </div>
                )}

                {isPaid && isPlanned && (
                  <div style={subBoxStyle}>
                    <TextInputWithLabel
                      id={`plasticYear${index}PlannedMonthlyBase`}
                      label="Μηνιαία ασφαλιστέα / συντάξιμη βάση για την εκτίμηση"
                      value={entry.monthlyPensionableBase}
                      onChange={(fieldValue) =>
                        updateEntry(
                          entry.id,
                          'monthlyPensionableBase',
                          fieldValue
                        )
                      }
                      placeholder="π.χ. 1850,40"
                    />

                    <p style={helpTextStyle}>
                      Χρησιμοποιείται μόνο για εκτίμηση της επίδρασης στη
                      σύνταξη. Δεν υπολογίζεται εδώ το κόστος της μελλοντικής
                      εξαγοράς.
                    </p>
                  </div>
                )}

                {entry.recognitionMode === 'free' && (
                  <p style={noticeStyle}>
                    Χωρίς εξαγορά ο χρόνος δεν θα προστεθεί στον υπολογισμό
                    της ανταποδοτικής σύνταξης.
                  </p>
                )}
              </div>
            );
          })}

          {safeValue.entries.length < maxEntries && (
            <button
              type="button"
              onClick={addEntry}
              style={secondaryButtonStyle}
            >
              + Προσθήκη πλασματικού χρόνου
            </button>
          )}
        </div>
      )}
    </fieldset>
  );
}

function createEmptyPlasticYearEntry() {
  return {
    id: `plastic_year_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    recognitionStatus: '',
    recognitionMode: '',
    years: '',
    months: '',
    days: '',
    applicationDate: '',
    financialInputMode: '',
    monthlyPensionableBase: '',
    buyoutAmount: '',
    contributionRatePercent: '',
  };
}

function normalizePlasticYearsDraft(value) {
  const status = value?.status === 'yes' ? 'yes' : 'no';
  const entries = Array.isArray(value?.entries)
    ? value.entries.map((entry) => ({
        ...createEmptyPlasticYearEntry(),
        ...entry,
        id: entry?.id || createEmptyPlasticYearEntry().id,
      }))
    : [];

  return {
    status,
    entries:
      status === 'yes' && entries.length === 0
        ? [createEmptyPlasticYearEntry()]
        : entries,
  };
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

const PLASTIC_YEARS_STATUS_OPTIONS = [
  { value: 'no', label: 'Όχι' },
  { value: 'yes', label: 'Ναι' },
];

const RECOGNITION_STATUS_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'recognized', label: 'Υπάρχει πράξη αναγνώρισης' },
  { value: 'planned', label: 'Δεν υπάρχει ακόμη πράξη — εκτίμηση εξαγοράς' },
];

const RECOGNITION_MODE_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'paid', label: 'Ναι, με εξαγορά' },
  { value: 'free', label: 'Όχι, χωρίς εξαγορά' },
];

const FINANCIAL_INPUT_MODE_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  {
    value: 'monthly_base',
    label: 'Μηνιαία ασφαλιστέα / συντάξιμη βάση',
  },
  {
    value: 'buyout_amount_and_rate',
    label: 'Συνολικό ποσό εξαγοράς και ποσοστό εισφοράς',
  },
];

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: '0.75rem',
};

const entryBoxStyle = {
  marginBottom: '1rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '1rem',
  background: '#f8fafc',
};

const entryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  alignItems: 'center',
  marginBottom: '1rem',
};

const subBoxStyle = {
  marginTop: '0.75rem',
  paddingTop: '0.75rem',
  borderTop: '1px solid #e2e8f0',
};

const selectStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '320px',
  maxWidth: '100%',
};

const inputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '220px',
  maxWidth: '100%',
};

const helpTextStyle = {
  marginTop: 0,
  color: '#475569',
};

const noticeStyle = {
  marginTop: '0.75rem',
  marginBottom: 0,
  padding: '0.75rem',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  background: '#fffbeb',
  color: '#78350f',
};

const secondaryButtonStyle = {
  padding: '0.5rem 0.75rem',
  cursor: 'pointer',
};

const removeButtonStyle = {
  padding: '0.4rem 0.65rem',
  border: '1px solid #dc2626',
  borderRadius: '6px',
  background: '#ffffff',
  color: '#b91c1c',
  cursor: 'pointer',
};

export default PlasticYearsInputSection;
