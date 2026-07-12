---
description: netkeibaから出馬表・競馬新聞・レース結果をPlaywrightで自動取得する。使い方: /fetch <日付> <レース名> (例: /fetch 2026-07-12 函館11R)
---

引数から日付・場名・R番号・レース名を解釈し、`tools/playwright/fetch-race.mjs` を実行して netkeiba から出馬表・競馬新聞・（実施済みなら）レース結果を取得し `races/` 配下に保存する。

日付が省略された場合は当日の日付を使う。

## 手順

### Step 1：race_idの特定
1. 日付を `YYYYMMDD` 形式に変換する。
2. `node tools/playwright/fetch-race.mjs list <YYYYMMDD>` を実行する（作業ディレクトリは `tools/playwright/`）。
3. 出力されたJSON配列から、指定された場名・R番号・レース名（部分一致でよい）に合致する `raceId` を特定する。
   - 該当が複数見つかる・見つからない場合は、候補一覧を提示してユーザーに確認する。
   - レース名が省略され場名・R番号のみ指定された場合はそれだけで一意に決まる（1日1回同じ場の同じR番号は重複しないため）。

### Step 2：データ取得
特定した `race_id` を使って以下を実行する（作業ディレクトリは `tools/playwright/`）。

- `node fetch-race.mjs shutuba <race_id>`
- `node fetch-race.mjs newspaper <race_id>`
- レースが既に終了している場合（`list`の該当行が過去日付、または結果ページが存在する場合）は `node fetch-race.mjs result <race_id>` も実行する。

`all` サブコマンド（`node fetch-race.mjs all <race_id>`）でまとめて実行してもよい。この場合レース未実施なら `result` は自動でスキップされる。

### Step 3：結果報告
保存された `races/<date>/<venue><N>R_<raceName>/*.json` のパスをユーザーに報告する。

### エラー時の対応
netkeiba側のページ構造変化・タイムアウト・アクセス制限等でPlaywright取得が失敗した場合は、エラー内容をそのままユーザーに伝え、`tools/chrome-extension`（要 `python3 tools/server.py` 起動）による手動取得へのフォールバックを案内する。
