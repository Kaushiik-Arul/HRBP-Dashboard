import { CustomizableOverview } from "@/components/customizable-overview";
import { demoOverview, demoSupplement } from "@/lib/demo-data";
import { requireUser } from "@/lib/auth/dal";

export default async function OverviewPage() {
  await requireUser();
  return <CustomizableOverview overview={demoOverview} supplement={demoSupplement} />;
}
