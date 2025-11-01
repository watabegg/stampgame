"use client";

import { useRouter } from "next/navigation";
import { useToast } from "../../../components/Toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCard } from "../../../hooks/useCards";

const schema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(80),
  description: z.string().max(200).optional(),
  dailyLimit: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  stampHasDate: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function CreateCardPage() {
  const router = useRouter();
  const { show } = useToast();
  const createMutation = useCreateCard();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dailyLimit: false, isPublic: true, stampHasDate: true },
  });

  const submit = handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    show("カードを作成しました");
    router.push("/");
  });

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">新しいカードを作成</h1>
        <p className="text-sm text-zinc-500">スタンプカードの設定を入力してください。</p>
      </div>
      <form className="space-y-5" onSubmit={submit}>
        <div>
          <label className="block text-sm font-medium">タイトル</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            {...register("title")}
          />
          {errors.title ? (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium">説明 (任意)</label>
          <textarea
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            rows={4}
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isPublic")} />
          公開カードにする
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("dailyLimit")} />
          1日1回までに制限する
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("stampHasDate")} />
          スタンプ押印日に日付を表示する
        </label>

        <button
          type="submit"
          className="rounded bg-emerald-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "作成中..." : "作成する"}
        </button>
      </form>
    </main>
  );
}
