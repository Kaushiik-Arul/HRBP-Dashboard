import { EmployeeExplorer } from "@/components/employee-explorer";
import { PageHeader } from "@/components/ui";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[] }>;
}) {
  const rawSearch = (await searchParams).search;
  const initialSearch = Array.isArray(rawSearch) ? rawSearch[0] ?? "" : rawSearch ?? "";

  return (
    <>
      <PageHeader
        description="Search and inspect frontend demo employee records. Changes last for the current session."
        eyebrow="Employee explorer"
        title="Find and inspect records"
      />
      <EmployeeExplorer initialSearch={initialSearch.slice(0, 80)} key={initialSearch} />
    </>
  );
}
