import { HabitDetail } from "./habit-detail";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ habitId: string }>;
}) {
  const { habitId } = await params;

  return <HabitDetail habitId={habitId} />;
}
