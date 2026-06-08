import React from 'react';

import { RadioOption } from '../components/FormControls';
import { fieldsetStyle } from '../utils/calculatorStyles';

function NationalPensionInputSection({
  pensionStartDateInput,
  pensionTypeInput,
  oldAgeCategoryInput,
  pensionModeInput,
  earlyReductionMonthsInput,
  disabilityCategoryInput,
  residenceYearsInput,
  onPensionStartDateChange,
  onPensionTypeChange,
  onOldAgeCategoryChange,
  onPensionModeChange,
  onEarlyReductionMonthsChange,
  onDisabilityCategoryChange,
  onResidenceYearsChange,
}) {
  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="pensionStartDate">
          Ημερομηνία έναρξης σύνταξης
        </label>

        <br />

        <input
          id="pensionStartDate"
          type="text"
          value={pensionStartDateInput}
          onChange={(event) => onPensionStartDateChange(event.target.value)}
          placeholder="π.χ. 1/1/26 ή 01/01/2026"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            width: '220px',
          }}
        />
      </div>

      <fieldset style={fieldsetStyle}>
        <legend>Είδος σύνταξης</legend>

        <RadioOption
          id="pensionTypeOldAge"
          name="pensionType"
          value="old_age"
          checked={pensionTypeInput === 'old_age'}
          onChange={onPensionTypeChange}
          label="Γήρατος"
        />

        <RadioOption
          id="pensionTypeDisability"
          name="pensionType"
          value="disability"
          checked={pensionTypeInput === 'disability'}
          onChange={onPensionTypeChange}
          label="Αναπηρίας"
        />
      </fieldset>

      {pensionTypeInput === 'old_age' && (
        <fieldset style={fieldsetStyle}>
          <legend>Κατηγορία σύνταξης γήρατος</legend>

          <RadioOption
            id="oldAgeCategoryStandard"
            name="oldAgeCategory"
            value="standard"
            checked={oldAgeCategoryInput === 'standard'}
            onChange={onOldAgeCategoryChange}
            label="Κανονική σύνταξη γήρατος"
          />

          <RadioOption
            id="oldAgeCategorySpecialDisease"
            name="oldAgeCategory"
            value="special_disease"
            checked={oldAgeCategoryInput === 'special_disease'}
            onChange={onOldAgeCategoryChange}
            label="Γήρατος λόγω ειδικών παθήσεων"
          />
        </fieldset>
      )}

      {pensionTypeInput === 'old_age' && oldAgeCategoryInput === 'standard' && (
        <fieldset style={fieldsetStyle}>
          <legend>Πλήρης ή μειωμένη σύνταξη γήρατος</legend>

          <RadioOption
            id="pensionModeFull"
            name="pensionMode"
            value="full"
            checked={pensionModeInput === 'full'}
            onChange={onPensionModeChange}
            label="Πλήρης"
          />

          <RadioOption
            id="pensionModeReduced"
            name="pensionMode"
            value="reduced"
            checked={pensionModeInput === 'reduced'}
            onChange={onPensionModeChange}
            label="Μειωμένη"
          />
        </fieldset>
      )}

      {pensionTypeInput === 'old_age' &&
        oldAgeCategoryInput === 'standard' &&
        pensionModeInput === 'reduced' && (
          <fieldset style={fieldsetStyle}>
            <legend>Μήνες πρόωρης μείωσης</legend>

            <label htmlFor="earlyReductionMonths">
              Μήνες πρόωρης μείωσης από το όριο πλήρους σύνταξης
            </label>

            <br />

            <input
              id="earlyReductionMonths"
              type="text"
              value={earlyReductionMonthsInput}
              onChange={(event) => onEarlyReductionMonthsChange(event.target.value)}
              placeholder="0 έως 60"
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                width: '120px',
              }}
            />
          </fieldset>
        )}

      {pensionTypeInput === 'disability' && (
        <fieldset style={fieldsetStyle}>
          <legend>Κατηγορία ποσοστού αναπηρίας</legend>

          <RadioOption
            id="disabilityEightyPlus"
            name="disabilityCategory"
            value="eighty_plus"
            checked={disabilityCategoryInput === 'eighty_plus'}
            onChange={onDisabilityCategoryChange}
            label="80% και άνω"
          />

          <RadioOption
            id="disabilitySixtySeven"
            name="disabilityCategory"
            value="sixty_seven_to_seventy_nine"
            checked={disabilityCategoryInput === 'sixty_seven_to_seventy_nine'}
            onChange={onDisabilityCategoryChange}
            label="67% έως 79,99%"
          />

          <RadioOption
            id="disabilityFifty"
            name="disabilityCategory"
            value="fifty_to_sixty_six"
            checked={disabilityCategoryInput === 'fifty_to_sixty_six'}
            onChange={onDisabilityCategoryChange}
            label="50% έως 66,99%"
          />
        </fieldset>
      )}

      {pensionTypeInput === 'old_age' && (
        <fieldset style={fieldsetStyle}>
          <legend>Έτη νόμιμης διαμονής</legend>

          <label htmlFor="residenceYears">
            Έτη νόμιμης διαμονής στην Ελλάδα
          </label>

          <br />

          <input
            id="residenceYears"
            type="text"
            value={residenceYearsInput}
            onChange={(event) => onResidenceYearsChange(event.target.value)}
            placeholder="π.χ. 40 ή 39,5"
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              width: '160px',
            }}
          />
        </fieldset>
      )}
    </>
  );
}

export default NationalPensionInputSection;
