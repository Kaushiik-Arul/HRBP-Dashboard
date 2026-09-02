// Client-safe field metadata for the employee directory.
// Physical database column names live only in lib/employees.ts (server-only) and never appear here.

export type EmployeeFieldKind = "text" | "email" | "date" | "timestamp";

export type EmployeeFieldMeta = {
  key: string;
  label: string;
  kind: EmployeeFieldKind;
  editable: boolean;
  summary: boolean;
  maxLength?: number;
};

export const employeeFields = [
  { key: "persNo", label: "Pers. No.", kind: "text", editable: false, summary: true },
  { key: "name", label: "Name", kind: "text", editable: true, summary: true, maxLength: 160 },
  { key: "email", label: "Email", kind: "email", editable: true, summary: true, maxLength: 320 },
  { key: "primaryHrbp", label: "Primary HRBP", kind: "text", editable: true, summary: true, maxLength: 80 },
  { key: "secondaryHrbp", label: "Secondary HRBP", kind: "text", editable: true, summary: true, maxLength: 160 },
  { key: "range", label: "Range", kind: "text", editable: true, summary: true, maxLength: 80 },
  { key: "designation", label: "Designation", kind: "text", editable: true, summary: true, maxLength: 160 },
  { key: "function", label: "Function", kind: "text", editable: true, summary: true, maxLength: 160 },
  { key: "employeeGroup", label: "Employee group", kind: "text", editable: true, summary: false, maxLength: 80 },
  { key: "employeeSubgroup", label: "Employee subgroup", kind: "text", editable: true, summary: false, maxLength: 80 },
  { key: "psGroup", label: "PS group", kind: "text", editable: true, summary: false, maxLength: 80 },
  { key: "organizationalUnit", label: "Organizational unit", kind: "text", editable: true, summary: false, maxLength: 160 },
  { key: "corpPlant", label: "Corp / plant", kind: "text", editable: true, summary: false, maxLength: 160 },
  { key: "organizationalArea", label: "Organizational area", kind: "text", editable: true, summary: false, maxLength: 160 },
  { key: "genderKey", label: "Gender", kind: "text", editable: true, summary: false, maxLength: 10 },
  { key: "locationName", label: "Location", kind: "text", editable: true, summary: false, maxLength: 160 },
  { key: "ntId", label: "NT ID", kind: "text", editable: true, summary: false, maxLength: 40 },
  { key: "globalId", label: "Global ID", kind: "text", editable: true, summary: false, maxLength: 40 },
  { key: "costCenter", label: "Cost center", kind: "text", editable: true, summary: false, maxLength: 80 },
  { key: "birthDate", label: "Birth date", kind: "date", editable: true, summary: false },
  { key: "joiningDate", label: "Joining date", kind: "date", editable: true, summary: false },
  { key: "retirementDate", label: "Retirement date", kind: "date", editable: true, summary: false },
  { key: "technicalEntryDate", label: "Technical entry date", kind: "date", editable: true, summary: false },
  { key: "monthYear", label: "Month / year", kind: "text", editable: true, summary: false, maxLength: 40 },
  { key: "tp", label: "TP", kind: "text", editable: true, summary: false, maxLength: 40 },
  { key: "createdAt", label: "Created", kind: "timestamp", editable: false, summary: false },
  { key: "updatedAt", label: "Updated", kind: "timestamp", editable: false, summary: false },
] as const satisfies readonly EmployeeFieldMeta[];

export type EmployeeFieldKey = (typeof employeeFields)[number]["key"];

export const employeeSummaryFields = employeeFields.filter((field) => field.summary);
export const employeeEditableFields = employeeFields.filter((field) => field.editable);
