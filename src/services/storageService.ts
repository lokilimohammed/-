import {
  ChildCapacityProfile,
  MauritanianLawhProgress,
  MushafPageData,
  WeakWordEntry,
} from '../types/quran';

const DB_NAME = 'MishkatQuranPlatformDB';
const DB_VERSION = 1;

export interface SessionAnalyticsSummary {
  totalRecitedWords: number;
  correctWordsCount: number;
  memorizationErrorsCount: number;
  tajweedErrorsCount: number;
  mutashabihatErrorsCount: number;
  totalMinutesActive: number;
  completedLawhsCount: number;
  masteredJuzBadges: number[];
}

const DEFAULT_PROFILE: ChildCapacityProfile = {
  childName: 'عبدالرحمن الشنقيطي',
  age: 9,
  dailyNewCapacity: 'one_page',
  totalMemorizedJuz: 5, // 5 أجزاء (100 صفحة) قابلة للتعديل من 1 إلى 15 جزءاً
  currentTargetPage: 604,
  preferredSheikh: 'husary',
  hideAyahMarkers: false,
  hadrSpeedMode: false,
  asrEndpointUrl: 'wss://api.tarteel-whisper-quran.local/v1/stream',
};

const DEFAULT_ANALYTICS: SessionAnalyticsSummary = {
  totalRecitedWords: 1420,
  correctWordsCount: 1368,
  memorizationErrorsCount: 19,
  tajweedErrorsCount: 24,
  mutashabihatErrorsCount: 9,
  totalMinutesActive: 185,
  completedLawhsCount: 12,
  masteredJuzBadges: [30, 29, 28, 27, 26],
};

const DEFAULT_WEAK_WORDS: WeakWordEntry[] = [
  {
    wordId: '112:2:2:5',
    verseKey: '112:2',
    surahNameAr: 'الإخلاص',
    pageNumber: 604,
    textUthmani: 'ٱلصَّمَدُ',
    verseFullText: 'ٱللَّهُ ٱلصَّمَدُ',
    reason: 'tajweed_makharij',
    mistakeCount: 2,
    hesitationCount: 1,
    requiredDrillReps: 5,
    completedDrillReps: 2,
    lastTimestamp: Date.now() - 3600_000,
  },
  {
    wordId: '113:1:4:18',
    verseKey: '113:1',
    surahNameAr: 'الفلق',
    pageNumber: 604,
    textUthmani: 'ٱلْفَلَقِ',
    verseFullText: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
    reason: 'mutashabihat',
    mistakeCount: 1,
    hesitationCount: 2,
    requiredDrillReps: 5,
    completedDrillReps: 1,
    lastTimestamp: Date.now() - 1800_000,
  },
  {
    wordId: '113:4:3:31',
    verseKey: '113:4',
    surahNameAr: 'الفلق',
    pageNumber: 604,
    textUthmani: 'ٱلنَّفَّـٰثَـٰتِ',
    verseFullText: 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ',
    reason: 'hesitation_5s',
    mistakeCount: 1,
    hesitationCount: 3,
    requiredDrillReps: 5,
    completedDrillReps: 0,
    lastTimestamp: Date.now() - 900_000,
  },
];

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('mushaf_pages')) {
          db.createObjectStore('mushaf_pages', { keyPath: 'pageNumber' });
        }
        if (!db.objectStoreNames.contains('kv_store')) {
          db.createObjectStore('kv_store');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getCachedMushafPage(pageNumber: number): Promise<MushafPageData | null> {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('mushaf_pages', 'readonly');
      const store = tx.objectStore('mushaf_pages');
      const req = store.get(pageNumber);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveCachedMushafPage(page: MushafPageData): Promise<void> {
  const db = await openDatabase();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('mushaf_pages', 'readwrite');
      const store = tx.objectStore('mushaf_pages');
      store.put(page);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function loadChildProfile(): ChildCapacityProfile {
  try {
    const raw = localStorage.getItem('mishkat_child_profile');
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_PROFILE;
}

export function saveChildProfile(profile: ChildCapacityProfile): void {
  try {
    localStorage.setItem('mishkat_child_profile', JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadMauritanianProgress(pageNumber: number): MauritanianLawhProgress {
  try {
    const raw = localStorage.getItem(`mishkat_lawh_${pageNumber}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    pageNumber,
    completedRepetitions: 14, // يبدأ عند 14 من 100 لإظهار الانتقال التربوي بين المراحل
    currentStage: 1,
    verifiedVocalPassCount: 14,
    lastUpdated: new Date().toISOString(),
  };
}

export function saveMauritanianProgress(progress: MauritanianLawhProgress): void {
  try {
    localStorage.setItem(`mishkat_lawh_${progress.pageNumber}`, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function loadWeakWordsLog(): WeakWordEntry[] {
  try {
    const raw = localStorage.getItem('mishkat_weak_words_log');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_WEAK_WORDS;
}

export function saveWeakWordsLog(entries: WeakWordEntry[]): void {
  try {
    localStorage.setItem('mishkat_weak_words_log', JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function loadAnalyticsSummary(): SessionAnalyticsSummary {
  try {
    const raw = localStorage.getItem('mishkat_analytics_summary');
    if (raw) return { ...DEFAULT_ANALYTICS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_ANALYTICS;
}

export function saveAnalyticsSummary(summary: SessionAnalyticsSummary): void {
  try {
    localStorage.setItem('mishkat_analytics_summary', JSON.stringify(summary));
  } catch {
    // ignore
  }
}
