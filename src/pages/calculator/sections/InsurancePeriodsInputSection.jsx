


import React from 'react';

import { fieldsetStyle } from '../utils/calculatorStyles';

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

    if (isUniformedFund(value)) {
      onSimpleInsuredTypeChange('');
      onSimpleEmploymentCategoryChange('common');
      onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
      return;
    }

    if (
      isArticle30MainContributionFund(value) ||
      isSalariedTsayFund(value)
    ) {
      onSimpleInsuredTypeChange('');
      onSimpleEmploymentCategoryChange('common');
      onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
      return;
    }

    onSimpleInsuredTypeChange('');
    onSimpleEmploymentCategoryChange('');
    onSimpleUniformedSpecialTimeDraftChange(createEmptyUniformedSpecialTimeDraft());
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend>Τρόπος κατανομής χρόνου ασφάλισης</legend>

      <p style={{ marginTop: 0, color: '#475569' }}>
        Επιλέγουμε αν όλος ο χρόνος ασφάλισης ανήκει σε μία κατηγορία ή αν θα
        χωριστεί σε περισσότερες κατηγορίες / περιόδους.
      </p>

      <label htmlFor="insurancePeriodsInputMode">
        Πώς θα δηλωθεί ο χρόνος ασφάλισης;
      </label>

      <br />

      <select
        id="insurancePeriodsInputMode"
        value={insurancePeriodsInputMode}
        onChange={(event) => handleModeChange(event.target.value)}
        style={selectStyle}
      >
        <option value="disabled">Όχι ακόμα</option>
        <option value="simple">Μία κατηγορία ασφάλισης</option>
        <option value="multiple">Περισσότερες κατηγορίες / περίοδοι</option>
      </select>

      {insurancePeriodsInputMode === 'simple' && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>
            Κατηγορία συνολικού χρόνου ασφάλισης
          </h3>

          <div style={gridStyle}>
            <SelectWithLabel
              id="simpleFund"
              label="Φορέας / κατηγορία ασφάλισης"
              value={simpleFundInput}
              onChange={handleSimpleFundChange}
              options={FUND_OPTIONS}
            />

            {!isSimpleContributionBasedFund && (
              <SelectWithLabel
                id="simpleInsuredType"
                label="Ασφαλισμένος"
                value={simpleInsuredTypeInput}
                onChange={handleSimpleInsuredTypeChange}
                options={simpleInsuredTypeOptions}
                disabled={!simpleFundInput}
              />
            )}

            {!isSimpleUniformedFund &&
              !isSimpleContributionBasedFund &&
              !isSimpleArticle30MainContributionFund && (
              <SelectWithLabel
                id="simpleEmploymentCategory"
                label="Κατηγορία εργασίας / εισφορών"
                value={simpleEmploymentCategoryInput}
                onChange={onSimpleEmploymentCategoryChange}
                options={simpleEmploymentCategoryOptions}
                disabled={!simpleFundInput}
              />
            )}

            {isSimpleContributionBasedFund && (
              <SelectWithLabel
                id="simpleNonSalariedEarningsInputMode"
                label="Πώς θα δηλωθούν οι εισφορές ή οι συντάξιμες αποδοχές αυτής της περιόδου;"
                value={simpleNonSalariedEarningsInputMode}
                onChange={onSimpleNonSalariedEarningsInputModeChange}
                options={NON_SALARIED_EARNINGS_INPUT_MODE_OPTIONS}
              />
            )}

            {isSimpleTsayFund && (
              <SelectWithLabel
                id="simpleTsaySinglePensionerStatus"
                label="Υπήρχε υπαγωγή στον Κλάδο Μονοσυνταξιούχων ΤΣΑΥ σε αυτή την περίοδο;"
                value={simpleTsaySinglePensionerStatus}
                onChange={onSimpleTsaySinglePensionerStatusChange}
                options={YES_NO_OPTIONS}
              />
            )}

            <TextInputWithLabel
              id="simpleFromDate"
              label="Ημερομηνία έναρξης περιόδου"
              value={simpleFromDateInput}
              onChange={onSimpleFromDateChange}
              placeholder="π.χ. 01/01/2002"
            />

            <TextInputWithLabel
              id="simpleToDate"
              label="Ημερομηνία λήξης περιόδου"
              value={simpleToDateInput}
              onChange={onSimpleToDateChange}
              placeholder="π.χ. 31/12/2025"
            />

            <SelectWithLabel
              id="simpleTimeInputMethod"
              label="Τρόπος εισαγωγής χρόνου"
              value={simpleTimeInputMethod}
              onChange={onSimpleTimeInputMethodChange}
              options={INSURANCE_TIME_METHOD_OPTIONS}
            />

            {simpleTimeInputMethod === 'insurance_days' && (
              <TextInputWithLabel
                id="simpleInsuranceDays"
                label="Ένσημα / ημέρες ασφάλισης"
                value={simpleInsuranceDaysInput}
                onChange={onSimpleInsuranceDaysChange}
                placeholder="π.χ. 8000"
              />
            )}

            {simpleTimeInputMethod === 'years_months_days' && (
              <>
                <TextInputWithLabel
                  id="simpleInsuranceYears"
                  label="Έτη"
                  value={simpleInsuranceYearsInput}
                  onChange={onSimpleInsuranceYearsChange}
                  placeholder="π.χ. 15"
                />

                <TextInputWithLabel
                  id="simpleInsuranceMonths"
                  label="Μήνες"
                  value={simpleInsuranceMonthsInput}
                  onChange={onSimpleInsuranceMonthsChange}
                  placeholder="0 έως 11"
                />

                <TextInputWithLabel
                  id="simpleInsuranceExtraDays"
                  label="Ημέρες"
                  value={simpleInsuranceExtraDaysInput}
                  onChange={onSimpleInsuranceExtraDaysChange}
                  placeholder="0 έως 24"
                />
              </>
            )}
          </div>

          {isSimpleUniformedFund && (
            <UniformedSpecialTimeFields
              idPrefix="simpleUniformed"
              value={simpleUniformedSpecialTimeDraft}
              onChange={onSimpleUniformedSpecialTimeDraftChange}
            />
          )}

          <p style={{ color: '#475569', marginBottom: 0 }}>
            Οι ημερομηνίες περιγράφουν πότε ίσχυε η κατηγορία. Ο πραγματικός
            ασφαλιστικός χρόνος προκύπτει από τα ένσημα / ημέρες ή από τα έτη,
            τους μήνες και τις ημέρες που δηλώνονται παραπάνω.
          </p>
        </div>
      )}

      {insurancePeriodsInputMode === 'multiple' && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: '#475569' }}>
            Στο πλήρες μοντέλο δηλώνουμε όσες ομάδες / περίοδοι χρειάζονται,
            μέχρι {maxInsurancePeriodGroups}. Οι ημέρες όλων των ομάδων
            αθροίζονται για τον συνολικό χρόνο ασφάλισης.
          </p>

          {safeInsurancePeriodGroups.map((group, index) => (
            <InsurancePeriodGroupFields
              key={group.id}
              groupNumber={index + 1}
              title={`Περίοδος / ομάδα ${index + 1}`}
              group={group}
              canRemove={safeInsurancePeriodGroups.length > 1}
              onGroupChange={(field, value) => {
                onInsurancePeriodGroupChange(group.id, field, value);
              }}
              onRemove={() => {
                onRemoveInsurancePeriodGroup(group.id);
              }}
            />
          ))}

          <button
            type="button"
            onClick={onAddInsurancePeriodGroup}
            disabled={safeInsurancePeriodGroups.length >= maxInsurancePeriodGroups}
            style={{
              ...secondaryButtonStyle,
              cursor:
                safeInsurancePeriodGroups.length >= maxInsurancePeriodGroups
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            + Προσθήκη περιόδου / ομάδας
          </button>

          {safeInsurancePeriodGroups.length >= maxInsurancePeriodGroups && (
            <p style={{ color: '#8a5a00', marginBottom: 0 }}>
              Έχει συμπληρωθεί το μέγιστο όριο των {maxInsurancePeriodGroups} ομάδων.
            </p>
          )}
        </div>
      )}

      {calculatorEdition !== 'free' &&
        conditionalPremiumPresence.hasAny && (
          <div style={specialRegimeBoxStyle}>
            <h3 style={{ marginTop: 0 }}>
              Ειδικές διατάξεις και επασφάλιστρο
            </h3>

            {conditionalPremiumPresence.vae && (
              <SelectWithLabel
                id="article30SpecialRegimeUsageVae"
                label="Η συνταξιοδότηση γίνεται με ειδικές διατάξεις ΒΑΕ;"
                value={normalizedSpecialRegimeUsageInput.vae}
                onChange={(value) =>
                  onArticle30SpecialRegimeUsageChange('vae', value)
                }
                options={SPECIAL_REGIME_USAGE_OPTIONS}
              />
            )}

            {conditionalPremiumPresence.yvae && (
              <SelectWithLabel
                id="article30SpecialRegimeUsageYvae"
                label="Η συνταξιοδότηση γίνεται με ειδικές διατάξεις ΥΒΑΕ;"
                value={normalizedSpecialRegimeUsageInput.yvae}
                onChange={(value) =>
                  onArticle30SpecialRegimeUsageChange('yvae', value)
                }
                options={SPECIAL_REGIME_USAGE_OPTIONS}
              />
            )}

            {conditionalPremiumPresence.ota_ika_vae && (
              <SelectWithLabel
                id="article30SpecialRegimeUsageOtaIkaVae"
                label="Η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ΒΑΕ ΟΤΑ του πρώην ΙΚΑ;"
                value={normalizedSpecialRegimeUsageInput.ota_ika_vae}
                onChange={(value) =>
                  onArticle30SpecialRegimeUsageChange(
                    'ota_ika_vae',
                    value
                  )
                }
                options={SPECIAL_REGIME_USAGE_OPTIONS}
              />
            )}

            {conditionalPremiumPresence.ota_public_vae && (
              <SelectWithLabel
                id="article30SpecialRegimeUsageOtaPublicVae"
                label="Η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ΒΑΕ ΟΤΑ του καθεστώτος Δημοσίου;"
                value={normalizedSpecialRegimeUsageInput.ota_public_vae}
                onChange={(value) =>
                  onArticle30SpecialRegimeUsageChange(
                    'ota_public_vae',
                    value
                  )
                }
                options={SPECIAL_REGIME_USAGE_OPTIONS}
              />
            )}

            {conditionalPremiumPresence.ota_ika_yvae && (
              <SelectWithLabel
                id="article30SpecialRegimeUsageOtaIkaYvae"
                label="Η συνταξιοδότηση γίνεται με τις ειδικές διατάξεις ΥΒΑΕ καθαριότητας / αποκομιδής ΟΤΑ;"
                value={normalizedSpecialRegimeUsageInput.ota_ika_yvae}
                onChange={(value) =>
                  onArticle30SpecialRegimeUsageChange(
                    'ota_ika_yvae',
                    value
                  )
                }
                options={SPECIAL_REGIME_USAGE_OPTIONS}
              />
            )}

            <p style={{ color: '#475569', marginBottom: 0 }}>
              Για κάθε ειδική κατηγορία δηλώνεται ξεχωριστά αν
              χρησιμοποιείται η αντίστοιχη ειδική διάταξη εξόδου. Με «Ναι»
              δεν υπολογίζεται ξανά η ίδια πρόσθετη εισφορά. Με «Δεν
              γνωρίζω» το συγκεκριμένο επασφάλιστρο δεν προστίθεται και
              εμφανίζεται προειδοποίηση.
            </p>
          </div>
        )}

    </fieldset>
  );
}

