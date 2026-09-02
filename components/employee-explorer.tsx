"use client";

import { Download, Eye, LoaderCircle, Pencil, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import { exportEmployeesCsv, revealEmployee, saveEmployee, type EmployeeActionState } from "@/app/actions/employees";
import {
  employeeDateFilterFields,
  employeeDateFilterKeys,
  employeeDetailSections,
  employeeEditableFields,
  employeeExportFields,
  employeeExportKeys,
  employeeFields,
  employeeOptionFilterFields,
  employeeOptionFilterKeys,
  employeeSummaryFields,
  type EmployeeDateFilterKey,
  type EmployeeFieldKey,
  type EmployeeOptionFilterKey,
} from "@/lib/employee-fields";
import type { EmployeeDateRange, EmployeeDetail, EmployeeFilterOptions, EmployeeListFilters, EmployeeSummary } from "@/lib/employees";

type Props = {
  employees: EmployeeSummary[];
  filterOptions: EmployeeFilterOptions;
  filters: EmployeeListFilters;
  page: number;
  pageCount: number;
  pageSize: number;
  search: string;
  totalCount: number;
};

const initialActionState: EmployeeActionState = {};

function csvValue(value: string | null | undefined) {
  if (value == null) return "";
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function EmployeeExplorer({
  employees,
  filterOptions,
  filters,
  page,
  pageCount,
  pageSize,
  search,
  totalCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [editing, setEditing] = useState<{ persNo: string; detail: EmployeeDetail } | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [selectedExportFields, setSelectedExportFields] = useState<EmployeeFieldKey[]>([...employeeExportKeys]);
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExport] = useTransition();

  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  useEffect(() => {
    if (searchInput === search) return;
    const handle = setTimeout(() => navigate({ search: searchInput, page: 1 }), 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function navigate(next: { search?: string; page?: number; filters?: EmployeeListFilters }) {
    const nextSearch = next.search ?? search;
    const nextFilters = next.filters ?? filters;
    const nextPage = next.page ?? page;

    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    for (const key of employeeOptionFilterKeys) {
      for (const value of nextFilters[key] ?? []) params.append(key, value);
    }
    for (const key of employeeDateFilterKeys) {
      const range = nextFilters[key];
      if (range?.from) params.set(`${key}From`, range.from);
      if (range?.to) params.set(`${key}To`, range.to);
    }
    if (nextPage > 1) params.set("page", String(nextPage));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleOption(key: EmployeeOptionFilterKey, value: string) {
    const selected = filters[key] ?? [];
    const nextSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    navigate({ filters: { ...filters, [key]: nextSelected.length ? nextSelected : undefined }, page: 1 });
  }

  function updateDateRange(key: EmployeeDateFilterKey, part: keyof EmployeeDateRange, value: string) {
    const nextRange = { ...filters[key], [part]: value || undefined };
    navigate({
      filters: {
        ...filters,
        [key]: nextRange.from || nextRange.to ? nextRange : undefined,
      },
      page: 1,
    });
  }

  function openDetail(persNo: string) {
    setDetailError(null);
    startTransition(async () => {
      const result = await revealEmployee(persNo);
      if ("error" in result) setDetailError(result.error);
      else setDetail(result.detail);
    });
  }

  function openEdit(persNo: string) {
    setDetailError(null);
    startTransition(async () => {
      const result = await revealEmployee(persNo);
      if ("error" in result) setDetailError(result.error);
      else setEditing({ persNo, detail: result.detail });
    });
  }

  function exportCsv() {
    setExportError(null);
    startExport(async () => {
      const result = await exportEmployeesCsv({ search, filters, fields: selectedExportFields });
      if ("error" in result) {
        setExportError(result.error);
        return;
      }

      const selectedFields = employeeExportFields.filter((field) => selectedExportFields.includes(field.key));
      const header = selectedFields.map((field) => csvValue(field.label)).join(",");
      const lines = result.rows.map((row) =>
        selectedFields.map((field) => csvValue(row[field.key])).join(","),
      );
      const blob = new Blob([`\uFEFF${[header, ...lines].join("\r\n")}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
    });
  }

  function toggleExportField(key: EmployeeFieldKey) {
    setSelectedExportFields((selected) => selected.includes(key)
      ? selected.filter((field) => field !== key)
      : employeeExportKeys.filter((field) => field === key || selected.includes(field)));
  }

  const activeFilterCount = employeeOptionFilterKeys.reduce((count, key) => count + (filters[key]?.length ?? 0), 0)
    + employeeDateFilterKeys.reduce((count, key) => count + (filters[key]?.from || filters[key]?.to ? 1 : 0), 0);
  const firstRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecord = Math.min(page * pageSize, totalCount);

  return (
    <>
      <section className="workforce-filter-form employee-filter-form">
        <div className="employee-filter-heading">
          <div>
            <h2>Find employee records</h2>
            <p>Search by personnel number, NT ID, global ID, or official email.</p>
          </div>
          <p><strong>{totalCount}</strong> records found</p>
        </div>

        <span className="employee-search-label">Search</span>
        <div className="employee-search-actions">
          <div className="search-box">
            <Search aria-hidden="true" size={16} />
            <input
              aria-label="Search employees"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Pers. no., name, NT ID, global ID, or official email"
              type="search"
              value={searchInput}
            />
          </div>
          <button className="action-button employee-filter-toggle" onClick={() => setShowFilters((value) => !value)} type="button">
            <SlidersHorizontal aria-hidden="true" size={15} />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
        </div>

        {showFilters ? (
          <div className="employee-filter-drawer">
            <div className="employee-option-filters">
              {employeeOptionFilterFields.map((field) => {
                const key = field.key as EmployeeOptionFilterKey;
                return (
                  <MultiSelectFilter
                    key={key}
                    label={field.label}
                    onToggle={(value) => toggleOption(key, value)}
                    options={filterOptions[key]}
                    selected={filters[key] ?? []}
                  />
                );
              })}
            </div>
            <div className="employee-date-filters">
              {employeeDateFilterFields.map((field) => {
                const key = field.key as EmployeeDateFilterKey;
                const range = filters[key] ?? {};
                return (
                  <fieldset className="employee-date-filter" key={key}>
                    <legend>{field.label}</legend>
                    <label><span>From</span><input onChange={(event) => updateDateRange(key, "from", event.target.value)} type="date" value={range.from ?? ""} /></label>
                    <label><span>To</span><input onChange={(event) => updateDateRange(key, "to", event.target.value)} type="date" value={range.to ?? ""} /></label>
                  </fieldset>
                );
              })}
            </div>
            <div className="employee-filter-footer">
              <span>{activeFilterCount ? `${activeFilterCount} selected` : "No filters selected"}</span>
              <button className="action-button" disabled={!activeFilterCount} onClick={() => navigate({ filters: {}, page: 1 })} type="button">
                <RotateCcw aria-hidden="true" size={14} />
                Reset filters
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {exportError ? <p className="employee-form-error">{exportError}</p> : null}
      {detailError ? <p className="employee-form-error">{detailError}</p> : null}

      <section className="panel employee-panel">
        <div className="employee-panel-header">
          <div>
            <h2>Employee master</h2>
            <p>Showing {firstRecord}-{lastRecord} of {totalCount} records</p>
          </div>
          <div className="employee-header-actions">
            <span className="panel-badge">Page {page} of {pageCount}</span>
            <button className="action-button" onClick={() => setShowExport(true)} type="button">
              <Download aria-hidden="true" size={15} />
              Export filtered
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table employee-table employee-directory-table">
            <thead>
              <tr>
                {employeeSummaryFields.map((field) => <th key={field.key}>{field.label}</th>)}
                <th><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={employeeSummaryFields.length + 1}>No employees match the current search and filters.</td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.persNo}>
                    {employeeSummaryFields.map((field) => (
                      <td key={field.key}>{employee[field.key as keyof EmployeeSummary] ?? "—"}</td>
                    ))}
                    <td>
                      <div className="employee-row-actions">
                        <button aria-label={`View ${employee.name ?? employee.persNo}`} disabled={isPending} onClick={() => openDetail(employee.persNo!)} title="View employee" type="button">
                          <Eye aria-hidden="true" size={15} />
                        </button>
                        <button aria-label={`Edit ${employee.name ?? employee.persNo}`} disabled={isPending} onClick={() => openEdit(employee.persNo!)} title="Edit employee" type="button">
                          <Pencil aria-hidden="true" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => navigate({ page: page - 1 })} type="button">Previous</button>
          <span>Page {page} of {pageCount}</span>
          <button disabled={page >= pageCount} onClick={() => navigate({ page: page + 1 })} type="button">Next</button>
        </div>
      </section>

      {detail ? <DetailModal detail={detail} onClose={() => setDetail(null)} /> : null}
      {editing ? <EditModal detail={editing.detail} onClose={() => setEditing(null)} persNo={editing.persNo} /> : null}
      {showExport ? (
        <div className="employee-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExport(false); }} role="dialog" aria-modal="true">
          <div className="employee-modal employee-export-modal">
            <header>
              <div>
                <span>Filtered export</span>
                <h2>Choose export fields</h2>
                <p>{totalCount} matching records will be included.</p>
              </div>
              <button aria-label="Close" onClick={() => setShowExport(false)} type="button"><X aria-hidden="true" size={18} /></button>
            </header>
            <div className="employee-export-toolbar">
              <strong>{selectedExportFields.length} of {employeeExportFields.length} selected</strong>
              <div>
                <button onClick={() => setSelectedExportFields([...employeeExportKeys])} type="button">Select all</button>
                <button onClick={() => setSelectedExportFields([])} type="button">Clear</button>
              </div>
            </div>
            <div className="employee-export-fields">
              {employeeExportFields.map((field, index) => (
                <label key={field.key}>
                  <span className="employee-export-order">{index + 1}</span>
                  <input checked={selectedExportFields.includes(field.key)} onChange={() => toggleExportField(field.key)} type="checkbox" />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>
            {exportError ? <p className="employee-form-error" role="alert">{exportError}</p> : null}
            <footer>
              <button onClick={() => setShowExport(false)} type="button">Cancel</button>
              <button className="action-button employee-export-submit" disabled={!selectedExportFields.length || isExporting} onClick={exportCsv} type="button">
                {isExporting ? <LoaderCircle aria-hidden="true" className="spin" size={15} /> : <Download aria-hidden="true" size={15} />}
                Export CSV
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MultiSelectFilter({
  label,
  onToggle,
  options,
  selected,
}: {
  label: string;
  onToggle: (value: string) => void;
  options: string[];
  selected: string[];
}) {
  return (
    <details className="employee-multi-filter">
      <summary>
        <span>{label}</span>
        <strong>{selected.length ? `${selected.length} selected` : "All"}</strong>
      </summary>
      <div className="employee-multi-options">
        {options.length ? options.map((option) => (
          <label key={option}>
            <input checked={selected.includes(option)} onChange={() => onToggle(option)} type="checkbox" />
            <span title={option}>{option}</span>
          </label>
        )) : <p>No values available</p>}
      </div>
    </details>
  );
}

function DetailModal({ detail, onClose }: { detail: EmployeeDetail; onClose: () => void }) {
  return (
    <div
      className="employee-modal-backdrop"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="employee-modal employee-detail-modal">
        <header>
          <div>
            <span>Employee profile</span>
            <h2>{detail.name ?? "Employee details"}</h2>
            <p>{detail.persNo}{detail.designation ? ` · ${detail.designation}` : ""}</p>
          </div>
          <button aria-label="Close" onClick={onClose} type="button"><X aria-hidden="true" size={18} /></button>
        </header>
        <div className="employee-detail-sections">
          {employeeDetailSections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <dl>
                {section.keys.map((key) => {
                  const field = employeeFields.find((item) => item.key === key)!;
                  return <div key={key}><dt>{field.label}</dt><dd>{detail[key] ?? "—"}</dd></div>;
                })}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditModal({ detail, onClose, persNo }: { detail: EmployeeDetail; onClose: () => void; persNo: string }) {
  const boundSaveEmployee = saveEmployee.bind(null, persNo);
  const [state, formAction, pending] = useActionState(boundSaveEmployee, initialActionState);

  useEffect(() => {
    if (state.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div
      className="employee-modal-backdrop"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <form action={formAction} className="employee-modal">
        <header>
          <h2>Edit employee — {persNo}</h2>
          <button aria-label="Close" onClick={onClose} type="button"><X aria-hidden="true" size={18} /></button>
        </header>

        {state.message ? <p className="employee-form-error" role="alert">{state.message}</p> : null}

        <div className="employee-form-grid">
          {employeeEditableFields.map((field) => (
            <label className="employee-form-field" key={field.key}>
              <span>{field.label}</span>
              <input
                aria-invalid={Boolean(state.errors?.[field.key])}
                defaultValue={detail[field.key as keyof EmployeeDetail] ?? ""}
                maxLength={"maxLength" in field ? field.maxLength : undefined}
                name={field.key}
                type={field.kind === "date" ? "date" : field.kind === "email" ? "email" : "text"}
              />
              {state.errors?.[field.key] ? <small>{state.errors[field.key]?.[0]}</small> : null}
            </label>
          ))}
        </div>

        <footer>
          <button onClick={onClose} type="button">Cancel</button>
          <button disabled={pending} type="submit">
            {pending ? <LoaderCircle aria-hidden="true" className="spin" size={15} /> : null}
            Save changes
          </button>
        </footer>
      </form>
    </div>
  );
}
