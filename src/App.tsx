/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PAGE_604_MADINAH } from './data/mushafFallbackData';
import {
  ChildCapacityProfile,
  MauritanianLawhProgress,
  MushafPageData,
  RecitationMode,
  WeakWordEntry,
  WordEvaluationResult,
} from './types/quran';
import { fetchMadinahMushafPage } from './services/quranApiService';
import {
  SessionAnalyticsSummary,
  loadAnalyticsSummary,
  loadChildProfile,
  loadMauritanianProgress,
  loadWeakWordsLog,
  saveAnalyticsSummary,
  saveChildProfile,
  saveMauritanianProgress,
  saveWeakWordsLog,
} from './services/storageService';
import { ActiveTabId, TopNav } from './components/TopNav';
import { MushafWorkspace } from './components/MushafWorkspace';
import { FiveFortressesView } from './components/FiveFortressesView';
import { TajweedMutashabihatLab } from './components/TajweedMutashabihatLab';
import { ParentsAnalyticsView } from './components/ParentsAnalyticsView';
import { ChildCapacityModal } from './components/ChildCapacityModal';

const THEME_STORAGE_KEY = 'mishkat_dark_mode';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabId>('mushaf');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const [profile, setProfile] = useState<ChildCapacityProfile>(() => loadChildProfile());
  const [recitationMode, setRecitationMode] = useState<RecitationMode>('daily_ward_hidden');
  const [activeSessionBanner, setActiveSessionBanner] = useState<string | null>(null);

  const [currentPageData, setCurrentPageData] = useState<MushafPageData>(PAGE_604_MADINAH);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);

  const [mauritanianProgress, setMauritanianProgress] = useState<MauritanianLawhProgress>(() =>
    loadMauritanianProgress(604)
  );
  const [weakWordsLog, setWeakWordsLog] = useState<WeakWordEntry[]>(() => loadWeakWordsLog());
  const [analytics, setAnalytics] = useState<SessionAnalyticsSummary>(() => loadAnalyticsSummary());
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDarkMode]);

  const handleLoadPage = async (pageNumber: number) => {
    setIsLoadingPage(true);
    try {
      const data = await fetchMadinahMushafPage(pageNumber);
      setCurrentPageData(data);
      const savedLawh = loadMauritanianProgress(pageNumber);
      setMauritanianProgress(savedLawh);
      const nextProfile = { ...profile, currentTargetPage: pageNumber };
      setProfile(nextProfile);
      saveChildProfile(nextProfile);
    } finally {
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    handleLoadPage(profile.currentTargetPage || 604);
  }, []);

  const handleUpdateProfile = (next: ChildCapacityProfile) => {
    setProfile(next);
    saveChildProfile(next);
  };

  const handleUpdateMauritanianProgress = (next: MauritanianLawhProgress) => {
    setMauritanianProgress(next);
    saveMauritanianProgress(next);
  };

  const handleLogWeakWord = (entry: Omit<WeakWordEntry, 'lastTimestamp'>) => {
    setWeakWordsLog((prev) => {
      const existingIdx = prev.findIndex((item) => item.wordId === entry.wordId);
      let updated: WeakWordEntry[];
      if (existingIdx >= 0) {
        updated = prev.map((item, idx) =>
          idx === existingIdx
            ? {
                ...item,
                mistakeCount: item.mistakeCount + entry.mistakeCount,
                hesitationCount: item.hesitationCount + entry.hesitationCount,
                lastTimestamp: Date.now(),
              }
            : item
        );
      } else {
        updated = [
          {
            ...entry,
            lastTimestamp: Date.now(),
          },
          ...prev,
        ];
      }
      saveWeakWordsLog(updated);
      return updated;
    });
  };

  const handleRecordEvaluationStat = (status: WordEvaluationResult['status']) => {
    setAnalytics((prev) => {
      const next: SessionAnalyticsSummary = {
        ...prev,
        totalRecitedWords: prev.totalRecitedWords + 1,
        correctWordsCount: status === 'correct' ? prev.correctWordsCount + 1 : prev.correctWordsCount,
        memorizationErrorsCount:
          status === 'memorization_error'
            ? prev.memorizationErrorsCount + 1
            : prev.memorizationErrorsCount,
        tajweedErrorsCount:
          status === 'tajweed_error' ? prev.tajweedErrorsCount + 1 : prev.tajweedErrorsCount,
        mutashabihatErrorsCount:
          status === 'mutashabihat_error'
            ? prev.mutashabihatErrorsCount + 1
            : prev.mutashabihatErrorsCount,
      };
      saveAnalyticsSummary(next);
      return next;
    });
  };

  const handleCompleteWeakWordDrillRep = (wordId: string) => {
    setWeakWordsLog((prev) => {
      const updated = prev.map((item) =>
        item.wordId === wordId
          ? {
              ...item,
              completedDrillReps: Math.min(item.requiredDrillReps, item.completedDrillReps + 1),
            }
          : item
      );
      saveWeakWordsLog(updated);
      return updated;
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDarkMode ? 'dark bg-[#0B1120] text-slate-100' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* Responsive Top Navigation Bar with Dark Mode Toggle */}
      <TopNav
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        onSelectTab={setActiveTab}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenCapacityModal={() => setIsCapacityModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'mushaf' && (
          <MushafWorkspace
            pageData={currentPageData}
            isLoadingPage={isLoadingPage}
            profile={profile}
            recitationMode={recitationMode}
            activeSessionBanner={activeSessionBanner}
            mauritanianProgress={mauritanianProgress}
            weakWordsLog={weakWordsLog}
            onChangePage={handleLoadPage}
            onChangeRecitationMode={(mode) => {
              setRecitationMode(mode);
              if (mode !== 'review_hidden') {
                setActiveSessionBanner(null);
              }
            }}
            onToggleHideAyahMarkers={() =>
              handleUpdateProfile({
                ...profile,
                hideAyahMarkers: !profile.hideAyahMarkers,
              })
            }
            onUpdateMauritanianProgress={handleUpdateMauritanianProgress}
            onLogWeakWord={handleLogWeakWord}
            onRecordEvaluationStat={handleRecordEvaluationStat}
            onCompleteWeakWordDrillRep={handleCompleteWeakWordDrillRep}
          />
        )}

        {activeTab === 'fortresses' && (
          <FiveFortressesView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onStartReviewSession={({ pageNumber, hadrSpeedMode, sessionTitle }) => {
              handleUpdateProfile({ ...profile, hadrSpeedMode });
              setRecitationMode('review_hidden');
              setActiveSessionBanner(sessionTitle);
              handleLoadPage(pageNumber);
              setActiveTab('mushaf');
            }}
          />
        )}

        {activeTab === 'tajweed_lab' && (
          <TajweedMutashabihatLab
            preferredSheikh={profile.preferredSheikh}
            asrEndpointUrl={profile.asrEndpointUrl}
          />
        )}

        {activeTab === 'parents_report' && (
          <ParentsAnalyticsView
            profile={profile}
            mauritanianProgress={mauritanianProgress}
            analytics={analytics}
            weakWordsLog={weakWordsLog}
            onCompleteWeakWordDrillRep={handleCompleteWeakWordDrillRep}
            onJumpToPage={(pageNum) => {
              handleLoadPage(pageNum);
              setActiveTab('mushaf');
            }}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          مِشكاة الترتيل — منصة تحفيظ وتسميع القرآن الكريم للأطفال بالرسم العثماني (مصحف المدينة 15 سطراً)
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span>طريقة اللوح الشنقيطي (100×)</span>
          <span aria-hidden="true">·</span>
          <span>منهجية الحصون الخمسة (1–15 جزءاً)</span>
          <span aria-hidden="true">·</span>
          <span>تخزين محلي عبر IndexedDB</span>
        </div>
      </footer>

      {/* Child Capacity Profile Modal */}
      <ChildCapacityModal
        isOpen={isCapacityModalOpen}
        profile={profile}
        onClose={() => setIsCapacityModalOpen(false)}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}
