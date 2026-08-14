import { ProfileSubPage, StatRows } from "@/components/profile-subpage";
import { MOCK_METRICS } from "@/lib/portal-mocks";

export default function TestingPage() {
  return (
    <ProfileSubPage
      title="Testing"
      intro="Benchmarks retested at the end of each block, so progress shows up as performance and not just as weight."
    >
      <StatRows stats={MOCK_METRICS} />
    </ProfileSubPage>
  );
}
