# races/ Webビューア

`races/` 配下の出馬表・結果・予想(analysis.md)・振り返り(review.md)・ルール適用ログをブラウザで閲覧するための読み取り専用ツール。

## ローカル起動方法

```bash
cd web
npm install
npm run dev
```

`http://localhost:5173/` を開く。

- `npm run dev` はVite dev serverのミドルウェアが`races/`を都度読むため常に最新データを表示する。
- `shutuba.json` を持たないレースフォルダ（旧フォーマット）は一覧から自動的に除外される。

## GitHub Pagesへのデプロイ

`races/`の生データはこれまで通りgitignore対象のまま（mainブランチにはコミットしない）。分析後に最新データをGitHub Pagesへ反映したくなったら、ローカルから手動でデプロイする。

```bash
cd web
npm run deploy
```

これで内部的に以下が実行される:
1. `scripts/build-data.mjs` が `races/` の現在の内容を `public/api/*.json` に静的スナップショットとして書き出す
2. `vite build`（`GH_PAGES=true`、base=`/keiba/`）で `dist/` に静的サイトをビルド
3. `gh-pages` パッケージが `dist/` の内容を `gh-pages` ブランチへpush

初回のみ、GitHubリポジトリの Settings → Pages で Source を `gh-pages` ブランチ（root）に設定する。

- URLは `https://<GitHubユーザー名>.github.io/keiba/` になる想定（リポジトリ名を変える場合は `vite.config.ts` の `GH_PAGES_REPO` も合わせて変更する）。
- ルーティングはHashRouterを採用しているため（例: `.../#/races/20260711/函館11R_五稜郭S`）、GitHub Pagesでの直リンク・リロードでも404にならない。
- GitHub Pagesは公開URL（知っている人は誰でも閲覧可能）になる点に注意。
