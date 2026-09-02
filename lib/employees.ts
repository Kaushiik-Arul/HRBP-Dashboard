import "server-only";

import { z } from "zod";

import { database } from "@/lib/db";
import {
  employeeEditableFields,
  employeeFields,
  employeeSummaryFields,
  type EmployeeFieldKey,
} from "@/lib/employee-fields";

// Physical column names for public.name_list live ONLY here and are never sent to the client.
const columnByKey: Record<EmployeeFieldKey, string> = {
  persNo: "pers_no",
  name: "personnel_number",
  email: "official_email",
  primaryHrbp: "primary_hrbp_global_id",
  secondaryHrbp: "secondary_hrbp_global_id_name",
  range: "employee_range",
  designation: "designation",
  function: "function_name",
  employeeGroup: "employee_group",
  employeeSubgroup: "employee_subgroup",
  psGroup: "ps_group",
  organizationalUnit: "organizational_unit",
  corpPlant: "corp_plant",
  organizationalArea: "organizational_area",
  genderKey: "gender_key",
  locationName: "location_name",
  ntId: "nt_id",
  globalId: "global_id",
  costCenter: "cost_center",
  birthDate: "birth_date",
  joiningDate: "joining_date",
  retirementDate: "retirement_date",
  technicalEntryDate: "technical_entry_date",
  monthYear: "month_year",
  tp: "tp",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const fieldByKey = new Map(employeeFields.map((field) => [field.key, field]));

function selectExpr(key: EmployeeFieldKey) {
  const field = fieldByKey.get(key)!;
  const column = columnByKey[key];
  if (field.kind === "date") return `to_char(${column}, 'YYYY-MM-DD') as "${key}"`;
  if (field.kind === "timestamp") {
    return `to_char(${column} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "${key}"`;
  }
  return `${column} as "${key}"`;
}

const summarySelectSql = employeeSummaryFields.map((field) => selectExpr(field.key)).join(", ");
const detailSelectSql = employeeFields.map((field) => selectExpr(field.key)).join(", ");

export type EmployeeSummary = Record<(typeof employeeSummaryFields)[number]["key"], string | null>;
export type EmployeeDetail = Record<EmployeeFieldKey, string | null>;

// --- Validation --------------------------------------------------------

function textValidator(maxLength = 160) {
  return z
    .union([z.string().trim().max(maxLength), z.null()])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value));
}

function emailValidator(maxLength = 320) {
  return z
    .union([z.literal(""), z.null(), z.string().trim().max(maxLength).email("Enter a valid email address.")])
    .optional()
    .transform((value) => (value === "" || value === undefined || value === null ? null : value.toLowerCase()));
}

function dateValidator() {
  return z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date format."),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value))
    .refine(
      (value) => value === null || !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
      "Enter a valid date.",
    );
}

const updateShape: Record<string, z.ZodTypeAny> = {};
for (const field of employeeEditableFields) {
  updateShape[field.key] =
    field.kind === "date"
      ? dateValidator()
      : field.kind === "email"
        ? emailValidator(field.maxLength)
        : textValidator(field.maxLength);
}

export const updateEmployeeSchema = z
  .object(updateShape)
  .strict()
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export type EmployeeUpdateInput = z.infer<typeof updateEmployeeSchema>;

export const persNoSchema = z.string().trim().min(1, "Personnel number is required.").max(50);

// --- Search / filter -----------------------------------------------------

const MAX_PAGE_SIZE = 25;
const MAX_EXPORT_ROWS = 5000;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export type EmployeeListFilters = {
  function?: string;
  range?: string;
  designation?: string;
};

function buildWhereClause(search: string | undefined, filters: EmployeeListFilters | undefined) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.push(`%${escapeLikePattern(trimmedSearch)}%`);
    const placeholder = `$${params.length}`;
    conditions.push(
      `(personnel_number ILIKE ${placeholder} ESCAPE '\\' OR pers_no ILIKE ${placeholder} ESCAPE '\\' OR official_email ILIKE ${placeholder} ESCAPE '\\' OR designation ILIKE ${placeholder} ESCAPE '\\')`,
    );
  }

  const filterColumns: [keyof EmployeeListFilters, string][] = [
    ["function", "function_name"],
    ["range", "employee_range"],
    ["designation", "designation"],
  ];
  for (const [filterKey, column] of filterColumns) {
    const value = filters?.[filterKey]?.trim();
    if (value) {
      params.push(value);
      conditions.push(`${column} = $${params.length}`);
    }
  }

  return { whereSql: conditions.length ? `where ${conditions.join(" and ")}` : "", params };
}

export type EmployeeListResult = {
  rows: EmployeeSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
};

