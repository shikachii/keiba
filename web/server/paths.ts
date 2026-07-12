import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '..', '..');
export const RACES_DIR = path.resolve(REPO_ROOT, 'races');

/**
 * date/dir はURLパラメータ由来の信頼できない入力。RACES_DIR配下に
 * 収まっているかを解決後のパスで検証し、パストラバーサルを防ぐ。
 */
export function resolveRaceDir(date: string, dir: string): string | null {
  const resolved = path.resolve(RACES_DIR, date, dir);
  const prefix = RACES_DIR + path.sep;
  if (!resolved.startsWith(prefix)) return null;
  return resolved;
}
