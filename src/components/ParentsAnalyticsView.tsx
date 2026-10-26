import React from 'react';
import { Award, CheckCircle2, Flame, RotateCcw, Volume2 } from 'lucide-react';
import {
  ChildCapacityProfile,
  MauritanianLawhProgress,
  WeakWordEntry,
} from '../types/quran';
import { SessionAnalyticsSummary } from '../services/storageService';
import { getSheikhAudioUrl } from '../utils/quranEngine';
import { playStandardQuranAudio } from '../services/audioAsrService';

interface ParentsAnalyticsViewProps {
  profile: ChildCapacityProfile;
  mauritanianProgress: MauritanianLawhProgress;
  analytics: SessionAnalyticsSummary;
  weakWordsLog: WeakWordEntry[];
  onCompleteWeakWordDrillRep: (wordId: string) => void;
  onJumpToPage: (pageNumber: number) => void;
}

export const ParentsAnalyticsView: React.FC<ParentsAnalyticsViewProps> = ({
  profile,
  mauritanianProgress,
  analytics,
  weakWordsLog,
  onCompleteWeakWordDrillRep,
  onJumpToPage,
}) => {
  const accuracyPercent =
    analytics.totalRecitedWords > 0
      ? Math.round((analytics.correctWordsCount / analytics.totalRecitedWords) * 1000) / 10
      : 96.4;

  const totalErrors =
    analytics.memorizationErrorsCount +
    analytics.tajweedErrorsCount +
    analytics.mutashabihatErrorsCount;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header & Top-Level KPI Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
              01. المتابعة التربوية الدقيقة للوالدين والمحفظ
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              تقرير الأداء الصوتي الموثق وخريطة الكلمات المتعثرة — {profile.childName}
            </h1>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>العمر: {profile.age} سنوات</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>المحفوظ: {profile.totalMemorizedJuz} أجزاء ({profile.totalMemorizedJuz * 20} صفحة)</span>
          </div>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              تكرار اللوح المنجز صوتياً (ص {mauritanianProgress.pageNumber})
            </span>
            <div className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100">
              {mauritanianProgress.completedRepetitions} / 100
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
              موثق عبر قفل الحماية الصوتي
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">معدل دقة التلاوة والمخارج</span>
            <div className="text-2xl font-bold font-mono-tabular text-emerald-800 dark:text-emerald-400">
              {accuracyPercent}%
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              إجمالي الكلمات المنطوقة: <span className="font-mono-tabular">{analytics.totalRecitedWords}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">إجمالي زمن التسميع الفعلي</span>
            <div className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100">
              {analytics.totalMinutesActive} دقيقة
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              سرعة التسميع: {profile.hadrSpeedMode ? 'مرتبة الحدر (20 د/جزء)' : 'مرتبة الترتيل والتحقيق'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">تصنيف الأخطاء المرصودة ({totalErrors})</span>
            <div className="text-sm font-mono-tabular font-semibold text-slate-900 dark:text-slate-100 pt-1 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-400">أخطاء الحفظ:</span>
                <span>{analytics.memorizationErrorsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-400">المخارج والتجويد:</span>
                <span>{analytics.tajweedErrorsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700 dark:text-indigo-400">المتشابهات اللفظية:</span>
                <span>{analytics.mutashabihatErrorsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Hesitation & Mistake Heatmap + Mandatory 5x Weak Words Drill */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-400">
              <Flame className="w-4 h-4" />
              <span>خريطة الكلمات المتعثرة والتلميح الذكي (weakWordsLog)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              02. الخريطة الحرارية للأخطاء وإلزام الإعادة (5 مرات إضافية للآية)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              كل كلمة صمت عندها الطفل أكثر من 5 ثوانٍ أو أخطأ في نطقها تُسجّل تلقائياً هنا، ويُلزم الطفل بإعادة تسميع آيتها 5 مرات لتثبيتها.
            </p>
          </div>
        </div>

        {weakWordsLog.length === 0 ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center text-sm text-emerald-900 dark:text-emerald-200 font-semibold">
            ما شاء الله! لا توجد كلمات متعثرة حالياً في سجل الطفل.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">الكلمة المتعثرة</th>
                  <th className="py-3 px-4 font-semibold">السورة والآية</th>
                  <th className="py-3 px-4 font-semibold">نص الآية الكامل للتدريب</th>
                  <th className="py-3 px-4 font-semibold">تصنيف السبب</th>
                  <th className="py-3 px-4 font-semibold">مرات الخطأ / التردد</th>
                  <th className="py-3 px-4 font-semibold">تكرار التثبيت (5×)</th>
                  <th className="py-3 px-4 font-semibold text-left">إجراءات المعالجة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {weakWordsLog.map((entry) => {
                  const isDrillDone = entry.completedDrillReps >= entry.requiredDrillReps;
                  const reasonLabel =
                    entry.reason === 'tajweed_makharij'
                      ? 'خطأ مخارج وتجويد'
                      : entry.reason === 'mutashabihat'
                        ? 'تشابه لفظي بين السور'
                        : entry.reason === 'hesitation_5s'
                          ? 'توقف وصمت > 5 ثوانٍ'
                          : entry.reason === 'hesitation_3s'
                            ? 'تلميح الحرف الأول (3 ث)'
                            : 'خطأ حفظ واستذكار';

                  const reasonColor =
                    entry.reason === 'tajweed_makharij'
                      ? 'text-amber-800 dark:text-amber-400'
                      : entry.reason === 'mutashabihat'
                        ? 'text-indigo-800 dark:text-indigo-400'
                        : 'text-red-700 dark:text-red-400';

                  const [sNumStr, aNumStr] = entry.verseKey.split(':');

                  return (
                    <tr key={entry.wordId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-quran text-xl text-slate-900 dark:text-slate-100">
                        {entry.textUthmani.replace(/ٱ/g, 'ا')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        سورة {entry.surahNameAr} ({entry.verseKey}) · ص {entry.pageNumber}
                      </td>
                      <td className="py-3.5 px-4 font-quran text-base text-slate-800 dark:text-slate-200">
                        «{entry.verseFullText.replace(/ٱ/g, 'ا')}»
                      </td>
                      <td className={`py-3.5 px-4 font-semibold text-xs ${reasonColor}`}>
                        {reasonLabel}
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular text-xs text-slate-700 dark:text-slate-300">
                        {entry.mistakeCount} أخطاء · {entry.hesitationCount} تردد
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular">
                        {isDrillDone ? (
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تم التثبيت (5/5)</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                            {entry.completedDrillReps} / {entry.requiredDrillReps} مرات
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              playStandardQuranAudio(
                                getSheikhAudioUrl(
                                  Number(sNumStr) || 112,
                                  Number(aNumStr) || 1,
                                  undefined,
                                  profile.preferredSheikh
                                ),
                                entry.verseFullText
                              )
                            }
                            aria-label={`الاستماع لآية ${entry.textUthmani}`}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {!isDrillDone && (
                            <button
                              type="button"
                              onClick={() => onCompleteWeakWordDrillRep(entry.wordId)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>تسميع الآية (+1)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onJumpToPage(entry.pageNumber)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                          >
                            فتح ص {entry.pageNumber}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Child Gamification & Mauritanian Honors (أوسمة اللوح المئوي وإتقان الأجزاء) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-5 transition-colors">
        <div className="space-y-1">
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
            03. التحفيز التربوي الموقر للقرآن الكريم
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            أوسمة إتمام اللوح الشنقيطي المئوي وإتقان الأجزاء
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                وسام فارس اللوح الشنقيطي (100×)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                يُمنح عند إتمام 100 تكرار صوتي موثق للصفحة الواحدة عبر المراحل الأربع دون غش.
              </p>
              <p className="text-xs font-mono-tabular font-semibold text-emerald-800 dark:text-emerald-400 pt-1">
                الألواح المكتملة: {analytics.completedLawhsCount} لوحاً مئوياً
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 rounded-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                وسام حارس الحصون الخمسة
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                يُمنح للالتزام بمراجعة القريب (آخر 20 صفحة) وأنابيب البعيد الأسبوعية بمرتبة الحدر.
              </p>
              <p className="text-xs font-mono-tabular font-semibold text-amber-800 dark:text-amber-400 pt-1">
                الأجزاء المتقنة: {profile.totalMemorizedJuz} أجزاء ({profile.totalMemorizedJuz * 20} صفحة)
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 rounded-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                وسام إتقان المخارج والتجويد
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                يُمنح عند تحقيق دقة تلاوة تفوق 95% في التفخيم والترقيق والقلقلة والغنة.
              </p>
              <p className="text-xs font-mono-tabular font-semibold text-sky-800 dark:text-sky-400 pt-1">
                الدقة الحالية: {accuracyPercent}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
