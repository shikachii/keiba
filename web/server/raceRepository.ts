import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
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
  weightRefreshedAt: string | null;
}

export interface RaceSummaryItem {
  date: string;
  dir: string;
  venue: string;
  raceNumber: number;
  raceName: string;
  profitYen: number | null;
  recoveryRatePercent: number | null;
  betsMarkdown: string | null;
}

export interface AnalysisMark {
  horseNumber: number | null;
  horseName: string | null;
  popularity: number | null;
  odds: number | null;
  mark: string | null;
}

export interface AnalysisBet {
  type: string | null;
  points: string[];
  unitYen: number | null;
}

export interface AnalysisMeta {
  schema: string;
  race: {
    date: string | null;
    venue: string | null;
    raceNumber: number | null;
    raceName: string | null;
    course: string | null;
    headcount: number | null;
    favoriteOdds: number | null;
  };
  favoriteJudgement: string | null;
  paceForecast: string | null;
  marks: AnalysisMark[];
  rulesApplied: string[];
  bets: AnalysisBet[];
}

export interface ReviewRuleLogRow {
  ruleId: string;
  result: string;
  note: string | null;
}

export interface ReviewMeta {
  schema: string;
  race: {
    date: string | null;
    venue: string | null;
    raceNumber: number | null;
    raceName: string | null;
  };
  pace: { forecast: string | null; actual: string | null };
  result: { top3: number[] };
  rulesLog: ReviewRuleLogRow[];
  bets: {
    totalStakeYen: number | null;
    totalPayoutYen: number | null;
    profitYen: number | null;
    recoveryRatePercent: number | null;
  };
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
  analysisMeta: AnalysisMeta | null;
  reviewMeta: ReviewMeta | null;
  weightRefreshedAt: string | null;
}

function readJsonIfExists(filePath: string): unknown | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function readTextIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

// analysis.md/review.mdの冒頭YAML frontmatterを抽出してパースする。
// frontmatterがない（旧フォーマットの）レースはnullを返し、呼び出し側は正規表現ベースの
// 既存フォールバック（extractBetSummary等）で引き続き処理する。
function parseFrontmatter(text: string): Record<string, any> | null {
  const m = text.match(FRONTMATTER_RE);
  if (!m) return null;
  try {
    const data = loadYaml(m[1]);
    if (!data || typeof data !== 'object') return null;
    return data as Record<string, any>;
  } catch {
    return null;
  }
}

// 表示用Markdown本文からfrontmatterブロックを取り除く。frontmatterはanalysisMeta/reviewMetaとして
// 別途構造化データで提供されるため、react-markdown側でYAMLがそのまま箇条書き等に誤変換されるのを防ぐ。
function stripFrontmatter(text: string): string {
  return text.replace(FRONTMATTER_RE, '').replace(/^\n+/, '');
}

function parseAnalysisMeta(analysisMd: string | null): AnalysisMeta | null {
  if (!analysisMd) return null;
  const d = parseFrontmatter(analysisMd);
  if (!d || d.schema !== 'analysis/v1') return null;

  const race = d.race ?? {};
  return {
    schema: d.schema,
    race: {
      date: race.date ?? null,
      venue: race.venue ?? null,
      raceNumber: race.raceNumber ?? null,
      raceName: race.raceName ?? null,
      course: race.course ?? null,
      headcount: race.headcount ?? null,
      favoriteOdds: race.favoriteOdds ?? null,
    },
    favoriteJudgement: d.favoriteJudgement ?? null,
    paceForecast: d.paceForecast ?? null,
    marks: Array.isArray(d.marks)
      ? d.marks.map((m: any) => ({
          horseNumber: m?.horseNumber ?? null,
          horseName: m?.horseName ?? null,
          popularity: m?.popularity ?? null,
          odds: m?.odds ?? null,
          mark: m?.mark ?? null,
        }))
      : [],
    rulesApplied: Array.isArray(d.rulesApplied) ? d.rulesApplied.map(String) : [],
    bets: Array.isArray(d.bets)
      ? d.bets.map((b: any) => ({
          type: b?.type ?? null,
          points: Array.isArray(b?.points) ? b.points.map(String) : [],
          unitYen: b?.unitYen ?? null,
        }))
      : [],
  };
}

