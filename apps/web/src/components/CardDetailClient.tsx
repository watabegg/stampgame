"use client";

import { useMemo } from "react";
import { StampgameGrid } from "./StampgameGrid";
import { PressButton } from "./PressButton";
import { AssignUserForm } from "./AssignUserForm";
import { ShareDialog } from "./ShareDialog";
import { useToast } from "./Toast";
import { type CardDetail } from "../lib/api";
import {
  useAssignUser,
  useCard,
  useCreateShareLink,
  usePressStamp,
} from "../hooks/useCards";

interface CardDetailClientProps {
  detail: CardDetail;
}

export function CardDetailClient({ detail }: CardDetailClientProps) {
  const { show } = useToast();
  const cardId = detail.card.id;
  const { data, isFetching } = useCard(cardId, detail);
  const pressMutation = usePressStamp(cardId);
  const assignMutation = useAssignUser(cardId);
  const shareMutation = useCreateShareLink(cardId);

  const card = data?.card ?? detail.card;
  const stamps = data?.stamps ?? detail.stamps;
  const shares = data?.shares ?? detail.shares;
  const isCardFull = stamps.length >= 15;

  async function handlePress(slot?: number) {
    try {
      await pressMutation.mutateAsync({ slot });
      show("スタンプを押しました");
    } catch (error) {
      show(error instanceof Error ? error.message : "エラーが発生しました");
    }
  }

  async function handleAssign({ userId }: { userId: string }) {
    try {
      await assignMutation.mutateAsync({ userId });
      show("ユーザーを割り当てました");
    } catch (error) {
      show(error instanceof Error ? error.message : "割り当てに失敗しました");
    }
  }

  async function handleShare(input: { canWrite: boolean; expiresAt?: string }) {
    try {
      const share = await shareMutation.mutateAsync(input);
      show(`共有リンクを作成しました: ${share.slug}`);
    } catch (error) {
      show(error instanceof Error ? error.message : "共有リンクの作成に失敗しました");
    }
  }

  const statusBadges = useMemo(() => {
    const badges = [];
    if (card.dailyLimit) badges.push("1日1回まで");
    badges.push(card.isPublic ? "公開" : "非公開");
    badges.push(card.stampHasDate ? "日付記録あり" : "日付記録なし");
    return badges;
  }, [card.dailyLimit, card.isPublic, card.stampHasDate]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{card.title}</h1>
        {card.description ? (
          <p className="text-sm text-zinc-600">{card.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs">
          {statusBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className="text-xs text-zinc-400">
          最終更新 {new Date(card.updatedAt).toLocaleString("ja-JP")}
        </p>
      </header>

      <StampgameGrid
        stamps={stamps}
        showDate={card.stampHasDate}
        onSlotPress={
          card.stampHasDate || pressMutation.isPending || isCardFull
            ? undefined
            : (slot) => handlePress(slot)
        }
      />

      <div className="flex flex-wrap gap-4">
        <PressButton
          onClick={() => handlePress()}
          loading={pressMutation.isPending || isFetching}
          disabled={isCardFull}
        >
          {isCardFull ? "カードがいっぱいです" : "押印する"}
        </PressButton>
        <ShareDialog
          trigger={
            <button className="rounded border border-zinc-300 px-4 py-2 text-sm">
              共有リンクを作る
            </button>
          }
          onSubmit={handleShare}
        />
      </div>

      <AssignUserForm onAssign={handleAssign} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">共有リンク</h2>
        <ul className="space-y-2">
          {shares.length === 0 ? (
            <li className="text-sm text-zinc-500">まだ共有リンクがありません。</li>
          ) : (
            shares.map((share) => (
              <li key={share.id} className="text-sm text-zinc-600">
                {share.slug} — {share.canWrite ? "書き込み可" : "閲覧のみ"}
              </li>
            ))
          )}
        </ul>
      </section>
    </section>
  );
}
