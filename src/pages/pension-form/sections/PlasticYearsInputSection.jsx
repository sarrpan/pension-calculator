import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';


function PlasticYearsInputSection(props) {
  if (props.calculatorEdition === "free") {
    return <FreePlasticYearsInputSection {...props} />;
  }

  return <ProfessionalPlasticYearsInputSection {...props} />;
}

function FreePlasticYearsInputSection({
  value,
  onChange,
  validationAttempted = false,
  fieldIssues = [],
}) {
  const safeValue = normalizeFreePlasticYearsDraft(value);
  const entry = safeValue.entries[0] || createEmptyPlasticYearEntry();
  const choice = safeValue.freeFlowChoice;
  const isPaidKnown = choice === "paid_known";
  const requiresDuration = choice === "free" || isPaidKnown;
  const sectionIsComplete =
    FREE_FLOW_CHOICES.includes(choice) && fieldIssues.length === 0;
  const sectionHasError =
    validationAttempted && fieldIssues.length > 0;

  const choiceIssue = findFieldIssue(fieldIssues, "plasticYearsChoice");
  const durationIssue = findFieldIssue(
    fieldIssues,
    "plasticYearsDuration",
  );
  const applicationYearIssue = findFieldIssue(
    fieldIssues,
    "plasticYearsApplicationYear",
  );
  const applicationPeriodIssue = findFieldIssue(
    fieldIssues,
    "plasticYearsApplicationPeriod",
  );
  const buyoutAmountIssue = findFieldIssue(
    fieldIssues,
    "plasticYearsBuyoutAmount",
  );

  function updateChoice(nextChoice) {
    onChange({
      ...safeValue,
      freeFlowChoice: nextChoice,
      status:
        nextChoice === "none"
          ? "no"
          : nextChoice
            ? "yes"
            : "",
      entries: [
        {
          ...entry,
          recognitionStatus: "recognized",
          recognitionMode:
            nextChoice === "paid_known"
              ? "paid"
              : nextChoice === "free"
                ? "free"
                : "",
          financialInputMode:
            nextChoice === "paid_known"
              ? "buyout_amount_and_rate"
              : "",
          applicationYear:
            nextChoice === "paid_known" ? entry.applicationYear : "",
          applicationPeriod2016:
            nextChoice === "paid_known"
              ? entry.applicationPeriod2016
              : "",
          buyoutAmount:
            nextChoice === "paid_known" ? entry.buyoutAmount : "",
        },
      ],
    });
  }

  function updateEntry(field, fieldValue) {
    onChange({
      ...safeValue,
      status: "yes",
      entries: [
        {
          ...entry,
          recognitionStatus: "recognized",
          recognitionMode: choice === "free" ? "free" : "paid",
          financialInputMode:
            choice === "paid_known"
              ? "buyout_amount_and_rate"
              : "",
          [field]: fieldValue,
        },
      ],
    });
  }

  const durationIsComplete = isValidPlasticDuration(entry);
  const applicationYearIsComplete =
    isValidPlasticApplicationYear(entry.applicationYear);
  const applicationPeriodIsComplete =
    entry.applicationYear !== "2016" ||
    ["until_2016_05_12", "from_2016_05_13"].includes(
      entry.applicationPeriod2016,
    );
  const buyoutAmountIsComplete = isPositiveDecimal(entry.buyoutAmount);

  return (
    <fieldset
      id="plasticYearsSection"
      style={{
        ...fieldsetStyle,
        ...(sectionHasError
          ? sectionErrorStyle
          : sectionIsComplete
            ? sectionCompleteStyle
            : {}),
      }}
    >
      <legend>Γενικά πλασματικά χρόνια</legend>

      <p style={{ marginTop: 0, color: "#475569" }}>
        Δηλώστε μόνο πλασματικό χρόνο που δεν έχει ήδη συμπεριληφθεί
        στις ασφαλιστικές περιόδους.
      </p>

      <QuestionBox
        id="plasticYearsChoiceField"
        isComplete={FREE_FLOW_CHOICES.includes(choice)}
        issue={choiceIssue}
        validationAttempted={validationAttempted}
      >
        <p style={questionTitleStyle}>
          Ποια από τις παρακάτω περιπτώσεις ισχύει;
        </p>

        <div style={choiceGridStyle}>
          {FREE_FLOW_OPTIONS.map((option) => (
            <label
              key={option.value}
              style={{
                ...choiceCardStyle,
                ...(choice === option.value
                  ? selectedChoiceCardStyle
                  : {}),
              }}
            >
              <input
                type="radio"
                name="freePlasticYearsChoice"
                value={option.value}
                checked={choice === option.value}
                onChange={() => updateChoice(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </QuestionBox>

      {choice === "paid_unknown" && (
        <p style={noticeStyle}>
          Ο υπολογισμός θα συνεχιστεί χωρίς τον πλασματικό χρόνο.
          Επιστρέψτε στη φόρμα όταν γνωρίζετε τον χρόνο, το έτος της
          αίτησης και το συνολικό ποσό εξαγοράς.
        </p>
      )}

      {requiresDuration && (
        <div style={{ marginTop: "1rem" }}>
          <QuestionBox
            id="plasticYearsDurationField"
            isComplete={durationIsComplete}
            issue={durationIssue}
            validationAttempted={validationAttempted}
          >
            <p style={questionTitleStyle}>
              {choice === "free"
                ? "Πόσος είναι ο πλασματικός χρόνος χωρίς εξαγορά;"
                : "Πόσος πλασματικός χρόνος εξαγοράστηκε ή θα εξαγοραστεί;"}
            </p>

            <div style={gridStyle}>
              <FreeTextInput
                id="plasticYearsYears"
                label="Έτη"
                value={entry.years}
                onChange={(fieldValue) =>
                  updateEntry("years", fieldValue)
                }
                placeholder="π.χ. 3"
              />

              <FreeTextInput
                id="plasticYearsMonths"
                label="Μήνες"
                value={entry.months}
                onChange={(fieldValue) =>
                  updateEntry("months", fieldValue)
                }
                placeholder="0 έως 11"
              />

              <FreeTextInput
                id="plasticYearsDays"
                label="Ημέρες"
                value={entry.days}
                onChange={(fieldValue) =>
                  updateEntry("days", fieldValue)
                }
                placeholder="0 έως 24"
              />
            </div>
          </QuestionBox>

          {choice === "free" && (
            <p style={noticeStyle}>
              Ο χρόνος θα καταγραφεί, αλλά δεν θα προστεθεί στον
              υπολογισμό της ανταποδοτικής σύνταξης επειδή δεν υπάρχει
              εξαγορά.
            </p>
          )}
        </div>
      )}

      {isPaidKnown && (
        <div style={{ marginTop: "1rem" }}>
          <QuestionBox
            id="plasticYearsApplicationYearField"
            isComplete={applicationYearIsComplete}
            issue={applicationYearIssue}
            validationAttempted={validationAttempted}
          >
            <FreeTextInput
              id="plasticYearsApplicationYear"
              label="Πότε υποβάλατε ή σκοπεύετε να υποβάλετε την αίτηση εξαγοράς;"
              value={entry.applicationYear}
              onChange={(fieldValue) =>
                updateEntry("applicationYear", fieldValue)
              }
              placeholder="Έτος, π.χ. 2025"
            />

            <p style={helpTextStyle}>
              Χρειάζεται μόνο το έτος υποβολής της αίτησης.
            </p>
          </QuestionBox>

          {entry.applicationYear === "2016" && (
            <QuestionBox
              id="plasticYearsApplicationPeriodField"
              isComplete={applicationPeriodIsComplete}
              issue={applicationPeriodIssue}
              validationAttempted={validationAttempted}
            >
              <p style={questionTitleStyle}>
                Πότε υποβλήθηκε ή θα υποβληθεί η αίτηση μέσα στο
                2016;
              </p>

              <div style={choiceGridStyle}>
                {APPLICATION_PERIOD_2016_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    style={{
                      ...choiceCardStyle,
                      ...(entry.applicationPeriod2016 === option.value
                        ? selectedChoiceCardStyle
                        : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="plasticYearsApplicationPeriod2016"
                      value={option.value}
                      checked={
                        entry.applicationPeriod2016 === option.value
                      }
                      onChange={() =>
                        updateEntry(
                          "applicationPeriod2016",
                          option.value,
                        )
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </QuestionBox>
          )}

          <QuestionBox
            id="plasticYearsBuyoutAmountField"
            isComplete={buyoutAmountIsComplete}
            issue={buyoutAmountIssue}
            validationAttempted={validationAttempted}
          >
            <FreeTextInput
              id="plasticYearsBuyoutAmount"
              label="Ποιο είναι το συνολικό ποσό εξαγοράς που πληρώσατε ή υπολογίζετε ότι θα πληρώσετε;"
              value={entry.buyoutAmount}
              onChange={(fieldValue) =>
                updateEntry("buyoutAmount", fieldValue)
              }
              placeholder="π.χ. 7200"
            />

            <p style={helpTextStyle}>
              Γράψτε το συνολικό ποσό και όχι μόνο τις δόσεις που
              έχουν ήδη πληρωθεί.
            </p>
          </QuestionBox>

          <p style={calculationRuleStyle}>
            Η δωρεάν έκδοση εφαρμόζει ποσοστό 6,67% για αιτήσεις έως
            12/05/2016 και 20% για αιτήσεις από 13/05/2016 και μετά.
          </p>
        </div>
      )}

      {sectionIsComplete && (
        <p style={sectionCompleteMessageStyle}>
          ✓ Τα στοιχεία πλασματικού χρόνου έχουν συμπληρωθεί.
        </p>
      )}
    </fieldset>
  );
}

function QuestionBox({
  id,
  isComplete,
  issue,
  validationAttempted,
  children,
}) {
  const hasError = validationAttempted && Boolean(issue);

  return (
    <div
      id={id}
      style={{
        ...questionBoxStyle,
        ...(hasError
          ? questionErrorStyle
          : isComplete
            ? questionCompleteStyle
            : {}),
      }}
    >
      {children}

      {hasError && (
        <p role="alert" style={fieldErrorTextStyle}>
          {issue.message}
        </p>
      )}

      {!hasError && isComplete && (
        <p style={fieldCompleteTextStyle}>✓ Συμπληρώθηκε</p>
      )}
    </div>
  );
}

function FreeTextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function normalizeFreePlasticYearsDraft(value) {
  const freeFlowChoice = inferFreeFlowChoice(value);
  const sourceEntry = Array.isArray(value?.entries)
    ? value.entries[0]
    : null;
  const entry = {
    ...createEmptyPlasticYearEntry(),
    ...(sourceEntry || {}),
    id: sourceEntry?.id || createEmptyPlasticYearEntry().id,
  };

  return {
    ...(value && typeof value === "object" ? value : {}),
    freeFlowChoice,
    status:
      freeFlowChoice === "none"
        ? "no"
        : freeFlowChoice
          ? "yes"
          : "",
    entries: [entry],
  };
}

function inferFreeFlowChoice(value) {
  const explicitChoice = String(
    value?.freeFlowChoice || "",
  ).trim();

  if (FREE_FLOW_CHOICES.includes(explicitChoice)) {
    return explicitChoice;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if (value.status === "no") {
    return "none";
  }

  if (value.status !== "yes") {
    return "";
  }

  const entry = Array.isArray(value.entries)
    ? value.entries[0] || {}
    : {};

  if (entry.recognitionMode === "free") {
    return "free";
  }

  if (
    entry.recognitionMode === "paid" &&
    isPositiveDecimal(entry.buyoutAmount)
  ) {
    return "paid_known";
  }

  return "paid_unknown";
}

function findFieldIssue(fieldIssues, key) {
  return (
    (Array.isArray(fieldIssues) ? fieldIssues : []).find(
      (issue) => issue.key === key,
    ) || null
  );
}

function isValidPlasticDuration(entry = {}) {
  const years = parseNonNegativeWholeNumber(entry.years);
  const months = parseNonNegativeWholeNumber(entry.months);
  const days = parseNonNegativeWholeNumber(entry.days);

  if (years === null || months === null || days === null) {
    return false;
  }

  if (months > 11 || days > 24) {
    return false;
  }

  return years * 300 + months * 25 + days > 0;
}

function isValidPlasticApplicationYear(value) {
  const text = String(value || "").trim();

  if (!/^\d{4}$/.test(text)) {
    return false;
  }

  const year = Number(text);
  return year >= 1900 && year <= 2100;
}

function parseNonNegativeWholeNumber(value) {
  const text = String(value || "0").trim();

  if (!text) {
    return 0;
  }

  return /^\d+$/.test(text) ? Number(text) : null;
}

function isPositiveDecimal(value) {
  const normalized = String(value || "")
    .trim()
    .replace(",", ".");

  return (
    /^\d+(\.\d+)?$/.test(normalized) &&
    Number(normalized) > 0
  );
}

function ProfessionalPlasticYearsInputSection({
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
    applicationYear: '',
    applicationPeriod2016: '',
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


const FREE_FLOW_CHOICES = [
  "none",
  "free",
  "paid_known",
  "paid_unknown",
];

const FREE_FLOW_OPTIONS = [
  {
    value: "none",
    label: "Δεν έχω πλασματικό χρόνο",
  },
  {
    value: "free",
    label: "Έχω πλασματικό χρόνο χωρίς εξαγορά",
  },
  {
    value: "paid_known",
    label:
      "Έχω ή θα έχω εξαγορά και γνωρίζω τα απαραίτητα στοιχεία",
  },
  {
    value: "paid_unknown",
    label:
      "Σκοπεύω να κάνω εξαγορά, αλλά δεν γνωρίζω ακόμη τα στοιχεία",
  },
];

const APPLICATION_PERIOD_2016_OPTIONS = [
  {
    value: "until_2016_05_12",
    label: "Έως 12 Μαΐου 2016",
  },
  {
    value: "from_2016_05_13",
    label: "Από 13 Μαΐου 2016 και μετά",
  },
];

const choiceGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "0.65rem",
};

const choiceCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.55rem",
  padding: "0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  cursor: "pointer",
};

const selectedChoiceCardStyle = {
  border: "2px solid #2563eb",
  background: "#eff6ff",
};

const questionBoxStyle = {
  marginBottom: "0.9rem",
  padding: "0.85rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
};

const questionCompleteStyle = {
  border: "1px solid #16a34a",
  background: "#f0fdf4",
};

const questionErrorStyle = {
  border: "1px solid #dc2626",
  background: "#fff7f7",
};

const sectionCompleteStyle = {
  border: "2px solid #16a34a",
};

const sectionErrorStyle = {
  border: "2px solid #dc2626",
};

const questionTitleStyle = {
  margin: "0 0 0.7rem",
  fontWeight: 700,
};

const fieldCompleteTextStyle = {
  margin: "0.6rem 0 0",
  color: "#166534",
  fontWeight: 700,
};

const fieldErrorTextStyle = {
  margin: "0.6rem 0 0",
  color: "#b91c1c",
  fontWeight: 700,
};

const sectionCompleteMessageStyle = {
  margin: "0.8rem 0 0",
  color: "#166534",
  fontWeight: 700,
};

const calculationRuleStyle = {
  margin: "0.75rem 0 0",
  padding: "0.75rem",
  border: "1px solid #bfdbfe",
  borderRadius: "6px",
  background: "#eff6ff",
  color: "#1e3a8a",
};

export default PlasticYearsInputSection;