function parseReviewMeta(reviewMd: string | null): ReviewMeta | null {
  if (!reviewMd) return null;
  const d = parseFrontmatter(reviewMd);
  if (!d || d.schema !== 'review/v1') return null;

  const race = d.race ?? {};
  const pace = d.pace ?? {};
  const result = d.result ?? {};
  const bets = d.bets ?? {};
  return {
    schema: d.schema,
    race: {
      date: race.date ?? null,
      venue: race.venue ?? null,
      raceNumber: race.raceNumber ?? null,
      raceName: race.raceName ?? null,
    },
    pace: {
      forecast: pace.forecast ?? null,
      actual: pace.actual ?? null,
    },
    result: {
      top3: Array.isArray(result.top3) ? result.top3.map(Number) : [],
    },
    rulesLog: Array.isArray(d.rulesLog)
      ? d.rulesLog.map((r: any) => ({
          ruleId: String(r?.ruleId ?? ''),
          result: String(r?.result ?? ''),
          note: r?.note ?? null,
        }))
      : [],
    bets: {
      totalStakeYen: bets.totalStakeYen ?? null,
      totalPayoutYen: bets.totalPayoutYen ?? null,
      profitYen: bets.profitYen ?? null,
      recoveryRatePercent: bets.recoveryRatePercent ?? null,
    },
  };
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

function getWeightRefreshedAt(raceDirPath: string): string | null {
  const markerPath = path.join(raceDirPath, '.weight_refreshed');
  if (!fs.existsSync(markerPath)) return null;
  const { mtime } = fs.statSync(markerPath);
  const hh = String(mtime.getHours()).padStart(2, '0');
  const mm = String(mtime.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
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
        weightRefreshedAt: getWeightRefreshedAt(raceDirPath),
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
    analysisMd: analysisMd !== null ? stripFrontmatter(analysisMd) : null,
    reviewMd: reviewMd !== null ? stripFrontmatter(reviewMd) : null,
    analysisMeta: parseAnalysisMeta(analysisMd),
    reviewMeta: parseReviewMeta(reviewMd),
    weightRefreshedAt: getWeightRefreshedAt(raceDirPath),
  };
}

const BET_SECTION_HEADING_RE = /^##[ \t]*.*収支記録.*$/m;
// 「収支」に半角/全角コロンが直接続く行、または「| 収支 | -290円 |」形式のテーブル行のみを対象とする。
// review.md の Step5 は自由記述のMarkdownで金額の書き方が統一されていないため、
// 「収支」という語の近くにある無関係な数値（購入点数・投資額など）を誤って拾わないよう、
// 意味的に確実な位置（コロン直後・テーブルの値セル）にのみマッチを絞る。
const PROFIT_COLON_RE = /収支[:：][ \t]*\*{0,2}([+-]?[\d,]+)[ \t]*円/;
const PROFIT_TABLE_RE = /\|[ \t]*\*{0,2}収支\*{0,2}[ \t]*\|[ \t]*\*{0,2}([+-]?[\d,]+)[ \t]*円/;
const RECOVERY_RATE_RE = /回収率[^\n\d%％]{0,10}([\d.]+)[ \t]*[%％]/;

function extractBetSection(reviewMd: string): string | null {
  const headingIdx = reviewMd.search(BET_SECTION_HEADING_RE);
  if (headingIdx === -1) return null;
  const rest = reviewMd.slice(headingIdx);
  const headingLineEnd = rest.indexOf('\n');
  const body = headingLineEnd === -1 ? '' : rest.slice(headingLineEnd + 1);
  const nextHeadingIdx = body.search(/^##[ \t]/m);
  const section = nextHeadingIdx === -1 ? body : body.slice(0, nextHeadingIdx);
  return section.trim() || null;
}

export function extractBetSummary(reviewMd: string | null): {
  betsMarkdown: string | null;
  profitYen: number | null;
  recoveryRatePercent: number | null;
} {
  if (!reviewMd) return { betsMarkdown: null, profitYen: null, recoveryRatePercent: null };

  const section = extractBetSection(reviewMd);
  if (!section) return { betsMarkdown: null, profitYen: null, recoveryRatePercent: null };

  const profitMatch = section.match(PROFIT_COLON_RE) ?? section.match(PROFIT_TABLE_RE);
  const recoveryMatch = section.match(RECOVERY_RATE_RE);

  return {
    betsMarkdown: section,
    profitYen: profitMatch ? Number(profitMatch[1].replace(/,/g, '')) : null,
    recoveryRatePercent: recoveryMatch ? Number(recoveryMatch[1]) : null,
  };
}

export function listRaceSummaries(): RaceSummaryItem[] {
  return listRaces()
    .filter((race) => race.hasReview)
    .map((race) => {
      const raceDirPath = resolveRaceDir(race.date, race.dir);
      const reviewMd = raceDirPath ? readTextIfExists(path.join(raceDirPath, 'review.md')) : null;
      const reviewMeta = parseReviewMeta(reviewMd);
      const { betsMarkdown, profitYen: regexProfitYen, recoveryRatePercent: regexRecoveryRate } =
        extractBetSummary(reviewMd);
      return {
        date: race.date,
        dir: race.dir,
        venue: race.venue,
        raceNumber: race.raceNumber,
        raceName: race.raceName,
        // frontmatter（新フォーマット）優先、なければ旧フォーマット向けの正規表現抽出にフォールバック。
        profitYen: reviewMeta?.bets.profitYen ?? regexProfitYen,
        recoveryRatePercent: reviewMeta?.bets.recoveryRatePercent ?? regexRecoveryRate,
        betsMarkdown,
      };
    });
}

export function getRulesLog(): string | null {
  return readTextIfExists(path.join(RACES_DIR, 'rules_log.md'));
}

export interface RuleStatItem {
  ruleId: string;
  okCount: number;
  ngCount: number;
  warnCount: number;
}

function splitRuleIds(raw: string): string[] {
  return raw
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      // 「C-02（準用）」のようにR-XX/C-XX直後に注釈が付くケースはIDのみ抽出。
      // 「（新規候補）...」「（傾向メモ）...」等の非公式ルールはラベル全体を1つのIDとして扱う。
      const m = token.match(/^([RC]-\d+[a-z]?)/);
      return m ? m[1] : token;
    });
}

