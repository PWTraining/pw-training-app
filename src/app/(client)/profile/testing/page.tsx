import { ProfileSubPage } from "@/components/profile-subpage";
import { EditableStats } from "@/components/editable-stats";
import { DEFAULT_TESTING } from "@/lib/portal-mocks";

export default function TestingPage() {
  return (
    <ProfileSubPage
      title="Testing"
      intro="Lifts, runs and outputs, retested each block so progress shows up as performance and not just as weight."
    >
      <EditableStats
        storageKey="pw-profile-testing"
        defaults={DEFAULT_TESTING}
        addLabel="+ Add a test"
      />
    </ProfileSubPage>
  );
}
