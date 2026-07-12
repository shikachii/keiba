import fs from 'node:fs';
import path from 'node:path';
import { RACES_DIR, resolveRaceDir } from './paths.ts';

const DATE_DIR_RE = /^\d{8}$/;
const RACE_DIR_RE = /^(.+?)(\d+)R_(.+)$/;

export type RaceStatus = '未着手' | '予想のみ' | '施行済み(レビュー未)' | '施行済み';

export interface RaceListItem {
  date: string;
  dir: string;
  venue: string;
  raceNumber: number;
  raceName: string;
  startTime: string | null;
  course: string | null;
  weather: string | null;
  trackCondition: string | null;
  headcount: number;
  hasAnalysis: boolean;
  hasResult: boolean;
  hasReview: boolean;
  status: RaceStatus;
}

export interface RaceDetail {
  date: string;
  dir: string;
  venue: string;
  raceNumber: number;
  raceName: string;
  status: RaceStatus;
  newspaper: unknown | null;
  shutuba: unknown | null;
  result: unknown | null;
  analysisMd: string | null;
  reviewMd: string | null;
}

function readJsonIfExists(filePath: string): unknown | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function readTextIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function parseRaceDirName(dirName: string): { venue: string; raceNumber: number; raceName: string } | null {
  const m = dirName.match(RACE_DIR_RE);
  if (!m) return null;
  return { venue: m[1], raceNumber: Number(m[2]), raceName: m[3] };
}

function computeStatus(hasAnalysis: boolean, hasResult: boolean, hasReview: boolean): RaceStatus {
  if (!hasResult) return hasAnalysis ? '予想のみ' : '未着手';
  return hasReview ? '施行済み' : '施行済み(レビュー未)';
}

function extractRaceInfo(shutuba: unknown): {
  startTime: string | null;
  course: string | null;
  weather: string | null;
  trackCondition: string | null;
  headcount: number;
} {
  const info = (shutuba as any)?.['レース情報'] ?? {};
  const horses = (shutuba as any)?.['出走馬'] ?? [];
  return {
    startTime: info['発走時刻'] ?? null,
    course: info['コース'] ?? null,
    weather: info['天候'] ?? null,
    trackCondition: info['馬場'] ?? null,
    headcount: Array.isArray(horses) ? horses.length : 0,
  };
}

export function listRaces(): RaceListItem[] {
  if (!fs.existsSync(RACES_DIR)) return [];

  const items: RaceListItem[] = [];
  const dateDirs = fs
    .readdirSync(RACES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && DATE_DIR_RE.test(d.name))
    .map((d) => d.name);

  for (const date of dateDirs) {
    const dateDirPath = path.join(RACES_DIR, date);
    const raceDirs = fs
      .readdirSync(dateDirPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const dir of raceDirs) {
      const raceDirPath = path.join(dateDirPath, dir);
      const shutubaPath = path.join(raceDirPath, 'shutuba.json');
      if (!fs.existsSync(shutubaPath)) continue; // 旧フォーマット除外

      const parsed = parseRaceDirName(dir);
      if (!parsed) continue;

      const shutuba = readJsonIfExists(shutubaPath);
      const { startTime, course, weather, trackCondition, headcount } = extractRaceInfo(shutuba);

      const hasAnalysis = fs.existsSync(path.join(raceDirPath, 'analysis.md'));
      const hasResult = fs.existsSync(path.join(raceDirPath, 'result.json'));
      const hasReview = fs.existsSync(path.join(raceDirPath, 'review.md'));

      items.push({
        date,
        dir,
        venue: parsed.venue,
        raceNumber: parsed.raceNumber,
        raceName: parsed.raceName,
        startTime,
        course,
        weather,
        trackCondition,
        headcount,
        hasAnalysis,
        hasResult,
        hasReview,
        status: computeStatus(hasAnalysis, hasResult, hasReview),
      });
    }
  }

  items.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.raceNumber - b.raceNumber;
  });

  return items;
}

export function getRaceDetail(date: string, dir: string): RaceDetail | null {
  const raceDirPath = resolveRaceDir(date, dir);
  if (!raceDirPath || !fs.existsSync(raceDirPath)) return null;

  const shutubaPath = path.join(raceDirPath, 'shutuba.json');
  if (!fs.existsSync(shutubaPath)) return null; // 旧フォーマット除外

  const parsed = parseRaceDirName(dir);
  if (!parsed) return null;

  const shutuba = readJsonIfExists(shutubaPath);
  const newspaper = readJsonIfExists(path.join(raceDirPath, 'newspaper.json'));
  const result = readJsonIfExists(path.join(raceDirPath, 'result.json'));
  const analysisMd = readTextIfExists(path.join(raceDirPath, 'analysis.md'));
  const reviewMd = readTextIfExists(path.join(raceDirPath, 'review.md'));

  return {
    date,
    dir,
    venue: parsed.venue,
    raceNumber: parsed.raceNumber,
    raceName: parsed.raceName,
    status: computeStatus(analysisMd !== null, result !== null, reviewMd !== null),
    newspaper,
    shutuba,
    result,
    analysisMd,
    reviewMd,
  };
}

export function getRulesLog(): string | null {
  return readTextIfExists(path.join(RACES_DIR, 'rules_log.md'));
}
