import { ProfileSubPage } from "@/components/profile-subpage";
import { EditableStats } from "@/components/editable-stats";
import { DEFAULT_NUTRITION } from "@/lib/portal-mocks";

export default function NutritionPage() {
  return (
    <ProfileSubPage
      title="Nutrition"
      intro="Daily targets for this block. Ranges rather than fixed numbers, so training days and rest days both fit."
    >
      <EditableStats
        storageKey="pw-profile-nutrition"
        defaults={DEFAULT_NUTRITION}
        addLabel="+ Add a target"
      />
    </ProfileSubPage>
  );
}
