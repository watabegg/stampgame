"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const shareFormSchema = z.object({
  canWrite: z.boolean().default(false),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

interface ShareDialogProps {
  trigger: React.ReactNode;
  onSubmit: (values: ShareFormValues) => Promise<void>;
}

export function ShareDialog({ trigger, onSubmit }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: { canWrite: false, expiresAt: undefined },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset();
    setOpen(false);
  });

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={setOpen} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold">共有リンクを作成</Dialog.Title>
                <form className="mt-4 space-y-4" onSubmit={submit}>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register("canWrite")} />
                    訪問者に押印権限を与える
                  </label>

                  <label className="block text-sm">
                    リンク有効期限 (任意)
                    <input
                      type="datetime-local"
                      className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                      {...register("expiresAt")}
                    />
                  </label>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded border border-zinc-300 px-4 py-2 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "作成中..." : "リンクを作成"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
