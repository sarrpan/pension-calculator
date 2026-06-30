import React from 'react';

import FreeInsuranceCategoryWizard from '../components/FreeInsuranceCategoryWizard';
import {
  getDefaultEmploymentCategoryForFund,
  getEmploymentCategoryLabel,
  getEmploymentCategoryOptionsForFund,
} from '../data/insuranceFundWorkTypeRules';
import { fieldsetStyle } from '../utils/calculatorStyles';
import {
  deriveUniformedInsuranceRegimeFromDate,
  getUniformedBodyLabel,
  getUniformedInsuranceRegimeLabel,
} from '../utils/uniformedBodyOptions';

function InsurancePeriodsInputSection({
  insurancePeriodsInputMode,
  simpleFundInput,
  simpleInsuredTypeInput,
  simpleEmploymentCategoryInput,
  simpleNonSalariedEarningsInputMode,
  simpleTsaySinglePensionerStatus,
  simpleFromDateInput,
  simpleToDateInput,
  simpleTimeInputMethod,
  simpleInsuranceDaysInput,
  simpleInsuranceYearsInput,
  simpleInsuranceMonthsInput,
  simpleInsuranceExtraDaysInput,
  simpleUniformedSpecialTimeDraft,
  calculatorEdition = 'professional',
  globalInsuredTypeInput = '',
  article30SpecialRegimeUsageInput,
  insurancePeriodGroups,
  maxInsurancePeriodGroups = 10,
  onInsurancePeriodsInputModeChange,
  onSimpleFundChange,
  onSimpleInsuredTypeChange,
  onSimpleEmploymentCategoryChange,
  onSimpleNonSalariedEarningsInputModeChange,
  onSimpleTsaySinglePensionerStatusChange,
  onSimpleFromDateChange,
  onSimpleToDateChange,
  onSimpleTimeInputMethodChange,
  onSimpleInsuranceDaysChange,
  onSimpleInsuranceYearsChange,
  onSimpleInsuranceMonthsChange,
  onSimpleInsuranceExtraDaysChange,
  onSimpleUniformedSpecialTimeDraftChange,
  onArticle30SpecialRegimeUsageChange,
  onInsurancePeriodGroupChange,
  onAddInsurancePeriodGroup,
  onRemoveInsurancePeriodGroup,
}) {
  const simpleInsuredTypeOptions = getInsuredTypeOptions(simpleFundInput);
  const simpleEmploymentCategoryOptions = getEmploymentCategoryOptions(
    simpleFundInput,
    simpleInsuredTypeInput
  );
  const isSimpleUniformedFund = isUniformedFund(simpleFundInput);
  const isSimpleContributionBasedFund = isContributionBasedFund(simpleFundInput);
  const isSimpleTsayFund = isTsayFund(simpleFundInput);
  const isSimpleArticle30MainContributionFund =
    isArticle30MainContributionFund(simpleFundInput);

  const safeInsurancePeriodGroups =
    Array.isArray(insurancePeriodGroups) && insurancePeriodGroups.length > 0
      ? insurancePeriodGroups
      : [];

  const conditionalPremiumPresence = getConditionalPremiumPresence({
    insurancePeriodsInputMode,
    simpleEmploymentCategoryInput,
    insurancePeriodGroups: safeInsurancePeriodGroups,
  });
  const normalizedSpecialRegimeUsageInput =
    normalizeSpecialRegimeUsageInput(article30SpecialRegimeUsageInput);

  function handleModeChange(value) {
    onInsurancePeriodsInputModeChange(value);
  }

  function handleSimpleInsuredTypeChange(value) {
    onSimpleInsuredTypeChange(value);

    if (
      simpleFundInput === 'ota' &&
      value === 'new' &&
      simpleEmploymentCategoryInput === 'ota_ika_yvae'
    ) {
      onSimpleEmploymentCategoryChange('');
    }
  }

  function handleSimpleFundChange(value) {
    onSimpleFundChange(value);
    onSimpleNonSalariedEarningsInputModeChange('');
    onSimpleTsaySinglePensionerStatusChange('');

    if (isContributionBasedFund(value)) {
      onSimpleInsuredTypeChange('not_applicable');
      onSimpleEmploymentCategoryChange('contributions');
      onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
      return;
    }

    onSimpleInsuredTypeChange('');
    onSimpleEmploymentCategoryChange(
      getDefaultEmploymentCategoryForFund(value)
    );
    onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Ασφαλιστικές περίοδοι</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Συμπληρώστε την πρώτη ασφαλιστική περίοδο. Αν ο χρόνος ασφάλισης
        ανήκει σε διαφορετική κατηγορία ή φορέα, προσθέστε ακόμη μία περίοδο.
        Ο συνολικός χρόνος θα προκύψει αυτόματα από το άθροισμα των περιόδων.
      </p>

      {calculatorEdition === 'free' ? (
        <FreeInsurancePeriodsFlow
          insurancePeriodGroups={safeInsurancePeriodGroups}
          maxInsurancePeriodGroups={maxInsurancePeriodGroups}
          globalInsuredTypeInput={globalInsuredTypeInput}
          specialRegimeUsageInput={
            normalizedSpecialRegimeUsageInput
          }
          onSpecialRegimeUsageChange={
            onArticle30SpecialRegimeUsageChange
          }
          onInsurancePeriodGroupChange={
            onInsurancePeriodGroupChange
          }
          onAddInsurancePeriodGroup={onAddInsurancePeriodGroup}
          onRemoveInsurancePeriodGroup={
            onRemoveInsurancePeriodGroup
          }
        />
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {safeInsurancePeriodGroups.map((group, index) => (
            <InsurancePeriodGroupFields
              key={group.id}
              groupNumber={index + 1}
              title={`Ασφαλιστική περίοδος ${index + 1}`}
              group={group}
              canRemove={safeInsurancePeriodGroups.length > 1}
              onGroupChange={(field, value) => {
                onInsurancePeriodGroupChange(
                  group.id,
                  field,
                  value
                );
              }}
              onRemove={() => {
                onRemoveInsurancePeriodGroup(group.id);
              }}
            />
          ))}

          <button
            type="button"
            onClick={onAddInsurancePeriodGroup}
            disabled={
              safeInsurancePeriodGroups.length >=
              maxInsurancePeriodGroups
            }
            style={{
              ...secondaryButtonStyle,
              cursor:
                safeInsurancePeriodGroups.length >=
                maxInsurancePeriodGroups
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            + Προσθήκη ασφαλιστικής περιόδου
          </button>

          {safeInsurancePeriodGroups.length >=
            maxInsurancePeriodGroups && (
            <p style={{ color: '#8a5a00', marginBottom: 0 }}>
              Έχει συμπληρωθεί το μέγιστο όριο των{' '}
              {maxInsurancePeriodGroups} περιόδων.
            </p>
          )}
        </div>
      )}

      {calculatorEdition !== 'free' &&
        conditionalPremiumPresence.hasAny && (
          <Article30SpecialRegimeFields
            presence={conditionalPremiumPresence}
            usageInput={normalizedSpecialRegimeUsageInput}
            onUsageChange={
              onArticle30SpecialRegimeUsageChange
            }
          />
        )}

    </fieldset>
  );
}


function FreeInsurancePeriodsFlow({
  insurancePeriodGroups,
  maxInsurancePeriodGroups,
  globalInsuredTypeInput,
  specialRegimeUsageInput,
  onSpecialRegimeUsageChange,
  onInsurancePeriodGroupChange,
  onAddInsurancePeriodGroup,
  onRemoveInsurancePeriodGroup,
}) {
  const groups = Array.isArray(insurancePeriodGroups)
    ? insurancePeriodGroups
    : [];

  const initialCompletedPeriodIds = groups
    .filter((group) => {
      const presence = getConditionalPremiumPresence({
        insurancePeriodsInputMode: 'multiple',
        simpleEmploymentCategoryInput: '',
        insurancePeriodGroups: [group],
      });

      return !getFreePeriodCompletionIssue({
        group,
        specialRegimePresence: presence,
        specialRegimeUsageInput,
        globalInsuredTypeInput,
      });
    })
    .map((group) => group.id);

  const initialOpenGroup = groups.find(
    (group) => !initialCompletedPeriodIds.includes(group.id)
  );

  const [completedPeriodIds, setCompletedPeriodIds] =
    React.useState(initialCompletedPeriodIds);
  const [editingPeriodId, setEditingPeriodId] = React.useState(
    initialOpenGroup?.id || ''
  );
  const [selectingFundPeriodId, setSelectingFundPeriodId] =
    React.useState(
      initialOpenGroup && !initialOpenGroup.fund
        ? initialOpenGroup.id
        : ''
    );
  const [completionErrors, setCompletionErrors] = React.useState({});
  const previousPeriodIdsRef = React.useRef(
    groups.map((group) => group.id)
  );

  const periodIdsKey = groups.map((group) => group.id).join('|');

  React.useEffect(() => {
    const currentIds = groups.map((group) => group.id);
    const previousIds = previousPeriodIdsRef.current;
    const addedGroup = groups.find(
      (group) => !previousIds.includes(group.id)
    );

    setCompletedPeriodIds((current) =>
      current.filter((periodId) => currentIds.includes(periodId))
    );
    setCompletionErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([periodId]) =>
          currentIds.includes(periodId)
        )
      )
    );

    if (addedGroup) {
      const presence = getConditionalPremiumPresence({
        insurancePeriodsInputMode: 'multiple',
        simpleEmploymentCategoryInput: '',
        insurancePeriodGroups: [addedGroup],
      });
      const issue = getFreePeriodCompletionIssue({
        group: addedGroup,
        specialRegimePresence: presence,
        specialRegimeUsageInput,
        globalInsuredTypeInput,
      });

      if (issue) {
        setEditingPeriodId(addedGroup.id);
        setSelectingFundPeriodId(
          addedGroup.fund ? '' : addedGroup.id
        );
      } else {
        setCompletedPeriodIds((current) => [
          ...new Set([...current, addedGroup.id]),
        ]);
      }
    } else {
      setEditingPeriodId((current) =>
        current && currentIds.includes(current) ? current : ''
      );
      setSelectingFundPeriodId((current) =>
        current && currentIds.includes(current) ? current : ''
      );
    }

    previousPeriodIdsRef.current = currentIds;
  }, [periodIdsKey]);

  const completedPeriodIdSet = new Set(completedPeriodIds);
  const specialRegimeUsageKey = [
    'vae',
    'yvae',
    'ota_ika_vae',
    'ota_public_vae',
    'ota_ika_yvae',
  ]
    .map((premiumType) =>
      specialRegimeUsageInput[premiumType] || ''
    )
    .join('|');
  const completionRelevantKey = groups
    .map((group) =>
      [
        group.id,
        group.fund,
        group.uniformedBody,
        group.insuredType,
        group.employmentCategory,
        group.fromDate,
        group.toDate,
        group.timeInputMethod,
        group.insuranceDays,
        group.insuranceYears,
        group.insuranceMonths,
        group.insuranceExtraDays,
        group.nonSalariedEarningsInputMode,
        group.tsaySinglePensionerStatus,
      ].join('~')
    )
    .join('|');

  React.useEffect(() => {
    setCompletedPeriodIds((current) =>
      current.filter((periodId) => {
        const group = groups.find(
          (candidate) => candidate.id === periodId
        );

        if (!group) {
          return false;
        }

        const presence = getConditionalPremiumPresence({
          insurancePeriodsInputMode: 'multiple',
          simpleEmploymentCategoryInput: '',
          insurancePeriodGroups: [group],
        });

        return !getFreePeriodCompletionIssue({
          group,
          specialRegimePresence: presence,
          specialRegimeUsageInput,
          globalInsuredTypeInput,
        });
      })
    );
  }, [
    completionRelevantKey,
    globalInsuredTypeInput,
    specialRegimeUsageKey,
  ]);

  function clearCompletionError(periodId) {
    setCompletionErrors((current) => {
      if (!current[periodId]) {
        return current;
      }

      const next = { ...current };
      delete next[periodId];
      return next;
    });
  }

  function markPeriodAsEditing(periodId, selectFund = false) {
    setCompletedPeriodIds((current) =>
      current.filter((currentId) => currentId !== periodId)
    );
    setEditingPeriodId(periodId);
    setSelectingFundPeriodId(selectFund ? periodId : '');
    clearCompletionError(periodId);
  }

  function handleGroupChange(groupId, field, value) {
    onInsurancePeriodGroupChange(groupId, field, value);
    setCompletedPeriodIds((current) =>
      current.filter((currentId) => currentId !== groupId)
    );
    clearCompletionError(groupId);
  }

  function handleFundSelected(groupId) {
    setEditingPeriodId(groupId);
    setSelectingFundPeriodId('');
    clearCompletionError(groupId);
  }

  function handleCompletePeriod(group, groupIndex) {
    const specialRegimePresence = getConditionalPremiumPresence({
      insurancePeriodsInputMode: 'multiple',
      simpleEmploymentCategoryInput: '',
      insurancePeriodGroups: [group],
    });
    const issue = getFreePeriodCompletionIssue({
      group,
      specialRegimePresence,
      specialRegimeUsageInput,
      globalInsuredTypeInput,
    });

    if (issue) {
      setCompletionErrors((current) => ({
        ...current,
        [group.id]: issue,
      }));
      return;
    }

    setCompletedPeriodIds((current) => [
      ...new Set([...current, group.id]),
    ]);
    clearCompletionError(group.id);

    const nextGroup = groups
      .slice(groupIndex + 1)
      .find(
        (candidate) =>
          !completedPeriodIdSet.has(candidate.id)
      );

    if (nextGroup) {
      setEditingPeriodId(nextGroup.id);
      setSelectingFundPeriodId(
        nextGroup.fund ? '' : nextGroup.id
      );
      return;
    }

    setEditingPeriodId('');
    setSelectingFundPeriodId('');
  }

  function handleAddPeriod() {
    onAddInsurancePeriodGroup();
  }

  function handleRemovePeriod(groupId) {
    onRemoveInsurancePeriodGroup(groupId);
    setCompletedPeriodIds((current) =>
      current.filter((currentId) => currentId !== groupId)
    );
    setEditingPeriodId((current) =>
      current === groupId ? '' : current
    );
    setSelectingFundPeriodId((current) =>
      current === groupId ? '' : current
    );
    clearCompletionError(groupId);
  }

  const firstPeriodCompleted = Boolean(
    groups[0] && completedPeriodIdSet.has(groups[0].id)
  );
  const hasUnfinishedPeriod = groups.some(
    (group) => !completedPeriodIdSet.has(group.id)
  );
  const canAddSecondPeriod =
    groups.length < maxInsurancePeriodGroups &&
    firstPeriodCompleted &&
    !hasUnfinishedPeriod;

  return (
    <div style={freeFlowStyle}>
      {groups.map((group, index) => {
        const isCompleted = completedPeriodIdSet.has(group.id);
        const isEditing = editingPeriodId === group.id;
        const isSelectingFund =
          selectingFundPeriodId === group.id || !group.fund;
        const periodTitle =
          index === 0
            ? 'Πρώτη ασφαλιστική περίοδος'
            : 'Δεύτερη ασφαλιστική περίοδος';

        if (!isEditing) {
          return (
            <FreeInsurancePeriodSummary
              key={group.id}
              group={group}
              title={periodTitle}
              isCompleted={isCompleted}
              canRemove={index > 0}
              onEditDetails={() =>
                markPeriodAsEditing(group.id, false)
              }
              onEditFund={() =>
                markPeriodAsEditing(group.id, true)
              }
              onRemove={() => handleRemovePeriod(group.id)}
            />
          );
        }

        if (isSelectingFund) {
          return (
            <div key={group.id} style={freeActiveCardStyle}>
              <FreeFlowHeading
                step="Βήμα 1"
                title={periodTitle}
                description="Επιλέξτε πρώτα τη γενική κατηγορία και μετά τον συγκεκριμένο ασφαλιστικό φορέα."
              />

              <FreeInsuranceCategoryWizard
                group={group}
                groupNumber={index + 1}
                canRemove={index > 0}
                onInsurancePeriodGroupChange={(
                  groupId,
                  field,
                  value
                ) => {
                  const resolvedValue =
                    field === 'insuredType' &&
                    value === '' &&
                    globalInsuredTypeInput
                      ? globalInsuredTypeInput
                      : value;

                  onInsurancePeriodGroupChange(
                    groupId,
                    field,
                    resolvedValue
                  );
                }}
                onFundSelected={() =>
                  handleFundSelected(group.id)
                }
                onRemove={() => handleRemovePeriod(group.id)}
              />
            </div>
          );
        }

        const specialRegimePresence =
          getConditionalPremiumPresence({
            insurancePeriodsInputMode: 'multiple',
            simpleEmploymentCategoryInput: '',
            insurancePeriodGroups: [group],
          });

        return (
          <div key={group.id} style={freeActiveCardStyle}>
            <FreeFlowHeading
              step="Βήμα 2"
              title={`Στοιχεία ${periodTitle.toLowerCase()}`}
              description="Συμπληρώστε τα στοιχεία και ολοκληρώστε την περίοδο. Μετά θα εμφανίζεται μόνο η σύνοψή της."
            />

            <div style={selectedFundBarStyle}>
              <div>
                <span style={selectedFundCaptionStyle}>
                  Επιλεγμένος φορέας
                </span>
                <strong>{getPeriodFundLabel(group)}</strong>
              </div>
              <button
                type="button"
                onClick={() =>
                  markPeriodAsEditing(group.id, true)
                }
                style={compactActionButtonStyle}
              >
                Αλλαγή φορέα
              </button>
            </div>

            <InsurancePeriodGroupFields
              groupNumber={index + 1}
              title={periodTitle}
              group={group}
              hideFundSelection
              hideInsuredTypeSelection
              hideSingleEmploymentCategory
              useEmploymentCategoryRadios
              canRemove={false}
              onGroupChange={(field, value) =>
                handleGroupChange(group.id, field, value)
              }
              onRemove={() => {}}
            />

            {specialRegimePresence.hasAny && (
              <Article30SpecialRegimeFields
                presence={specialRegimePresence}
                usageInput={specialRegimeUsageInput}
                onUsageChange={(premiumType, value) => {
                  onSpecialRegimeUsageChange(
                    premiumType,
                    value
                  );
                  clearCompletionError(group.id);
                }}
              />
            )}

            {completionErrors[group.id] && (
              <div style={freeCompletionErrorStyle}>
                {completionErrors[group.id]}
              </div>
            )}

            <div style={freeEditorActionsStyle}>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemovePeriod(group.id)}
                  style={freeRemoveButtonStyle}
                >
                  Αφαίρεση περιόδου
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCompletePeriod(group, index)}
                style={freeCompleteButtonStyle}
              >
                Ολοκλήρωση ασφαλιστικής περιόδου
              </button>
            </div>
          </div>
        );
      })}

      {canAddSecondPeriod && (
        <button
          type="button"
          onClick={handleAddPeriod}
          style={freeAddPeriodButtonStyle}
        >
          + Προσθήκη δεύτερης ασφαλιστικής περιόδου
        </button>
      )}

      {groups.length === maxInsurancePeriodGroups &&
        groups.every((group) =>
          completedPeriodIdSet.has(group.id)
        ) && (
          <div style={freeAllCompleteStyle}>
            Οι ασφαλιστικές περίοδοι ολοκληρώθηκαν. Μπορείτε να
            συνεχίσετε στα επόμενα στοιχεία της σύνταξης.
          </div>
        )}
    </div>
  );
}

