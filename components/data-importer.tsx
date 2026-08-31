"use client";

import { parse } from "csv-parse/browser/esm/sync";
import {
  Check,
  CircleAlert,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCcw,
  Upload,
} from "lucide-react";
import { readSheet } from "read-excel-file/browser";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

import {
  ImportValidation,
  SpreadsheetCell,
  validateSpreadsheetRows,
} from "@/lib/employee-import";

const maxFileBytes = 5 * 1024 * 1024;
const maxEmployeeRows = 5000;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function DataImporter() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [validation, setValidation] = useState<ImportValidation | null>(null);

  const validRows = validation?.rows.filter((row) => row.issues.length === 0) ?? [];
  const invalidRows = validation?.rows.filter((row) => row.issues.length > 0) ?? [];
  const canImport = Boolean(validation && !validation.missingColumns.length && validRows.length && !invalidRows.length);

  function resetImport() {
    setFile(null);
    setImportError(null);
    setImportedCount(null);
    setValidation(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function parseFile(selectedFile: File) {
    setImportError(null);
    setImportedCount(null);
    setValidation(null);

    const extension = selectedFile.name.split(".").pop()?.toLocaleLowerCase();
    if (extension !== "csv" && extension !== "xlsx") {
      setImportError("Choose an Excel .xlsx or CSV .csv file.");
      return;
    }
    if (selectedFile.size > maxFileBytes) {
      setImportError("The file is larger than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    try {
      let rows: SpreadsheetCell[][];
      if (extension === "csv") {
        rows = parse(await selectedFile.text(), {
          bom: true,
          relax_column_count: true,
          skip_empty_lines: true,
          trim: true,
        }) as string[][];
      } else {
        rows = await readSheet(selectedFile) as SpreadsheetCell[][];
      }

      if (rows.length - 1 > maxEmployeeRows) {
        setImportError(`This file has more than ${maxEmployeeRows.toLocaleString()} employee rows.`);
        return;
      }

      const result = validateSpreadsheetRows(rows);
      if (!result.rows.length && !result.missingColumns.length) {
        setImportError("The file contains headers but no employee rows.");
        return;
      }
      setValidation(result);
    } catch (error) {
      console.error("Employee file parsing failed", error);
      setImportError("The file could not be read. Confirm that it is a valid Excel or CSV file.");
    } finally {
      setParsing(false);
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) void parseFile(selectedFile);
  }

  function dropFile(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const selectedFile = event.dataTransfer.files?.[0];
    if (selectedFile) void parseFile(selectedFile);
  }

  function importEmployees() {
    if (!canImport) return;
    setImporting(true);
    setImportError(null);
    setImportedCount(validRows.length);
    setImporting(false);
  }

  return (
    <section className="data-import-workflow">
      <div className="import-steps" aria-label="Import progress">
        <span className="complete"><b>1</b>Upload</span>
        <i />
        <span className={validation ? "complete" : ""}><b>2</b>Validate & preview</span>
        <i />
        <span className={importedCount !== null ? "complete" : ""}><b>3</b>Preview import</span>
      </div>

      <article className="panel data-upload-panel">
        <header className="data-upload-header">
          <div>
            <h2>Upload employee file</h2>
            <p>Excel .xlsx or CSV · first row must contain column headers · maximum 5,000 employees</p>
          </div>
          {file ? <button className="action-button" disabled={parsing || importing} onClick={resetImport} type="button"><RefreshCcw aria-hidden="true" size={14} />Choose another</button> : null}
        </header>

        {!file ? (
          <div
            className={`data-dropzone${dragActive ? " is-dragging" : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropFile}
          >
            <span><Upload aria-hidden="true" size={25} /></span>
            <h3>Drop an Excel or CSV file here</h3>
            <p>The file is checked and previewed before anything is saved.</p>
            <button className="action-button primary" onClick={() => fileInput.current?.click()} type="button">Browse files</button>
          </div>
        ) : (
          <div className="data-file-card">
            <span><FileSpreadsheet aria-hidden="true" size={22} /></span>
            <div><strong>{file.name}</strong><small>{formatFileSize(file.size)}</small></div>
            {parsing ? <em><LoaderCircle aria-hidden="true" className="spin" size={16} />Reading file…</em> : validation ? <em className="ready"><Check aria-hidden="true" size={16} />Ready for review</em> : null}
          </div>
        )}
        <input accept=".xlsx,.csv" className="sr-only" onChange={chooseFile} ref={fileInput} type="file" />

        {importError ? <div className="data-import-error" role="alert"><CircleAlert aria-hidden="true" size={17} /><span>{importError}</span></div> : null}
        {importedCount !== null ? (
          <div className="data-import-success" role="status">
            <Check aria-hidden="true" size={18} />
            <div><strong>{importedCount.toLocaleString()} employees accepted</strong><span>This frontend preview does not persist imported records.</span></div>
          </div>
        ) : null}
      </article>

      {validation ? (
        <article className="panel data-validation-panel">
          <header className="data-validation-header">
            <div><h2>Validation summary</h2><p>Review the file before importing it into the employee master.</p></div>
            <span className={invalidRows.length || validation.missingColumns.length ? "has-errors" : "is-ready"}>
              {invalidRows.length || validation.missingColumns.length ? "Needs attention" : "Ready to import"}
            </span>
          </header>

          <div className="data-validation-stats">
            <article><span>Rows found</span><strong>{validation.rows.length}</strong></article>
            <article><span>Valid rows</span><strong>{validRows.length}</strong></article>
            <article className={invalidRows.length ? "warning" : ""}><span>Rows with issues</span><strong>{invalidRows.length}</strong></article>
          </div>

          {validation.missingColumns.length ? (
            <div className="missing-columns"><strong>Required columns are missing</strong><p>{validation.missingColumns.join(", ")}</p></div>
          ) : null}

          {validation.rows.length ? (
            <>
              <div className="data-preview-heading"><div><h3>Employee preview</h3><p>Showing the first {Math.min(validation.rows.length, 12)} rows from the file.</p></div></div>
              <div className="table-scroll data-preview-scroll">
                <table className="data-table data-preview-table">
                  <thead><tr><th>Row</th><th>Personnel no.</th><th>Group</th><th>Function</th><th>Location</th><th>Gender</th><th>Birth date</th><th>Joining date</th><th>Retirement</th><th>Designation</th><th>Status</th></tr></thead>
                  <tbody>
                    {validation.rows.slice(0, 12).map((row) => (
                      <tr className={row.issues.length ? "invalid" : ""} key={row.rowNumber}>
                        <td>{row.rowNumber}</td>
                        <td><strong className="mono">{row.employee.personnel_number || "—"}</strong></td>
                        <td>{row.employee.employee_group || "—"}</td>
                        <td>{row.employee.function_name || "—"}</td>
                        <td>{row.employee.location_name || "—"}</td>
                        <td>{row.employee.gender_key || "—"}</td>
                        <td>{displayDate(row.employee.birth_date)}</td>
                        <td>{displayDate(row.employee.joining_date)}</td>
                        <td>{displayDate(row.employee.retirement_date)}</td>
                        <td>{row.employee.designation || "—"}</td>
                        <td>{row.issues.length ? <span className="preview-status invalid" title={row.issues.join("; ")}>{row.issues.length} issue{row.issues.length === 1 ? "" : "s"}</span> : <span className="preview-status valid">Valid</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          <footer className="data-import-actions">
            <div>
              {invalidRows.length ? <strong>Correct every highlighted row, then upload the file again.</strong> : <strong>{validRows.length.toLocaleString()} employees are ready to be added.</strong>}
              <span>Records stay in this frontend preview and are not sent to a database.</span>
            </div>
            <button className="action-button primary" disabled={!canImport || importing || importedCount !== null} onClick={() => void importEmployees()} type="button">
              {importing ? <LoaderCircle aria-hidden="true" className="spin" size={15} /> : <Upload aria-hidden="true" size={15} />}
              {importing ? "Importing…" : `Import ${validRows.length.toLocaleString()} employees`}
            </button>
          </footer>
        </article>
      ) : null}
    </section>
  );
}
