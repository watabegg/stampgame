"use client";

import Link from "next/link";
import { Card } from "@stampgame/ui";
import { useDashboardCards, useMe } from "../hooks/useCards";
import type { StampCard } from "@stampgame/db";
import type { MeResult } from "../lib/api";

interface DashboardClientProps {
  initialCards: StampCard[];
  initialMe?: MeResult;
}

export function DashboardClient({ initialCards, initialMe }: DashboardClientProps) {
  const { data: cards } = useDashboardCards(initialCards);
  const { data: me } = useMe(initialMe);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">スタンプカード</h1>
          <p className="text-sm text-zinc-500">
            {me?.profile?.displayName ?? me?.profile?.email ?? "日々の達成を記録しましょう。"}
          </p>
        </div>
        <Link
          href="/cards/new"
          className="inline-flex items-center rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
        >
          新しいカード
        </Link>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {cards && cards.length > 0 ? (
          cards.map((card) => (
            <Link key={card.id} href={`/cards/${card.id}`}>
              <Card title={card.title} description={card.description ?? ""}>
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <span>スタンプ {card.stampCount} / 15</span>
                  {card.dailyLimit ? <span className="text-amber-600">1日1回</span> : null}
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-zinc-500">
            まだカードがありません。右上のボタンから作成してください。
          </p>
        )}
      </section>
    </main>
  );
}
