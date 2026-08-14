import { ProfileSubPage } from "@/components/profile-subpage";
import { MeasurementList } from "@/components/measurement-list";
import { DEFAULT_METRICS } from "@/lib/portal-mocks";

export default function MetricsPage() {
  return (
    <ProfileSubPage title="Metrics">
      <MeasurementList storageKey="pw-profile-measurements" catalogue={DEFAULT_METRICS} />
    </ProfileSubPage>
  );
}
