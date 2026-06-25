

import React from "react";

import {
  preStyle,
  preparedInputSectionStyle,
  sectionStyle,
} from "../utils/calculatorStyles";

function PreparedInputPreview({ analysis }) {
  return (
    <>
      <section style={sectionStyle}>
        <h2>Τι κατάλαβε η εφαρμογή</h2>

        <p>
          <strong>Ημερομηνία γέννησης:</strong>{" "}
          {analysis.displayBirthDate}
        </p>

        <p>
          <strong>Ηλικία κατά την έναρξη της σύνταξης:</strong>{" "}
          {analysis.ageAtPensionStart} έτη
        </p>

        <p>
          <strong>Ημερομηνία που δόθηκε:</strong> {analysis.displayDate}
        </p>

        <p>
          <strong>Έτος σύνταξης:</strong> {analysis.pensionYear}
        </p>

        <p>
          <strong>Είδος σύνταξης:</strong> {analysis.pensionTypeLabel}
        </p>

        {analysis.oldAgeCategoryLabel && (
          <p>
            <strong>Κατηγορία γήρατος:</strong> {analysis.oldAgeCategoryLabel}
          </p>
        )}

        {analysis.pensionModeLabel && (
          <p>
            <strong>Πλήρης ή μειωμένη:</strong> {analysis.pensionModeLabel}
          </p>
        )}

        {analysis.earlyReductionMonths !== null && (
          <p>
            <strong>Μήνες πρόωρης μείωσης:</strong>{" "}
            {analysis.earlyReductionMonths}
          </p>
        )}

        {analysis.disabilityCategoryLabel && (
          <p>
            <strong>Κατηγορία αναπηρίας:</strong>{" "}
            {analysis.disabilityCategoryLabel}
          </p>
        )}

        {analysis.disabilityPercentage !== null && (
          <p>
            <strong>Ποσοστό αναπηρίας που θα σταλεί:</strong>{" "}
            {analysis.disabilityPercentage}%
          </p>
        )}

        <p>
          <strong>Τρόπος εισαγωγής χρόνου ασφάλισης:</strong>{" "}
          {analysis.insuranceTimeInputMethodLabel}
        </p>

        {analysis.hasParallelInsuranceTimeAdjustment ? (
          <div style={previewBoxStyle}>
            <h3 style={{ marginTop: 0 }}>
              Συνολικός χρόνος μετά την παράλληλη ασφάλιση
            </h3>

            <p>
              <strong>
                Αρχικός αθροισμένος χρόνος πριν αφαιρεθεί ο διπλός χρόνος:
              </strong>{" "}
              {analysis.initialSummedInsuranceTimeDisplay}
            </p>

            <p>
              <strong>Αρχικό άθροισμα ημερών:</strong>{" "}
              {analysis.initialSummedInsuranceDays} ημέρες ({" "}
              {analysis.initialSummedInsuranceDecimalYears} έτη)
            </p>

            <p>
              <strong>Ημέρες παράλληλης ασφάλισης που αφαιρούνται:</strong>{" "}
              {analysis.duplicateParallelInsuranceDays}
            </p>

            <p>
              <strong>
                Καθαρός χρόνος μετά την αφαίρεση του διπλού χρόνου:
              </strong>{" "}
              {analysis.cleanedInsuranceTimeDisplay}
            </p>

            <p>
              <strong>Καθαρό σύνολο ημερών:</strong>{" "}
              {analysis.cleanedInsuranceDays} ημέρες ({" "}
              {analysis.cleanedInsuranceDecimalYears} έτη)
            </p>

            <p style={{ color: "#475569", marginBottom: 0 }}>
              Ο calculator λαμβάνει χωριστά το αρχικό άθροισμα και τις ημέρες
              που αφαιρούνται και χρησιμοποιεί τελικά τον καθαρό χρόνο.
            </p>
          </div>
        ) : (
          <>
            <p>
              <strong>
                Χρόνος ασφάλισης που χρησιμοποιείται στον υπολογισμό:
              </strong>{" "}
              {analysis.insuranceTimeDisplay}
            </p>

            <p>
              <strong>Σύνολο ημερών ασφάλισης:</strong>{" "}
              {analysis.totalInsuranceDaysEquivalent}
            </p>

            <p>
              <strong>Σύνολο σε δεκαδικά έτη:</strong>{" "}
              {analysis.totalInsuranceDecimalYears}
            </p>
          </>
        )}

        {analysis.residenceYears !== null && (
          <p>
            <strong>Έτη νόμιμης διαμονής:</strong> {analysis.residenceYears}
          </p>
        )}

        {analysis.insurancePeriodsDraft?.length > 0 && (
          <div style={previewBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Κατανομή χρόνου ασφάλισης</h3>

            {analysis.insurancePeriodsDraft.map((period, index) => (
              <div
                key={`${period.fund}-${period.insuredType}-${period.employmentCategory}-${index}`}
              >
                {period.fromDateDisplay && period.toDateDisplay ? (
                  <p>
                    <strong>Περίοδος:</strong> {period.fromDateDisplay} έως{" "}
                    {period.toDateDisplay}
                  </p>
                ) : (
                  <p>
                    <strong>Χρόνος που αποδίδεται:</strong>{" "}
                    {period.insuranceDaysSource === "total_insurance_time"
                      ? "Όλος ο δηλωμένος συνολικός χρόνος ασφάλισης"
                      : `Περίοδος / ομάδα ${index + 1}`}
                  </p>
                )}

                <p>
                  <strong>Φορέας / κατηγορία ασφάλισης:</strong>{" "}
                  {period.fundLabel}
                </p>

                <p>
                  <strong>Ασφαλισμένος:</strong> {period.insuredTypeLabel}
                </p>

                <p>
                  <strong>Κατηγορία εργασίας / εισφορών:</strong>{" "}
                  {period.employmentCategoryLabel}
                </p>

                {period.nonSalariedEarningsInputModeLabel && (
                  <p>
                    <strong>
                      Τρόπος εισαγωγής εισφορών / συντάξιμων αποδοχών:
                    </strong>{" "}
                    {period.nonSalariedEarningsInputModeLabel}
                  </p>
                )}

                {period.tsaySinglePensionerStatusLabel && (
                  <p>
                    <strong>Κλάδος Μονοσυνταξιούχων ΤΣΑΥ:</strong>{" "}
                    {period.tsaySinglePensionerStatusLabel}
                  </p>
                )}

                <p>
                  <strong>Ημέρες / ένσημα που αποδίδονται:</strong>{" "}
                  {period.insuranceDays}
                </p>

                {period.insuranceDaysSourceLabel && (
                  <p>
                    <strong>Πηγή ημερών:</strong>{" "}
                    {period.insuranceDaysSourceLabel}
                  </p>
                )}

                <p>
                  <strong>Εσωτερικά values:</strong> fund={period.fund},
                  insuredType={period.insuredType}, employmentCategory=
                  {period.employmentCategory}
                  {period.formerAuxiliaryFund
                    ? `, formerAuxiliaryFund=${period.formerAuxiliaryFund}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {Array.isArray(analysis.auxiliaryContributionDisplay) &&
          analysis.auxiliaryContributionDisplay.length > 0 && (
            <div style={previewBoxStyle}>
              <h3 style={{ marginTop: 0 }}>Αντιστοίχιση επικουρικής σύνταξης</h3>

              {analysis.auxiliaryContributionDisplay.map((item, index) => (
                <div key={`${item.periodId || "auxiliary"}_${index}`}>
                  <p>
                    <strong>{item.fundLabel || `Περίοδος ${index + 1}`}:</strong>{" "}
                    {item.classificationLabel}
                  </p>

                  {item.workerGroupLabel && (
                    <p>
                      <strong>Ομάδα εργαζομένων:</strong>{" "}
                      {item.workerGroupLabel}
                    </p>
                  )}

                  {item.formerAuxiliaryFundLabel && (
                    <p>
                      <strong>Πρώην επικουρικό ταμείο:</strong>{" "}
                      {item.formerAuxiliaryFundLabel}
                    </p>
                  )}

                  {item.hasAuxiliary &&
                    item.extraContributionRatePercent !== null && (
                      <p>
                        <strong>Πρόσθετη επικουρική εισφορά:</strong>{" "}
                        {Number(item.extraContributionRatePercent).toLocaleString(
                          "el-GR",
                          { maximumFractionDigits: 2 },
                        )}
                        %
                        {item.isProvisional ? " (παραδοχή / προσεγγιστική τιμή)" : ""}
                      </p>
                    )}

                  {!item.hasAuxiliary && (
                    <p style={{ color: "#475569" }}>
                      Η περίοδος δεν ενεργοποιεί αυτόματο υπολογισμό
                      επικουρικής στην τρέχουσα υλοποίηση.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        {Array.isArray(analysis.parallelInsuranceDisplay) &&
          analysis.parallelInsuranceDisplay.length > 0 && (
            <div style={previewBoxStyle}>
              <h3 style={{ marginTop: 0 }}>Παράλληλη κύρια ασφάλιση</h3>

              <p style={{ color: "#475569" }}>
                Θα υπολογιστεί μία ενιαία κύρια σύνταξη. Δεν υπολογίζεται
                δεύτερη σύνταξη σε αυτό το στάδιο.
              </p>

              {analysis.parallelInsuranceDisplay.map((segment, index) => (
                <div key={segment.id}>
                  <p>
                    <strong>Παράλληλο διάστημα {index + 1}:</strong>{" "}
                    {segment.fromDateDisplay} έως {segment.toDateDisplay}
                  </p>
                  <p>
                    <strong>Περίοδος που μετρά στον χρόνο:</strong>{" "}
                    {segment.timeCountingPeriodLabel}
                  </p>
                  <p>
                    <strong>Ημέρες που αφαιρούνται ως διπλομετρημένες:</strong>{" "}
                    {segment.duplicateInsuranceDays}
                  </p>

                  {segment.additionalPeriods.map((period) => (
                    <p key={`${segment.id}_${period.periodId}`}>
                      <strong>{period.periodLabel}:</strong>{" "}
                      {period.insuranceDaysToRemove} ημέρες
                      {period.totalContributionAmount
                        ? `, συνολικό ποσό εισφορών κύριας σύνταξης ${period.totalContributionAmount} €`
                        : period.monthlyBaseAmount
                          ? `, βάση ${period.monthlyBaseAmount} €, μονάδες εισφοράς ${period.contributionUnits}`
                          : ""}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

        {Array.isArray(analysis.plasticYearsDisplay) &&
          analysis.plasticYearsDisplay.length > 0 && (
            <div style={previewBoxStyle}>
              <h3 style={{ marginTop: 0 }}>Γενικά πλασματικά χρόνια</h3>

              {analysis.plasticYearsDisplay.map((item) => (
                <div key={`plastic_year_${item.entryNumber}`}>
                  <p>
                    <strong>Πλασματικός χρόνος {item.entryNumber}:</strong>{" "}
                    {item.durationDisplay}
                  </p>
                  <p>
                    <strong>Κατάσταση:</strong> {item.recognitionStatusLabel}
                  </p>
                  <p>
                    <strong>Εξαγορά:</strong> {item.recognitionModeLabel}
                  </p>
                  {item.applicationDateDisplay && (
                    <p>
                      <strong>Ημερομηνία αίτησης / αναγνώρισης:</strong>{" "}
                      {item.applicationDateDisplay}
                    </p>
                  )}
                  {item.financialDisplay && (
                    <p>
                      <strong>Οικονομικό στοιχείο:</strong>{" "}
                      {item.financialDisplay}
                    </p>
                  )}
                  {!item.includedInCalculation && (
                    <p style={{ color: "#8a5a00" }}>
                      Δεν θα προστεθεί στον υπολογισμό της ανταποδοτικής
                      σύνταξης.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        {Array.isArray(analysis.etaaExtraBenefitDisplay) &&
          analysis.etaaExtraBenefitDisplay.length > 0 && (
            <div style={previewBoxStyle}>
              <h3 style={{ marginTop: 0 }}>Πρόσθετη παροχή πρώην ΕΤΑΑ</h3>

              {analysis.etaaExtraBenefitDisplay.map((item, index) => (
                <p key={`${item}_${index}`}>{item}</p>
              ))}
            </div>
          )}

        {analysis.contributoryEarningsInputMethodLabel && (
          <p>
            <strong>Τρόπος εισαγωγής ανταποδοτικής:</strong>{" "}
            {analysis.contributoryEarningsInputMethodLabel}
          </p>
        )}

        {analysis.averageMonthlyPensionableEarnings !== null && (
          <p>
            <strong>Μέσος μηνιαίος συντάξιμος μισθός:</strong>{" "}
            {analysis.averageMonthlyPensionableEarnings} €
          </p>
        )}

        {analysis.yearlyEarningsRowsCount > 0 && (
          <p>
            <strong>Γραμμές ετήσιων στοιχείων που θα σταλούν:</strong>{" "}
            {analysis.yearlyEarningsRowsCount}
          </p>
        )}

        {analysis.isSpecialDiseaseOldAgeCase && (
          <p style={{ color: "#8a5a00" }}>
            Η εφαρμογή θα στείλει ειδική ένδειξη ότι πρόκειται για γήρας λόγω
            ειδικών παθήσεων. Ο calculator αργότερα πρέπει να εφαρμόσει τον
            ειδικό κανόνα χωρίς μείωση 1/40 λόγω 40ετίας.
          </p>
        )}

        {analysis.requiresContributoryYearlyStep &&
          analysis.yearlyEarningsRowsCount === 0 && (
            <p style={{ color: "#8a5a00" }}>
              Έχει επιλεγεί ετήσια εισαγωγή στοιχείων. Η επόμενη φόρμα θα
              ζητήσει το ετήσιο ποσό και τις ημέρες ασφάλισης ανά έτος.
            </p>
          )}

        {analysis.warnings.map((warning) => (
          <p key={warning} style={{ color: "crimson" }}>
            {warning}
          </p>
        ))}
      </section>

      <section style={preparedInputSectionStyle}>
        <h2>Δεδομένα που ετοιμάζονται για τον calculator</h2>

        <p>
          <strong>Σημείωση:</strong> Εδώ δεν εμφανίζονται ποσά σύνταξης. Το
          prepare endpoint κάνει μόνο validation / normalization και δεν καλεί
          τον calculator.
        </p>

        <pre style={preStyle}>
          {JSON.stringify(analysis.calculationInput, null, 2)}
        </pre>
      </section>
    </>
  );
}

const previewBoxStyle = {
  border: "1px solid #cbd5e1",
  padding: "0.75rem",
  marginTop: "1rem",
  marginBottom: "1rem",
  backgroundColor: "#f8fafc",
};

export default PreparedInputPreview;
