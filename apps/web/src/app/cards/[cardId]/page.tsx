import { notFound } from "next/navigation";
import { fetchCardDetail } from "../../../lib/api";
import { CardDetailClient } from "../../../components/CardDetailClient";

interface CardDetailPageProps {
  params: { cardId: string };
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const detail = await fetchCardDetail(params.cardId).catch(() => null);
  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <CardDetailClient detail={detail} />
    </main>
  );
}
