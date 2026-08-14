import { ProfileSubPage, StatRows } from "@/components/profile-subpage";
import { MOCK_FOOD_SNAPSHOT } from "@/lib/portal-mocks";

export default function NutritionPage() {
  return (
    <ProfileSubPage
      title="Nutrition"
      intro="Daily targets for this block. Ranges rather than fixed numbers, so training days and rest days both fit."
    >
      <StatRows
        stats={[
          { label: "Calories", value: MOCK_FOOD_SNAPSHOT.calories },
          { label: "Protein", value: MOCK_FOOD_SNAPSHOT.protein },
          { label: "Carbs", value: MOCK_FOOD_SNAPSHOT.carbs },
          { label: "Fat", value: MOCK_FOOD_SNAPSHOT.fat },
        ]}
      />
    </ProfileSubPage>
  );
}
