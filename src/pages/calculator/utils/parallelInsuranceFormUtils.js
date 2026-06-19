const PARALLEL_INSURANCE_FROM_DATE = "2017-01-01";
const INSURANCE_DAYS_PER_YEAR = 300;

const PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS =
  "monthly_base_and_contribution_units";
const PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT =
  "total_main_pension_contribution_amount";

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

    return {
      id: createSegmentId({
        periodIds: segment.periodIds,
        fromDate,
        toDate,
      }),
      fromDate,
      toDate,
      fromDateDisplay: formatGreekDate(segment.fromDate),
      toDateDisplay: formatGreekDate(segment.toDate),
      periodType: segment.periodType,
      periodTypeLabel:
        segment.periodType === "until_2016"
          ? "Έως 31/12/2016"
          : "Από 01/01/2017",
      periodIds: segment.periodIds,
      activePeriodCount: segment.periodIds.length,
      suggestedInsuranceDays: roundToDecimals(
        calculateInsuranceDaysBetweenDates(segment.fromDate, segment.toDate),
        4,
      ),
      periods: segment.activePeriods.map((period) => ({
        id: period.id,
        label: buildPeriodLabel(period),
        fundLabel: period.fundLabel || period.fund,
        fromDateDisplay: period.fromDateDisplay || "",
        toDateDisplay: period.toDateDisplay || "",
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
      additionalPeriods,
    };
  }

  return { segments };
}

function normalizeParallelContributionInputMode(value, periodValue = {}) {
  if (value === PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT) {
    return PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT;
  }

  if (value === PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS) {
    return PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS;
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

      if (!fromDate || !toDate || toDate < fromDate) {
        return null;
      }

      return {
        ...period,
        id: String(period?.id || `period_${index + 1}`),
        fromDate,
        toDate,
      };
    })
    .filter(Boolean);
}

function createSegmentId({ periodIds, fromDate, toDate }) {
  const safePeriodIds = periodIds
    .map((value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "_"))
    .join("__");

  return `parallel_${safePeriodIds}_${fromDate}_${toDate}`;
}

function calculateInsuranceDaysBetweenDates(fromDate, toDate) {
  let totalInsuranceDays = 0;

  for (
    let year = fromDate.getUTCFullYear();
    year <= toDate.getUTCFullYear();
    year += 1
  ) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31));
    const periodStart = fromDate > yearStart ? fromDate : yearStart;
    const periodEnd = toDate < yearEnd ? toDate : yearEnd;

    if (periodEnd < periodStart) {
      continue;
    }

    const calendarDays = Math.floor((periodEnd - periodStart) / 86400000) + 1;
    const daysInYear = isLeapYear(year) ? 366 : 365;

    totalInsuranceDays += (calendarDays / daysInYear) * INSURANCE_DAYS_PER_YEAR;
  }

  return totalInsuranceDays;
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

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export {
  PARALLEL_CONTRIBUTION_INPUT_MODE_BASE_AND_UNITS,
  PARALLEL_CONTRIBUTION_INPUT_MODE_TOTAL_AMOUNT,
  createEmptyParallelInsuranceDraft,
  detectParallelInsuranceSegments,
  normalizeParallelContributionInputMode,
  normalizeParallelInsuranceDraft,
};
