import { DayView } from "./day-view";

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;

  return <DayView day={Number(day)} />;
}
