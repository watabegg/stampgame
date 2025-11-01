import { fetchDashboardCards, fetchMe } from "../../lib/api";
import { DashboardClient } from "../../components/DashboardClient";

export default async function DashboardPage() {
  const [cards, me] = await Promise.all([
    fetchDashboardCards().catch(() => []),
    fetchMe().catch(() => undefined),
  ]);

  return <DashboardClient initialCards={cards} initialMe={me} />;
}
