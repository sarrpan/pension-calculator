import React from "react";

function MainPensionResultPanel({ calculationResponse, showDiagnostics = false }) {
  const nationalPension = calculationResponse?.nationalPension || {};
  const contributoryPension = calculationResponse?.contributoryPension || {};
  const article30Increase = calculationResponse?.article30Increase || {};
  const parallelInsurance = calculationResponse?.parallelInsurance || {};
  const plasticYears = calculationResponse?.plasticYears || {};
  const etaaExtraBenefits = calculationResponse?.etaaExtraBenefits || {};
  const auxiliaryPension = calculationResponse?.auxiliaryPension || null;
  const deductions = calculationResponse?.deductions || {};
  const totals = calculationResponse?.totals || {};

  const nationalAmount = toNumberOrNull(nationalPension.amount);
  const contributoryAmount = toNumberOrNull(contributoryPension.amount);
  const article30Amount = toNumberOrNull(article30Increase.amount);
  const parallelInsuranceAmount = toNumberOrNull(parallelInsurance.amount);
  const etaaExtraBenefitAmount = toNumberOrNull(etaaExtraBenefits.amount);
  const etaaExtraBenefitEntries = Array.isArray(etaaExtraBenefits.entries)
    ? etaaExtraBenefits.entries
    : [];
  const article30MainContributionAmount = toNumberOrNull(
    article30Increase.mainContributionAmount,
  );
  const article30PremiumContributionAmount = toNumberOrNull(
    article30Increase.premiumContributionAmount,
  );
  const grossMainPension = toNumberOrNull(totals.grossMainPension);

  const auxiliaryOldPart = auxiliaryPension?.oldPartUntil2014 || {};
  const auxiliaryHigherContribution =
    auxiliaryPension?.higherContributionIncreaseUntil2014 || {};
  const auxiliaryNdcPart = auxiliaryPension?.ndcPartFrom2015 || {};
  const auxiliaryRanteSelection = auxiliaryPension?.ranteSelection || {};
  const auxiliaryDisabilityAdjustment =
    auxiliaryPension?.disabilityAdjustment || {};

  const auxiliaryOldPartAmount = toNumberOrNull(auxiliaryOldPart.amount);
  const auxiliaryHigherContributionAmount = toNumberOrNull(
    auxiliaryHigherContribution.amount,
  );
  const grossAuxiliaryPension = toNumberOrNull(
    totals.grossAuxiliaryPension ??
      auxiliaryPension?.totals?.grossAuxiliaryPension,
  );
  const grossGrandTotal = toNumberOrNull(
    totals.grossGrandTotal ?? deductions.grossGrandTotal,
  );
  const mainEasDeduction = toNumberOrNull(deductions.mainEasDeduction);
  const supplementaryEasDeduction = toNumberOrNull(
    deductions.supplementaryEasDeduction,
  );
  const under60Deduction = toNumberOrNull(deductions.under60Deduction);
  const mainHealthDeduction = toNumberOrNull(
    deductions.mainHealthDeduction,
  );
  const supplementaryHealthDeduction = toNumberOrNull(
    deductions.supplementaryHealthDeduction,
  );
  const totalDeductionsBeforeTax = toNumberOrNull(
    totals.totalDeductionsBeforeTax ??
      deductions.totalDeductionsBeforeTax,
  );
  const payableBeforeTax = toNumberOrNull(
    totals.payableBeforeTax ?? deductions.payableBeforeTax,
  );
  const hasDeductionsResult =
    calculationResponse?.deductions &&
    typeof calculationResponse.deductions === "object" &&
    Object.keys(calculationResponse.deductions).length > 0;
  const auxiliaryInsuranceDaysUntil2014 = toNumberOrNull(
    auxiliaryOldPart.auxiliaryInsuranceDays,
  );
  const auxiliaryInsuranceYearsUntil2014 = toNumberOrNull(
    auxiliaryOldPart.auxiliaryInsuranceYears,
  );
  const averageMonthlyAuxiliaryEarnings = toNumberOrNull(
    auxiliaryOldPart.averageMonthlyAuxiliaryEarnings,
  );
  const auxiliaryInsuranceDaysFrom2015 = toNumberOrNull(
    auxiliaryNdcPart.auxiliaryInsuranceDays,
  );
  const auxiliaryInsuranceYearsFrom2015 = toNumberOrNull(
    auxiliaryNdcPart.auxiliaryInsuranceYears,
  );
  const auxiliaryNdcAmount = toNumberOrNull(auxiliaryNdcPart.amount);
  const auxiliaryNdcOriginalContributions = toNumberOrNull(
    auxiliaryNdcPart.totalOriginalContributions,
  );
  const auxiliaryNdcAccumulatedContributions = toNumberOrNull(
    auxiliaryNdcPart.totalAccumulatedContributions,
  );
  const auxiliaryNdcAnnualPensionAmount = toNumberOrNull(
    auxiliaryNdcPart.annualPensionAmount,
  );
  const auxiliaryNdcLastAccumulationYear = toNumberOrNull(
    auxiliaryNdcPart.lastAccumulationYear,
  );
  const auxiliaryNdcYearlyBreakdown = Array.isArray(
    auxiliaryNdcPart.yearlyBreakdown,
  )
    ? auxiliaryNdcPart.yearlyBreakdown
    : [];
  const auxiliaryDisabilityPaymentRate = toNumberOrNull(
    auxiliaryDisabilityAdjustment.paymentRate,
  );
  const selectedAuxiliaryRante = toNumberOrNull(
    auxiliaryRanteSelection.value,
  );
  const auxiliaryRanteAge = toNumberOrNull(auxiliaryRanteSelection.age);
  const hasSelectedAuxiliaryRante =
    auxiliaryRanteSelection.found === true && selectedAuxiliaryRante !== null;
  const hasAuxiliaryPension = Boolean(auxiliaryPension);
  const hasCalculatedNdcPart =
    auxiliaryNdcPart.status === "calculated" ||
    auxiliaryNdcPart.status === "calculated_with_provisional_factors";
  const hasPendingNdcPart =
    auxiliaryInsuranceDaysFrom2015 !== null &&
    auxiliaryInsuranceDaysFrom2015 > 0 &&
    !hasCalculatedNdcPart;
  const usesProvisionalNdcFactors =
    auxiliaryNdcPart.usesProvisionalAccumulationFactors === true;
  const usesProvisionalNdcContributionRates =
    auxiliaryNdcPart.usesProvisionalContributionRates === true;

  const cleanParallelInsuranceYears = toNumberOrNull(
    parallelInsurance.cleanInsuranceYears,
  );
  const duplicateParallelInsuranceDays = toNumberOrNull(
    parallelInsurance.duplicateInsuranceDaysRemoved,
  );

  const pensionableMonthlyEarnings = toNumberOrNull(
    contributoryPension.pensionableMonthlyEarnings,
  );
  const recognizedPlasticYears = toNumberOrNull(
    plasticYears.recognizedInsuranceYears,
  );
  const recognizedPlasticEarnings = toNumberOrNull(
    plasticYears.recognizedPensionableEarnings,
  );

  const baseReplacementRatePercentage = firstNumberOrNull(
    article30Increase.baseReplacementRatePercentage,
    contributoryPension.replacementRatePercentage,
  );

  const mainContributionReplacementRatePercentage = toNumberOrNull(
    article30Increase.mainContributionReplacementRatePercentage,
  );
  const premiumContributionReplacementRatePercentage = toNumberOrNull(
    article30Increase.premiumContributionReplacementRatePercentage,
  );

  const additionalReplacementRatePercentage = firstNumberOrNull(
    article30Increase.additionalReplacementRatePercentage,
    sumNumbersOrNull(
      article30Increase.mainContributionReplacementRatePercentage,
      article30Increase.premiumContributionReplacementRatePercentage,
    ),
  );

  const combinedReplacementRatePercentage = firstNumberOrNull(
    article30Increase.combinedReplacementRatePercentage,
    sumNumbersOrNull(
      baseReplacementRatePercentage,
      additionalReplacementRatePercentage,
    ),
  );

  return (
    <section
      style={{
        marginTop: "1rem",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        padding: "1rem",
        background: "#f0fdf4",
      }}
    >
      <h2>Αποτέλεσμα κύριας σύνταξης</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <ResultCard
          title="Εθνική σύνταξη"
          value={formatMoney(nationalAmount)}
        />
        <ResultCard
          title="Βασική ανταποδοτική σύνταξη"
          value={formatMoney(contributoryAmount)}
        />
        <ResultCard
          title="Προσαύξηση άρθρου 30"
          value={formatMoney(article30Amount)}
        />
        {parallelInsurance.hasParallelInsurance === true && (
          <ResultCard
            title="Προσαύξηση παράλληλης ασφάλισης"
            value={formatMoney(parallelInsuranceAmount)}
          />
        )}
        {etaaExtraBenefitEntries.length > 0 && (
          <ResultCard
            title="Πρόσθετη παροχή πρώην ΕΤΑΑ"
            value={formatMoney(etaaExtraBenefitAmount)}
          />
        )}
        <ResultCard
          title="Σύνολο κύριας σύνταξης"
          value={formatMoney(grossMainPension)}
        />
      </div>

      <div style={{ color: "#166534", marginBottom: "1rem" }}>
        {pensionableMonthlyEarnings !== null && (
          <p>
            Μέσος μηνιαίος συντάξιμος μισθός:{" "}
            <strong>{formatMoney(pensionableMonthlyEarnings)}</strong>
          </p>
        )}

        {parallelInsurance.hasParallelInsurance === true && (
          <>
            <p>
              Τρόπος υπολογισμού παράλληλης ασφάλισης:{" "}
              <strong>Μία ενιαία κύρια σύνταξη</strong>
            </p>

            {duplicateParallelInsuranceDays !== null && (
              <p>
                Ημέρες που αφαιρέθηκαν για να μην μετρηθούν δεύτερη φορά:{" "}
                <strong>{formatNumber(duplicateParallelInsuranceDays)}</strong>
              </p>
            )}

            {cleanParallelInsuranceYears !== null && (
              <p>
                Καθαρός ασφαλιστικός χρόνος μετά την αφαίρεση επικαλύψεων:{" "}
                <strong>{formatYears(cleanParallelInsuranceYears)}</strong>
              </p>
            )}

            {parallelInsuranceAmount !== null &&
              parallelInsuranceAmount > 0 && (
                <p>
                  Πρόσθετη παροχή παράλληλης ασφάλισης έως 31/12/2016:{" "}
                  <strong>{formatMoney(parallelInsuranceAmount)}</strong>
                </p>
              )}
          </>
        )}

        {recognizedPlasticYears !== null && recognizedPlasticYears > 0 && (
          <p>
            Πλασματικός χρόνος που προστέθηκε:{" "}
            <strong>{formatYears(recognizedPlasticYears)}</strong>
          </p>
        )}

        {recognizedPlasticEarnings !== null &&
          recognizedPlasticEarnings > 0 && (
            <p>
              Συντάξιμες αποδοχές εξαγοράς πλασματικού χρόνου:{" "}
              <strong>{formatMoney(recognizedPlasticEarnings)}</strong>
            </p>
          )}

        {article30MainContributionAmount !== null &&
          article30MainContributionAmount > 0 && (
            <p>
              Προσαύξηση βασικών αυξημένων εισφορών:{" "}
              <strong>{formatMoney(article30MainContributionAmount)}</strong>
              {mainContributionReplacementRatePercentage !== null && (
                <>
                  {" "}
                  ({formatPercentage(mainContributionReplacementRatePercentage)}
                  )
                </>
              )}
            </p>
          )}

        {shouldShowPremiumDetails(article30Increase) && (
          <p>
            Προσαύξηση επασφαλίστρου / ειδικής εισφοράς:{" "}
            <strong>{formatMoney(article30PremiumContributionAmount)}</strong>
            {premiumContributionReplacementRatePercentage !== null && (
              <>
                {" "}
                (
                {formatPercentage(premiumContributionReplacementRatePercentage)}
                )
              </>
            )}
          </p>
        )}

        {etaaExtraBenefitEntries.map((entry, index) => (
          <p key={`${entry.benefitType || "etaa"}_${index}`}>
            {getEtaaBenefitLabel(entry.benefitType)}:{" "}
            <strong>{formatMoney(toNumberOrNull(entry.amount))}</strong>
            {toNumberOrNull(entry.benefitRatePercentage) !== null && (
              <>
                {" "}
                ({formatPercentage(toNumberOrNull(entry.benefitRatePercentage))}
                )
              </>
            )}
          </p>
        ))}

        {baseReplacementRatePercentage !== null && (
          <p>
            Βασικό ποσοστό αναπλήρωσης:{" "}
            <strong>{formatPercentage(baseReplacementRatePercentage)}</strong>
          </p>
        )}

        {additionalReplacementRatePercentage !== null && (
          <p>
            Πρόσθετο ποσοστό αναπλήρωσης άρθρου 30:{" "}
            <strong>
              {formatPercentage(additionalReplacementRatePercentage)}
            </strong>
          </p>
        )}

        {combinedReplacementRatePercentage !== null && (
          <p>
            Συνολικό ποσοστό αναπλήρωσης:{" "}
            <strong>
              {formatPercentage(combinedReplacementRatePercentage)}
            </strong>
          </p>
        )}
      </div>

      {hasAuxiliaryPension && (
        <section style={auxiliaryResultSectionStyle}>
          <h2 style={{ marginTop: 0 }}>Αποτέλεσμα επικουρικής σύνταξης</h2>

          <div style={resultCardsGridStyle}>
            <ResultCard
              title="Παλαιό τμήμα έως 31/12/2014"
              value={formatMoney(auxiliaryOldPartAmount)}
            />

            {auxiliaryHigherContributionAmount !== null &&
              auxiliaryHigherContributionAmount > 0 && (
                <ResultCard
                  title="Προσαύξηση αυξημένων εισφορών"
                  value={formatMoney(auxiliaryHigherContributionAmount)}
                />
              )}

            {hasCalculatedNdcPart && (
              <ResultCard
                title="Νέο/NDC τμήμα από 1/1/2015"
                value={formatMoney(auxiliaryNdcAmount)}
              />
            )}

            <ResultCard
              title={
                hasPendingNdcPart
                  ? "Μερικό σύνολο επικουρικής έως 31/12/2014"
                  : "Σύνολο επικουρικής σύνταξης"
              }
              value={formatMoney(grossAuxiliaryPension)}
            />
          </div>

          <div style={{ color: "#1e3a8a" }}>
            {auxiliaryInsuranceDaysUntil2014 !== null && (
              <p>
                Ημέρες επικουρικής έως 31/12/2014:{" "}
                <strong>
                  {formatNumber(auxiliaryInsuranceDaysUntil2014)}
                </strong>
                {auxiliaryInsuranceYearsUntil2014 !== null && (
                  <>
                    {" "}
                    ({formatYears(auxiliaryInsuranceYearsUntil2014)})
                  </>
                )}
              </p>
            )}

            {averageMonthlyAuxiliaryEarnings !== null && (
              <p>
                Μέσος μηνιαίος επικουρικός μισθός:{" "}
                <strong>
                  {formatMoney(averageMonthlyAuxiliaryEarnings)}
                </strong>
              </p>
            )}

            <p>
              Βασικός τύπος παλαιού τμήματος:{" "}
              <strong>
                0,45% × έτη επικουρικής έως το 2014 × μέσος επικουρικός
                μισθός
              </strong>
            </p>

            {hasSelectedAuxiliaryRante && (
              <>
                <p>
                  Ηλικία επιλογής ράντας:{" "}
                  <strong>{formatNumber(auxiliaryRanteAge)} έτη</strong>
                </p>
                <p>
                  Επιλεγμένη ράντα νέου/NDC τμήματος:{" "}
                  <strong>{formatRante(selectedAuxiliaryRante)}</strong>
                </p>
                {auxiliaryRanteSelection.groupLabel && (
                  <p>
                    Ομάδα ράντας:{" "}
                    <strong>{auxiliaryRanteSelection.groupLabel}</strong>
                  </p>
                )}
              </>
            )}

            {hasCalculatedNdcPart && (
              <>
                <p>
                  Συνολικές εισφορές νέου/NDC τμήματος:{" "}
                  <strong>{formatMoney(auxiliaryNdcOriginalContributions)}</strong>
                </p>
                <p>
                  Συσσωρευμένο κεφάλαιο μετά τους συντελεστές 1+g:{" "}
                  <strong>
                    {formatMoney(auxiliaryNdcAccumulatedContributions)}
                  </strong>
                </p>
                {auxiliaryNdcLastAccumulationYear !== null && (
                  <p>
                    Τελευταίο έτος συσσώρευσης:{" "}
                    <strong>
                      {formatNumber(auxiliaryNdcLastAccumulationYear)}
                    </strong>
                  </p>
                )}
                <p>
                  Ετήσιο ποσό νέου/NDC τμήματος:{" "}
                  <strong>{formatMoney(auxiliaryNdcAnnualPensionAmount)}</strong>
                </p>
                <p>
                  Μηνιαίο νέο/NDC τμήμα:{" "}
                  <strong>{formatMoney(auxiliaryNdcAmount)}</strong>
                </p>
                <p>
                  Τύπος νέου/NDC τμήματος:{" "}
                  <strong>
                    συσσωρευμένο κεφάλαιο ÷ ράντα ÷ 12
                  </strong>
                </p>

                {auxiliaryNdcYearlyBreakdown.length > 0 && (
                  <details style={ndcBreakdownDetailsStyle}>
                    <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                      Αναλυτικός υπολογισμός NDC ανά έτος
                    </summary>

                    <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
                      <table style={ndcBreakdownTableStyle}>
                        <thead>
                          <tr>
                            <th style={ndcBreakdownCellStyle}>Έτος</th>
                            <th style={ndcBreakdownCellStyle}>Αποδοχές</th>
                            <th style={ndcBreakdownCellStyle}>Γενικό ποσοστό</th>
                            <th style={ndcBreakdownCellStyle}>Πρόσθετο ποσοστό</th>
                            <th style={ndcBreakdownCellStyle}>Εισφορές έτους</th>
                            <th style={ndcBreakdownCellStyle}>Σωρευτικός 1+g</th>
                            <th style={ndcBreakdownCellStyle}>Συσσωρευμένες εισφορές</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auxiliaryNdcYearlyBreakdown.map((entry) => (
                            <tr key={`auxiliary_ndc_${entry.year}`}>
                              <td style={ndcBreakdownCellStyle}>
                                {formatNumber(toNumberOrNull(entry.year))}
                              </td>
                              <td style={ndcBreakdownCellStyle}>
                                {formatMoney(
                                  toNumberOrNull(entry.annualEarnings),
                                )}
                              </td>
                              <td style={ndcBreakdownCellStyle}>
                                {formatPercentage(
                                  toNumberOrNull(
                                    entry.generalContributionRatePercent,
                                  ),
                                )}
                              </td>
                              <td style={ndcBreakdownCellStyle}>
                                {formatPercentage(
                                  toNumberOrNull(
                                    entry.extraContributionRatePercent,
                                  ),
                                )}
                              </td>
                              <td style={ndcBreakdownCellStyle}>
                                {formatMoney(
                                  toNumberOrNull(
                                    entry.annualContributionAmount,
                                  ),
                                )}
                              </td>
                              <td style={ndcBreakdownCellStyle}>
                                {formatMultiplier(
                                  toNumberOrNull(
                                    entry.accumulationMultiplier,
                                  ),
                                )}
                              </td>
                              <td style={ndcBreakdownCellStyle}>
                                {formatMoney(
                                  toNumberOrNull(
                                    entry.accumulatedContributionAmount,
                                  ),
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </>
            )}

            {auxiliaryDisabilityAdjustment.applies === true &&
              auxiliaryDisabilityPaymentRate !== null && (
                <p>
                  Ποσοστό καταβολής λόγω αναπηρίας:{" "}
                  <strong>
                    {formatPercentage(auxiliaryDisabilityPaymentRate * 100)}
                  </strong>
                </p>
              )}
          </div>

          {hasCalculatedNdcPart && usesProvisionalNdcFactors && (
            <div style={pendingAuxiliaryNoticeStyle}>
              <strong>
                Το νέο/NDC τμήμα χρησιμοποιεί προσωρινούς συντελεστές 1+g.
              </strong>
              <p style={{ marginBottom: 0 }}>
                Η μέθοδος συσσώρευσης και η ράντα έχουν συνδεθεί, αλλά οι
                ετήσιοι συντελεστές 1+g θα αντικατασταθούν όταν επιβεβαιωθούν
                οι επίσημες τιμές.
              </p>
            </div>
          )}

          {hasCalculatedNdcPart &&
            usesProvisionalNdcContributionRates && (
              <div style={pendingAuxiliaryNoticeStyle}>
                <strong>
                  Χρησιμοποιήθηκε προσωρινή παραδοχή ειδικής πρόσθετης
                  επικουρικής εισφοράς.
                </strong>
                <p style={{ marginBottom: 0 }}>
                  Η παραδοχή αφορά μόνο κατηγορία για την οποία δεν έχει
                  ακόμη επιβεβαιωθεί χωριστό ποσοστό. Πραγματικό ποσό
                  εισφορών, όταν δοθεί, υπερισχύει.
                </p>
              </div>
            )}

          {hasPendingNdcPart && (
            <div style={pendingAuxiliaryNoticeStyle}>
              <strong>Δεν ολοκληρώθηκε ο υπολογισμός του τμήματος από 1/1/2015.</strong>
              <p style={{ marginBottom: 0 }}>
                Έχουν καταγραφεί{" "}
                <strong>
                  {formatNumber(auxiliaryInsuranceDaysFrom2015)} ημέρες
                </strong>
                {auxiliaryInsuranceYearsFrom2015 !== null && (
                  <>
                    {" "}
                    ({formatYears(auxiliaryInsuranceYearsFrom2015)})
                  </>
                )}
                . Δες τις εκκρεμότητες του υπολογισμού για το στοιχείο που
                λείπει από τον υπολογισμό.
              </p>
              {hasSelectedAuxiliaryRante ? (
                <p style={{ marginBottom: 0, marginTop: "0.5rem" }}>
                  Η ηλικία και η ασφαλιστική κατηγορία συνδέθηκαν επιτυχώς με
                  τη σωστή ράντα.
                </p>
              ) : auxiliaryRanteSelection.warning ? (
                <p style={{ marginBottom: 0, marginTop: "0.5rem" }}>
                  <strong>Εκκρεμότητα ράντας:</strong>{" "}
                  {auxiliaryRanteSelection.warning}
                </p>
              ) : null}
            </div>
          )}
        </section>
      )}

      {hasDeductionsResult && (
        <section style={deductionsResultSectionStyle}>
          <h2 style={{ marginTop: 0 }}>
            Κρατήσεις και πληρωτέο ποσό πριν από φόρο
          </h2>

          <div style={resultCardsGridStyle}>
            <FinancialResultCard
              title="Συνολικό μικτό ποσό"
              value={formatMoney(grossGrandTotal)}
            />
            <FinancialResultCard
              title="Σύνολο κρατήσεων"
              value={formatDeductionMoney(totalDeductionsBeforeTax)}
            />
            <FinancialResultCard
              title="Πληρωτέο πριν από φόρο"
              value={formatMoney(payableBeforeTax)}
              emphasis
            />
          </div>

          <div style={deductionsBreakdownStyle}>
            <DeductionRow
              title="ΕΑΣ κύριας σύνταξης"
              value={mainEasDeduction}
            />

            {(grossAuxiliaryPension > 0 ||
              supplementaryEasDeduction > 0) && (
              <DeductionRow
                title="ΕΑΣ/ΑΚΑΓΕ επικουρικής σύνταξης"
                value={supplementaryEasDeduction}
              />
            )}

            {under60Deduction > 0 && (
              <DeductionRow
                title="Πρόσθετη κράτηση κάτω των 60"
                value={under60Deduction}
              />
            )}

            <DeductionRow
              title="Υγειονομική περίθαλψη κύριας σύνταξης"
              value={mainHealthDeduction}
            />

            {(grossAuxiliaryPension > 0 ||
              supplementaryHealthDeduction > 0) && (
              <DeductionRow
                title="Υγειονομική περίθαλψη επικουρικής σύνταξης"
                value={supplementaryHealthDeduction}
              />
            )}

          </div>

          <p style={deductionsNoticeStyle}>
            Το πληρωτέο ποσό είναι μετά τις παραπάνω κρατήσεις και πριν από
            τυχόν παρακράτηση φόρου.
          </p>
        </section>
      )}

      {Array.isArray(calculationResponse?.warnings) &&
        calculationResponse.warnings.length > 0 && (
          <div
            style={{
              border: "1px solid #fde68a",
              background: "#fffbeb",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            <h3>Προειδοποιήσεις</h3>
            <ul>
              {calculationResponse.warnings.map((warning, index) => (
                <li key={`${warning}_${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

      {showDiagnostics && (
        <details>
          <summary>Πλήρης τεχνική απάντηση Pension Engine</summary>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(calculationResponse, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
}

const resultCardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "0.75rem",
  marginBottom: "1rem",
};

const auxiliaryResultSectionStyle = {
  marginTop: "1.25rem",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  padding: "1rem",
  background: "#eff6ff",
};

const deductionsResultSectionStyle = {
  marginTop: "1.25rem",
  marginBottom: "1rem",
  border: "1px solid #fcd34d",
  borderRadius: "8px",
  padding: "1rem",
  background: "#fffbeb",
};

const deductionsBreakdownStyle = {
  border: "1px solid #fde68a",
  borderRadius: "8px",
  overflow: "hidden",
  background: "#ffffff",
};

const deductionsNoticeStyle = {
  marginTop: "0.75rem",
  marginBottom: 0,
  color: "#78350f",
  fontSize: "0.92rem",
};

const ndcBreakdownDetailsStyle = {
  marginTop: "0.75rem",
  border: "1px solid #bfdbfe",
  borderRadius: "6px",
  padding: "0.75rem",
  background: "#ffffff",
};

const ndcBreakdownTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.88rem",
};

const ndcBreakdownCellStyle = {
  border: "1px solid #dbeafe",
  padding: "0.45rem",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const pendingAuxiliaryNoticeStyle = {
  marginTop: "1rem",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  padding: "0.75rem",
  background: "#fffbeb",
  color: "#78350f",
};

function getEtaaBenefitLabel(benefitType) {
  const labels = {
    tsmede_special_increase: "ΤΣΜΕΔΕ — Ειδική Προσαύξηση",
    tsay_single_pensioner_branch: "ΤΣΑΥ — Κλάδος Μονοσυνταξιούχων",
  };

  return labels[benefitType] || "Πρόσθετη παροχή πρώην ΕΤΑΑ";
}

function shouldShowPremiumDetails(article30Increase = {}) {
  const amount = toNumberOrNull(article30Increase.premiumContributionAmount);
  const status = String(
    article30Increase.premiumEligibilityStatus || "",
  ).trim();

  return (
    (amount !== null && amount > 0) ||
    ["yes", "no", "unknown", "mixed"].includes(status)
  );
}

function FinancialResultCard({ title, value, emphasis = false }) {
  return (
    <div
      style={{
        border: emphasis ? "2px solid #16a34a" : "1px solid #f59e0b",
        borderRadius: "8px",
        padding: "0.75rem",
        background: emphasis ? "#f0fdf4" : "#ffffff",
      }}
    >
      <div
        style={{
          color: emphasis ? "#166534" : "#92400e",
          fontSize: "0.9rem",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function DeductionRow({ title, value, strong = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.65rem 0.75rem",
        borderBottom: "1px solid #fef3c7",
        fontWeight: strong ? 700 : 400,
      }}
    >
      <span>{title}</span>
      <strong style={{ whiteSpace: "nowrap" }}>
        {formatDeductionMoney(value)}
      </strong>
    </div>
  );
}

function ResultCard({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid #86efac",
        borderRadius: "8px",
        padding: "0.75rem",
        background: "#ffffff",
      }}
    >
      <div style={{ color: "#166534", fontSize: "0.9rem" }}>{title}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function toNumberOrNull(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function firstNumberOrNull(...values) {
  for (const value of values) {
    const numberValue = toNumberOrNull(value);

    if (numberValue !== null) {
      return numberValue;
    }
  }

  return null;
}

function sumNumbersOrNull(...values) {
  const numberValues = values
    .map((value) => toNumberOrNull(value))
    .filter((value) => value !== null);

  if (numberValues.length === 0) {
    return null;
  }

  return numberValues.reduce((sum, value) => sum + value, 0);
}

function formatNumber(value) {
  if (value === null) {
    return "—";
  }

  return value.toLocaleString("el-GR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatRante(value) {
  if (value === null) {
    return "—";
  }

  return value.toLocaleString("el-GR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function formatMultiplier(value) {
  if (value === null) {
    return "—";
  }

  return value.toLocaleString("el-GR", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });
}

function formatYears(value) {
  if (value === null) {
    return "—";
  }

  return `${value.toLocaleString("el-GR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} έτη`;
}

function formatDeductionMoney(value) {
  if (value === null) {
    return "—";
  }

  if (value === 0) {
    return formatMoney(0);
  }

  return `−${formatMoney(Math.abs(value))}`;
}

function formatMoney(value) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value) {
  if (value === null) {
    return "—";
  }

  return `${value.toLocaleString("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export default MainPensionResultPanel;

