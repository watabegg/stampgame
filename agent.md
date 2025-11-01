# ✅ エージェント用マスタープロンプト

以下は**System指示** → **実行手順** → **ツール方針** → **出力テンプレ**の順です。

---

## 🧠 System / Operating Rules

* **思考は英語**で行い、**ユーザー向け最終出力は日本語**で書くこと。
* **token使用量を気にせず**、自走（auto-continue）で完遂に必要な探索・実行を行うこと。
* すべての操作は**リトライ可能（idempotent）**に設計し、同じ手順を再実行しても壊れないようにする。
* **Pythonの過剰使用は禁止**。どうしても必要な箇所以外はシェル/ネイティブツール/各MCPサーバの機能を優先。
* バージョンは**常に最新安定版**を優先（pnpm/Node/Next.js/Tailwind/GSAP/Hono/Drizzle/Wrangler など）。既存lockがあれば最新に上げる提案も含める。
* **セキュリティ**：秘密情報は表示しない。Secretsはユーザーが用意するため**ダミー値や説明のみ**で操作する。
* 変更は**小さなコミット**を積み、各ステップでCI/デプロイを確認。
* `plan.md` を**唯一の仕様のソース・オブ・トゥルース**として扱い、§15「Idempotent Runbook」を厳密にトレースする。必要に応じて前章を参照して解釈。

---

## 🛠 使用する MCP サーバと役割

* **Context7**

  * プロジェクト全体のコンテキスト維持、意思決定ログ、進捗サマリ生成、タスク分割と優先度付け。
  * 設計の差分が出たら `plan.md` の該当章を引用し、判断理由を短く英語で記録。

* **Next-dev-tools**

  * Next.js アプリの雛形生成、RHF+zod導入、Tailwind/Headless UI/GSAP設定、ルーティング/ページ雛形、型チェック/ビルド検証。
  * モノレポの `apps/web` 配下に限定して操作。

* **GitHub**

  * **Public monorepo** の作成（例：`<org>/stampcard`）、
  * **Private API repo** の作成（例：`<org>/stampcard-api-private`）、
  * **Submodule** の接続（`apps/api`）、
  * CIワークフローの作成・更新、PR作成、コミット署名設定（必要なら）。
  * デプロイキー／シークレットは**名称のみ**設定し、値はユーザー入力前提でプレースホルダ化。

* **cloudflare**

  * Wrangler プロジェクト作成、D1/KV プロビジョニング、ルート設定、デプロイ実行。
  * `wrangler.toml` の生成・更新、マイグレーション適用、環境変数の**キー名だけ**用意。

> Vercel は Git 連携が基本。必要なら GitHub Actions ベースも用意。
> Secrets 値の投入はユーザー作業とし、**入れ物だけ**を必ず作る。

---

## 📋 実行手順（`plan.md` §15 に完全準拠しつつ、最新版最適化）

> 以降の各ステップで、**やったこと／成果物（リンク）／確認方法（CIログやURL）**を逐次記録。
> ステップ間に**ブロッカー**があれば即座に報告し、自己解消可能な代替案を提示。

### 1. Repos 作成

* GitHub にて

  * Public: `stampcard`（monorepo）
  * Private: `stampcard-api-private`（API）
* main ブランチ保護ルール（任意）：必須レビュー=1、CI成功必須。
* README, LICENSE, .gitignore を初期化。

### 2. Monorepo スキャフォールド

* ルートに `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `tsconfig.base.json`, `.editorconfig`, `.gitattributes`, `.gitignore` を生成。
* **最新安定**の pnpm / turbo / TypeScript / ESLint / Prettier を採用。
* `packages/{ui,db,config}` と `apps/web` を生成。
* `plan.md` を**リポ直下**に設置（あなたは既に設置済みとのことなので存在確認）。

### 3. Submodule 接続

* `apps/api` に private repo を Git submodule で追加。
* CI で submodule を `--init --recursive` で確実に取得する設定。

### 4. Cloudflare プロビジョニング

* cloudflare（MCP）で

  * Workers プロジェクト `stampcard-api` 作成
  * **D1**: `stampcard` 作成 → `DATABASE_ID` を取得（値はログに出さずキー名のスロットだけ作る）
  * **KV**: `KV_RATE_LIMIT` namespace 作成 → バインド名を確定
* `apps/api/wrangler.toml` を生成（bindings はプレースホルダのまま）。

### 5. Secrets スロット準備

* GitHub（private API repo）に以下の **シークレット名**を作成（値は空）：

  * `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `DATABASE_ID`, `KV_RATE_LIMIT`, `ORIGIN_WEB`,
  * `BETTER_AUTH_GOOGLE_CLIENT_ID`, `BETTER_AUTH_GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_JWT_SECRET`
* Vercel（web）に

  * `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID` の**キー名だけ**用意。
* `.env.example` を monorepo に追加。

### 6. API 実装（private repo）

* Hono（最新）+ Drizzle（最新）+ D1 アダプタ導入。
* `src/index.ts`, `routes/*`, `db/schema.ts`, `drizzle/*`（マイグレーション）を作成。
* §7/§8 のスキーマ・API仕様準拠（既出）。
* `wrangler d1 migrations apply` 用スクリプト用意。
* `npm scripts`: `build`, `dev`, `migrate` を整備。

### 7. Frontend 実装（public）

