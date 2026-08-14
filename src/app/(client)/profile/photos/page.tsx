import { ProfileSubPage } from "@/components/profile-subpage";
import { ProgressPhotos } from "@/components/progress-photos";

export default function ProgressPhotosPage() {
  return (
    <ProfileSubPage
      title="Progress Photos"
      intro="Taken at the start and end of each block. Photos catch changes the scale misses."
    >
      <ProgressPhotos />
    </ProfileSubPage>
  );
}
