const PARALLEL_INSURANCE_REFERENCE_EARNINGS_FROM_DATE = "2002-01-01";
const PARALLEL_INSURANCE_FROM_DATE = "2017-01-01";

const PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002 =
  "post_2002_reference_earnings";
const PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED =
  "declared_parallel_contribution_data";
const PARALLEL_REFERENCE_EARNINGS_MODE_COMBINED =
  "combined_annual_earnings";

const PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS =
  "monthly_base_and_contribution_units";
const PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT =
  "total_main_pension_contribution_amount";
const PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE =
  "post_2002_reference_earnings_and_units";

function detectParallelInsuranceSegments(insurancePeriodsDraft = []) {
  const periods = normalizePeriods(insurancePeriodsDraft);

  if (periods.length < 2) {
    return [];
  }

  const boundaries = new Set();

  for (const period of periods) {
    boundaries.add(period.fromDate.getTime());
    boundaries.add(addDays(period.toDate, 1).getTime());
  }

  boundaries.add(
    parseIsoDate(PARALLEL_INSURANCE_REFERENCE_EARNINGS_FROM_DATE).getTime(),
  );
  boundaries.add(parseIsoDate(PARALLEL_INSURANCE_FROM_DATE).getTime());

  const sortedBoundaries = Array.from(boundaries)
    .sort((a, b) => a - b)
    .map((time) => new Date(time));

  const rawSegments = [];

  for (let index = 0; index < sortedBoundaries.length - 1; index += 1) {
    const fromDate = sortedBoundaries[index];
    const toDate = addDays(sortedBoundaries[index + 1], -1);

    if (toDate < fromDate) {
      continue;
    }

    const activePeriods = periods.filter((period) => {
      return period.fromDate <= fromDate && period.toDate >= toDate;
    });

    if (activePeriods.length < 2) {
      continue;
    }

    const periodIds = activePeriods
      .map((period) => period.id)
      .sort((a, b) => a.localeCompare(b));

    rawSegments.push({
      fromDate,
      toDate,
      periodType:
        toDate < parseIsoDate(PARALLEL_INSURANCE_FROM_DATE)
          ? "until_2016"
          : "from_2017",
      referenceEarningsMode: resolveParallelReferenceEarningsMode({
        fromDate,
        toDate,
      }),
      periodIds,
      activePeriods,
    });
  }

  const mergedSegments = [];

  for (const segment of rawSegments) {
    const previous = mergedSegments[mergedSegments.length - 1];
    const samePeriods =
      previous &&
      previous.periodType === segment.periodType &&
      previous.referenceEarningsMode === segment.referenceEarningsMode &&
      arraysEqual(previous.periodIds, segment.periodIds);
    const adjacent =
      previous &&
      addDays(previous.toDate, 1).getTime() === segment.fromDate.getTime();

    if (samePeriods && adjacent) {
      previous.toDate = segment.toDate;
      continue;
    }

    mergedSegments.push({ ...segment });
  }

  return mergedSegments.map((segment) => {
    const fromDate = formatIsoDate(segment.fromDate);
    const toDate = formatIsoDate(segment.toDate);
    const maximumDuplicateInsuranceDays =
      calculatePossibleMaximumDuplicateDaysForSegment(segment.activePeriods);
    const overlapGroupId = createOverlapGroupId(segment.periodIds);

    return {
      id: createSegmentId({
        periodIds: segment.periodIds,
        fromDate,
        toDate,
      }),
      overlapGroupId,
      overlapGroupMaximumDuplicateInsuranceDays:
        maximumDuplicateInsuranceDays,
      fromDate,
      toDate,
      fromDateDisplay: formatGreekDate(segment.fromDate),
      toDateDisplay: formatGreekDate(segment.toDate),
      periodType: segment.periodType,
      referenceEarningsMode: segment.referenceEarningsMode,
      periodTypeLabel: buildParallelSegmentPeriodLabel(segment),
      periodIds: segment.periodIds,
      activePeriodCount: segment.periodIds.length,
      maximumDuplicateInsuranceDays,
      periods: segment.activePeriods.map((period) => ({
        id: period.id,
        label: buildPeriodLabel(period),
        fundLabel: period.fundLabel || period.fund,
        fromDateDisplay: period.fromDateDisplay || "",
        toDateDisplay: period.toDateDisplay || "",
        insuranceDays: period.insuranceDays,
        maximumDuplicateInsuranceDays:
          calculatePossibleMaximumDuplicateDaysForPeriod({
            periodId: period.id,
            periods: segment.activePeriods,
          }),
      })),
    };
  });
}

