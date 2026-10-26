import React from 'react';
import { ChildCapacityProfile } from '../types/quran';
import { calculateFiveFortressesPlan } from '../utils/quranEngine';

interface FiveFortressesViewProps {
  profile: ChildCapacityProfile;
  onUpdateProfile: (next: ChildCapacityProfile) => void;
  onStartReviewSession: (params: {
    pageNumber: number;
    hadrSpeedMode: boolean;
    sessionTitle: string;
  }) => void;
}

export const FiveFortressesView: React.FC<FiveFortressesViewProps> = ({
  profile,
  onUpdateProfile,
  onStartReviewSession,
}) => {
  const dailyPagesCount =
    profile.dailyNewCapacity === 'two_pages'
      ? 2
      : profile.dailyNewCapacity === 'one_page'
        ? 1
        : 1;

  const plan = calculateFiveFortressesPlan(
    profile.totalMemorizedJuz,
    dailyPagesCount,
    profile.currentTargetPage
  );

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header & Interactive Juz Slider (1 to 15 Juz) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
              01. الهيكلة الرياضية للمراجعة التراكمية
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              محرك المراجعة المتدرجة وفق منهجية «الحصون الخمسة»
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              يفصل النظام تلقائياً بين التحضير الاستباقي، واللوح اليومي المئوي، ومراجعة القريب (آخر 20 صفحة ملاصقة في وضع الإخفاء الإجباري)، وأنابيب مراجعة البعيد الموزعة أسبوعياً وفق سرعة الحدر المنضبطة (20 دقيقة للجزء).
            </p>
          </div>

          {/* Interactive Control for Memorized Juz (1 to 15 Juz) */}
          <div className="w-full lg:w-96 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="juz-range-slider" className="font-semibold text-slate-900 dark:text-slate-100">
                مقدار حفظ الطفل الكلي:
              </label>
              <span className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400">
                {plan.totalMemorizedJuz} أجزاء ({plan.totalMemorizedPages} صفحة)
              </span>
            </div>
            <input
              id="juz-range-slider"
              type="range"
              min={1}
              max={15}
              step={1}
              value={profile.totalMemorizedJuz}
              onChange={(e) =>
                onUpdateProfile({
                  ...profile,
                  totalMemorizedJuz: Number(e.target.value),
                })
              }
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
              <span>1 جزء (20 ص)</span>
              <span>5 أجزاء (100 ص)</span>
              <span>10 أجزاء (200 ص)</span>
              <span>15 جزءاً (300 ص)</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Fortresses Architectural Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Fortress 1: Pre-preparation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>الحصن الأول</span>
              <span aria-hidden="true">·</span>
              <span>التحضير الاستباقي الثلاثي</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              01. القراءة المستمرة والتحضير
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              تهيئة الذاكرة السمعية والبصرية قبل فتح اللوح الجديد لمنع التلكؤ أثناء التكرار المئوي.
            </p>
            <div className="pt-2 space-y-2.5 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">التحضير الأسبوعي (قراءة حدر):</span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  ص {plan.fortress1Preparation.weeklyPagesFrom} – {plan.fortress1Preparation.weeklyPagesTo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">التحضير الليلي (قبل النوم):</span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  صفحة {plan.fortress1Preparation.nightlyPage} (15 مرة)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">التحضير القبلي السمعي:</span>
                <span className="font-mono-tabular font-semibold text-emerald-800 dark:text-emerald-400">
                  {plan.fortress1Preparation.preSessionListeningMinutes} دقيقة مع الحصري
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartReviewSession({
                pageNumber: plan.fortress1Preparation.nightlyPage,
                hadrSpeedMode: false,
                sessionTitle: `الحصن الأول: التحضير الليلي والقبلي (صفحة ${plan.fortress1Preparation.nightlyPage})`,
              })
            }
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            بدء جلسة التحضير السمعي والليلي
          </button>
        </div>

        {/* Fortress 2: New Memorization (Mauritanian 100x Lawh) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>الحصن الثاني</span>
              <span aria-hidden="true">·</span>
              <span>طريقة الشناقطة المؤتمتة</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              02. حفظ اللوح الجديد (100 تكرار)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              تقسيم الـ 100 تكرار إلى 4 مراحل تربوية محمية بقفل ضد الغش (15 سمعي · 25 بصري · 20 محو متناوب · 40 غيبي صارم).
            </p>
            <div className="pt-2 space-y-2.5 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">صفحة اللوح الحالي:</span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  صفحة {plan.fortress2NewLawh.targetPage}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">مقدار الورد اليومي:</span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  {plan.fortress2NewLawh.pagesCount === 2 ? 'صفحتان' : 'صفحة كاملة'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">نصاب التكرار الإلزامي:</span>
                <span className="font-mono-tabular font-semibold text-emerald-800 dark:text-emerald-400">
                  100 تكرار صوتي موثق
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartReviewSession({
                pageNumber: plan.fortress2NewLawh.targetPage,
                hadrSpeedMode: false,
                sessionTitle: `الحصن الثاني: اللوح الشنقيطي (صفحة ${plan.fortress2NewLawh.targetPage})`,
              })
            }
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            فتح اللوح الشنقيطي (100 تكرار)
          </button>
        </div>

        {/* Fortress 3: Near Review (Last 20 Adjacent Pages in Mandatory Hidden Mode) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400">
              <span>الحصن الثالث</span>
              <span aria-hidden="true">·</span>
              <span>إخفاء إجباري صارم 100%</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              03. مراجعة القريب (آخر 20 صفحة)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              تُراجع آخر 20 صفحة ملاصقة للوح الجديد يومياً غيباً بالكامل لمنع تفلّت المحفوظ الحديث قبل انتقاله للذاكرة طويلة المدى.
            </p>
            <div className="pt-2 space-y-2.5 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">نطاق الصفحات الملاصقة:</span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  ص {plan.fortress3NearReview.fromPage} إلى ص {plan.fortress3NearReview.toPage}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">عدد صفحات القريب اليومية:</span>
                <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                  {plan.fortress3NearReview.pagesCount} صفحة (جزء كامل)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">وضع التسميع:</span>
                <span className="font-semibold text-amber-800 dark:text-amber-400">
                  إخفاء إجباري + سرعة الحدر
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartReviewSession({
                pageNumber: plan.fortress3NearReview.toPage,
                hadrSpeedMode: true,
                sessionTitle: `الحصن الثالث: تسميع القريب بالإخفاء الإجباري (ص ${plan.fortress3NearReview.fromPage}–${plan.fortress3NearReview.toPage})`,
              })
            }
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-700 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            بدء تسميع القريب (وضع الإخفاء الإجباري)
          </button>
        </div>
      </div>

      {/* Fortresses 4 & 5: Weekly Far Review Pipelines (أنابيب مراجعة البعيد بمرتبة الحدر) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>الحصنان الرابع والخامس</span>
              <span aria-hidden="true">·</span>
              <span>مرتبة الحدر السريعة (20 دقيقة للجزء الواحد)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              04. أنابيب مراجعة البعيد الأسبوعية (ما زاد عن آخر 20 صفحة)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400 ml-2">إجمالي صفحات البعيد:</span>
              <span className="font-mono-tabular font-bold text-slate-900 dark:text-slate-100">
                {plan.fortress4And5FarReview.totalFarPages} صفحة
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 ml-2">النصاب اليومي للبعيد:</span>
              <span className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400">
                {plan.fortress4And5FarReview.dailyPagesQuota} صفحة / يوم
              </span>
            </div>
          </div>
        </div>

        {plan.fortress4And5FarReview.weeklyTubes.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/70 rounded-lg text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              مقدار حفظ الطفل الحالي (جزء واحد = 20 صفحة) يقع بالكامل ضمن «الحصن الثالث: مراجعة القريب اليومية».
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              حرّك شريط «مقدار حفظ الطفل الكلي» بالأعلى إلى جزأين أو أكثر (حتى 15 جزءاً) لتوليد أنابيب مراجعة البعيد الأسبوعية تلقائياً.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">أنبوب اليوم</th>
                  <th className="py-3 px-4 font-semibold">الأجزاء المشمولة</th>
                  <th className="py-3 px-4 font-semibold">نطاق الصفحات</th>
                  <th className="py-3 px-4 font-semibold">عدد الصفحات</th>
                  <th className="py-3 px-4 font-semibold">زمن الحدر المقدر</th>
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold text-left">إجراء التسميع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {plan.fortress4And5FarReview.weeklyTubes.map((tube) => (
                  <tr key={tube.dayIndex} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      يوم {tube.dayNameAr}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{tube.juzLabel}</td>
                    <td className="py-3.5 px-4 font-mono-tabular text-slate-800 dark:text-slate-200">
                      ص {tube.fromPage} – ص {tube.toPage}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-slate-700 dark:text-slate-300">
                      {tube.pagesCount} صفحة
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-slate-700 dark:text-slate-300">
                      {tube.estimatedMinutesHadr} دقيقة (حدر)
                    </td>
                    <td className="py-3.5 px-4">
                      {tube.completedToday ? (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          منجز اليوم
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                          مجدول للتسميع
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          onStartReviewSession({
                            pageNumber: tube.fromPage === 1 ? 1 : 604,
                            hadrSpeedMode: true,
                            sessionTitle: `مراجعة البعيد (${tube.dayNameAr} · ${tube.juzLabel} · سرعة الحدر)`,
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                      >
                        تسميع بحساسية الحدر
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
