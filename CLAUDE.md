# 競馬予想プロジェクト

## スタイル
**5〜9番人気の馬を絡めて勝つ**スタイル。1番人気への盲信を避け、
オッズの歪みを利用して回収率を上げることを目標とする。

---

## ディレクトリ構成

各ディレクトリの詳細ルールは、そのディレクトリ配下のファイルを扱う際に個別のCLAUDE.mdとして自動的に読み込まれる。

- **`tools/`** — netkeibaからのデータ取得（Playwright自動取得＋Chrome拡張フォールバック）。詳細は [`tools/CLAUDE.md`](tools/CLAUDE.md)
- **`races/`** — レースデータ（日付/レース名/に`newspaper.json`・`result.json`・`analysis.md`・`review.md`）と、予想ロジック（分析フロー・コース別傾向・消し根拠・買い目構成ルール）。詳細は [`races/CLAUDE.md`](races/CLAUDE.md)
- **`web/`** — races/ Webビューア（閲覧専用、React/Vite）。詳細は [`web/CLAUDE.md`](web/CLAUDE.md)
- **`data/html/`** — 取得済みHTMLの一時保管

## スキル
- `/fetch <日付> <レース名>` — netkeibaから出馬表・競馬新聞・レース結果を取得
- `/analysis <レース名>` — 競馬新聞JSONを読み込んでレース予想
- `/review <レース名>` — レース結果JSONを読み込んで振り返り
