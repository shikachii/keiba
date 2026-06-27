(function() {

// ━━━ ユーティリティ ━━━
const txt = (el, sel) => (sel ? el?.querySelector(sel) : el)?.innerText.trim().replace(/\s+/g, ' ') ?? '';
const attr = (el, sel, a) => el?.querySelector(sel)?.getAttribute(a) ?? '';
const id = href => (href.match(/horse\/(\d+)/) ?? [])[1] ?? '';

// ━━━ ① レース情報 ━━━
const r1 = txt(document, 'div.RaceData01');
const raceInfo = {
  レース名:  document.querySelector('h1.RaceName')?.innerText.trim().split('\n')[0].trim() ?? '',
  レース番号: txt(document, 'span.RaceNum').split('\n')[0].trim(),
  発走時刻:  (r1.match(/(\d{1,2}:\d{2})発走/)??[])[1]??'',
  コース:    ((m) => m ? m[1]+m[2]+'m' : '')(r1.match(/(芝|ダ)(\d+)m/)),
  天候:      (r1.match(/天候:(\S+?)(?:\s|\/|$)/)??[])[1]??'',
  馬場:      (r1.match(/馬場:(\S+?)(?:\s|\/|$)/)??[])[1]??'',
  詳細:      txt(document, 'div.RaceData02'),
};

// ━━━ ② 各馬データ ━━━
const horses = [...document.querySelectorAll('dl.HorseList')].map(dl => {

  // 枠・馬番
  const 枠番   = txt(dl, 'dt[class*="Waku"][class*="orderfix"]:first-child');
  const 馬番 = txt(dl, 'dt.Waku.Waku_Horse');

  // 馬名・馬ID（縦表示の HorseName から）
  const horseA    = dl.querySelector('dt.HorseName a');
  const horseName = horseA?.innerText.trim() ?? '';
  const horseId   = id(horseA?.getAttribute('href') ?? '');

  // Horse_Info ブロック（血統・騎手・脚質・体重・オッズ）
  const info = dl.querySelector('dt.Horse_Info');
  const 父  = txt(info, '.Horse01');
  const 母  = txt(info, '.Horse03');
  const 母父 = txt(info, '.Horse04');
  const 調教師 = txt(info, '.Horse05:first-of-type');
  const 馬主  = info ? [...info.querySelectorAll('.Horse05')].map(e => e.innerText.trim())[1] ?? '' : '';
  const 脚質ローテ = txt(info, '.Horse06');
  const 馬体重 = txt(info, '.Weight');
  const オッズ = txt(info, 'span[id^="odds-"]');
  const 人気  = txt(info, 'span[id^="ninki-"]');

  // 騎手・斤量（Jockey dd）
  const jockeyDd = dl.querySelector('dd.Jockey');
  const 性齢  = txt(jockeyDd, 'span.Barei');
  const 騎手  = jockeyDd?.querySelector('a span')?.innerText.trim() ?? '';
  const 斤量  = [...(jockeyDd?.childNodes??[])].map(n=>n.textContent?.trim()).filter(t=>/^\d+\.\d$/.test(t))[0]??'';

  // 前走〜5走前
  const pasts = [...dl.querySelectorAll('dd.Past_Wrapper li.Past')].map((li, i) => {
    const g = sel => txt(li, sel);
    const corners = [...li.querySelectorAll('.Data20 .Corner')].map(c => c.innerText.trim()).join('-');
    const chaku = li.className.match(/Ranking_(\d+)/)?.[1] ?? '';
    return {
      順番:    i === 0 ? '前走' : `${i+1}走前`,
      着順:    chaku,
      日付場R: g('.Data01'),
      グレード: txt(li, 'span[class*="Icon_GradeType"]'),
      レース名: g('.RaceName'),
      条件:    g('.Data03'),
      頭数:    g('.Data05'),
      馬番:    g('.Data06'),
      人気:    g('.Data07'),
      コース:  g('.Data09'),
      回り:    g('.Data10'),
      馬場:    g('.Data11'),
      タイム:  g('.Data12'),
      騎手:    g('.Data14'),
      斤量:    g('.Data15'),
      馬体重:  g('.Data16'),
      増減:    g('.Data17'),
      前3F:   g('.Data19'),
      通過順:  corners,
      後3F:   g('.Data21'),
      ペース:  g('.Data13'),
      勝ち馬:  g('.Data22'),
      着差:    g('.Data23'),
      備考:    g('.Data24'),
    };
  });

  // 実績（Performance）
  const perf = [...dl.querySelectorAll('dd.Performance table tr')].map(tr => {
    const cells = [...tr.querySelectorAll('th,td')].map(c => c.innerText.trim());
    if (cells.length < 2) return null;
    return { 条件: cells[0], 勝: cells[1], 連: cells[2], 複: cells[3], 着外: cells[4] };
  }).filter(Boolean);

  // 調教タイム
  const trainDd = dl.querySelector('dd.Past5_Stable_Time');
  const 調教 = trainDd ? {
    日コース: txt(trainDd, '.TraningData01'),
    タイム:   [...trainDd.querySelectorAll('ul li')].map(l=>l.innerText.trim()).filter(t=>t!=='-').join(' - '),
    脚色:     txt(trainDd, '.TrainingLoad'),
    評価:     txt(trainDd, '.Training_Critic'),
  } : null;

  // 厩舎コメント（Stable_Comment の対応行から）
  const cmRow = [...document.querySelectorAll('#All_Comment_Table tbody tr')]
    .find(tr => tr.querySelector('a')?.getAttribute('href')?.includes(horseId));
  const markNum = (cmRow?.querySelector('span[class*="Icon_Mark_"]')?.className.match(/Icon_Mark_(\d+)/)??[])[1]??'';
  const markMap = {'01':'◎','02':'○','03':'▲','04':'△','05':'×'};
  const 厩舎コメント = cmRow?.querySelector('dd')?.innerText.trim() ?? '';
  const 厩舎評価    = markMap[markNum] ?? '';

  return {
    枠番, 馬番, 馬名: horseName, 馬ID: horseId,
    父, 母, 母父, 調教師, 馬主, 脚質ローテ, 馬体重, オッズ, 人気,
    性齢, 騎手, 斤量,
    前走データ: pasts,
    実績: perf,
    調教: 調教,
    厩舎コメント, 厩舎評価,
  };
});

// ━━━ 出力 ━━━
const out  = { レース情報: raceInfo, 出走馬: horses };
const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = `newspaper_${raceInfo.レース名}.json`;
a.click();
console.log('✅ 完了', out);

})();