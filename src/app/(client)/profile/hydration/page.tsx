import { ProfileSubPage } from "@/components/profile-subpage";
import { EditableStats } from "@/components/editable-stats";
import { DEFAULT_HYDRATION } from "@/lib/portal-mocks";

export default function HydrationPage() {
  return (
    <ProfileSubPage
      title="Hydration"
      intro="How much to drink and when. Training days need more than rest days, so both are here."
    >
      <EditableStats
        storageKey="pw-profile-hydration"
        defaults={DEFAULT_HYDRATION}
        addLabel="+ Add a target"
      />
    </ProfileSubPage>
  );
}
