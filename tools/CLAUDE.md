# データ取得ツール（tools/ 配下の作業時に適用）

netkeibaからのデータ取得まわりの構成・注意点。`/fetch`スキルや取得スクリプトを触る際に適用する。

## `tools/playwright/` — AIエージェントによる自動取得（主経路）
- `fetch-race.mjs`：netkeibaをPlaywrightで操作し出馬表・競馬新聞・レース結果を取得、`races/`直下にJSON保存するCLI
  - `node fetch-race.mjs list <YYYYMMDD>`：開催日のレース一覧から`race_id`を解決
  - `node fetch-race.mjs shutuba|newspaper|result|all <race_id>`：各データを取得・保存
- `/fetch <日付> <レース名>` スキル（`.claude/skills/fetch/SKILL.md`）から呼び出す

## `tools/` 直下 — JSスニペット・Chrome拡張（手動フォールバック用）
- `shutuba.js`：出馬表→JSON（shutuba.html で実行）
- `newspaper.js`：競馬新聞→JSON（馬柱描画済み後に実行）
- `result.js`：レース結果→JSON（result.html で実行）
- `chrome-extension/`：上記3スクリプトをワンクリックで実行できるChrome拡張（要: `python3 tools/server.py` を起動しておく）。Playwright自動取得が失敗した場合の手動バックアップ用
- `server.py`：Chrome拡張からのデータをkeiba/races/以下に保存するローカルサーバー（ポート3500）

## エラー時の対応
netkeiba側のページ構造変化・タイムアウト・アクセス制限等でPlaywright取得が失敗した場合は、エラー内容をそのままユーザーに伝え、`tools/chrome-extension`（要`python3 tools/server.py`起動）による手動取得へフォールバックする。

## `data/html/` — 取得済みHTMLの一時保管