export async function listEmployees(options: {
  search?: string;
  filters?: EmployeeListFilters;
  page?: number;
  pageSize?: number;
}): Promise<EmployeeListResult> {
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(options.pageSize ?? MAX_PAGE_SIZE)));
  const requestedPage = Math.max(1, Math.trunc(options.page ?? 1));
  const { whereSql, params } = buildWhereClause(options.search, options.filters);

  const countResult = await database().query<{ total: string }>(
    `select count(*)::text as total from public.name_list ${whereSql}`,
    params,
  );
  const totalCount = Number(countResult.rows[0]?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const offset = (page - 1) * pageSize;

  const dataParams = [...params, pageSize, offset];
  const rowsResult = await database().query(
    `select ${summarySelectSql}
       from public.name_list
       ${whereSql}
      order by lower(personnel_number) asc nulls last, pers_no asc
      limit $${dataParams.length - 1} offset $${dataParams.length}`,
    dataParams,
  );

  return { rows: rowsResult.rows as EmployeeSummary[], page, pageSize, totalCount, pageCount };
}

export async function getEmployeeDetail(persNo: string): Promise<EmployeeDetail | null> {
  const result = await database().query(
    `select ${detailSelectSql} from public.name_list where pers_no = $1 limit 1`,
    [persNo],
  );
  return (result.rows[0] as EmployeeDetail | undefined) ?? null;
}

export type EmployeeFilterOptions = {
  functions: string[];
  ranges: string[];
  designations: string[];
};

export async function listFilterOptions(): Promise<EmployeeFilterOptions> {
  const result = await database().query<{
    function_name: string | null;
    employee_range: string | null;
    designation: string | null;
  }>(`select distinct function_name, employee_range, designation from public.name_list`);

  const functions = new Set<string>();
  const ranges = new Set<string>();
  const designations = new Set<string>();
  for (const row of result.rows) {
    if (row.function_name) functions.add(row.function_name);
    if (row.employee_range) ranges.add(row.employee_range);
    if (row.designation) designations.add(row.designation);
  }

  const sort = (values: Set<string>) => [...values].sort((a, b) => a.localeCompare(b));
  return { functions: sort(functions), ranges: sort(ranges), designations: sort(designations) };
}

// --- Mutations (update + export, both audited; no delete) ---------------

export type EmployeeActor = { userId: string; email: string; role: string };

export type EmployeeUpdateResult =
  | { updated: true; changedFields: string[] }
  | { updated: false; reason: "not_found" | "no_changes" };

export async function updateEmployee(
  persNo: string,
  patch: Partial<Record<EmployeeFieldKey, string | null>>,
  actor: EmployeeActor,
): Promise<EmployeeUpdateResult> {
  const entries = Object.entries(patch).filter(
    ([key, value]) => value !== undefined && fieldByKey.get(key)?.editable,
  ) as [EmployeeFieldKey, string | null][];

  if (entries.length === 0) return { updated: false, reason: "no_changes" };

  const client = await database().connect();
  try {
    await client.query("begin");

    const currentSelect = entries.map(([key]) => `${columnByKey[key]} as "${key}"`).join(", ");
    const currentResult = await client.query(
      `select ${currentSelect} from public.name_list where pers_no = $1 for update`,
      [persNo],
    );
    const current = currentResult.rows[0] as Record<string, string | null> | undefined;
    if (!current) {
      await client.query("rollback");
      return { updated: false, reason: "not_found" };
    }

    const setClauses: string[] = [];
    const params: unknown[] = [];
    const changes: { field: EmployeeFieldKey; oldValue: string | null; newValue: string | null }[] = [];

    for (const [key, newValue] of entries) {
      const oldValue = current[key] ?? null;
      if (oldValue === newValue) continue;
      params.push(newValue);
      setClauses.push(`${columnByKey[key]} = $${params.length}`);
      changes.push({ field: key, oldValue, newValue });
    }

    if (setClauses.length === 0) {
      await client.query("rollback");
      return { updated: false, reason: "no_changes" };
    }

    params.push(persNo);
    await client.query(
      `update public.name_list set ${setClauses.join(", ")} where pers_no = $${params.length}`,
      params,
    );

    for (const change of changes) {
      await client.query(
        `insert into public.name_list_audit
           (action, pers_no, field, old_value, new_value, actor_user_id, actor_email, actor_role)
         values ('update', $1, $2, $3, $4, $5, $6, $7)`,
        [persNo, change.field, change.oldValue, change.newValue, actor.userId, actor.email, actor.role],
      );
    }

    await client.query("commit");
    return { updated: true, changedFields: changes.map((change) => change.field) };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function exportEmployees(
  options: { search?: string; filters?: EmployeeListFilters },
  actor: EmployeeActor,
): Promise<EmployeeSummary[]> {
  const { whereSql, params } = buildWhereClause(options.search, options.filters);
  const result = await database().query(
    `select ${summarySelectSql}
       from public.name_list
       ${whereSql}
      order by lower(personnel_number) asc nulls last, pers_no asc
      limit ${MAX_EXPORT_ROWS}`,
    params,
  );
  const rows = result.rows as EmployeeSummary[];

  await database().query(
    `insert into public.name_list_audit
       (action, pers_no, field, old_value, new_value, actor_user_id, actor_email, actor_role)
     values ('export', null, 'row_count', null, $1, $2, $3, $4)`,
    [String(rows.length), actor.userId, actor.email, actor.role],
  );

  return rows;
}
