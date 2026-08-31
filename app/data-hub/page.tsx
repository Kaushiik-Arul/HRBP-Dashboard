import { DataImporter } from "@/components/data-importer";
import { PageHeader } from "@/components/ui";

export default function DataHubPage() {
  return (
    <>
      <PageHeader
        description="Upload an Excel or CSV file, validate every employee row, and preview the result locally."
        eyebrow="Data operations"
        title="Import employee data"
      />
      <DataImporter />
    </>
  );
}
