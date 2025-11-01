import { notFound } from "next/navigation";
import { fetchPublicCard } from "../../../lib/api";
import { StampgameGrid } from "../../../components/StampgameGrid";

interface PublicCardPageProps {
  params: { slug: string };
}

export default async function PublicCardPage({ params }: PublicCardPageProps) {
  const detail = await fetchPublicCard(params.slug).catch(() => null);
  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{detail.card.title}</h1>
        {detail.card.description ? (
          <p className="text-sm text-zinc-600">{detail.card.description}</p>
        ) : null}
      </header>
      <StampgameGrid stamps={detail.stamps} showDate />
    </main>
  );
}
