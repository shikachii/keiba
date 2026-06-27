(function () {
  const VENUES = ['札幌','函館','福島','新潟','東京','中山','中京','京都','阪神','小倉'];

  // ━━━ レース情報 ━━━
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

  // ━━━ 出走馬 ━━━
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

  // ━━━ 保存パスを構築 ━━━
  const titleDateM = document.title.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = titleDateM
    ? titleDateM[1] + titleDateM[2].padStart(2, '0') + titleDateM[3].padStart(2, '0')
    : (new Date().getFullYear() + String(new Date().getMonth()+1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0'));
  const venue    = VENUES.find(v => raceData2.includes(v)) ?? '';
  const numMatch = raceInfo.レース番号.match(/(\d+)/);
  const raceN    = numMatch ? numMatch[1] + 'R' : raceInfo.レース番号;

  return { path: `${date}/${venue}${raceN}_${raceName}/shutuba.json`, data };
})();