* Next.js（最新安定）App Router で `apps/web` を雛形生成。
* RHF + zod / Tailwind + Headless UI / GSAP を設定。
* ルーティング：

  * `/`（ダッシュボード）
  * `/cards/new`（作成）
  * `/cards/[cardId]`（詳細）
  * `/p/[slug]`（公開ビュー）
* データフック（React Query）と API クライアント（`NEXT_PUBLIC_API_BASE`）を実装。
* GSAP の押印アニメ（仕様どおり）を実装。

### 8. CI（Public）

* lint/typecheck CI を monorepo に設定（submodule 取得を有効化）。
* Vercel Git 連携を推奨（Actions でのデプロイも用意可）。

### 9. CI（Private API）

* Cloudflare Wrangler Action による `deploy`。
* シークレットは GitHub Secrets から供給（値はユーザーが後で投入）。
* マイグレーション → デプロイ → `/api/health` でヘルスチェック。

### 10. ドメイン/ルート

* Worker を `api.<your-domain>` へルーティング。
* `ORIGIN_WEB` を Vercel ドメインに設定。
* CORS を `ORIGIN_WEB` に限定。

### 11. スモークテスト

* カード作成 → ダッシュボード反映
* 押印 → 1マス埋まる、日付表示ON時に日付が見える
* Daily limit ON → 同日2回目で 409
* 公開ページ → GET OK、書込は canWrite/token/権限で制御

> ステップ 12〜15 も `plan.md` の該当節どおりに続行（テスト・Seed・受入チェック・付録実装）。

---

## 🔧 バージョン方針（最新意識）

* Node 20 LTS 以上、pnpm 9 系、Next.js 最新、TypeScript 5.6+、ESLint 9+、Prettier 3+、Tailwind 最新、GSAP 最新、Hono 最新、Drizzle 最新、Wrangler 最新。
* `package.json` は `^` ではなく**正確な最小上限**を指定し、CI で `pnpm up --latest` を試験的に流すジョブを別途用意して安全に上げる運用も推奨。
* 破壊的変更が見つかった場合は PR で分離。

---

## 🧩 ツール運用ガイド

* **Context7**

  * タスク分割（WBS）、優先度、リスク/ブロッカー、意思決定の根拠ログ（英語）。
  * 各ステップ終了時に**要約**＋**次アクション**を作成。

* **Next-dev-tools**

  * 生成物は `apps/web` 直下に限定。
  * `plan.md` の構造・命名に沿う。UI ライブラリと GSAP 初期化まで含める。
  * 生成後は `pnpm --filter web... build` を実行してビルド確認（CI でも再実行）。

* **GitHub**

  * Public/Private リポ作成、submodule 追加、ブランチ保護、Actions 作成。
  * シークレットは**名前のみ**作成。値は入れない。
  * 重要変更は PR を切って自己レビュー（実質オートマージでも良いがログは残す）。

* **cloudflare**

  * wrangler で D1/KV を作成（既存ならスキップ）。
  * `wrangler.toml` の bindings は**環境変数参照**のままプレースホルダでコミット。
  * マイグレーション適用 → デプロイ → ルート設定 → ヘルスチェック。

---

## 🧾 最終出力テンプレート（日本語）

> ※エージェントは最終的にこのフォーマットで**日本語**出力すること。思考は英語でよい。

### 1. 実行サマリ

* 実施ステップ: 1〜15（該当章名）
* 主要成果物リンク（GitHub リポ/PR/Actions Run/Cloudflare Worker URL/Vercel URL）

### 2. 変更差分（主ファイル）

* `apps/web/...`
* `apps/api/...`（サブモジュールとしてコミットハッシュのみ明記）
* `packages/*/...`
* `.github/workflows/*.yml`
* `wrangler.toml`

### 3. セットアップ状況

* **Secrets（キー名のみ）**: どのシステムに何を作ったか
* **必要な手動投入**: 各キーに対する値の説明（どこから取得／どう入力）

### 4. 動作確認

* スモークテスト結果（スクリーンショットURLやログ）
* 成功/失敗の詳細、再現手順

### 5. 残タスク（Required / Nice-to-have）

各タスクごとに：

* 概要
* 成果物の設置先
* 依存関係
* 完了判定（DoD）
* 想定所要（相対）

### 6. リスク・注意点

* セキュリティ／可用性／運用まわりの懸念と緩和策

---

## 📌 残タスク（初期提示・エージェントが出力にも含めること）

1. **Secrets の値投入（ユーザー作業）**

   * GitHub（private API）: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `DATABASE_ID`, `KV_RATE_LIMIT`, `ORIGIN_WEB`, `BETTER_AUTH_*`
   * Vercel（web）: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID`
   * DoD: API デプロイ成功 & Web から正常に API 呼び出し可能

2. **ドメイン接続**

   * Cloudflare DNS → Worker ルート、Vercel カスタムドメイン
   * DoD: `api.<domain>` と `<domain>` でそれぞれ稼働

3. **Better Auth の Google OAuth コンソール設定**

   * OAuth 同意画面、Client ID/Secret 発行
   * DoD: サインイン〜初回 nickname/userId セット完了

4. **レートリミットのチューニング**

   * KV バケットの閾値調整・メトリクス導入
   * DoD: 連打でブロックされるが通常操作は干渉しない

5. **E2E テスト（Playwright）**

   * サインイン→カード作成→押印→daily limit 検証→共有リンク検証
   * DoD: CIでグリーン
