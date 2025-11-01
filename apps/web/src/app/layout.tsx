import "../styles/globals.css";
import type { Metadata } from "next";
import { ReactQueryClientProvider } from "../lib/query-provider";
import { ToastProvider } from "../components/Toast";

export const metadata: Metadata = {
  title: "Stampgame Dashboard",
  description: "Create and share stamp cards with rewarding animations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-zinc-50 text-zinc-900">
        <ReactQueryClientProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
