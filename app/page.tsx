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

export default function OverviewPage() {
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