function FreeFlowHeading({ step, title, description }) {
  return (
    <div style={freeFlowHeadingStyle}>
      <span style={freeFlowStepStyle}>{step}</span>
      <div>
        <h2 style={freeFlowTitleStyle}>{title}</h2>
        <p style={freeFlowDescriptionStyle}>{description}</p>
      </div>
    </div>
  );
}

function FreeInsurancePeriodSummary({
  group,
  title,
  isCompleted,
  canRemove,
  onEditDetails,
  onEditFund,
  onRemove,
}) {
  return (
    <div
      style={{
        ...freeSummaryCardStyle,
        ...(isCompleted
          ? freeCompletedSummaryCardStyle
          : freePendingSummaryCardStyle),
      }}
    >
      <div style={freeSummaryHeaderStyle}>
        <div>
          <strong>{title}</strong>
          <span style={freeSummaryStatusStyle}>
            {isCompleted
              ? 'Ολοκληρωμένη'
              : 'Δεν έχει ολοκληρωθεί'}
          </span>
        </div>

        <div style={freeSummaryActionsStyle}>
          {group.fund && (
            <button
              type="button"
              onClick={onEditFund}
              style={compactActionButtonStyle}
            >
              Αλλαγή φορέα
            </button>
          )}
          <button
            type="button"
            onClick={onEditDetails}
            style={compactActionButtonStyle}
          >
            {isCompleted ? 'Αλλαγή στοιχείων' : 'Συνέχεια'}
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              style={freeCompactRemoveButtonStyle}
            >
              Αφαίρεση
            </button>
          )}
        </div>
      </div>

      <div style={freeSummaryDetailsStyle}>
        <strong>
          {group.fund
            ? getPeriodFundLabel(group)
            : 'Δεν έχει επιλεγεί φορέας'}
        </strong>
        {group.employmentCategory && (
          <span>{getPeriodEmploymentCategoryLabel(group)}</span>
        )}
        {(group.fromDate || group.toDate) && (
          <span>
            {group.fromDate || '—'} έως {group.toDate || '—'}
          </span>
        )}
        {getFreeInsuranceTimeSummary(group) && (
          <span>{getFreeInsuranceTimeSummary(group)}</span>
        )}
      </div>
    </div>
  );
}

