// netkeibaページ上で page.evaluate() 経由で実行されるDOM抽出関数群。
// tools/chrome-extension/scripts/{shutuba,newspaper,result}.js のロジックを移植。
// ブラウザコンテキストで実行されるため document 以外の外部スコープを参照しない。

export function extractShutuba() {
  const VENUES = ['札幌','函館','福島','新潟','東京','中山','中京','京都','阪神','小倉'];

  const raceName  = document.querySelector('h1.RaceName')?.innerText.trim().split('\n')[0].trim() ?? '';
  const raceNum   = document.querySelector('span.RaceNum')?.innerText.trim().replace(/\s+/g, ' ') ?? '';
  const raceData1 = document.querySelector('div.RaceData01')?.innerText.trim().replace(/\s+/g, ' ') ?? '';
  const raceData2 = document.querySelector('div.RaceData02')?.innerText.trim().replace(/\s+/g, ' ') ?? '';

  const timeMatch    = raceData1.match(/(\d{1,2}:\d{2})発走/);
  const distMatch    = raceData1.match(/(芝|ダ)(\d+)m/);
  const weatherMatch = raceData1.match(/天候:(\S+?)(?:\s|\/|$)/);
  const trackMatch   = raceData1.match(/馬場:(\S+?)(?:\s|\/|$)/);

  const raceInfo = {
    レース名:   raceName,
    レース番号: raceNum.replace(/\n.*/s, '').trim(),
    発走時刻:   timeMatch    ? timeMatch[1]              : '',
    コース:     distMatch    ? distMatch[1] + distMatch[2] + 'm' : '',
    天候:       weatherMatch ? weatherMatch[1]           : '',
    馬場:       trackMatch   ? trackMatch[1]             : '',
    詳細:       raceData2,
  };

  const horses = [...document.querySelectorAll('tr.HorseList')].map(row => {
    const g = (sel, attr) => {
      const el = row.querySelector(sel);
      if (!el) return '';
      return attr ? (el.getAttribute(attr) ?? '') : el.innerText.trim();
    };
    const horseHref  = g('td.HorseInfo span.HorseName a', 'href');
    const weightText = g('td.Weight');
    const wm = weightText.match(/(\d+)\(([+-]?\d+)\)/);
    return {
      枠番:     g('td[class^="Waku"]'),
      馬番:     g('td[class^="Umaban"]'),
      馬名:     g('td.HorseInfo span.HorseName a', 'title'),
      馬ID:     (horseHref.match(/horse\/(\d+)/) ?? [])[1] ?? '',
      性齢:     g('td.Barei'),
      斤量:     g('td.Barei') ? row.querySelector('td.Barei')?.nextElementSibling?.innerText.trim() : '',
      騎手:     g('td.Jockey a', 'title'),
      厩舎所属: row.querySelector('td.Trainer span')?.innerText.trim() ?? '',
      厩舎名:   g('td.Trainer a', 'title'),
      馬体重:   wm ? wm[1] : weightText,
      増減:     wm ? wm[2] : '',
      オッズ:   g('span[id^="odds-"]'),
      人気:     g('span[id^="ninki-"]'),
    };
  });

  const data = { レース情報: raceInfo, 出走馬: horses };

  const titleDateM = document.title.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = titleDateM
    ? titleDateM[1] + titleDateM[2].padStart(2, '0') + titleDateM[3].padStart(2, '0')
    : (new Date().getFullYear() + String(new Date().getMonth()+1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0'));
  const venue    = VENUES.find(v => raceData2.includes(v)) ?? '';
  const numMatch = raceInfo.レース番号.match(/(\d+)/);
  const raceN    = numMatch ? numMatch[1] + 'R' : raceInfo.レース番号;

  return { path: `${date}/${venue}${raceN}_${raceName}/shutuba.json`, data };
}

export function extractNewspaper() {
  const txt = (el, sel) => (sel ? el?.querySelector(sel) : el)?.innerText.trim().replace(/\s+/g, ' ') ?? '';
  const id = href => (href.match(/horse\/(\d+)/) ?? [])[1] ?? '';

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

  const horses = [...document.querySelectorAll('dl.HorseList')].map(dl => {
    const 枠番   = txt(dl, 'dt[class*="Waku"][class*="orderfix"]:first-child');
    const 馬番 = txt(dl, 'dt.Waku.Waku_Horse');

    const horseA    = dl.querySelector('dt.HorseName a');
    const horseName = horseA?.innerText.trim() ?? '';
    const horseId   = id(horseA?.getAttribute('href') ?? '');

    const info = dl.querySelector('dt.Horse_Info');
    const 父  = txt(info, '.Horse01');
    const 母  = txt(info, '.Horse03');
    const 母父 = txt(info, '.Horse04');
    const horse05Links = info ? [...info.querySelectorAll('.Horse05 a')] : [];
    const 調教師 = horse05Links.find(a => (a.getAttribute('href') ?? '').includes('/trainer/'))?.innerText.trim() ?? '';
    const 馬主  = horse05Links.find(a => (a.getAttribute('href') ?? '').includes('/owner/'))?.innerText.trim() ?? '';
    const 脚質ローテ = txt(info, '.Horse06');
    const wEl   = info?.querySelector('.Weight');
    const 馬体重 = (wEl?.innerText.trim() || wEl?.textContent.trim() || '').replace(/\s+/g, ' ');
    const オッズ = txt(info, 'span[id^="odds-"]');
    const 人気  = txt(info, 'span[id^="ninki-"]');

    const jockeyDd = dl.querySelector('dd.Jockey');
    const 性齢  = txt(jockeyDd, 'span.Barei');
    const 騎手  = jockeyDd?.querySelector('a span')?.innerText.trim() ?? '';
    const 斤量  = [...(jockeyDd?.childNodes??[])].map(n=>n.textContent?.trim()).filter(t=>/^\d+\.\d$/.test(t))[0]??'';

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

    const perf = [...dl.querySelectorAll('dd.Performance table tr')].map(tr => {
      const cells = [...tr.querySelectorAll('th,td')].map(c => c.innerText.trim());
      if (cells.length < 2) return null;
      return { 条件: cells[0], 勝: cells[1], 連: cells[2], 複: cells[3], 着外: cells[4] };
    }).filter(Boolean);

    const trainDd = dl.querySelector('dd.Past5_Stable_Time');
    const 調教 = trainDd ? {
      日コース: txt(trainDd, '.TraningData01'),
      タイム:   [...trainDd.querySelectorAll('ul li')].map(l=>l.innerText.trim()).filter(t=>t!=='-').join(' - '),
      脚色:     txt(trainDd, '.TrainingLoad'),
      評価:     txt(trainDd, '.Training_Critic'),
    } : null;

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

  const out = { レース情報: raceInfo, 出走馬: horses };

  const VENUES = ['札幌','函館','福島','新潟','東京','中山','中京','京都','阪神','小倉'];
  const titleDateM = document.title.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = titleDateM
    ? titleDateM[1] + titleDateM[2].padStart(2, '0') + titleDateM[3].padStart(2, '0')
    : (new Date().getFullYear() + String(new Date().getMonth()+1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0'));
  const venue    = VENUES.find(v => raceInfo.詳細.includes(v)) ?? '';
  const numMatch = raceInfo.レース番号.match(/(\d+)/);
  const raceN    = numMatch ? numMatch[1] + 'R' : raceInfo.レース番号;

  // structured clone によるキー順序変化を防ぐため JSON 文字列で返す
  return JSON.stringify({ path: `${date}/${venue}${raceN}_${raceInfo.レース名}/newspaper.json`, data: out });
}

export function extractResult() {
  const raceName  = document.querySelector('.RaceName')?.textContent.trim() ?? '';
  const raceData1 = document.querySelector('.RaceData01')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  const raceData2 = [...(document.querySelectorAll('.RaceData02 span') ?? [])]
                      .map(s => s.textContent.trim()).filter(Boolean);

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

  const results = [];
  document.querySelectorAll('#All_Result_Table tbody tr.HorseList').forEach(tr => {
    const rank = tr.querySelector('.Rank')?.textContent.trim() ?? '';

    const wakuEl  = tr.querySelector('td.Num[class*="Waku"]');
    const wakuNum = wakuEl?.className.match(/Waku(\d)/)?.[1] ?? '';

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
    const stable    = trainerEl?.textContent.trim() ?? '';

    const timeCells = [...tr.querySelectorAll('td.Time .RaceTime')];
    const finTime   = timeCells[0]?.textContent.trim() ?? '';
    const margin    = timeCells[1]?.textContent.trim() ?? '';

    const popularity = tr.querySelector('.OddsPeople')?.textContent.trim() ?? '';
    const odds       = tr.querySelector('.Odds_Ninki')?.textContent.trim() ?? '';

    const last3f = tr.querySelector('td.Time:not(:has(.RaceTime))')?.textContent.trim() ?? '';

    const corner = tr.querySelector('.PassageRate')?.textContent.trim() ?? '';

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

  const pace = document.querySelector('.RapPace_Title span')?.textContent.trim() ?? '';

  const haronRows = document.querySelectorAll('.Race_HaronTime tr.HaronTime');
  const haronLabels = [...document.querySelectorAll('.Race_HaronTime tr.Header th')]
                        .map(th => th.textContent.trim());

  const cumulativeTimes = [...(haronRows[0]?.querySelectorAll('td') ?? [])]
                            .map(td => td.textContent.trim());
  const splitTimes      = [...(haronRows[1]?.querySelectorAll('td') ?? [])]
                            .map(td => td.textContent.trim());

  const lapData = haronLabels.map((label, i) => ({
    point     : label,
    cumulative: cumulativeTimes[i] ?? '',
    split     : splitTimes[i] ?? '',
  }));

  const corners = {};
  document.querySelectorAll('.Corner_Num tbody tr').forEach(tr => {
    const label = tr.querySelector('th')?.textContent.trim() ?? '';
    const order = tr.querySelector('td')?.textContent.trim() ?? '';
    if (label) corners[label] = order;
  });

  const payouts = {};
  document.querySelectorAll('.Payout_Detail_Table tbody tr').forEach(tr => {
    const type   = tr.querySelector('th')?.textContent.trim() ?? '';
    if (!type) return;

    const nums = [...tr.querySelectorAll('td.Result span, td.Result li span')]
                   .map(el => el.textContent.trim()).filter(Boolean);
    const pays = [...tr.querySelectorAll('td.Payout span')]
                   .flatMap(el => el.innerHTML.split('<br>'))
                   .map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    const ninkis = [...tr.querySelectorAll('td.Ninki span')]
                     .map(el => el.textContent.trim()).filter(Boolean);

    payouts[type] = { nums, pays, ninkis };
  });

  const output = {
    raceInfo,
    pace,
    lapData,
    corners,
    results,
    payouts,
  };

  const titleDateM = document.title.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = titleDateM
    ? titleDateM[1] + titleDateM[2].padStart(2, '0') + titleDateM[3].padStart(2, '0')
    : (new Date().getFullYear() + String(new Date().getMonth()+1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0'));
  const venue  = raceInfo.category[1] ?? '';
  const raceN  = String(parseInt(raceInfo.raceId.slice(-2), 10)) + 'R';

  return { path: `${date}/${venue}${raceN}_${raceName}/result.json`, data: output };
}

// レース一覧ページ (race_list.html?kaisai_date=YYYYMMDD) から
// その日の全レースの {venue, raceNum, raceName, raceId} を抽出する。
// /fetch スキルが「日付+レース名」からrace_idを解決するために使う。
export function extractRaceList() {
  const VENUES = ['札幌','函館','福島','新潟','東京','中山','中京','京都','阪神','小倉'];
  const races = [];

  document.querySelectorAll('dl.RaceList_DataList').forEach(dl => {
    const titleText = dl.querySelector('.RaceList_DataTitle')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
    const venue = VENUES.find(v => titleText.includes(v)) ?? '';

    dl.querySelectorAll('li.RaceList_DataItem').forEach(li => {
      const a = li.querySelector('a[href*="race_id="]');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const raceId = (href.match(/race_id=(\d+)/) ?? [])[1] ?? '';
      if (!raceId) return;

      const numText = li.querySelector('.Race_Num')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
      const numMatch = numText.match(/(\d+)R/);
      const raceNum = numMatch ? `${numMatch[1]}R` : '';

      const raceName = li.querySelector('.RaceList_ItemTitle .ItemTitle')?.textContent.trim() ?? '';
      const time = li.querySelector('.RaceList_Itemtime')?.textContent.trim() ?? '';
      const headcountText = li.querySelector('.RaceList_Itemnumber')?.textContent.trim() ?? '';

      races.push({ venue, raceNum, raceName, raceId, time, headcount: headcountText });
    });
  });

  return races;
}
