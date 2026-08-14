import { ProfileSubPage } from "@/components/profile-subpage";
import { ProgressPhotos } from "@/components/progress-photos";

export default function ProgressPhotosPage() {
  return (
    <ProfileSubPage
      title="Progress Photos"
      intro="Front, back and side on the same day. Compare any two shoots side by side."
    >
      <ProgressPhotos />
    </ProfileSubPage>
  );
}
