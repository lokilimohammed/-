export type RecitationMode =
  | 'daily_ward_hidden'     // تسميع الورد اليومي (إخفاء إجباري)
  | 'review_hidden'         // تسميع المراجعة - الحصون الخمسة (إخفاء إجباري + سرعة الحدر)
  | 'mauritanian_100x';     // اللوح الشنقيطي (مراحل التكرار الـ 100)

export type MauritanianStageId = 1 | 2 | 3 | 4;

export interface MauritanianStageInfo {
  id: MauritanianStageId;
  title: string;
  subtitle: string;
  targetCount: number;
  startRep: number;
  endRep: number;
  visibilityMode: 'full_visible_audio' | 'full_visible_tajweed' | 'half_hidden_alternating' | 'strict_hidden_100';
}

export type MistakeCategory = 'memorization' | 'tajweed_makharij' | 'mutashabihat';

export type TajweedHeadType =
  | 'tafkheem_tarqeeq'   // التفخيم والترقيق
  | 'qalqalah'           // القلقلة (قطب جد)
  | 'ghunnah'            // الغنة (نّ / مّ)
  | 'madd_tabeei'        // المد الطبيعي والفرعي
  | 'idgham'             // الإدغام
  | 'ikhfaa'             // الإخفاء
  | 'iqlab'              // الإقلاب
  | 'izhar'              // الإظهار الحلقي
  | 'hams_jahr'          // الهمس والجهر
  | 'shiddah_rakhawah'   // الشدة والرخاوة
  | 'itbaq_infitah';     // الإطباق والانفتاح

export interface TajweedRuleAnnotation {
  head: TajweedHeadType;
  labelAr: string;
  letter: string;
  makhrajAr: string;
  colorHex: string;
  adviceAr: string;
}

export interface QuranWord {
  id: string;
  globalIndex: number; // 0-based index on the page
  verseKey: string;    // e.g. "112:1"
  surahNumber: number;
  surahNameAr: string;
  ayahNumber: number;
  wordPosition: number;
  pageNumber: number;
  lineNumber: number;  // 1 to 15 (Standard Madinah Mushaf)
  textUthmani: string;
  textImlaeiSimple: string;
  audioUrl?: string;
  isAyahEnd?: boolean;
  tajweedRules?: TajweedRuleAnnotation[];
  mutashabihatRef?: {
    similarSurahName: string;
    similarVerseKey: string;
    similarContinuation: string;
    correctContinuation: string;
    warningNote: string;
  };
}

export interface MushafPageData {
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  surahHeaders: {
    lineNumber: number;
    surahNumber: number;
    surahNameAr: string;
    hasBasmalah: boolean;
  }[];
  words: QuranWord[];
  source: 'quran_com_v4' | 'alquran_cloud' | 'local_indexeddb';
}

export interface WordEvaluationResult {
  status: 'correct' | 'memorization_error' | 'tajweed_error' | 'mutashabihat_error';
  matchedScore: number; // 0 to 100
  normalizedSpoken: string;
  normalizedTargetUthmani: string;
  normalizedTargetImlaei: string;
  feedbackTitle: string;
  feedbackDetail: string;
  tajweedAlert?: {
    confusedPair: string; // e.g. "س بدلاً من ص"
    ruleName: string;
    makhrajExplanation: string;
    head: TajweedHeadType;
    sheikhAudioUrl: string;
  };
  mutashabihatAlert?: {
    spokenContinuation: string;
    confusedSurahName: string;
    confusedVerseKey: string;
    correctSurahName: string;
    correctVerseKey: string;
    guidance: string;
  };
}

export interface WeakWordEntry {
  wordId: string;
  verseKey: string;
  surahNameAr: string;
  pageNumber: number;
  textUthmani: string;
  verseFullText: string;
  reason: 'hesitation_3s' | 'hesitation_5s' | 'memorization' | 'tajweed_makharij' | 'mutashabihat';
  mistakeCount: number;
  hesitationCount: number;
  requiredDrillReps: number; // Default 5 mandatory repetitions at end of session
  completedDrillReps: number;
  lastTimestamp: number;
}

export interface ChildCapacityProfile {
  childName: string;
  age: number;
  dailyNewCapacity: 'half_page' | 'one_page' | 'two_pages';
  totalMemorizedJuz: number; // 1 to 15 Juz (20 to 300 pages)
  currentTargetPage: number; // 1 to 604
  preferredSheikh: 'husary' | 'minshawi';
  hideAyahMarkers: boolean;
  hadrSpeedMode: boolean; // مرتبة الحدر (20 دقيقة للجزء)
  asrEndpointUrl: string; // WebSocket / REST Hook for tarteel-ai/whisper-base-ar-quran & muaalem El Quran
}

export interface MauritanianLawhProgress {
  pageNumber: number;
  completedRepetitions: number; // 0 to 100
  currentStage: MauritanianStageId;
  verifiedVocalPassCount: number;
  lastUpdated: string;
}

export interface FortressTubeDay {
  dayIndex: number;
  dayNameAr: string;
  fromPage: number;
  toPage: number;
  pagesCount: number;
  juzLabel: string;
  estimatedMinutesHadr: number;
  completedToday: boolean;
}

export interface FiveFortressesPlan {
  totalMemorizedJuz: number;
  totalMemorizedPages: number;
  currentTargetPage: number;
  fortress1Preparation: {
    weeklyPagesFrom: number;
    weeklyPagesTo: number;
    nightlyPage: number;
    preSessionListeningMinutes: number;
  };
  fortress2NewLawh: {
    targetPage: number;
    pagesCount: number;
    requiredRepetitions: 100;
  };
  fortress3NearReview: {
    fromPage: number;
    toPage: number;
    pagesCount: number; // Always up to 20 adjacent pages
    mandatoryHiddenMode: true;
  };
  fortress4And5FarReview: {
    totalFarPages: number;
    dailyPagesQuota: number;
    cycleDays: number;
    hadrTargetMinutesPerJuz: 20;
    weeklyTubes: FortressTubeDay[];
  };
}
