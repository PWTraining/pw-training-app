import { ProfileSubPage, StatRows } from "@/components/profile-subpage";
import { MOCK_HEALTH_STATS } from "@/lib/portal-mocks";

export default function MetricsPage() {
  return (
    <ProfileSubPage
      title="Metrics"
      intro="Measurements taken at the start of each block. Trends matter more than any single number."
    >
      <StatRows stats={MOCK_HEALTH_STATS} />
    </ProfileSubPage>
  );
}