function createEmptyParallelInsuranceDraft() {
  return {
    segments: {},
  };
}

function normalizeParallelInsuranceDraft(value) {
  const rawSegments = value?.segments;

  if (!rawSegments || typeof rawSegments !== "object") {
    return createEmptyParallelInsuranceDraft();
  }

  const segments = {};

  for (const [segmentId, segmentValue] of Object.entries(rawSegments)) {
    const additionalPeriods = {};
    const rawAdditionalPeriods = segmentValue?.additionalPeriods;

    if (rawAdditionalPeriods && typeof rawAdditionalPeriods === "object") {
      for (const [periodId, periodValue] of Object.entries(
        rawAdditionalPeriods,
      )) {
        additionalPeriods[periodId] = {
          insuranceDaysToRemove: periodValue?.insuranceDaysToRemove ?? "",
          contributionInputMode: normalizeParallelContributionInputMode(
            periodValue?.contributionInputMode,
            periodValue,
          ),
          monthlyBaseAmount: periodValue?.monthlyBaseAmount ?? "",
          contributionUnits: periodValue?.contributionUnits ?? "",
          totalContributionAmount: periodValue?.totalContributionAmount ?? "",
        };
      }
    }

    segments[segmentId] = {
      timeCountingPeriodId: segmentValue?.timeCountingPeriodId || "",
      baseEarningsConfirmed: segmentValue?.baseEarningsConfirmed === true,
      combinedEarningsConfirmed:
        segmentValue?.combinedEarningsConfirmed === true,
      annualAuxiliaryContributionAmounts:
        normalizeAnnualAuxiliaryContributionAmounts(
          segmentValue?.annualAuxiliaryContributionAmounts,
        ),
      additionalPeriods,
    };
  }

  return { segments };
}

function normalizeAnnualAuxiliaryContributionAmounts(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized = {};

  for (const [year, amount] of Object.entries(value)) {
    if (!/^\d{4}$/.test(String(year))) {
      continue;
    }

    normalized[year] = amount ?? "";
  }

  return normalized;
}

function normalizeParallelContributionInputMode(value, periodValue = {}) {
  if (value === PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT) {
    return PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT;
  }

  if (value === PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS) {
    return PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS;
  }

  if (value === PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE) {
    return PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE;
  }

  const hasTotalContributionAmount =
    String(periodValue?.totalContributionAmount ?? "").trim() !== "";
  const hasLegacyBaseOrUnits =
    String(periodValue?.monthlyBaseAmount ?? "").trim() !== "" ||
    String(periodValue?.contributionUnits ?? "").trim() !== "";

  if (hasTotalContributionAmount && !hasLegacyBaseOrUnits) {
    return PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT;
  }

  return PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS;
}

function buildPeriodLabel(period = {}) {
  const datePart =
    period.fromDateDisplay && period.toDateDisplay
      ? ` (${period.fromDateDisplay}–${period.toDateDisplay})`
      : "";

  return `${period.fundLabel || period.fund || period.id}${datePart}`;
}