function Article30SpecialRegimeFields({
  presence,
  usageInput,
  onUsageChange,
}) {
  return (
    <div style={specialRegimeBoxStyle}>
      <h3 style={{ marginTop: 0 }}>
        Ειδικές διατάξεις και επασφάλιστρο
      </h3>

      {presence.vae && (
        <SelectWithLabel
          id="article30SpecialRegimeUsageVae"
          label="Η συνταξιοδότηση γίνεται με ειδικές διατάξεις ΒΑΕ;"
          value={usageInput.vae}
          onChange={(value) => onUsageChange('vae', value)}
          options={SPECIAL_REGIME_USAGE_OPTIONS}
        />
      )}

      {presence.yvae && (
        <SelectWithLabel
          id="article30SpecialRegimeUsageYvae"
          label="Η συνταξιοδότηση γίνεται με ειδικές διατάξεις ΥΒΑΕ;"
          value={usageInput.yvae}
          onChange={(value) => onUsageChange('yvae', value)}
          options={SPECIAL_REGIME_USAGE_OPTIONS}
        />
      )}

      {presence.ota_ika_vae && (
        <SelectWithLabel
          id="article30SpecialRegimeUsageOtaIkaVae"
          label="Η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ΒΑΕ ΟΤΑ του πρώην ΙΚΑ;"
          value={usageInput.ota_ika_vae}
          onChange={(value) =>
            onUsageChange('ota_ika_vae', value)
          }
          options={SPECIAL_REGIME_USAGE_OPTIONS}
        />
      )}

      {presence.ota_public_vae && (
        <SelectWithLabel
          id="article30SpecialRegimeUsageOtaPublicVae"
          label="Η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ΒΑΕ ΟΤΑ του καθεστώτος Δημοσίου;"
          value={usageInput.ota_public_vae}
          onChange={(value) =>
            onUsageChange('ota_public_vae', value)
          }
          options={SPECIAL_REGIME_USAGE_OPTIONS}
        />
      )}

      {presence.ota_ika_yvae && (
        <SelectWithLabel
          id="article30SpecialRegimeUsageOtaIkaYvae"
          label="Η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ΥΒΑΕ καθαριότητας / αποκομιδής ΟΤΑ;"
          value={usageInput.ota_ika_yvae}
          onChange={(value) =>
            onUsageChange('ota_ika_yvae', value)
          }
          options={SPECIAL_REGIME_USAGE_OPTIONS}
        />
      )}

      <p style={{ color: '#475569', marginBottom: 0 }}>
        Με «Ναι» ή «Δεν γνωρίζω» το συγκεκριμένο
        επασφάλιστρο δεν προστίθεται. Με «Δεν γνωρίζω»
        εμφανίζεται επιπλέον σχετική προειδοποίηση.
      </p>
    </div>
  );
}

function getFreePeriodCompletionIssue({
  group,
  specialRegimePresence,
  specialRegimeUsageInput,
  globalInsuredTypeInput,
}) {
  if (!group?.fund) {
    return 'Επιλέξτε ασφαλιστικό φορέα.';
  }

  if (!globalInsuredTypeInput) {
    return 'Συμπληρώστε πρώτα το έτος πρώτης ασφάλισης στα βασικά στοιχεία.';
  }

  if (!group.insuredType) {
    return 'Ο χαρακτηρισμός παλαιού ή νέου ασφαλισμένου δεν μπόρεσε να υπολογιστεί.';
  }

  if (!group.employmentCategory) {
    return 'Επιλέξτε την κατηγορία εργασίας ή εισφορών.';
  }

  if (!String(group.fromDate || '').trim()) {
    return 'Συμπληρώστε την ημερομηνία έναρξης.';
  }

  if (!String(group.toDate || '').trim()) {
    return 'Συμπληρώστε την ημερομηνία λήξης.';
  }

  if (!group.timeInputMethod) {
    return 'Επιλέξτε τον τρόπο εισαγωγής του χρόνου ασφάλισης.';
  }

  if (group.timeInputMethod === 'insurance_days') {
    const days = Number(group.insuranceDays);

    if (!Number.isFinite(days) || days <= 0) {
      return 'Συμπληρώστε τις ημέρες ή τα ένσημα ασφάλισης.';
    }
  }

  if (group.timeInputMethod === 'years_months_days') {
    const totalDeclaredTime =
      Number(group.insuranceYears || 0) +
      Number(group.insuranceMonths || 0) +
      Number(group.insuranceExtraDays || 0);

    if (!Number.isFinite(totalDeclaredTime) || totalDeclaredTime <= 0) {
      return 'Συμπληρώστε έτη, μήνες ή ημέρες ασφάλισης.';
    }
  }

  if (
    isContributionBasedFund(group.fund) &&
    !group.nonSalariedEarningsInputMode
  ) {
    return 'Επιλέξτε αν γνωρίζετε το ετήσιο εισόδημα ή τις ετήσιες εισφορές κύριας σύνταξης.';
  }

  if (
    isTsayFund(group.fund) &&
    !['yes', 'no'].includes(group.tsaySinglePensionerStatus)
  ) {
    return 'Απαντήστε για τον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ.';
  }

  if (
    isUniformedFund(group.fund) &&
    !getUniformedBodyLabel(group.uniformedBody)
  ) {
    return 'Επιλέξτε αν ανήκετε στις Ένοπλες Δυνάμεις ή στα Σώματα Ασφαλείας και το συγκεκριμένο σώμα.';
  }

  if (
    isUniformedFund(group.fund) &&
    !group.uniformedSpecialTimeDraft?.insuranceRegime
  ) {
    return 'Επιλέξτε το καθεστώς κατάταξης του ενστόλου.';
  }

  for (const premiumType of [
    'vae',
    'yvae',
    'ota_ika_vae',
    'ota_public_vae',
    'ota_ika_yvae',
  ]) {
    if (
      specialRegimePresence[premiumType] &&
      !specialRegimeUsageInput[premiumType]
    ) {
      return 'Απαντήστε στην ερώτηση για τις ειδικές διατάξεις και το επασφάλιστρο.';
    }
  }

  return '';
}

function getFreeInsuranceTimeSummary(group) {
  if (group.timeInputMethod === 'insurance_days') {
    return group.insuranceDays
      ? `${group.insuranceDays} ημέρες ασφάλισης`
      : '';
  }

  if (group.timeInputMethod === 'years_months_days') {
    const years = group.insuranceYears || '0';
    const months = group.insuranceMonths || '0';
    const days = group.insuranceExtraDays || '0';

    return `${years} έτη, ${months} μήνες, ${days} ημέρες`;
  }

  return '';
}

function getFundOptionLabel(value) {
  return (
    FUND_OPTIONS.find((option) => option.value === value)?.label ||
    value ||
    ''
  );
}

function getPeriodFundLabel(group = {}) {
  const fundLabel = getFundOptionLabel(group.fund);
  const uniformedBodyLabel = getUniformedBodyLabel(group.uniformedBody);

  if (group.fund === 'uniformed' && uniformedBodyLabel) {
    return `${fundLabel} — ${uniformedBodyLabel}`;
  }

  return fundLabel;
}

function getInsuredTypeOptionLabel(value) {
  if (value === 'not_applicable') {
    return 'Δεν απαιτείται για αυτή την κατηγορία';
  }

  const option = OLD_NEW_INSURED_OPTIONS.find(
    (candidate) => candidate.value === value
  );

  return option?.label || value || '—';
}

function getEmploymentCategoryOptionLabel(value) {
  return getEmploymentCategoryLabel(value);
}

function getPeriodEmploymentCategoryLabel(group = {}) {
  if (group.fund === 'uniformed') {
    return 'Κανονική υπηρεσία ενστόλου';
  }

  return getEmploymentCategoryOptionLabel(group.employmentCategory);
}

