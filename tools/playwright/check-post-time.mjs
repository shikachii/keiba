#!/usr/bin/env node
// races/<date>/race_ids.json を読み、発走n分前〜発走前のレースのうち
// まだ馬体重再取得マーカー(.weight_refreshed)が無いものを一覧出力する。
//
// 使い方:
//   node check-post-time.mjs <YYYYMMDD> [--window=60]
//
// 出力: JSON配列 [{ dir, race_id, post_time, minutes_to_post }, ...]

import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const [, , dateArg, ...rest] = process.argv;
if (!dateArg) {
  console.error('日付を指定してください (例: 20260718)');
  process.exit(1);
}
const windowArg = rest.find(a => a.startsWith('--window='));
const windowMinutes = windowArg ? Number(windowArg.split('=')[1]) : 60;

const raceIdsPath = path.join(REPO_ROOT, 'races', dateArg, 'race_ids.json');
const mapping = JSON.parse(await readFile(raceIdsPath, 'utf-8'));

const y = Number(dateArg.slice(0, 4));
const m = Number(dateArg.slice(4, 6));
const d = Number(dateArg.slice(6, 8));

const now = new Date();

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

const results = [];
for (const [dir, info] of Object.entries(mapping)) {
  const [hh, mm] = info.post_time.split(':').map(Number);
  const postDate = new Date(y, m - 1, d, hh, mm, 0);
  const minutesToPost = (postDate.getTime() - now.getTime()) / 60000;

  const markerPath = path.join(REPO_ROOT, 'races', dateArg, dir, '.weight_refreshed');
  const alreadyRefreshed = await exists(markerPath);

  if (minutesToPost <= windowMinutes && minutesToPost > -5 && !alreadyRefreshed) {
    results.push({
      dir,
      race_id: info.race_id,
      post_time: info.post_time,
      minutes_to_post: Math.round(minutesToPost),
    });
  }
}

results.sort((a, b) => a.minutes_to_post - b.minutes_to_post);
console.log(JSON.stringify(results, null, 2));
