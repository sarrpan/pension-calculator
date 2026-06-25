import React from "react";

function PensionInputJsonImportSection({
  importedPackage,
  importedFileName,
  importError,
  isPreparing,
  onFileSelected,
  onPrepare,
}) {
  const source = importedPackage?.source || {};
  const calculationInput = importedPackage?.calculationInput || {};
  const generalInfoData = calculationInput.generalInfoData || {};
  const insurancePeriods = Array.isArray(
    calculationInput.insurancePeriodsDraft,
  )
    ? calculationInput.insurancePeriodsDraft
    : [];

  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>Εισαγωγή κοινού αρχείου JSON</h2>

      <p style={{ color: "#475569" }}>
        Η επιλογή αυτή διαβάζει το αρχείο που δημιούργησε η ανεξάρτητη
        εφαρμογή φορμών και στέλνει το περιεχόμενό του στο ίδιο υπάρχον
        function προετοιμασίας. Δεν αλλάζει κανέναν calculator.
      </p>

      <label htmlFor="pensionInputJsonFile">
        Αρχείο geodora-pension-input
      </label>

      <br />

      <input
        id="pensionInputJsonFile"
        type="file"
        accept=".json,application/json"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0] || null;
          onFileSelected(selectedFile);
        }}
        style={{ marginTop: "0.5rem" }}
      />

      {importError && (
        <p style={{ color: "crimson", marginBottom: 0 }}>{importError}</p>
      )}

      {importedPackage && (
        <div style={summaryStyle}>
          <p style={{ marginTop: 0 }}>
            <strong>Αρχείο:</strong> {importedFileName || "—"}
          </p>

          <p>
            <strong>Έκδοση μορφής:</strong>{" "}
            {importedPackage.schemaVersion || "—"}
          </p>

          <p>
            <strong>Πηγή:</strong>{" "}
            {source.application || "—"} / {source.edition || "—"}
          </p>

          <p>
            <strong>Ημερομηνία σύνταξης:</strong>{" "}
            {generalInfoData.pensionDate || "—"}
          </p>

          <p>
            <strong>Συνολικές ημέρες ασφάλισης:</strong>{" "}
            {formatNumber(generalInfoData.totalInsuranceDays)}
          </p>

          <p>
            <strong>Ασφαλιστικές περίοδοι:</strong>{" "}
            {insurancePeriods.length}
          </p>

          <button
            type="button"
            onClick={onPrepare}
            disabled={isPreparing}
            style={{
              padding: "0.6rem 1rem",
              cursor: isPreparing ? "not-allowed" : "pointer",
            }}
          >
            {isPreparing
              ? "Προετοιμασία JSON..."
              : "Προετοιμασία δεδομένων από JSON"}
          </button>
        </div>
      )}
    </section>
  );
}

function formatNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "—";
  }

  return numberValue.toLocaleString("el-GR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const sectionStyle = {
  marginTop: "1rem",
  marginBottom: "1rem",
  border: "1px solid #93c5fd",
  borderRadius: "8px",
  padding: "1rem",
  background: "#eff6ff",
};

const summaryStyle = {
  marginTop: "1rem",
  border: "1px solid #bfdbfe",
  borderRadius: "6px",
  padding: "0.75rem",
  background: "#ffffff",
};

export default PensionInputJsonImportSection;
