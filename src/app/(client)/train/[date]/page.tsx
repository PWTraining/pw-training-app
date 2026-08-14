import { SessionView } from "./session-view";

export default async function SessionPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  return <SessionView dateKey={date} />;
}