function countSymbol(text: string, symbol: string): number {
  return text.split(symbol).length - 1;
}

// races/rules_log.md の「## ログ」表（既に運用上厳格に維持されている構造化Markdown）を
// パースしてルールID別の✅❌⚠️集計を返す。analysis/review.mdのfrontmatter対応を待たずに
// 全レース分（新旧問わず）すぐ使える。
export function getRuleStats(): RuleStatItem[] {
  const content = getRulesLog();
  if (!content) return [];

  const logHeadingIdx = content.indexOf('## ログ');
  if (logHeadingIdx === -1) return [];
  const afterHeading = content.slice(logHeadingIdx);
  const nextHeadingIdx = afterHeading.indexOf('\n## ', 1);
  const section = nextHeadingIdx === -1 ? afterHeading : afterHeading.slice(0, nextHeadingIdx);

  const stats = new Map<string, RuleStatItem>();

  for (const line of section.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());
    if (cells.length < 4) continue;
    const [ruleIdRaw, , , resultRaw] = cells;
    if (!ruleIdRaw || ruleIdRaw === 'ルールID' || /^-+$/.test(ruleIdRaw)) continue;

    const okCount = countSymbol(resultRaw, '✅');
    const ngCount = countSymbol(resultRaw, '❌');
    const warnCount = countSymbol(resultRaw, '⚠️');
    if (okCount === 0 && ngCount === 0 && warnCount === 0) continue;

    for (const ruleId of splitRuleIds(ruleIdRaw)) {
      const existing = stats.get(ruleId) ?? { ruleId, okCount: 0, ngCount: 0, warnCount: 0 };
      existing.okCount += okCount;
      existing.ngCount += ngCount;
      existing.warnCount += warnCount;
      stats.set(ruleId, existing);
    }
  }

  return Array.from(stats.values()).sort((a, b) => b.ngCount - a.ngCount || b.okCount - a.okCount);
}