function InsurancePeriodGroupFields({
  groupNumber,
  title,
  group,
  hideFundSelection = false,
  hideInsuredTypeSelection = false,
  hideSingleEmploymentCategory = false,
  useEmploymentCategoryRadios = false,
  canRemove,
  onGroupChange,
  onRemove,
}) {
  const insuredTypeOptions = getInsuredTypeOptions(group.fund);
  const employmentCategoryOptions = getEmploymentCategoryOptions(
    group.fund,
    group.insuredType
  );
  const selectableEmploymentCategoryOptions =
    employmentCategoryOptions.filter((option) => option.value);
  const singleEmploymentCategoryOption =
    selectableEmploymentCategoryOptions.length === 1
      ? selectableEmploymentCategoryOptions[0]
      : null;
  const isCurrentUniformedFund = isUniformedFund(group.fund);
  const isCurrentContributionBasedFund = isContributionBasedFund(group.fund);
  const isCurrentTsayFund = isTsayFund(group.fund);
  const isCurrentArticle30MainContributionFund =
    isArticle30MainContributionFund(group.fund);
  const hasAutomaticEmploymentCategory =
    Boolean(group.employmentCategory) &&
    (
      (
        singleEmploymentCategoryOption &&
        group.employmentCategory === singleEmploymentCategoryOption.value
      ) ||
      isCurrentUniformedFund ||
      isCurrentContributionBasedFund ||
      isCurrentArticle30MainContributionFund
    );
  const shouldShowAutomaticEmploymentCategory =
    hideSingleEmploymentCategory &&
    hasAutomaticEmploymentCategory;

  function handleFundChange(value) {
    onGroupChange('fund', value);
    onGroupChange('nonSalariedEarningsInputMode', '');
    onGroupChange('tsaySinglePensionerStatus', '');

    if (isContributionBasedFund(value)) {
      onGroupChange('insuredType', 'not_applicable');
      onGroupChange('employmentCategory', 'contributions');
      onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
      return;
    }

    onGroupChange('insuredType', '');
    onGroupChange(
      'employmentCategory',
      getDefaultEmploymentCategoryForFund(value)
    );
    onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
  }

  return (
    <div style={periodBoxStyle}>
      <div style={periodHeaderStyle}>
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>{title}</h3>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={removeButtonStyle}
          >
            Αφαίρεση
          </button>
        )}
      </div>

      <div style={gridStyle}>
        {!hideFundSelection && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}Fund`}
            label="Φορέας / κατηγορία ασφάλισης"
            value={group.fund}
            onChange={handleFundChange}
            options={FUND_OPTIONS}
          />
        )}

        {!hideInsuredTypeSelection &&
          !isCurrentContributionBasedFund && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}InsuredType`}
            label="Ασφαλισμένος"
            value={group.insuredType}
            onChange={(value) => {
              onGroupChange('insuredType', value);

              if (
                group.fund === 'ota' &&
                value === 'new' &&
                group.employmentCategory === 'ota_ika_yvae'
              ) {
                onGroupChange('employmentCategory', '');
              }
            }}
            options={insuredTypeOptions}
            disabled={!group.fund}
          />
        )}

        {useEmploymentCategoryRadios &&
          !isCurrentContributionBasedFund &&
          !isCurrentUniformedFund && (
          <RadioGroupWithLabel
            id={`multiPeriod${groupNumber}EmploymentCategory`}
            label="Κατηγορία ενσήμων"
            value={group.employmentCategory}
            onChange={(value) => onGroupChange('employmentCategory', value)}
            options={selectableEmploymentCategoryOptions}
            disabled={!group.fund}
          />
        )}

        {isCurrentUniformedFund && (
          <ConfirmedValueWithLabel
            label="Κατηγορία ασφάλισης"
            value="Κανονική υπηρεσία ενστόλου"
          />
        )}

        {!useEmploymentCategoryRadios &&
          shouldShowAutomaticEmploymentCategory && (
          <ConfirmedValueWithLabel
            label="Κατηγορία εργασίας / εισφορών"
            value={getEmploymentCategoryOptionLabel(
              group.employmentCategory
            )}
          />
        )}

        {!useEmploymentCategoryRadios &&
          !isCurrentUniformedFund &&
          !isCurrentContributionBasedFund &&
          !isCurrentArticle30MainContributionFund &&
          !shouldShowAutomaticEmploymentCategory && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}EmploymentCategory`}
            label="Κατηγορία εργασίας / εισφορών"
            value={group.employmentCategory}
            onChange={(value) => onGroupChange('employmentCategory', value)}
            options={employmentCategoryOptions}
            disabled={!group.fund}
          />
        )}

        {isCurrentContributionBasedFund && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}NonSalariedEarningsInputMode`}
            label="Τι στοιχεία γνωρίζετε για κάθε έτος;"
            value={group.nonSalariedEarningsInputMode || ''}
            onChange={(value) =>
              onGroupChange('nonSalariedEarningsInputMode', value)
            }
            options={NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS}
          />
        )}

        {isCurrentTsayFund && (
          <SelectWithLabel
            id={`multiPeriod${groupNumber}TsaySinglePensionerStatus`}
            label="Υπήρχε υπαγωγή στον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ σε αυτή την περίοδο;"
            value={group.tsaySinglePensionerStatus || ''}
            onChange={(value) =>
              onGroupChange('tsaySinglePensionerStatus', value)
            }
            options={YES_NO_OPTIONS}
          />
        )}

        {isCurrentUniformedFund && group.uniformedBody && (
          <ConfirmedValueWithLabel
            label="Κλάδος / σώμα"
            value={getUniformedBodyLabel(group.uniformedBody)}
          />
        )}

        <TextInputWithLabel
          id={`multiPeriod${groupNumber}FromDate`}
          label="Ημερομηνία έναρξης"
          value={group.fromDate || ''}
          onChange={(value) => onGroupChange('fromDate', value)}
          placeholder="π.χ. 01/01/2025"
        />

        <TextInputWithLabel
          id={`multiPeriod${groupNumber}ToDate`}
          label="Ημερομηνία λήξης"
          value={group.toDate || ''}
          onChange={(value) => onGroupChange('toDate', value)}
          placeholder="π.χ. 31/12/2025"
        />

        <SelectWithLabel
          id={`multiPeriod${groupNumber}TimeInputMethod`}
          label="Τρόπος εισαγωγής χρόνου"
          value={group.timeInputMethod}
          onChange={(value) => onGroupChange('timeInputMethod', value)}
          options={INSURANCE_TIME_METHOD_OPTIONS}
        />

        {group.timeInputMethod === 'insurance_days' && (
          <TextInputWithLabel
            id={`multiPeriod${groupNumber}InsuranceDays`}
            label="Ένσημα / ημέρες ασφάλισης"
            value={group.insuranceDays}
            onChange={(value) => onGroupChange('insuranceDays', value)}
            placeholder="π.χ. 4500"
          />
        )}

        {group.timeInputMethod === 'years_months_days' && (
          <>
            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceYears`}
              label="Έτη"
              value={group.insuranceYears}
              onChange={(value) => onGroupChange('insuranceYears', value)}
              placeholder="π.χ. 15"
            />

            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceMonths`}
              label="Μήνες"
              value={group.insuranceMonths}
              onChange={(value) => onGroupChange('insuranceMonths', value)}
              placeholder="0 έως 11"
            />

            <TextInputWithLabel
              id={`multiPeriod${groupNumber}InsuranceExtraDays`}
              label="Ημέρες"
              value={group.insuranceExtraDays}
              onChange={(value) => onGroupChange('insuranceExtraDays', value)}
              placeholder="0 έως 24"
            />
          </>
        )}
      </div>

      {isCurrentUniformedFund && (
        <UniformedSpecialTimeFields
          idPrefix={`multiPeriod${groupNumber}Uniformed`}
          value={group.uniformedSpecialTimeDraft}
          uniformedBody={group.uniformedBody}
          fromDate={group.fromDate}
          onChange={(nextValue) => {
            onGroupChange('uniformedSpecialTimeDraft', nextValue);
          }}
        />
      )}
    </div>
  );
}

