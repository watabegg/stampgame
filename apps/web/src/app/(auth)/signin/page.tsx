export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-lg">
        <h1 className="text-2xl font-semibold text-zinc-900">Googleでサインイン</h1>
        <p className="mt-2 text-sm text-zinc-600">
          下のボタンからGoogleアカウントでログインしてください。認証後はダッシュボードへリダイレクトします。
        </p>
        <form className="mt-6" action="/api/auth/google" method="post">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            Googleで続行
          </button>
        </form>
        <p className="mt-6 text-xs text-zinc-400">
          ボタンはプレースホルダです。Better Auth の実装後に `/api/auth/google` を Worker 側で処理してください。
        </p>
      </div>
    </main>
  );
}
