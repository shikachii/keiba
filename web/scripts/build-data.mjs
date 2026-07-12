// GitHub Pages（静的ホスティング）向けに races/ の内容を public/api/ 配下へ
// JSON スナップショットとして書き出すビルド前処理。
// dev時はVite middleware（server/apiHandlers.ts）が同じロジック(server/raceRepository.ts)を
// 都度リクエストごとに実行するのに対し、ここではデプロイ直前に1回だけ実行してファイル化する。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listRaces, getRaceDetail, getRulesLog } from '../server/raceRepository.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'api');

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });

const races = listRaces();
writeJson(path.join(OUT_DIR, 'races.json'), races);

for (const race of races) {
  const detail = getRaceDetail(race.date, race.dir);
  writeJson(path.join(OUT_DIR, 'races', race.date, `${race.dir}.json`), detail);
}

const rulesLogContent = getRulesLog();
writeJson(path.join(OUT_DIR, 'rules-log.json'), { content: rulesLogContent ?? '' });

console.log(`races.json: ${races.length}件`);
console.log(`race detail: ${races.length}ファイル`);
console.log(`rules-log.json: ${rulesLogContent ? rulesLogContent.length : 0}文字`);
