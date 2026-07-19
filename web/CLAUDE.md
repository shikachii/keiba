# Webビューア（web/ 配下の作業時に適用）

`races/`配下の出馬表・結果・予想・振り返り・ルール適用ログをブラウザで視覚的に閲覧するNode/React製ツール。**閲覧専用**（データの作成・編集はここでは行わない）。

## 起動・デプロイ
- 開発: `cd web && npm install && npm run dev` → `http://localhost:5173/`
- 外出先から確認したい場合: `npm run deploy` でGitHub Pagesへ反映（詳細は`web/README.md`）
- `races/`配下のanalysis.md等を更新した後は、閲覧側に反映するため`npm run deploy`を忘れずに実行する