export interface OddsScatterPoint {
  date: string;
  dir: string;
  venue: string;
  raceNumber: number;
  horseNumber: number;
  horseName: string | null;
  popularity: number;
  odds: number;
  mark: string | null;
  resultRank: number | null;
}

function buildRankByHorseNum(result: unknown): Map<number, number> {
  const map = new Map<number, number>();
  const results = (result as any)?.results;
  if (!Array.isArray(results)) return map;
  for (const r of results) {
    const num = Number(r?.horseNum);
    const rank = Number(r?.rank);
    if (!Number.isNaN(num) && !Number.isNaN(rank)) map.set(num, rank);
  }
  return map;
}

// analysis.mdのfrontmatter（marks）が入っているレースのみが対象。frontmatter未対応の
// 旧レースは自然に対象外となり、新スキル運用のレースが増えるにつれてデータが蓄積する。
export function getOddsScatterData(): OddsScatterPoint[] {
  const points: OddsScatterPoint[] = [];

  for (const race of listRaces()) {
    if (!race.hasAnalysis || !race.hasResult) continue;
    const raceDirPath = resolveRaceDir(race.date, race.dir);
    if (!raceDirPath) continue;

    const analysisMd = readTextIfExists(path.join(raceDirPath, 'analysis.md'));
    const meta = parseAnalysisMeta(analysisMd);
    if (!meta || meta.marks.length === 0) continue;

    const result = readJsonIfExists(path.join(raceDirPath, 'result.json'));
    const rankByHorseNum = buildRankByHorseNum(result);

    for (const m of meta.marks) {
      if (m.horseNumber == null || m.odds == null || m.popularity == null) continue;
      points.push({
        date: race.date,
        dir: race.dir,
        venue: race.venue,
        raceNumber: race.raceNumber,
        horseNumber: m.horseNumber,
        horseName: m.horseName,
        popularity: m.popularity,
        odds: m.odds,
        mark: m.mark,
        resultRank: rankByHorseNum.get(m.horseNumber) ?? null,
      });
    }
  }

  return points;
}

export interface CourseStatItem {
  course: string;
  raceCount: number;
  profitYen: number;
  knownProfitCount: number;
}

// コース別成績。course（芝1200m等）はshutuba.jsonから全レース共通で取得できるため、
// analysis.mdのfrontmatter対応を待たずに新旧問わず全レースが対象になる。
// venue+courseで束ねる（同じ「芝1200m」でも競馬場ごとに傾向が異なるため。CLAUDE.mdのコース別傾向メモ参照）。
// 十分なサンプル数が溜まるまではWeb側で「データ不足」表示にする想定（件数はraceCountで判断）。
export function getCourseStats(): CourseStatItem[] {
  const summaryByDir = new Map<string, RaceSummaryItem>();
  for (const s of listRaceSummaries()) {
    summaryByDir.set(`${s.date}/${s.dir}`, s);
  }

  const stats = new Map<string, CourseStatItem>();
  for (const race of listRaces()) {
    if (!race.hasReview || !race.course) continue;
    const course = `${race.venue}${race.course}`;

    const existing = stats.get(course) ?? { course, raceCount: 0, profitYen: 0, knownProfitCount: 0 };
    existing.raceCount += 1;

    const summary = summaryByDir.get(`${race.date}/${race.dir}`);
    if (summary?.profitYen !== null && summary?.profitYen !== undefined) {
      existing.profitYen += summary.profitYen;
      existing.knownProfitCount += 1;
    }

    stats.set(course, existing);
  }

  return Array.from(stats.values()).sort((a, b) => b.raceCount - a.raceCount);
}
