/**
 * netkeiba レース結果ページ → JSON 変換スニペット
 * devtools コンソールで実行してください
 * 対象: https://race.netkeiba.com/race/result.html?race_id=...
 */
(function extractRaceResult() {

  /* ------------------------------------------------------------------ */
  /* 1. レース基本情報                                                    */
  /* ------------------------------------------------------------------ */
  const raceName  = document.querySelector('.RaceName')?.textContent.trim() ?? '';
  const raceData1 = document.querySelector('.RaceData01')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  const raceData2 = [...(document.querySelectorAll('.RaceData02 span') ?? [])]
                      .map(s => s.textContent.trim()).filter(Boolean);

  // "芝1200m" / "ダ1200m" などを抽出
  const distMatch  = raceData1.match(/(芝|ダ|障)(\d+)m/);
  const surfMatch  = raceData1.match(/(芝|ダート|障害)/);
  const timeMatch  = raceData1.match(/(\d+:\d+)発走/);
  const weatherM   = raceData1.match(/天候:(\S+?)\s/);
  const trackM     = raceData1.match(/馬場:(\S+)/);
  const turnM      = raceData1.match(/\(([右左])/);

  const raceInfo = {
    raceName,
    raceId   : new URLSearchParams(location.search).get('race_id') ?? '',
    startTime: timeMatch?.[1] ?? '',
    surface  : surfMatch?.[1] ?? '',
    distance : distMatch ? `${distMatch[1]}${distMatch[2]}m` : '',
    turn     : turnM?.[1] ?? '',
    weather  : weatherM?.[1] ?? '',
    trackCond: trackM?.[1] ?? '',
    category : raceData2,
  };

  /* ------------------------------------------------------------------ */
  /* 2. 着順テーブル                                                      */
  /* ------------------------------------------------------------------ */
  const results = [];
  document.querySelectorAll('#All_Result_Table tbody tr.HorseList').forEach(tr => {
    const td = (sel) => tr.querySelector(sel)?.textContent.trim() ?? '';
    const rank = tr.querySelector('.Rank')?.textContent.trim() ?? '';

    // 枠番は Waku[N] クラスから取得
    const wakuEl  = tr.querySelector('td.Num[class*="Waku"]');
    const wakuNum = wakuEl?.className.match(/Waku(\d)/)?.[1] ?? '';

    // 馬番
    const horseNum = [...tr.querySelectorAll('td.Num.Txt_C')]
                       .map(el => el.textContent.trim()).find(Boolean) ?? '';

    const horseName = tr.querySelector('.HorseNameSpan')?.textContent.trim() ?? '';
    const horseUrl  = tr.querySelector('.Horse_Name a')?.href ?? '';
    const sexAge    = tr.querySelector('.Lgt_Txt')?.textContent.trim() ?? '';
    const weight    = tr.querySelector('.JockeyWeight')?.textContent.trim() ?? '';
    const jockey    = tr.querySelector('.JockeyNameSpan')?.textContent.trim() ?? '';
    const jockeyUrl = tr.querySelector('.Jockey a')?.href ?? '';
    const trainer   = tr.querySelector('.TrainerNameSpan')?.textContent.trim() ?? '';
    const trainerEl = tr.querySelector('.Trainer .Label1, .Trainer .Label2');
    const stable    = trainerEl?.textContent.trim() ?? '';   // 美浦 / 栗東

    // タイム・着差
    const timeCells = [...tr.querySelectorAll('td.Time .RaceTime')];
    const finTime   = timeCells[0]?.textContent.trim() ?? '';
    const margin    = timeCells[1]?.textContent.trim() ?? '';

    // 人気・オッズ
    const popularity = tr.querySelector('.OddsPeople')?.textContent.trim() ?? '';
    const odds       = tr.querySelector('.Odds_Ninki')?.textContent.trim() ?? '';

    // 後3F
    const last3f = tr.querySelector('td.Time:not(:has(.RaceTime))')?.textContent.trim() ?? '';

    // コーナー通過順
    const corner = tr.querySelector('.PassageRate')?.textContent.trim() ?? '';

    // 馬体重・増減
    const bwCell  = tr.querySelector('.Weight')?.textContent ?? '';
    const bwMatch = bwCell.match(/(\d+)\(([+-]?\d+)\)/);
    const bodyWeight     = bwMatch?.[1] ?? bwCell.trim();
    const bodyWeightDiff = bwMatch?.[2] ?? '';

    if (horseName) {
      results.push({
        rank, wakuNum, horseNum, horseName, horseUrl,
        sexAge, weight, jockey, jockeyUrl, trainer, stable,
        finTime, margin, popularity, odds, last3f, corner,
        bodyWeight, bodyWeightDiff,
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* 3. ラップタイム & ペース                                             */
  /* ------------------------------------------------------------------ */
  const pace = document.querySelector('.RapPace_Title span')?.textContent.trim() ?? '';

  const haronRows = document.querySelectorAll('.Race_HaronTime tr.HaronTime');
  const haronLabels = [...document.querySelectorAll('.Race_HaronTime tr.Header th')]
                        .map(th => th.textContent.trim());

  // 1行目: 累計タイム / 2行目: 区間タイム
  const cumulativeTimes = [...(haronRows[0]?.querySelectorAll('td') ?? [])]
                            .map(td => td.textContent.trim());
  const splitTimes      = [...(haronRows[1]?.querySelectorAll('td') ?? [])]
                            .map(td => td.textContent.trim());

  const lapData = haronLabels.map((label, i) => ({
    point     : label,
    cumulative: cumulativeTimes[i] ?? '',
    split     : splitTimes[i] ?? '',
  }));

  /* ------------------------------------------------------------------ */
  /* 4. コーナー通過順位                                                  */
  /* ------------------------------------------------------------------ */
  const corners = {};
  document.querySelectorAll('.Corner_Num tbody tr').forEach(tr => {
    const label = tr.querySelector('th')?.textContent.trim() ?? '';
    const order = tr.querySelector('td')?.textContent.trim() ?? '';
    if (label) corners[label] = order;
  });

  /* ------------------------------------------------------------------ */
  /* 5. 払戻し                                                            */
  /* ------------------------------------------------------------------ */
  const payouts = {};
  document.querySelectorAll('.Payout_Detail_Table tbody tr').forEach(tr => {
    const type   = tr.querySelector('th')?.textContent.trim() ?? '';
    if (!type) return;

    // 馬番リスト
    const nums = [...tr.querySelectorAll('td.Result span, td.Result li span')]
                   .map(el => el.textContent.trim()).filter(Boolean);
    // 払戻額リスト
    const pays = [...tr.querySelectorAll('td.Payout span')]
                   .flatMap(el => el.innerHTML.split('<br>'))
                   .map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    // 人気
    const ninkis = [...tr.querySelectorAll('td.Ninki span')]
                     .map(el => el.textContent.trim()).filter(Boolean);

    payouts[type] = { nums, pays, ninkis };
  });

  /* ------------------------------------------------------------------ */
  /* 6. まとめ & 出力                                                     */
  /* ------------------------------------------------------------------ */
  const output = {
    raceInfo,
    pace,
    lapData,
    corners,
    results,
    payouts,
  };

  console.log(JSON.stringify(output, null, 2));

  /* ------------------------------------------------------------------ */
  /* 7. JSONファイルとしてダウンロード                                     */
  /* ------------------------------------------------------------------ */
  const raceId   = raceInfo.raceId || 'race';
  const fileName = `netkeiba_${raceId}.json`;
  const blob     = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // クリーンアップ
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);

  console.log(`✅ ダウンロード開始: ${fileName}`);
  return output; // コンソール変数としても参照可能
})();