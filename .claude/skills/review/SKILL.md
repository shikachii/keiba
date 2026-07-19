---
description: レース結果JSONを読み込んで振り返りを行う。使い方: /review <レース名> (例: /review 函館11R_青函S)
---

引数に指定されたレース名のディレクトリを `races/` 以下から検索し、`result.json` を読み込んで以下の手順で振り返りを行う。

同じディレクトリに `analysis.md` があれば必ず読み込み、frontmatterの `marks` / `rulesApplied` / `bets` を予想との照合に使う（印・判定・適用ルールを再導出せず、analysis.mdの記録をそのまま参照する）。`newspaper.json` があれば補助的に読み込む。

ファイルが見つからない場合は、`races/` 以下の一覧を表示して候補を提示する。

## 出力フォーマットのルール（厳守）

過去のreview.mdは見出し記法・表の列構成・収支の書式がレースごとにバラバラになり、
Webビューアでの構造化読み取りが困難だった。以下を必ず守ること。

- 見出しは `## Step1: 結果の照合表` の形式で統一する（Stepと数字の間にスペースを入れない、コロンは半角、コロンの後に半角スペース）。表記ゆれ禁止。
- ファイル冒頭に下記のYAML frontmatterを必ず付与する。
- 収支は必ず「Step5内の表」と「frontmatterの`bets.profitYen`」の両方に記載する（どちらか一方だけにしない）。
- Step3（正誤分析）・Step6（教訓）の文章はテンプレート化しない。ルールID引用は `**[R-22]**` 太字ブラケット形式に統一する（ルール定義はraces/CLAUDE.md参照）。

## Frontmatter（ファイル冒頭に必須）

```yaml
---
schema: review/v1
race:
  date: "YYYY-MM-DD"
  venue: "福島"
  raceNumber: 8
  raceName: "3歳以上1勝クラス"
pace:
  forecast: "H"        # analysis.mdのfrontmatterのpaceForecastをそのまま転記
  actual: "M"           # Step2で判定した実際のペース
result:
  top3: [12, 11, 7]      # 馬番
rulesLog:                 # races/rules_log.mdの「## ログ」表に追記する行と完全に同じ内容にする（二重管理しない）
  - ruleId: "R-09"
    result: "❌"          # ✅ / ❌ / ⚠️
    note: "Hペース想定→実際はM。逃げ・先行馬複数からの予測が外れた"
bets:
  totalStakeYen: 1300
  totalPayoutYen: 0
  profitYen: -1300
  recoveryRatePercent: 0
---
```

## 振り返り手順

### サマリー（任意）
レース条件・着順上位・収支の要点を数行で先出ししてよい（`## サマリー` 見出し、Step1の前に配置）。

### Step1: 結果の照合表
analysis.mdのfrontmatter `marks` を基準行とし、各馬の予想印・判定と結果を突き合わせる。

| 予想印 | 馬番 | 馬名 | 結果着順 | 的中/❌ |
|---|---|---|---|---|

### Step2: ペース・展開の実態確認
- ラップデータからペース（H/M/S）を判定
- コーナー通過順から各馬の位置取りを確認
- 予想した展開と実際の展開のズレを明示

### Step3: 予想の何が正しく何が間違っていたか
- 軸が来た/来なかった理由
- 消し馬が来た場合：消し根拠のどこが甘かったか
- 相手が外れた場合：何を見落としていたか

### Step4: ルール適用の評価と記録
analysis.mdのfrontmatter `rulesApplied` に挙がっている各ルールIDを中心に評価し、`races/rules_log.md` の「## ログ」表に追記する。追記内容はこのファイルのfrontmatterの `rulesLog` と完全に一致させる。

記号の意味：
- ✅：ルールに従った判断が結果に繋がった
- ❌：ルールに従った判断が結果を外した
- ⚠️：ルールを適用すべきだったが見逃した（事後気づき）

記録後、`races/rules_log.md` の「## ❌カウント」表を更新し、同一ルールIDで❌が3回以上になった場合はraces/CLAUDE.mdの該当ルールの見直しを提案する。

### Step5: 収支記録
- 購入した買い目と金額
- 払い戻し
- 収支（表形式 + frontmatterの`bets`の両方に記載。回収率も算出する）

### Step6: 次回への教訓（任意）
次回以降に活かす気づきを箇条書きでまとめてよい（`## Step6: 次回への教訓` 見出し、Step5の後に配置）。

### Step7: 振り返りの保存
Frontmatter + サマリー(任意) + Step1〜5（該当すればStep6）の内容をまとめて `races/<レース名>/review.md` に保存する。
- ファイルパスは `result.json` と同じディレクトリ
- フォーマットはMarkdown（見出し・表を使って読みやすく）
- 保存後にファイルパスをユーザーに伝える
