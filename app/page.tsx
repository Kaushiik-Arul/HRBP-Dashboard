import {
  CustomizableOverview,
} from "@/components/customizable-overview";
import {
  demoLifecycle,
  demoOrganization,
  demoOverview,
  demoSupplement,
  demoWorkforce,
} from "@/lib/demo-data";
import { requireUser } from "@/lib/auth/dal";

export default async function OverviewPage() {
  await requireUser();
  return (
    <CustomizableOverview
      lifecycle={demoLifecycle}
      organization={demoOrganization}
      overview={demoOverview}
      supplement={demoSupplement}
      workforce={demoWorkforce}
    />
  );
}
