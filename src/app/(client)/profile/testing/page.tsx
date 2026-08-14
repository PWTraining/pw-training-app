import { ProfileSubPage } from "@/components/profile-subpage";
import { EditableStats } from "@/components/editable-stats";
import { DEFAULT_TESTING } from "@/lib/portal-mocks";

export default function TestingPage() {
  return (
    <ProfileSubPage
      title="Testing"
    >
      <EditableStats
        storageKey="pw-profile-testing"
        defaults={DEFAULT_TESTING}
        addLabel="+ Add a test"
      />
    </ProfileSubPage>
  );
}
