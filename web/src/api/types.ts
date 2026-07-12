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

export interface PastRace {
  順番: string;
  着順: string;
  日付場R: string;
  グレード?: string;
  レース名: string;
  条件?: string;
  頭数?: string;
  馬番?: string;
  人気?: string;
  コース?: string;
  回り?: string;
  馬場?: string;
  タイム?: string;
  騎手?: string;
  斤量?: string;
  馬体重?: string;
  増減?: string;
  前3F?: string;
  通過順?: string;
  後3F?: string;
  ペース?: string;
  勝ち馬?: string;
  着差?: string;
  備考?: string;
}

export interface Achievement {
  条件: string;
  勝: string;
  連: string;
  複: string;
  着外: string;
}

export interface Training {
  日コース?: string;
  タイム?: string;
  脚色?: string;
  評価?: string;
}

export interface NewspaperHorse {
  枠番: string;
  馬番: string;
  馬名: string;
  馬ID?: string;
  父?: string;
  母?: string;
  母父?: string;
  調教師?: string;
  馬主?: string;
  脚質ローテ?: string;
  馬体重?: string;
  オッズ?: string;
  人気?: string;
  性齢?: string;
  騎手?: string;
  斤量?: string;
  前走データ?: PastRace[];
  実績?: Achievement[];
  調教?: Training | null;
  厩舎コメント?: string;
  厩舎評価?: string;
}

export interface RaceInfo {
  レース名: string;
  レース番号: string;
  発走時刻?: string;
  コース?: string;
  天候?: string;
  馬場?: string;
  詳細?: string;
}

export interface NewspaperData {
  レース情報: RaceInfo;
  出走馬: NewspaperHorse[];
}

export interface LapEntry {
  point: string;
  split: string;
  cumulative: string;
}

export interface ResultEntry {
  rank: string;
  horseNum: string;
  wakuNum: string;
  horseName: string;
  sexAge?: string;
  weight?: string;
  jockey?: string;
  finTime?: string;
  margin?: string;
  corner?: string;
  last3f?: string;
  odds?: string;
  popularity?: string;
  bodyWeight?: string;
  bodyWeightDiff?: string;
  trainer?: string;
  stable?: string;
}

export interface PayoutEntry {
  nums: string[];
  pays: string[];
  ninkis: string[];
}

export interface ResultData {
  raceInfo?: Record<string, unknown>;
  corners?: Record<string, string>;
  lapData?: LapEntry[];
  pace?: string;
  results: ResultEntry[];
  payouts: Record<string, PayoutEntry>;
}

export interface RaceDetail {
  date: string;
  dir: string;
  venue: string;
  raceNumber: number;
  raceName: string;
  status: RaceStatus;
  newspaper: NewspaperData | null;
  shutuba: NewspaperData | null;
  result: ResultData | null;
  analysisMd: string | null;
  reviewMd: string | null;
}

export interface RulesLogResponse {
  content: string;
}
