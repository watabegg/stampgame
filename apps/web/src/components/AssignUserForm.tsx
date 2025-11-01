"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  userId: z.string().min(1, "ユーザーIDを入力してください")
});

type FormValues = z.infer<typeof schema>;

interface AssignUserFormProps {
  onAssign: (values: FormValues) => Promise<void>;
}

export function AssignUserForm({ onAssign }: AssignUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (values) => {
    await onAssign(values);
    reset();
  });

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div>
        <label className="block text-sm font-medium">ユーザーIDを割り当て</label>
        <input
          type="text"
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          {...register("userId")}
        />
        {errors.userId ? (
          <p className="mt-1 text-xs text-red-500">{errors.userId.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "割り当て中..." : "割り当て"}
      </button>
    </form>
  );
}
