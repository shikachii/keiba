import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getCourseStats,
  getOddsScatterData,
  getRaceDetail,
  getRulesLog,
  getRuleStats,
  listRaces,
  listRaceSummaries,
} from './raceRepository.ts';

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// パスは静的ビルド版（GitHub Pages用にpublic/api/配下へ書き出す実ファイル）と
// 完全に同じ形（.json拡張子つき）にしておくことで、dev(ミドルウェア)/本番(静的ファイル)を
// フロントエンドの同じfetch URL構築ロジックで扱えるようにしている。
const RACE_DETAIL_RE = /^\/api\/races\/([^/]+)\/([^/]+)\.json$/;

export function apiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url ?? '';
  if (!url.startsWith('/api/')) {
    next();
    return;
  }

  const [pathname] = url.split('?');

  if (pathname === '/api/races.json') {
    sendJson(res, 200, listRaces());
    return;
  }

  if (pathname === '/api/summary.json') {
    sendJson(res, 200, listRaceSummaries());
    return;
  }

  if (pathname === '/api/rule-stats.json') {
    sendJson(res, 200, getRuleStats());
    return;
  }

  if (pathname === '/api/odds-scatter.json') {
    sendJson(res, 200, getOddsScatterData());
    return;
  }

  if (pathname === '/api/course-stats.json') {
    sendJson(res, 200, getCourseStats());
    return;
  }

  if (pathname === '/api/rules-log.json') {
    const content = getRulesLog();
    if (content === null) {
      sendJson(res, 404, { error: 'rules_log.md not found' });
      return;
    }
    sendJson(res, 200, { content });
    return;
  }

  const detailMatch = pathname.match(RACE_DETAIL_RE);
  if (detailMatch) {
    const date = decodeURIComponent(detailMatch[1]);
    const dir = decodeURIComponent(detailMatch[2]);
    const detail = getRaceDetail(date, dir);
    if (!detail) {
      sendJson(res, 404, { error: 'race not found' });
      return;
    }
    sendJson(res, 200, detail);
    return;
  }

  sendJson(res, 404, { error: 'unknown API route' });
}
