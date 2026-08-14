import { ProfileSubPage } from "@/components/profile-subpage";
import { EditableStats } from "@/components/editable-stats";
import { DEFAULT_METRICS } from "@/lib/portal-mocks";

export default function MetricsPage() {
  return (
    <ProfileSubPage
      title="Metrics"
      intro="Height, weight, measurements and body composition. Trends matter more than any single number."
    >
      <EditableStats
        storageKey="pw-profile-metrics"
        defaults={DEFAULT_METRICS}
        addLabel="+ Add a measurement"
      />
    </ProfileSubPage>
  );
}