function InsurancePeriodGroupFields({
  groupNumber,
  title,
  group,
  canRemove,
  onGroupChange,
  onRemove,
}) {
  const insuredTypeOptions = getInsuredTypeOptions(group.fund);
  const employmentCategoryOptions = getEmploymentCategoryOptions(
    group.fund,
    group.insuredType
  );
  const isCurrentUniformedFund = isUniformedFund(group.fund);
  const isCurrentContributionBasedFund = isContributionBasedFund(group.fund);
  const isCurrentTsayFund = isTsayFund(group.fund);
  const isCurrentArticle30MainContributionFund =
    isArticle30MainContributionFund(group.fund);

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

    if (isUniformedFund(value)) {
      onGroupChange('insuredType', '');
      onGroupChange('employmentCategory', 'common');
      onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
      return;
    }

    if (
      isArticle30MainContributionFund(value) ||
      isSalariedTsayFund(value)
    ) {
      onGroupChange('insuredType', '');
      onGroupChange('employmentCategory', 'common');
      onGroupChange('uniformedSpecialTimeDraft', createEmptyUniformedSpecialTimeDraft());
      return;
    }

    onGroupChange('insuredType', '');
    onGroupChange('employmentCategory', '');
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
        <SelectWithLabel
          id={`multiPeriod${groupNumber}Fund`}
          label="Φορέας / κατηγορία ασφάλισης"
          value={group.fund}
          onChange={handleFundChange}
          options={FUND_OPTIONS}
        />

        {!isCurrentContributionBasedFund && (
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

        {!isCurrentUniformedFund &&
          !isCurrentContributionBasedFund &&
          !isCurrentArticle30MainContributionFund && (
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
            label="Πώς θα δηλωθούν οι εισφορές ή οι συντάξιμες αποδοχές αυτής της περιόδου;"
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
  onChange,
}) {
  const safeValue = normalizeUniformedSpecialTimeDraft(value);

  function updateUniformedField(field, fieldValue) {
    onChange({
      ...safeValue,
      [field]: fieldValue,
    });
  }

  function updateCombatFiveYearService(field, fieldValue) {
    const nextCombatFiveYearService = {
      ...safeValue.combatFiveYearService,
      [field]: fieldValue,
    };

    if (field === 'recognitionPeriod' && fieldValue === 'before_2002') {
      nextCombatFiveYearService.paidAmount = '0';
      nextCombatFiveYearService.contributionRatePercent = '';
      nextCombatFiveYearService.explicitPensionableEarningsBase = '';
      nextCombatFiveYearService.earningsReferenceYear = '';
    }

    onChange({
      ...safeValue,
      combatFiveYearService: nextCombatFiveYearService,
    });
  }

  function updateSpecialSemesters(field, fieldValue) {
    const nextSpecialSemesters = {
      ...safeValue.specialSemesters,
      [field]: fieldValue,
    };

    if (field === 'status' && fieldValue === 'none') {
      nextSpecialSemesters.specialSemestersType = '';
      nextSpecialSemesters.semestersCount = '';
      nextSpecialSemesters.milestoneCompletionYear = '';
      nextSpecialSemesters.recognitionPeriod = '';
      nextSpecialSemesters.paidAmount = '';
    }

    if (field === 'recognitionPeriod' && fieldValue === 'before_2002') {
      nextSpecialSemesters.paidAmount = '0';
      nextSpecialSemesters.contributionRatePercent = '';
      nextSpecialSemesters.explicitPensionableEarningsBase = '';
      nextSpecialSemesters.earningsReferenceYear = '';
    }

    onChange({
      ...safeValue,
      specialSemesters: nextSpecialSemesters,
    });
  }

  const insuranceRegime = safeValue.insuranceRegime;
  const article36ACategory = safeValue.article36ACategory;
  const combatStatus = safeValue.combatFiveYearService.status;
  const semestersStatus = safeValue.specialSemesters.status;
  const hasCombatFiveYearService = combatStatus !== 'none';
  const hasSpecialSemesters = semestersStatus === 'yes';
  const shouldAskCombatPaidAmount =
    hasCombatFiveYearService &&
    safeValue.combatFiveYearService.recognitionPeriod &&
    safeValue.combatFiveYearService.recognitionPeriod !== 'before_2002';
  const shouldAskSemestersPaidAmount =
    hasSpecialSemesters &&
    safeValue.specialSemesters.recognitionPeriod &&
    safeValue.specialSemesters.recognitionPeriod !== 'before_2002';
  const validationError = getUniformedSpecialTimeValidationError(safeValue);

  return (
    <div style={uniformedBoxStyle}>
      <h4 style={{ marginTop: 0 }}>
        Ειδικοί χρόνοι ενστόλων
      </h4>

      <div style={gridStyle}>
        <SelectWithLabel
          id={`${idPrefix}InsuranceRegime`}
          label="Καθεστώς κατάταξης"
          value={insuranceRegime}
          onChange={(fieldValue) => updateUniformedField('insuranceRegime', fieldValue)}
          options={UNIFORMED_INSURANCE_REGIME_OPTIONS}
          required
        />

        <SelectWithLabel
          id={`${idPrefix}Article36ACategory`}
          label="Κατηγορία άρθρου 36Α (+1,5% μετά το 45ο έτος)"
          value={article36ACategory}
          onChange={(fieldValue) => updateUniformedField('article36ACategory', fieldValue)}
          options={ARTICLE_36A_CATEGORY_OPTIONS}
        />
      </div>

      {validationError && (
        <p style={{ color: 'crimson', marginTop: 0 }}>
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
            onChange={(fieldValue) => updateCombatFiveYearService('status', fieldValue)}
            options={COMBAT_FIVE_YEAR_STATUS_OPTIONS}
          />

          {combatStatus === 'partial' && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceYears`}
                label="Έτη"
                value={safeValue.combatFiveYearService.years}
                onChange={(fieldValue) => updateCombatFiveYearService('years', fieldValue)}
                placeholder="0 έως 5"
                required
              />

              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceMonths`}
                label="Μήνες"
                value={safeValue.combatFiveYearService.months}
                onChange={(fieldValue) => updateCombatFiveYearService('months', fieldValue)}
                placeholder="0 έως 11"
              />

              <TextInputWithLabel
                id={`${idPrefix}CombatFiveYearServiceDays`}
                label="Ημέρες"
                value={safeValue.combatFiveYearService.days}
                onChange={(fieldValue) => updateCombatFiveYearService('days', fieldValue)}
                placeholder="0 έως 24"
              />
            </>
          )}

          {hasCombatFiveYearService && (
            <>
              <SelectWithLabel
                id={`${idPrefix}CombatFiveYearServiceRecognitionPeriod`}
                label="Πότε αναγνωρίστηκε / εξαγοράστηκε;"
                value={safeValue.combatFiveYearService.recognitionPeriod}
                onChange={(fieldValue) => updateCombatFiveYearService('recognitionPeriod', fieldValue)}
                options={RECOGNITION_PERIOD_OPTIONS}
                required
              />

              {shouldAskCombatPaidAmount && (
                <TextInputWithLabel
                  id={`${idPrefix}CombatFiveYearServicePaidAmount`}
                  label="Ποσό που πληρώθηκε"
                  value={safeValue.combatFiveYearService.paidAmount}
                  onChange={(fieldValue) => updateCombatFiveYearService('paidAmount', fieldValue)}
                  placeholder="π.χ. 3000"
                  required
                />
              )}

              {shouldAskCombatPaidAmount && (
                <>
                  <TextInputWithLabel
                    id={`${idPrefix}CombatFiveYearServiceContributionRatePercent`}
                    label="Πραγματικό ποσοστό εισφοράς της πράξης (%)"
                    value={safeValue.combatFiveYearService.contributionRatePercent}
                    onChange={(fieldValue) => updateCombatFiveYearService('contributionRatePercent', fieldValue)}
                    placeholder="π.χ. 6,67 ή 20"
                  />
                  <TextInputWithLabel
                    id={`${idPrefix}CombatFiveYearServiceExplicitPensionableEarningsBase`}
                    label="Ασφαλιστέα / συντάξιμη βάση πράξης (αν αναγράφεται)"
                    value={safeValue.combatFiveYearService.explicitPensionableEarningsBase}
                    onChange={(fieldValue) => updateCombatFiveYearService('explicitPensionableEarningsBase', fieldValue)}
                    placeholder="π.χ. 20000"
                  />
                  <TextInputWithLabel
                    id={`${idPrefix}CombatFiveYearServiceEarningsReferenceYear`}
                    label="Έτος αναφοράς της βάσης / αίτησης"
                    value={safeValue.combatFiveYearService.earningsReferenceYear}
                    onChange={(fieldValue) => updateCombatFiveYearService('earningsReferenceYear', fieldValue)}
                    placeholder="π.χ. 2015"
                    required
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div style={uniformedSubBoxStyle}>
        <h5 style={{ marginTop: 0 }}>
          Εξάμηνα
        </h5>

        <div style={gridStyle}>
          <SelectWithLabel
            id={`${idPrefix}SpecialSemestersStatus`}
            label="Υπάρχουν εξάμηνα;"
            value={semestersStatus}
            onChange={(fieldValue) => updateSpecialSemesters('status', fieldValue)}
            options={SPECIAL_SEMESTERS_STATUS_OPTIONS}
          />

          {hasSpecialSemesters && (
            <>
              <TextInputWithLabel
                id={`${idPrefix}SpecialSemestersCount`}
                label="Πλήθος εξαμήνων"
                value={safeValue.specialSemesters.semestersCount}
                onChange={(fieldValue) => updateSpecialSemesters('semestersCount', fieldValue)}
                placeholder={insuranceRegime === 'new_ika' ? 'π.χ. 4, έως 14' : 'π.χ. 20'}
                required
              />

              <SelectWithLabel
                id={`${idPrefix}SpecialSemestersType`}
                label="Τύπος εξαμήνων"
                value={safeValue.specialSemesters.specialSemestersType}
                onChange={(fieldValue) => updateSpecialSemesters('specialSemestersType', fieldValue)}
                options={SPECIAL_SEMESTERS_TYPE_OPTIONS}
                required
              />

              <TextInputWithLabel
                id={`${idPrefix}SpecialSemestersMilestoneCompletionYear`}
                label={
                  safeValue.specialSemesters.specialSemestersType === 'flight'
                    ? 'Έτος συμπλήρωσης 18 ετών πραγματικής υπηρεσίας (αν είναι γνωστό)'
                    : 'Έτος συμπλήρωσης 20 ετών πραγματικής υπηρεσίας (αν είναι γνωστό)'
                }
                value={safeValue.specialSemesters.milestoneCompletionYear}
                onChange={(fieldValue) => updateSpecialSemesters('milestoneCompletionYear', fieldValue)}
                placeholder="π.χ. 2014"
              />

              <SelectWithLabel
                id={`${idPrefix}SpecialSemestersRecognitionPeriod`}
                label="Πότε αναγνωρίστηκαν / εξαγοράστηκαν;"
                value={safeValue.specialSemesters.recognitionPeriod}
                onChange={(fieldValue) => updateSpecialSemesters('recognitionPeriod', fieldValue)}
                options={RECOGNITION_PERIOD_OPTIONS}
                required
              />

              {shouldAskSemestersPaidAmount && (
                <TextInputWithLabel
                  id={`${idPrefix}SpecialSemestersPaidAmount`}
                  label="Ποσό που πληρώθηκε"
                  value={safeValue.specialSemesters.paidAmount}
                  onChange={(fieldValue) => updateSpecialSemesters('paidAmount', fieldValue)}
                  placeholder="π.χ. 1200"
                  required
                />
              )}

              {shouldAskSemestersPaidAmount && (
                <>
                  <TextInputWithLabel
                    id={`${idPrefix}SpecialSemestersContributionRatePercent`}
                    label="Πραγματικό ποσοστό εισφοράς της πράξης (%)"
                    value={safeValue.specialSemesters.contributionRatePercent}
                    onChange={(fieldValue) => updateSpecialSemesters('contributionRatePercent', fieldValue)}
                    placeholder="π.χ. 6,67 ή 20"
                  />
                  <TextInputWithLabel
                    id={`${idPrefix}SpecialSemestersExplicitPensionableEarningsBase`}
                    label="Ασφαλιστέα / συντάξιμη βάση πράξης (αν αναγράφεται)"
                    value={safeValue.specialSemesters.explicitPensionableEarningsBase}
                    onChange={(fieldValue) => updateSpecialSemesters('explicitPensionableEarningsBase', fieldValue)}
                    placeholder="π.χ. 20000"
                  />
                  <TextInputWithLabel
                    id={`${idPrefix}SpecialSemestersEarningsReferenceYear`}
                    label="Έτος αναφοράς της βάσης / αίτησης"
                    value={safeValue.specialSemesters.earningsReferenceYear}
                    onChange={(fieldValue) => updateSpecialSemesters('earningsReferenceYear', fieldValue)}
                    placeholder="π.χ. 2018"
                    required
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function getUniformedSpecialTimeValidationError(value) {
  const normalizedValue = normalizeUniformedSpecialTimeDraft(value);
  const insuranceRegime = normalizedValue.insuranceRegime;

  if (!['old_public', 'new_ika'].includes(insuranceRegime)) {
    return 'Επιλέξτε καθεστώς κατάταξης ενστόλου.';
  }

  const combatFiveYearService = normalizedValue.combatFiveYearService;
  const specialSemesters = normalizedValue.specialSemesters;

  const combatDaysResult = getCombatFiveYearServiceDays(combatFiveYearService);

  if (combatDaysResult.error) {
    return combatDaysResult.error;
  }

  const combatEarningsError = getUniformedRecognitionEarningsValidationError(
    combatFiveYearService,
    'τη μάχιμη πενταετία'
  );
  if (combatEarningsError) return combatEarningsError;

  const semestersDaysResult = getSpecialSemestersDays(
    specialSemesters,
    insuranceRegime
  );

  if (semestersDaysResult.error) {
    return semestersDaysResult.error;
  }

  const semestersEarningsError = getUniformedRecognitionEarningsValidationError(
    specialSemesters,
    'τα εξάμηνα'
  );
  if (semestersEarningsError) return semestersEarningsError;

  if (insuranceRegime === 'new_ika') {
    const maxCombinedDays = 7 * 300;
    const totalSpecialDays = combatDaysResult.days + semestersDaysResult.days;

    if (totalSpecialDays > maxCombinedDays) {
      return 'Για κατάταξη από 01/01/2011, η μάχιμη πενταετία μαζί με τα εξάμηνα δεν μπορεί να ξεπερνά συνολικά τα 7 έτη.';
    }
  }

  return null;
}

function getUniformedRecognitionEarningsValidationError(value = {}, label) {
  const status = String(value.status || 'none').trim();
  const recognitionPeriod = String(value.recognitionPeriod || '').trim();

  if (status === 'none' || !recognitionPeriod || recognitionPeriod === 'before_2002') {
    return null;
  }

  const paidAmount = parsePositiveDecimal(value.paidAmount);
  if (!paidAmount.isValid) {
    return `Για ${label} μετά το 2002, το ποσό που πληρώθηκε πρέπει να είναι μεγαλύτερο από 0.`;
  }

  const baseText = String(value.explicitPensionableEarningsBase || '').trim();
  const rateText = String(value.contributionRatePercent || '').trim();
  if (!baseText && !rateText) {
    return `Για ${label} μετά το 2002, δηλώστε είτε την ασφαλιστέα βάση της πράξης είτε το πραγματικό ποσοστό εισφοράς.`;
  }

  if (baseText && !parsePositiveDecimal(baseText).isValid) {
    return `Η ασφαλιστέα βάση για ${label} πρέπει να είναι μεγαλύτερη από 0.`;
  }

  if (rateText) {
    const rate = parsePositiveDecimal(rateText);
    if (!rate.isValid || rate.value > 100) {
      return `Το ποσοστό εισφοράς για ${label} πρέπει να είναι μεγαλύτερο από 0 και έως 100.`;
    }
  }

  const yearText = String(value.earningsReferenceYear || '').trim();
  if (!/^\d{4}$/.test(yearText) || Number(yearText) < 2002) {
    return `Το έτος αναφοράς για ${label} πρέπει να είναι έγκυρο έτος από το 2002 και μετά.`;
  }

  return null;
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

  const semestersType = String(
    specialSemesters.specialSemestersType || ''
  ).trim();

  if (!isValidSpecialSemestersType(semestersType)) {
    return {
      days: 0,
      error: 'Επιλέξτε τύπο εξαμήνων.',
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

  if (insuranceRegime === 'new_ika' && semestersCount.value > 14) {
    return {
      days: 0,
      error: 'Για κατάταξη από 01/01/2011, τα εξάμηνα δεν μπορούν να είναι περισσότερα από 14.',
    };
  }

  const milestoneCompletionYear = String(
    specialSemesters.milestoneCompletionYear || ''
  ).trim();

  if (milestoneCompletionYear && !/^\d{4}$/.test(milestoneCompletionYear)) {
    return {
      days: 0,
      error: 'Το έτος συμπλήρωσης πραγματικής υπηρεσίας πρέπει να έχει 4 ψηφία.',
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
    label: 'Ένστολοι / στρατιωτικοί',
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
    label: 'Γνωρίζω το ετήσιο ασφαλιστέο / συντάξιμο εισόδημα',
  },
  {
    value: 'annual_pension_contribution',
    label: 'Γνωρίζω την ετήσια εισφορά κύριας σύνταξης',
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

const SPECIAL_SEMESTERS_TYPE_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'flight', label: 'Πτητικά εξάμηνα' },
  { value: 'diving', label: 'Καταδυτικά εξάμηνα' },
  {
    value: 'paratrooper_or_special_forces',
    label: 'Αλεξιπτωτιστών / ειδικών δυνάμεων',
  },
  { value: 'mine_clearance', label: 'Εκκαθαριστών ναρκοπεδίων' },
  { value: 'other_special_category', label: 'Άλλη ειδική κατηγορία' },
];

const SPECIAL_SEMESTERS_TYPE_VALUES = SPECIAL_SEMESTERS_TYPE_OPTIONS
  .map((option) => option.value)
  .filter(Boolean);

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

const ARTICLE_36A_CATEGORY_OPTIONS = [
  { value: '', label: 'Δεν υπάγεται / δεν δηλώθηκε' },
  { value: 'flight', label: 'Ιπτάμενος σε κατάσταση πτητικής ενέργειας' },
  {
    value: 'submarine_or_diving',
    label: 'Πλήρωμα υποβρυχίου / καταδυτική ενέργεια',
  },
  { value: 'paratrooper', label: 'Αλεξιπτωτιστής' },
  {
    value: 'underwater_demolition_or_special_ops',
    label: 'Υποβρύχιος καταστροφέας / ειδικές αποστολές',
  },
  {
    value: 'mine_clearance_or_eod',
    label: 'Ναρκαλιευτής / πυροτεχνουργός',
  },
  {
    value: 'other_confirmed',
    label: 'Άλλη κατηγορία με επιβεβαιωμένη διάταξη',
  },
];

const RECOGNITION_PERIOD_OPTIONS = [
  { value: '', label: 'Επιλέξτε' },
  { value: 'before_2002', label: 'Πριν το 2002' },
  { value: 'between_2002_2016', label: 'Από 2002 έως 2016' },
  { value: 'after_2016', label: 'Μετά το 2016' },
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

const SIMPLE_VAE_YVAE_OPTIONS = [
  SELECT_OPTION,
  { value: 'common', label: 'Απλή / κοινή ασφάλιση' },
  { value: 'vae', label: 'ΒΑΕ' },
  {
    value: 'yvae',
    label: 'ΥΒΑΕ / υπόγειες στοές / υποθαλάσσιες εργασίες',
  },
];

const OTA_EMPLOYMENT_OPTIONS = [
  SELECT_OPTION,
  { value: 'common', label: 'Απλά' },
  { value: 'ota_ika_vae', label: 'ΒΑΕ με καθεστώς ΟΤΑ' },
  { value: 'ota_public_vae', label: 'ΒΑΕ με καθεστώς Δημοσίου' },
  { value: 'ota_ika_yvae', label: 'ΥΒΑΕ μόνο για παλαιούς' },
];

const COMMON_ONLY_EMPLOYMENT_OPTIONS = [
  SELECT_OPTION,
  { value: 'common', label: 'Απλή / διοικητική ασφάλιση' },
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

  if (fund === 'ika' || fund === 'tap_dei') {
    return SIMPLE_VAE_YVAE_OPTIONS;
  }

  if (fund === 'ota') {
    if (insuredType === 'new') {
      return OTA_EMPLOYMENT_OPTIONS.filter((option) => {
        return option.value !== 'ota_ika_yvae';
      });
    }

    return OTA_EMPLOYMENT_OPTIONS;
  }

  if (
    fund === 'public_sector' ||
    fund === 'deko' ||
    fund === 'nat' ||
    fund === 'banking_funds' ||
    isArticle30MainContributionFund(fund) ||
    isSalariedTsayFund(fund)
  ) {
    return COMMON_ONLY_EMPLOYMENT_OPTIONS;
  }

  return [SELECT_OPTION];
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

function normalizeUniformedSpecialTimeDraft(value) {
  const defaultValue = createEmptyUniformedSpecialTimeDraft();

  if (!value || typeof value !== 'object') {
    return defaultValue;
  }

  const normalizedDraft = {
    insuranceRegime: value.insuranceRegime || '',
    article36ACategory: value.article36ACategory || '',
    combatFiveYearService: {
      ...defaultValue.combatFiveYearService,
      ...(value.combatFiveYearService || {}),
    },
    specialSemesters: {
      ...defaultValue.specialSemesters,
      ...(value.specialSemesters || {}),
    },
  };

  if (normalizedDraft.combatFiveYearService.recognitionPeriod === 'before_2002') {
    normalizedDraft.combatFiveYearService.paidAmount = '0';
  }

  if (normalizedDraft.specialSemesters.status === 'none') {
    normalizedDraft.specialSemesters.specialSemestersType = '';
  }

  if (normalizedDraft.specialSemesters.recognitionPeriod === 'before_2002') {
    normalizedDraft.specialSemesters.paidAmount = '0';
  }

  return normalizedDraft;
}

function isValidSpecialSemestersType(value) {
  return SPECIAL_SEMESTERS_TYPE_VALUES.includes(value);
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: '0.75rem',
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

const secondaryButtonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 0.75rem',
};

const removeButtonStyle = {
  padding: '0.35rem 0.6rem',
};

export default InsurancePeriodsInputSection;
