#!/usr/bin/env node
// netkeibaの出馬表・競馬新聞・レース結果をPlaywrightで取得し races/ 配下にJSON保存するCLI。
//
// 使い方:
//   node fetch-race.mjs list <YYYYMMDD>
//   node fetch-race.mjs shutuba <race_id>
//   node fetch-race.mjs newspaper <race_id>
//   node fetch-race.mjs result <race_id>
//   node fetch-race.mjs all <race_id>

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractShutuba, extractNewspaper, extractResult, extractRaceList } from './lib/extract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const RACES_DIR = path.join(REPO_ROOT, 'races');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

async function withPage(fn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA, locale: 'ja-JP' });
  const page = await context.newPage();
  try {
    return await fn(page);
  } finally {
    await browser.close();
  }
}

async function saveJson(relPath, data) {
  const dest = path.join(RACES_DIR, relPath);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ 保存: races/${relPath}`);
  return dest;
}

async function cmdList(date) {
  if (!date) throw new Error('日付を指定してください (例: 20260712)');
  await withPage(async page => {
    await page.goto(`https://race.netkeiba.com/top/race_list.html?kaisai_date=${date}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('dl.RaceList_DataList', { timeout: 20000 }).catch(() => {});
    const races = await page.evaluate(extractRaceList);
    console.log(JSON.stringify(races, null, 2));
  });
}

async function cmdShutuba(raceId) {
  if (!raceId) throw new Error('race_idを指定してください');
  await withPage(async page => {
    await page.goto(`https://race.netkeiba.com/race/shutuba.html?race_id=${raceId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('tr.HorseList', { timeout: 20000 });
    // オッズはページ描画後に非同期(XHR)で流し込まれるため、プレースホルダー("---.-")から
    // 実値に変わるまで待つ（未発売等で確定しない場合もあるためタイムアウトしても続行する）
    await page.waitForFunction(() => {
      const el = document.querySelector('span[id^="odds-"]');
      return el && el.textContent.trim() !== '---.-';
    }, { timeout: 8000 }).catch(() => {});
    const { path: relPath, data } = await page.evaluate(extractShutuba);
    await saveJson(relPath, data);
  });
}

async function cmdNewspaper(raceId) {
  if (!raceId) throw new Error('race_idを指定してください');
  await withPage(async page => {
    await page.goto(`https://race.netkeiba.com/race/newspaper.html?race_id=${raceId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('dl.HorseList', { timeout: 20000 });
    // オッズはページ描画後に非同期(XHR)で流し込まれるため、プレースホルダー("---.-")から
    // 実値に変わるまで待つ（未発売等で確定しない場合もあるためタイムアウトしても続行する）
    await page.waitForFunction(() => {
      const el = document.querySelector('span[id^="odds-"]');
      return el && el.textContent.trim() !== '---.-';
    }, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300); // 厩舎コメント等の残り描画待ち
    const raw = await page.evaluate(extractNewspaper);
    const { path: relPath, data } = typeof raw === 'string' ? JSON.parse(raw) : raw;
    await saveJson(relPath, data);
  });
}

async function cmdResult(raceId) {
  if (!raceId) throw new Error('race_idを指定してください');
  await withPage(async page => {
    await page.goto(`https://race.netkeiba.com/race/result.html?race_id=${raceId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#All_Result_Table tbody tr.HorseList', { timeout: 20000 });
    const { path: relPath, data } = await page.evaluate(extractResult);
    await saveJson(relPath, data);
  });
}

async function cmdAll(raceId) {
  await cmdShutuba(raceId);
  await cmdNewspaper(raceId);
  try {
    await cmdResult(raceId);
  } catch (e) {
    console.log('ℹ️ レース結果は未取得（レース未実施の可能性）:', e.message);
  }
}

const commands = { list: cmdList, shutuba: cmdShutuba, newspaper: cmdNewspaper, result: cmdResult, all: cmdAll };

const [, , cmd, arg] = process.argv;

if (!commands[cmd]) {
  console.error('使い方: node fetch-race.mjs <list|shutuba|newspaper|result|all> <引数>');
  process.exit(1);
}

try {
  await commands[cmd](arg);
} catch (e) {
  console.error('❌ エラー:', e.message);
  process.exit(1);
}