function UniformedSpecialTimeFields({
  idPrefix,
  value,
  uniformedBody,
  fromDate,
  onChange,
}) {
  const normalizedValue =
    normalizeUniformedSpecialTimeDraft(value);
  const derivedInsuranceRegime =
    deriveUniformedInsuranceRegimeFromDate(fromDate);
  const safeValue = {
    ...normalizedValue,
    insuranceRegime:
      derivedInsuranceRegime || "",
    article36ACategory: "",
  };

  function updateCombatFiveYearService(
    field,
    fieldValue,
  ) {
    const nextCombatFiveYearService = {
      ...safeValue.combatFiveYearService,
      [field]: fieldValue,
    };

    if (
      field === 'status' &&
      fieldValue === 'none'
    ) {
      nextCombatFiveYearService.years = '';
      nextCombatFiveYearService.months = '';
      nextCombatFiveYearService.days = '';
      nextCombatFiveYearService.serviceYears = '';
      nextCombatFiveYearService.contributionPaymentMode = '';
      nextCombatFiveYearService.applicationYear = '';
      nextCombatFiveYearService.recognitionPeriod = '';
      nextCombatFiveYearService.paidAmount = '';
      nextCombatFiveYearService.contributionRatePercent = '';
      nextCombatFiveYearService.explicitPensionableEarningsBase = '';
      nextCombatFiveYearService.earningsReferenceYear = '';
    }

    if (
      field === 'contributionPaymentMode' &&
      fieldValue !== 'legacy_opt_out_later_recognition'
    ) {
      nextCombatFiveYearService.applicationYear = '';
    }

    onChange({
      ...safeValue,
      combatFiveYearService:
        nextCombatFiveYearService,
    });
  }

  function updateSpecialSemesters(
    field,
    fieldValue,
  ) {
    const nextSpecialSemesters = {
      ...safeValue.specialSemesters,
      [field]: fieldValue,
    };

    if (field === 'status' && fieldValue === 'yes') {
      nextSpecialSemesters.specialSemestersType =
        FREE_RECOGNIZED_ARTICLE_41_SEMESTERS_TYPE;
      nextSpecialSemesters.recognizedArticle41Time = true;
      nextSpecialSemesters.milestoneCompletionYear = '';
    }

    if (
      field === 'status' &&
      fieldValue === 'none'
    ) {
      nextSpecialSemesters.specialSemestersType = '';
      nextSpecialSemesters.recognizedArticle41Time = false;
      nextSpecialSemesters.semestersCount = '';
      nextSpecialSemesters.milestoneCompletionYear = '';
      nextSpecialSemesters.serviceYears = '';
      nextSpecialSemesters.contributionPaymentMode = '';
      nextSpecialSemesters.applicationYear = '';
      nextSpecialSemesters.recognitionPeriod = '';
      nextSpecialSemesters.paidAmount = '';
      nextSpecialSemesters.contributionRatePercent = '';
      nextSpecialSemesters.explicitPensionableEarningsBase = '';
      nextSpecialSemesters.earningsReferenceYear = '';
    }

    if (
      field === 'contributionPaymentMode' &&
      fieldValue !== 'legacy_opt_out_later_recognition'
    ) {
      nextSpecialSemesters.applicationYear = '';
    }

    onChange({
      ...safeValue,
      specialSemesters:
        nextSpecialSemesters,
    });
  }

  const insuranceRegime =
    safeValue.insuranceRegime;
  const insuranceRegimeLabel =
    getUniformedInsuranceRegimeLabel(
      insuranceRegime
    );
  const combatStatus =
    safeValue.combatFiveYearService.status;
  const semestersStatus =
    safeValue.specialSemesters.status;
  const hasCombatFiveYearService =
    combatStatus !== 'none';
  const hasSpecialSemesters =
    semestersStatus === 'yes';
  const validationError =
    getUniformedSpecialTimeValidationError(
      safeValue,
      {
        uniformedBody,
        fromDate,
      }
    );

  return (
    <div style={uniformedBoxStyle}>
      <h4 style={{ marginTop: 0 }}>
        Ειδικοί χρόνοι ενστόλων
      </h4>

      <p style={{ color: '#475569' }}>
        Με αναλυτικές ετήσιες αποδοχές, οι επιλέξιμοι
        ειδικοί χρόνοι τοποθετούνται στα πραγματικά έτη
        υπηρεσίας. Η μάχιμη πενταετία ΕΛ.ΑΣ.,
        Πυροσβεστικής και Λιμενικού, καθώς και χρόνος
        χωρίς υποχρέωση εισφορών, αυξάνουν μόνο τον
        συντάξιμο χρόνο. Με έτοιμο μέσο μηνιαίο μισθό,
        χρησιμοποιείται ο ίδιος μέσος ως απλοποιητική
        βάση όπου ο ειδικός χρόνος επηρεάζει αποδοχές.
      </p>

      <div style={gridStyle}>
        <ConfirmedValueWithLabel
          label="Καθεστώς κατάταξης"
          value={
            insuranceRegimeLabel ||
            'Θα προκύψει από την ημερομηνία έναρξης'
          }
          statusText={
            insuranceRegimeLabel
              ? '✓ Προέκυψε αυτόματα από την ημερομηνία έναρξης'
              : 'Συμπληρώστε έγκυρη ημερομηνία έναρξης'
          }
          pending={!insuranceRegimeLabel}
        />

      </div>

      {validationError && (
        <p
          style={{
            color: 'crimson',
            marginTop: 0,
          }}
        >
          {validationError}
        </p>
      )}

      <div style={uniformedSubBoxStyle}>
        <h5 style={{ marginTop: 0 }}>
          Μάχιμη πενταετία / διπλός χρόνος
        </h5>

        <div style={gridStyle}>
          <SelectWithLabel
            id={`${idPrefix}CombatFiveYearServiceStatus`}
            label="Υπάρχει μάχιμη πενταετία;"
            value={combatStatus}
            onChange={(fieldValue) =>
              updateCombatFiveYearService(
                'status',
                fieldValue
              )
            }
            options={
              COMBAT_FIVE_YEAR_STATUS_OPTIONS
            }
          />

          {combatStatus === 'partial' && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceYears`}
                label="Έτη"
                value={
                  safeValue
                    .combatFiveYearService.years
                }
                onChange={(fieldValue) =>
                  updateCombatFiveYearService(
                    'years',
                    fieldValue
                  )
                }
                placeholder="0 έως 5"
                required
              />

              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceMonths`}
                label="Μήνες"
                value={
                  safeValue
                    .combatFiveYearService.months
                }
                onChange={(fieldValue) =>
                  updateCombatFiveYearService(
                    'months',
                    fieldValue
                  )
                }
                placeholder="0 έως 11"
              />

              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceDays`}
                label="Ημέρες"
                value={
                  safeValue
                    .combatFiveYearService.days
                }
                onChange={(fieldValue) =>
                  updateCombatFiveYearService(
                    'days',
                    fieldValue
                  )
                }
                placeholder="0 έως 24"
              />
            </>
          )}

          {hasCombatFiveYearService && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceServiceYears`}
                label="Έτη στα οποία πραγματοποιήθηκε η ειδική υπηρεσία"
                value={
                  safeValue
                    .combatFiveYearService
                    .serviceYears
                }
                onChange={(fieldValue) =>
                  updateCombatFiveYearService(
                    'serviceYears',
                    fieldValue
                  )
                }
                placeholder="π.χ. 2004, 2005, 2006, 2007, 2008"
                required
              />

              <SelectWithLabel
                id={`${idPrefix}CombatFiveYearServiceContributionPaymentMode`}
                label="Πώς καταβλήθηκαν οι πρόσθετες εισφορές;"
                value={
                  safeValue
                    .combatFiveYearService
                    .contributionPaymentMode
                }
                onChange={(fieldValue) =>
                  updateCombatFiveYearService(
                    'contributionPaymentMode',
                    fieldValue
                  )
                }
                options={
                  UNIFORMED_CONTRIBUTION_PAYMENT_MODE_OPTIONS
                }
                required
              />

              {safeValue
                .combatFiveYearService
                .contributionPaymentMode ===
                'legacy_opt_out_later_recognition' && (
                <TextInputWithLabel
                  id={`${idPrefix}CombatFiveYearServiceApplicationYear`}
                  label="Έτος αίτησης μετά από παλιά δήλωση μη παρακράτησης"
                  value={
                    safeValue
                      .combatFiveYearService
                      .applicationYear
                  }
                  onChange={(fieldValue) =>
                    updateCombatFiveYearService(
                      'applicationYear',
                      fieldValue
                    )
                  }
                  placeholder="π.χ. 2024"
                  required
                />
              )}
            </>
          )}
        </div>

        {hasCombatFiveYearService && (
          <p
            style={{
              color: '#475569',
              marginBottom: 0,
            }}
          >
            Δηλώστε τα πραγματικά έτη υπηρεσίας,
            χωρισμένα με κόμμα. Η εφαρμογή κατανέμει
            έως 300 ημέρες αναγνωρισμένου χρόνου σε
            κάθε δηλωμένο έτος.
          </p>
        )}
      </div>

      <div style={uniformedSubBoxStyle}>
        <h5 style={{ marginTop: 0 }}>
          Αναγνωρισμένα ειδικά εξάμηνα άρθρου 41
        </h5>

        <div style={gridStyle}>
          <SelectWithLabel
            id={`${idPrefix}SpecialSemestersStatus`}
            label="Έχετε αναγνωρισμένο χρόνο από ειδικά εξάμηνα άρθρου 41;"
            value={semestersStatus}
            onChange={(fieldValue) =>
              updateSpecialSemesters(
                'status',
                fieldValue
              )
            }
            options={
              SPECIAL_SEMESTERS_STATUS_OPTIONS
            }
          />

          <p
            style={{
              gridColumn: '1 / -1',
              color: '#475569',
              margin: 0,
            }}
          >
            Η πρόσθετη προσαύξηση 1,5% υπολογίζεται αυτόματα μόνο
            για τον αναγνωρισμένο χρόνο αυτών των εξαμήνων που
            βρίσκεται πάνω από τα 45 συνολικά συντάξιμα έτη.
          </p>

          {hasSpecialSemesters && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}SpecialSemestersCount`}
                label="Πλήθος εξαμήνων"
                value={
                  safeValue.specialSemesters
                    .semestersCount
                }
                onChange={(fieldValue) =>
                  updateSpecialSemesters(
                    'semestersCount',
                    fieldValue
                  )
                }
                placeholder={
                  insuranceRegime === 'new_ika'
                    ? 'π.χ. 4'
                    : 'π.χ. 20'
                }
                required
              />

              <TextInputWithLabel
                id={`${idPrefix}SpecialSemestersServiceYears`}
                label="Έτη στα οποία πραγματοποιήθηκαν τα εξάμηνα"
                value={
                  safeValue.specialSemesters
                    .serviceYears
                }
                onChange={(fieldValue) =>
                  updateSpecialSemesters(
                    'serviceYears',
                    fieldValue
                  )
                }
                placeholder="π.χ. 2003, 2004, 2006"
                required
              />

              <SelectWithLabel
                id={`${idPrefix}SpecialSemestersContributionPaymentMode`}
                label="Πώς καταβλήθηκαν οι πρόσθετες εισφορές;"
                value={
                  safeValue.specialSemesters
                    .contributionPaymentMode
                }
                onChange={(fieldValue) =>
                  updateSpecialSemesters(
                    'contributionPaymentMode',
                    fieldValue
                  )
                }
                options={
                  UNIFORMED_CONTRIBUTION_PAYMENT_MODE_OPTIONS
                }
                required
              />

              {safeValue.specialSemesters
                .contributionPaymentMode ===
                'legacy_opt_out_later_recognition' && (
                <TextInputWithLabel
                  id={`${idPrefix}SpecialSemestersApplicationYear`}
                  label="Έτος αίτησης μετά από παλιά δήλωση μη παρακράτησης"
                  value={
                    safeValue.specialSemesters
                      .applicationYear
                  }
                  onChange={(fieldValue) =>
                    updateSpecialSemesters(
                      'applicationYear',
                      fieldValue
                    )
                  }
                  placeholder="π.χ. 2024"
                  required
                />
              )}
            </>
          )}
        </div>

        {hasSpecialSemesters && (
          <>
            <p
              style={{
                color: '#475569',
                marginBottom: 0,
              }}
            >
              Δύο εξάμηνα αντιστοιχούν σε ένα
              ασφαλιστικό έτος. Δηλώστε ακριβώς τόσα
              διαφορετικά έτη όσα απαιτούνται για το
              πλήθος των εξαμήνων.
            </p>

            <p
              style={{
                color: '#8a5a00',
                marginBottom: 0,
              }}
            >
              Η δωρεάν έκδοση δεν επιβεβαιώνει ακόμη
              αν ο συγκεκριμένος τύπος και το πλήθος
              εξαμήνων πληρούν όλες τις ειδικές
              υπηρεσιακές προϋποθέσεις. Ο χρήστης πρέπει
              να δηλώνει μόνο εξάμηνα που πράγματι
              δικαιούται. Ελέγχεται πάντως το συνολικό
              πλαφόν αναγνωριζόμενων χρόνων.
            </p>
          </>
        )}
      </div>
    </div>
  );
}


function getUniformedSpecialTimeValidationError(
  value,
  {
    uniformedBody = '',
    fromDate = '',
  } = {}
) {
  const normalizedValue =
    normalizeUniformedSpecialTimeDraft(value);
  const expectedInsuranceRegime =
    deriveUniformedInsuranceRegimeFromDate(fromDate);
  const insuranceRegime =
    normalizedValue.insuranceRegime;

  if (!expectedInsuranceRegime) {
    return 'Συμπληρώστε έγκυρη ημερομηνία έναρξης, ώστε να προκύψει αυτόματα το καθεστώς κατάταξης.';
  }

  if (
    insuranceRegime !==
    expectedInsuranceRegime
  ) {
    return 'Το καθεστώς κατάταξης δεν συμφωνεί με την ημερομηνία έναρξης της συγκεκριμένης ένστολης περιόδου.';
  }

  const combatFiveYearService =
    normalizedValue.combatFiveYearService;
  const specialSemesters =
    normalizedValue.specialSemesters;

  const combatDaysResult =
    getCombatFiveYearServiceDays(
      combatFiveYearService
    );

  if (combatDaysResult.error) {
    return combatDaysResult.error;
  }

  const combatEarningsError =
    getUniformedRecognitionEarningsValidationError(
      combatFiveYearService,
      'τη μάχιμη πενταετία',
      combatDaysResult.days
    );

  if (combatEarningsError) {
    return combatEarningsError;
  }

  const semestersDaysResult =
    getSpecialSemestersDays(
      specialSemesters,
      insuranceRegime
    );

  if (semestersDaysResult.error) {
    return semestersDaysResult.error;
  }

  const semestersEarningsError =
    getUniformedRecognitionEarningsValidationError(
      specialSemesters,
      'τα εξάμηνα',
      semestersDaysResult.days
    );

  if (semestersEarningsError) {
    return semestersEarningsError;
  }

  if (insuranceRegime === 'new_ika') {
    const maxCombinedDays = 7 * 300;
    const totalSpecialDays =
      combatDaysResult.days +
      semestersDaysResult.days;

    if (totalSpecialDays > maxCombinedDays) {
      return 'Για κατάταξη από 01/01/2011, η μάχιμη πενταετία μαζί με τα εξάμηνα δεν μπορεί να ξεπερνά τα 7 έτη. Στον τελικό έλεγχο συνυπολογίζονται και τυχόν λοιποί αναγνωριζόμενοι χρόνοι.';
    }
  }

  return null;
}

function getUniformedRecognitionEarningsValidationError(
  value = {},
  label,
  insuranceDays
) {
  const status = String(
    value.status || 'none'
  ).trim();

  if (status === 'none') {
    return null;
  }

  const serviceYearsResult =
    parseUniformedServiceYearsForForm(
      value.serviceYears
    );

  if (serviceYearsResult.error) {
    return `Για ${label}, ${serviceYearsResult.error}`;
  }

  const requiredServiceYearsCount = Math.ceil(
    Number(insuranceDays || 0) / 300
  );

  if (
    serviceYearsResult.years.length !==
    requiredServiceYearsCount
  ) {
    const yearsWord =
      requiredServiceYearsCount === 1 ? 'έτος' : 'έτη';

    return (
      `Για ${label}, δηλώστε ακριβώς ${requiredServiceYearsCount} διαφορετικά ${yearsWord} ειδικής υπηρεσίας. ` +
      `Έχουν δηλωθεί ${serviceYearsResult.years.length}.`
    );
  }

  const contributionPaymentMode = String(
    value.contributionPaymentMode || ''
  ).trim();

  if (
    ![
      'withheld_during_service',
      'later_recognition',
      'legacy_opt_out_later_recognition',
      'legal_exemption',
    ].includes(contributionPaymentMode)
  ) {
    return `Για ${label}, επιλέξτε πώς καταβλήθηκαν οι πρόσθετες εισφορές.`;
  }

  if (
    contributionPaymentMode ===
    'legacy_opt_out_later_recognition'
  ) {
    const applicationYearText = String(
      value.applicationYear || ''
    ).trim();

    if (
      !/^\d{4}$/.test(
        applicationYearText
      ) ||
      Number(applicationYearText) < 1900 ||
      Number(applicationYearText) > 2100
    ) {
      return `Για ${label}, το έτος μεταγενέστερης αναγνώρισης πρέπει να είναι έγκυρο τετραψήφιο έτος.`;
    }

    const latestServiceYear = Math.max(
      ...serviceYearsResult.years
    );

    if (
      Number(applicationYearText) <
      latestServiceYear
    ) {
      return `Για ${label}, το έτος μεταγενέστερης αναγνώρισης δεν μπορεί να προηγείται του τελευταίου έτους ειδικής υπηρεσίας.`;
    }
  }

  return null;
}

function parseUniformedServiceYearsForForm(
  value
) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || '')
        .split(/[\s,;|]+/)
        .filter(Boolean);

  if (rawValues.length === 0) {
    return {
      years: [],
      error:
        'δηλώστε τα έτη στα οποία πραγματοποιήθηκε η ειδική υπηρεσία.',
    };
  }

  const years = [];
  const seen = new Set();

  for (const rawValue of rawValues) {
    const text = String(rawValue).trim();

    if (!/^\d{4}$/.test(text)) {
      return {
        years: [],
        error:
          'τα έτη ειδικής υπηρεσίας πρέπει να είναι τετραψήφια και χωρισμένα με κόμμα.',
      };
    }

    const year = Number(text);

    if (year < 1900 || year > 2100) {
      return {
        years: [],
        error:
          'κάθε έτος ειδικής υπηρεσίας πρέπει να είναι από 1900 έως 2100.',
      };
    }

    if (seen.has(year)) {
      return {
        years: [],
        error:
          `το έτος ${year} δηλώθηκε περισσότερες από μία φορές.`,
      };
    }

    seen.add(year);
    years.push(year);
  }

  return {
    years,
    error: null,
  };
}

function parsePositiveDecimal(value) {
  const text = String(value || '').trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return { isValid: false, value: 0 };
  const numberValue = Number(text);
  return { isValid: numberValue > 0, value: numberValue };
}

function getCombatFiveYearServiceDays(combatFiveYearService = {}) {
  const status = combatFiveYearService.status || 'none';

  if (status === 'none') {
    return {
      days: 0,
      error: null,
    };
  }

  if (status === 'full') {
    return {
      days: 5 * 300,
      error: null,
    };
  }

  if (status !== 'partial') {
    return {
      days: 0,
      error: 'Η επιλογή μάχιμης πενταετίας δεν είναι έγκυρη.',
    };
  }

  const years = parseNonNegativeIntegerOrEmpty(combatFiveYearService.years);
  const months = parseNonNegativeIntegerOrEmpty(combatFiveYearService.months);
  const days = parseNonNegativeIntegerOrEmpty(combatFiveYearService.days);

  if (!years.isValid || !months.isValid || !days.isValid) {
    return {
      days: 0,
      error: 'Ο μερικός χρόνος μάχιμης πενταετίας πρέπει να δηλωθεί με ακέραια έτη, μήνες και ημέρες.',
    };
  }

  if (months.value > 11) {
    return {
      days: 0,
      error: 'Οι μήνες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 11.',
    };
  }

  if (days.value > 24) {
    return {
      days: 0,
      error: 'Οι ημέρες της μερικής μάχιμης πενταετίας πρέπει να είναι από 0 έως 24.',
    };
  }

  const totalDays =
    years.value * 300 +
    months.value * 25 +
    days.value;

  if (totalDays > 5 * 300) {
    return {
      days: 0,
      error: 'Η μερική μάχιμη πενταετία δεν μπορεί να ξεπερνά τα 5 έτη.',
    };
  }

  return {
    days: totalDays,
    error: null,
  };
}

function getSpecialSemestersDays(specialSemesters = {}, insuranceRegime = '') {
  const status = specialSemesters.status || 'none';

  if (status === 'none') {
    return {
      days: 0,
      error: null,
    };
  }

  if (status !== 'yes') {
    return {
      days: 0,
      error: 'Η επιλογή εξαμήνων δεν είναι έγκυρη.',
    };
  }

  const semestersCount = parseNonNegativeIntegerOrEmpty(
    specialSemesters.semestersCount
  );

  if (!semestersCount.isValid || semestersCount.value <= 0) {
    return {
      days: 0,
      error: 'Το πλήθος εξαμήνων πρέπει να είναι ακέραιος αριθμός μεγαλύτερος από 0.',
    };
  }

  return {
    days: semestersCount.value * 6 * 25,
    error: null,
  };
}

function parseNonNegativeIntegerOrEmpty(value) {
  const text = String(value || '').trim();

  if (!text) {
    return {
      isValid: true,
      value: 0,
    };
  }

  if (!/^\d+$/.test(text)) {
    return {
      isValid: false,
      value: 0,
    };
  }

  return {
    isValid: true,
    value: Number(text),
  };
}

function ConfirmedValueWithLabel({
  label,
  value,
  statusText = '✓ Επιλέχθηκε αυτόματα',
  pending = false,
}) {
  return (
    <div
      style={{
        ...confirmedValueFieldStyle,
        ...(pending
          ? confirmedValuePendingFieldStyle
          : {}),
      }}
    >
      <span style={confirmedValueLabelStyle}>{label}</span>
      <strong>{value}</strong>
      <span
        style={{
          ...confirmedValueStatusStyle,
          ...(pending
            ? confirmedValuePendingStatusStyle
            : {}),
        }}
      >
        {statusText}
      </span>
    </div>
  );
}

function RadioGroupWithLabel({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <fieldset style={radioGroupFieldsetStyle} disabled={disabled}>
      <legend style={radioGroupLegendStyle}>{label}</legend>
      <div style={radioOptionsStyle}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;

          return (
            <label key={option.value} htmlFor={optionId} style={radioOptionStyle}>
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SelectWithLabel({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>

      <br />

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
        disabled={disabled}
        required={required}
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

function TextInputWithLabel({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>

      <br />

      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        required={required}
      />
    </div>
  );
}

const FUND_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },

  {
    value: 'ika',
    label: 'ΙΚΑ / e-ΕΦΚΑ μισθωτών',
  },
  {
    value: 'public_sector',
    label: 'Δημόσιο (γενική κατηγορία)',
  },
  {
    value: 'ota',
    label: 'ΟΤΑ / υπηρεσίες καθαριότητας και υγιεινής',
  },
  {
    value: 'uniformed',
    label: 'Ένστολοι',
  },
  {
    value: 'tap_dei',
    label: 'ΤΑΠ-ΔΕΗ',
  },
  {
    value: 'ika_tsp_hsap',
    label: 'τ. ΤΣΠ-ΗΣΑΠ',
  },
  {
    value: 'ika_tsp_ete',
    label: 'τ. ΤΣΠ-ΕΤΕ',
  },
  {
    value: 'ika_tap_etba',
    label: 'τ. ΤΑΠ-ΕΤΒΑ',
  },
  {
    value: 'tapae_ethniki',
    label: 'ΤΑΠΑΕ «Η Εθνική»',
  },
  {
    value: 'tseapgso',
    label: 'τ. ΤΣΕΑΠΓΣΟ',
  },
  {
    value: 'ika_tap_ote_ote',
    label: 'τ. ΤΑΠ-ΟΤΕ — ΟΤΕ',
  },
  {
    value: 'ika_tap_ote_ose_elta',
    label: 'τ. ΤΑΠ-ΟΤΕ — ΟΣΕ / ΕΛΤΑ',
  },
  {
    value: 'ika_tap_ote_staff',
    label: 'τ. ΤΑΠ-ΟΤΕ — υπάλληλοι τ. ΤΑΠΟΤΕ',
  },
  {
    value: 'ika_npdd_special',
    label: 'Τακτικοί υπάλληλοι ΙΚΑ / ΝΠΔΔ ειδικού καθεστώτος',
  },
  {
    value: 'etap_mme_tattath',
    label: 'ΕΤΑΠ-ΜΜΕ / πρώην ΤΑΤΤΑΘ',
  },
  {
    value: 'tanpy',
    label: 'ΤΑΝΠΥ / έμμισθοι ναυτικοί πράκτορες',
  },
  {
    value: 'deko',
    label: 'Άλλη ΔΕΚΟ / οργανισμός κοινής ωφέλειας',
  },
  {
    value: 'nat',
    label: 'ΝΑΤ / ναυτικοί',
  },
  {
    value: 'aviation',
    label: 'Αεροπορικές / ΥΠΑ / χειριστές',
  },
  {
    value: 'artistic',
    label: 'Καλλιτεχνικές κατηγορίες',
  },

  {
    value: 'banking_funds',
    label: 'Άλλο τραπεζικό ταμείο / συνεταιρισμός',
  },

  {
    value: 'oaee',
    label: 'ΟΑΕΕ / ελεύθερος επαγγελματίας',
  },
  {
    value: 'etaa',
    label: 'Πρώην ΕΤΑΑ',
  },
  {
    value: 'tsmede',
    label: 'ΤΣΜΕΔΕ',
  },
  {
    value: 'tsay',
    label: 'ΤΣΑΥ — Ελεύθερος επαγγελματίας',
  },
  {
    value: 'tsay_salaried',
    label: 'ΤΣΑΥ — Μισθωτός',
  },
  {
    value: 'oga',
    label: 'Πρώην ΟΓΑ / αγρότης',
  },
];

const INSURANCE_TIME_METHOD_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  {
    value: 'insurance_days',
    label: 'Με αριθμό ενσήμων / ημερών ασφάλισης',
  },
  {
    value: 'years_months_days',
    label: 'Με έτη, μήνες και ημέρες',
  },
];

const NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  {
    value: 'annual_pensionable_earnings',
    label: 'Το ετήσιο εισόδημά μου',
  },
  {
    value: 'annual_pension_contribution',
    label: 'Οι ετήσιες εισφορές κύριας σύνταξής μου',
  },
];

const YES_NO_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'yes', label: 'Ναι' },
  { value: 'no', label: 'Όχι' },
];

const SPECIAL_REGIME_USAGE_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'yes', label: 'Ναι' },
  { value: 'no', label: 'Όχι' },
  { value: 'unknown', label: 'Δεν γνωρίζω' },
];

const COMBAT_FIVE_YEAR_STATUS_OPTIONS = [
  { value: 'none', label: 'Όχι' },
  { value: 'full', label: 'Ναι, ολόκληρη' },
  { value: 'partial', label: 'Ναι, μέρος της' },
];

const SPECIAL_SEMESTERS_STATUS_OPTIONS = [
  { value: 'none', label: 'Όχι' },
  { value: 'yes', label: 'Ναι' },
];

const FREE_RECOGNIZED_ARTICLE_41_SEMESTERS_TYPE =
  'recognized_article_41';

const UNIFORMED_INSURANCE_REGIME_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  {
    value: 'old_public',
    label: 'Κατάταξη έως 31/12/2010 — καθεστώς Δημοσίου',
  },
  {
    value: 'new_ika',
    label: 'Κατάταξη από 01/01/2011 — καθεστώς τ. ΙΚΑ-ΕΤΑΜ',
  },
];


const RECOGNITION_PERIOD_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'before_2002', label: 'Πριν το 2002' },
  { value: 'between_2002_2016', label: 'Από 2002 έως 2016' },
  { value: 'after_2016', label: 'Μετά το 2016' },
];

const UNIFORMED_CONTRIBUTION_PAYMENT_MODE_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  {
    value: 'withheld_during_service',
    label: 'Οι πρόσθετες εισφορές παρακρατούνταν κατά την υπηρεσία',
  },
  {
    value: 'later_recognition',
    label:
      'Έγινε αναγνώριση αργότερα, χωρίς παλιά δήλωση μη παρακράτησης',
  },
  {
    value: 'legacy_opt_out_later_recognition',
    label:
      'Παλιά περίπτωση: είχε δηλωθεί μη παρακράτηση και αργότερα ζητήθηκε αναγνώριση',
  },
  {
    value: 'legal_exemption',
    label: 'Δεν απαιτούνταν καταβολή εισφορών',
  },
];

const DEFAULT_EMPTY_OPTION = {
  value: '',
  label: 'Επιλέξτε πρώτα φορέα',
};

const SELECT_OPTION = {
  value: '',
  label: 'Επιλέξτε',
};

const OLD_NEW_INSURED_OPTIONS = [
  SELECT_OPTION,
  { value: 'old', label: 'Παλαιός' },
  { value: 'new', label: 'Νέος' },
];

const ARTICLE30_MAIN_CONTRIBUTION_FUNDS = [
  'ika_tsp_hsap',
  'ika_tsp_ete',
  'ika_tap_etba',
  'tapae_ethniki',
  'tseapgso',
  'ika_tap_ote_ote',
  'ika_tap_ote_ose_elta',
  'ika_tap_ote_staff',
  'aviation',
  'artistic',
  'ika_npdd_special',
  'etap_mme_tattath',
  'tanpy',
];

const CONTRIBUTION_BASED_FUNDS = [
  'oaee',
  'etaa',
  'tsmede',
  'tsay',
  'oga',
];

function isUniformedFund(fund) {
  return fund === 'uniformed';
}

function isContributionBasedFund(fund) {
  return CONTRIBUTION_BASED_FUNDS.includes(fund);
}

function isArticle30MainContributionFund(fund) {
  return ARTICLE30_MAIN_CONTRIBUTION_FUNDS.includes(fund);
}

function isSalariedTsayFund(fund) {
  return fund === 'tsay_salaried';
}

function isTsayFund(fund) {
  return fund === 'tsay' || fund === 'tsay_salaried';
}

function getInsuredTypeOptions(fund) {
  if (!fund) {
    return [DEFAULT_EMPTY_OPTION];
  }

  return OLD_NEW_INSURED_OPTIONS;
}

function getEmploymentCategoryOptions(fund, insuredType) {
  if (!fund) {
    return [DEFAULT_EMPTY_OPTION];
  }

  const options = getEmploymentCategoryOptionsForFund(fund, {
    insuredType,
  });

  return options.length > 0 ? [SELECT_OPTION, ...options] : [SELECT_OPTION];
}

function getConditionalPremiumPresence({
  insurancePeriodsInputMode,
  simpleEmploymentCategoryInput,
  insurancePeriodGroups,
}) {
  const categories = [];

  if (insurancePeriodsInputMode === 'simple') {
    categories.push(simpleEmploymentCategoryInput);
  }

  if (insurancePeriodsInputMode === 'multiple') {
    for (const group of insurancePeriodGroups) {
      categories.push(group?.employmentCategory);
    }
  }

  const presence = {
    vae: categories.includes('vae'),
    yvae: categories.includes('yvae'),
    ota_ika_vae: categories.includes('ota_ika_vae'),
    ota_public_vae: categories.includes('ota_public_vae'),
    ota_ika_yvae: categories.includes('ota_ika_yvae'),
  };

  return {
    ...presence,
    hasAny: Object.values(presence).some(Boolean),
  };
}

function normalizeSpecialRegimeUsageInput(value) {
  if (typeof value === 'string') {
    return {
      vae: value,
      yvae: value,
      ota_ika_vae: value,
      ota_public_vae: value,
      ota_ika_yvae: value,
    };
  }

  if (!value || typeof value !== 'object') {
    return {
      vae: '',
      yvae: '',
      ota_ika_vae: '',
      ota_public_vae: '',
      ota_ika_yvae: '',
    };
  }

  return {
    vae: value.vae || '',
    yvae: value.yvae || '',
    ota_ika_vae: value.ota_ika_vae || '',
    ota_public_vae: value.ota_public_vae || '',
    ota_ika_yvae: value.ota_ika_yvae || value.ota_cleaning || '',
  };
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
      serviceYears: '',
      contributionPaymentMode: '',
      applicationYear: '',
      recognitionPeriod: '',
      paidAmount: '',
      contributionRatePercent: '',
      explicitPensionableEarningsBase: '',
      earningsReferenceYear: '',
    },
    specialSemesters: {
      status: 'none',
      specialSemestersType: '',
      recognizedArticle41Time: false,
      semestersCount: '',
      milestoneCompletionYear: '',
      serviceYears: '',
      contributionPaymentMode: '',
      applicationYear: '',
      recognitionPeriod: '',
      paidAmount: '',
      contributionRatePercent: '',
      explicitPensionableEarningsBase: '',
      earningsReferenceYear: '',
    },
  };
}

function normalizeUniformedSpecialTimeDraft(
  value
) {
  const defaultValue =
    createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  const normalizedDraft = {
    insuranceRegime:
      value.insuranceRegime || '',
    article36ACategory: '',
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(value.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(value.specialSemesters || {}),
    },
  };

  if (
    normalizedDraft
      .combatFiveYearService.status ===
    'none'
  ) {
    normalizedDraft
      .combatFiveYearService
      .serviceYears = '';
    normalizedDraft
      .combatFiveYearService
      .contributionPaymentMode = '';
    normalizedDraft
      .combatFiveYearService
      .applicationYear = '';
  }

  if (
    normalizedDraft.specialSemesters
      .status === 'none'
  ) {
    normalizedDraft.specialSemesters
      .specialSemestersType = '';
    normalizedDraft.specialSemesters
      .recognizedArticle41Time = false;
    normalizedDraft.specialSemesters
      .serviceYears = '';
    normalizedDraft.specialSemesters
      .contributionPaymentMode = '';
    normalizedDraft.specialSemesters
      .applicationYear = '';
  } else {
    normalizedDraft.specialSemesters
      .specialSemestersType =
      FREE_RECOGNIZED_ARTICLE_41_SEMESTERS_TYPE;
    normalizedDraft.specialSemesters
      .recognizedArticle41Time = true;
    normalizedDraft.specialSemesters
      .milestoneCompletionYear = '';
  }

  if (
    normalizedDraft
      .combatFiveYearService
      .contributionPaymentMode !==
    'legacy_opt_out_later_recognition'
  ) {
    normalizedDraft
      .combatFiveYearService
      .applicationYear = '';
  }

  if (
    normalizedDraft.specialSemesters
      .contributionPaymentMode !==
    'legacy_opt_out_later_recognition'
  ) {
    normalizedDraft.specialSemesters
      .applicationYear = '';
  }

  return normalizedDraft;
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: '0.75rem',
};

const radioGroupFieldsetStyle = {
  margin: 0,
  marginBottom: '0.75rem',
  padding: 0,
  border: 0,
  minWidth: 0,
};

const radioGroupLegendStyle = {
  marginBottom: '0.5rem',
};

const radioOptionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.55rem',
};

const radioOptionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.55rem 0.75rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  background: '#ffffff',
  cursor: 'pointer',
};

const selectStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '260px',
};

const inputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '220px',
};

const specialRegimeBoxStyle = {
  marginTop: '1rem',
  padding: '1rem',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  background: '#fffbeb',
};

const confirmedValueFieldStyle = {
  marginBottom: '0.75rem',
  padding: '0.65rem 0.75rem',
  border: '1px solid #86efac',
  borderRadius: '6px',
  background: '#f0fdf4',
  color: '#065f46',
};

const confirmedValueLabelStyle = {
  display: 'block',
  marginBottom: '0.25rem',
  color: '#047857',
  fontSize: '0.82rem',
};

const confirmedValueStatusStyle = {
  display: 'block',
  marginTop: '0.3rem',
  color: '#15803d',
  fontSize: '0.8rem',
};

const confirmedValuePendingFieldStyle = {
  border: '1px solid #fcd34d',
  background: '#fffbeb',
  color: '#92400e',
};

const confirmedValuePendingStatusStyle = {
  color: '#b45309',
};

const periodBoxStyle = {
  marginTop: '1rem',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  padding: '0.75rem',
};

const periodHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '0.75rem',
};

const uniformedBoxStyle = {
  marginTop: '1rem',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  padding: '0.75rem',
  borderRadius: '6px',
};

const uniformedSubBoxStyle = {
  marginTop: '0.75rem',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '0.75rem',
};


const freeFlowStyle = {
  marginTop: '1rem',
};

const freeActiveCardStyle = {
  marginBottom: '1rem',
  padding: '1rem',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  background: '#f8fafc',
};

const freeFlowHeadingStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  marginBottom: '1rem',
};

const freeFlowStepStyle = {
  minWidth: '72px',
  padding: '0.35rem 0.55rem',
  borderRadius: '999px',
  background: '#1d4ed8',
  color: '#fff',
  fontWeight: 700,
  textAlign: 'center',
};

const freeFlowTitleStyle = {
  margin: 0,
  fontSize: '1.15rem',
};

const freeFlowDescriptionStyle = {
  margin: '0.3rem 0 0',
  color: '#475569',
};

const selectedFundBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem',
  padding: '0.75rem',
  border: '1px solid #86efac',
  borderRadius: '8px',
  background: '#ecfdf5',
  color: '#065f46',
};

const selectedFundCaptionStyle = {
  display: 'block',
  marginBottom: '0.2rem',
  color: '#047857',
  fontSize: '0.8rem',
};

const compactActionButtonStyle = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #93c5fd',
  borderRadius: '6px',
  background: '#fff',
  color: '#1d4ed8',
  cursor: 'pointer',
};

const freeEditorActionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '0.65rem',
  marginTop: '1rem',
};

const freeCompleteButtonStyle = {
  padding: '0.7rem 0.95rem',
  border: '1px solid #15803d',
  borderRadius: '8px',
  background: '#15803d',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const freeRemoveButtonStyle = {
  padding: '0.7rem 0.95rem',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  background: '#fff',
  color: '#b91c1c',
  cursor: 'pointer',
};

const freeCompletionErrorStyle = {
  marginTop: '0.75rem',
  padding: '0.75rem',
  border: '1px solid #fca5a5',
  borderRadius: '8px',
  background: '#fef2f2',
  color: '#991b1b',
};

const freeSummaryCardStyle = {
  marginBottom: '0.8rem',
  padding: '0.9rem',
  borderRadius: '10px',
};

const freeCompletedSummaryCardStyle = {
  border: '1px solid #86efac',
  background: '#f0fdf4',
};

const freePendingSummaryCardStyle = {
  border: '1px solid #fcd34d',
  background: '#fffbeb',
};

const freeSummaryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '0.75rem',
};

const freeSummaryStatusStyle = {
  display: 'block',
  marginTop: '0.25rem',
  color: '#475569',
  fontSize: '0.82rem',
};

const freeSummaryActionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '0.45rem',
};

const freeCompactRemoveButtonStyle = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  background: '#fff',
  color: '#b91c1c',
  cursor: 'pointer',
};

const freeSummaryDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  marginTop: '0.75rem',
  color: '#334155',
};

const freeAddPeriodButtonStyle = {
  marginTop: '0.25rem',
  padding: '0.7rem 0.9rem',
  border: '1px solid #2563eb',
  borderRadius: '8px',
  background: '#fff',
  color: '#1d4ed8',
  fontWeight: 700,
  cursor: 'pointer',
};

const freeAllCompleteStyle = {
  marginTop: '0.8rem',
  padding: '0.75rem',
  border: '1px solid #86efac',
  borderRadius: '8px',
  background: '#f0fdf4',
  color: '#166534',
  fontWeight: 600,
};

const freeDetailsHeadingStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  marginBottom: '1rem',
};

const freeDetailsStepStyle = {
  minWidth: '72px',
  padding: '0.35rem 0.55rem',
  borderRadius: '999px',
  background: '#0f766e',
  color: '#fff',
  fontWeight: 700,
  textAlign: 'center',
};

const freeDetailsTitleStyle = {
  margin: 0,
  fontSize: '1.25rem',
};

const freeDetailsDescriptionStyle = {
  margin: '0.35rem 0 0',
  color: '#475569',
};

const secondaryButtonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 0.75rem',
};

const removeButtonStyle = {
  padding: '0.35rem 0.6rem',
};

export default InsurancePeriodsInputSection;