function normalizePeriods(periods = []) {
  return (Array.isArray(periods) ? periods : [])
    .map((period, index) => {
      const fromDate = parseIsoDate(period?.fromDate);
      const toDate = parseIsoDate(period?.toDate);
      const insuranceDays = toPositiveNumber(period?.insuranceDays);

      if (!fromDate || !toDate || toDate < fromDate) {
        return null;
      }

      return {
        ...period,
        id: String(period?.id || `period_${index + 1}`),
        fromDate,
        toDate,
        insuranceDays,
      };
    })
    .filter(Boolean);
}

function calculatePossibleMaximumDuplicateDaysForPeriod({
  periodId,
  periods = [],
}) {
  const currentPeriod = periods.find((period) => period.id === periodId);
  const currentInsuranceDays = toPositiveNumber(currentPeriod?.insuranceDays);
  const otherInsuranceDays = periods.reduce((sum, period) => {
    if (period.id === periodId) {
      return sum;
    }

    return sum + toPositiveNumber(period.insuranceDays);
  }, 0);

  if (currentInsuranceDays <= 0 || otherInsuranceDays <= 0) {
    return null;
  }

  return roundToDecimals(
    Math.min(currentInsuranceDays, otherInsuranceDays),
    4,
  );
}

function calculatePossibleMaximumDuplicateDaysForSegment(periods = []) {
  const declaredDays = periods
    .map((period) => toPositiveNumber(period?.insuranceDays))
    .filter((value) => value > 0);

  if (declaredDays.length < 2 || declaredDays.length !== periods.length) {
    return null;
  }

  const totalDays = declaredDays.reduce((sum, value) => sum + value, 0);
  const largestPeriodDays = Math.max(...declaredDays);

  return roundToDecimals(totalDays - largestPeriodDays, 4);
}

function resolveParallelReferenceEarningsMode({ fromDate, toDate }) {
  const referenceStartDate = parseIsoDate(
    PARALLEL_INSURANCE_REFERENCE_EARNINGS_FROM_DATE,
  );
  const unifiedStartDate = parseIsoDate(PARALLEL_INSURANCE_FROM_DATE);

  if (toDate < referenceStartDate) {
    return PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002;
  }

  if (fromDate >= unifiedStartDate) {
    return PARALLEL_REFERENCE_EARNINGS_MODE_COMBINED;
  }

  return PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED;
}

function buildParallelSegmentPeriodLabel(segment = {}) {
  if (
    segment.referenceEarningsMode ===
    PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002
  ) {
    return "Έως 31/12/2001";
  }

  if (
    segment.referenceEarningsMode ===
    PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED
  ) {
    return "Από 01/01/2002 έως 31/12/2016";
  }

  return "Από 01/01/2017";
}

function createOverlapGroupId(periodIds = []) {
  const safePeriodIds = [...periodIds]
    .map((value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "_"))
    .sort((a, b) => a.localeCompare(b))
    .join("__");

  return `parallel_group_${safePeriodIds}`;
}

function createSegmentId({ periodIds, fromDate, toDate }) {
  const safePeriodIds = periodIds
    .map((value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "_"))
    .join("__");

  return `parallel_${safePeriodIds}_${fromDate}_${toDate}`;
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));

  if (!match) {
    return null;
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );

  if (
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() + 1 !== Number(match[2]) ||
    date.getUTCDate() !== Number(match[3])
  ) {
    return null;
  }

  return date;
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatGreekDate(date) {
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function arraysEqual(first = [], second = []) {
  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

function toPositiveNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export {
  PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS,
  PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT,
  PARALLEL_CONTRIBUTION_INPUT_MODE_POST_2002_REFERENCE,
  PARALLEL_REFERENCE_EARNINGS_MODE_POST_2002,
  PARALLEL_REFERENCE_EARNINGS_MODE_DECLARED,
  PARALLEL_REFERENCE_EARNINGS_MODE_COMBINED,
  createEmptyParallelInsuranceDraft,
  createOverlapGroupId,
  detectParallelInsuranceSegments,
  normalizeParallelContributionInputMode,
  normalizeParallelInsuranceDraft,
};
