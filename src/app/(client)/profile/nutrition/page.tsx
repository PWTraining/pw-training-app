import { ProfileSubPage } from "@/components/profile-subpage";
import { EditableStats } from "@/components/editable-stats";
import { DEFAULT_NUTRITION } from "@/lib/portal-mocks";

export default function NutritionPage() {
  return (
    <ProfileSubPage
      title="Nutrition"
    >
      <EditableStats
        storageKey="pw-profile-nutrition"
        defaults={DEFAULT_NUTRITION}
        addLabel="+ Add a target"
      />
    </ProfileSubPage>
  );
}
