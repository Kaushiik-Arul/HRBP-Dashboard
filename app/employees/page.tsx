import { EmployeeExplorer } from "@/components/employee-explorer";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { employeeDateFilterKeys, employeeOptionFilterKeys } from "@/lib/employee-fields";
import { listEmployees, listFilterOptions } from "@/lib/employees";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function allValues(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value : value ? [value] : [])
    .slice(0, 50)
    .map((item) => item.slice(0, 160));
}

function dateValue(value: string | string[] | undefined) {
  const date = firstValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const params = await searchParams;

  const search = firstValue(params.search).slice(0, 160);
  const page = Number(firstValue(params.page)) || 1;
  const filters = Object.fromEntries([
    ...employeeOptionFilterKeys
      .map((key) => [key, allValues(params[key])] as const)
      .filter(([, values]) => values.length),
    ...employeeDateFilterKeys
      .map((key) => [key, {
        from: dateValue(params[`${key}From`]),
        to: dateValue(params[`${key}To`]),
      }] as const)
      .filter(([, range]) => range.from || range.to),
  ]);

  const [list, filterOptions] = await Promise.all([
    listEmployees({ search, filters, page }),
    listFilterOptions(),
  ]);

  return (
    <>
      <PageHeader
        description="Search, review, and update employee master records."
        eyebrow="Employee explorer"
        title="Find and inspect records"
      />
      <EmployeeExplorer
        employees={list.rows}
        filterOptions={filterOptions}
        filters={filters}
        page={list.page}
        pageCount={list.pageCount}
        pageSize={list.pageSize}
        search={search}
        totalCount={list.totalCount}
      />
    </>
  );
}

