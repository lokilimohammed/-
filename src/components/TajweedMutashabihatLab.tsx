import React, { useState } from 'react';
import { Volume2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import {
  PHONETIC_CONFUSION_PAIRS,
  normalizeQuranicWord,
  getSheikhAudioUrl,
} from '../utils/quranEngine';
import { BUILTIN_MUTASHABIHAT_RADAR } from '../services/quranApiService';
import { playStandardQuranAudio, queryMuaalemTajweedEndpoint } from '../services/audioAsrService';

interface TajweedMutashabihatLabProps {
  preferredSheikh: 'husary' | 'minshawi';
  asrEndpointUrl: string;
}

const ELEVEN_TAJWEED_HEADS = [
  { id: 1, title: 'التفخيم والترقيق', desc: 'تمييز حروف الاستعلاء (خص ضغط قظ) عن الحروف المرققة المستفلة', status: 'نشط' },
  { id: 2, title: 'القلقلة (قطب جد)', desc: 'قياس نبرة اضطراب المخرج في القاف والطاء والباء والجيم والدال الساكنة', status: 'نشط' },
  { id: 3, title: 'الغنة ومقدارها', desc: 'تحليل الرنين الخيشومي في النون والميم المشددتين (حركتان كاملتان)', status: 'نشط' },
  { id: 4, title: 'المد الطبيعي والفرعي', desc: 'قياس زمن إطالة الصوت في المد المتصل والمنفصل واللازم (2–6 حركات)', status: 'نشط' },
  { id: 5, title: 'الإطباق والانفتاح', desc: 'فحص انطباق اللسان على الحنك الأعلى في (ص، ض، ط، ظ)', status: 'نشط' },
  { id: 6, title: 'الإدغام بغنة وبغير غنة', desc: 'إدخال النون الساكنة والتنوين في حروف (يرملون)', status: 'نشط' },
  { id: 7, title: 'الإخفاء الحقيقي والشفوي', desc: 'النطق بحالة بين الإظهار والإدغام مع مراعاة تفخيم وترقيق الغنة', status: 'نشط' },
  { id: 8, title: 'الإقلاب', desc: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاتها للباء', status: 'نشط' },
  { id: 9, title: 'الإظهار الحلقي والشفوي', desc: 'إخراج الحرف من مخرجه بغير غنة زائدة عند حروف الحلق الستة', status: 'نشط' },
  { id: 10, title: 'الهمس والجهر', desc: 'جريان النفس في حروف (فحثه شخص سكت) وانحباسه في بقية الحروف', status: 'نشط' },
  { id: 11, title: 'الشدة والتوسط والرخاوة', desc: 'ضبط زمن جريان الصوت في الحروف الشديدة والبينية والرخوة', status: 'نشط' },
];

export const TajweedMutashabihatLab: React.FC<TajweedMutashabihatLabProps> = ({
  preferredSheikh,
  asrEndpointUrl,
}) => {
  const [testInput, setTestInput] = useState('ٱلرَّحْمَـٰنِ');
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);

  const normalizedOutput = normalizeQuranicWord(testInput);
  const activePair = PHONETIC_CONFUSION_PAIRS[selectedPairIndex] || PHONETIC_CONFUSION_PAIRS[0];

  const handleRun11HeadCheck = async () => {
    const res = await queryMuaalemTajweedEndpoint({
      endpointUrl: asrEndpointUrl,
      wordUthmani: testInput,
      spokenTranscript: normalizedOutput,
      verseKey: '1:3',
    });
    setDiagnosticReport(
      `${res.verdict} — النموذج: ${res.modelName} — زمن الاستجابة: ${res.latencyMs} مللي ثانية.`
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Section 1: Phonetic Articulation & 11-Head Tajweed Inspector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
              01. المعالجة الصوتية وتصحيح المخارج
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              مختبر المخارج الصوتية والرؤوس التجويدية الـ 11 (muaalem El Quran)
            </h1>
          </div>
          <button
            type="button"
            onClick={handleRun11HeadCheck}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 self-start"
          >
            <Sparkles className="w-4 h-4" />
            <span>فحص استجابة رؤوس التجويد الـ 11</span>
          </button>
        </div>

        {diagnosticReport && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between gap-4 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{diagnosticReport}</span>
            </div>
          </div>
        )}

        {/* Phonetic Confusion Matrix (س/ص، ت/ط، ذ/ظ، د/ض، ق/ك، ح/هـ) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              الأزواج الصوتية المتقاربة الأكثر التباساً لدى الأطفال:
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PHONETIC_CONFUSION_PAIRS.map((pair, idx) => (
                <button
                  key={pair.pairLabel}
                  type="button"
                  onClick={() => setSelectedPairIndex(idx)}
                  className={`p-3 text-right rounded-lg border text-xs transition-colors cursor-pointer ${
                    selectedPairIndex === idx
                      ? 'bg-slate-900 dark:bg-emerald-700 text-white border-slate-900 dark:border-emerald-500 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold">{pair.pairLabel}</div>
                  <div
                    className={
                      selectedPairIndex === idx
                        ? 'text-slate-200 mt-1'
                        : 'text-slate-500 dark:text-slate-400 mt-1'
                    }
                  >
                    حرف ({pair.targetLetter}) ← ({pair.spokenLetter})
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-400 font-semibold">
                <span>تشخيص المخرج الصوتي الدقيق (/v1/word/tajweed)</span>
                <span>الحرف المستهدف: ({activePair.targetLetter})</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {activePair.ruleName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activePair.makhrajExplanation}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                استمع للنطق المعياري بصوت الشيخ {preferredSheikh === 'husary' ? 'محمود خليل الحصري' : 'محمد صديق المنشاوي'}:
              </div>
              <button
                type="button"
                onClick={() =>
                  playStandardQuranAudio(
                    getSheikhAudioUrl(112, 2, 2, preferredSheikh),
                    'ٱلصَّمَدُ'
                  )
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>تشغيل النطق المعياري للشيخ</span>
              </button>
            </div>
          </div>
        </div>

        {/* 11 Heads Grid */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            الرؤوس التجويدية الـ 11 لنموذج (muaalem El Quran):
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ELEVEN_TAJWEED_HEADS.map((head) => (
              <div
                key={head.id}
                className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400">
                    الرأس #{head.id}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{head.status}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{head.title}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{head.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Orthographic Normalization Pipeline Tester */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-4 transition-colors">
        <div className="space-y-1">
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
            02. جسر الفجوة بين الرسم العثماني والإملائي
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            مختبر خوارزمية التطبيع الإملائي-العثماني الفوري (normalizeQuranicWord)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            يختبر توحيد الهمزات (أ، إ، آ، ٱ ← ا)، وحذف الألف الخنجرية والمدود العثمانية، وتوحيد التاء المربوطة والهاء، للوصول إلى دقة تطابق تتجاوز 95% دون ظلم الطفل.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <label htmlFor="norm-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              أدخل كلمة بالرسم العثماني أو بالتشكيل:
            </label>
            <input
              id="norm-input"
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full px-4 py-2.5 text-lg font-quran bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ناتج التطبيع الجذري للمطابقة الفورية:
            </span>
            <div className="w-full px-4 py-3 text-lg font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              {normalizedOutput || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Mutashabihat Radar (رادار المتشابهات اللفظية) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-5 transition-colors">
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
            03. الحماية من الانتقال الخاطئ بين السور (ummahapi.com/api/quran/mutashabihat)
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            رادار المتشابهات اللفظية وتنبيه السياق القرآني
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUILTIN_MUTASHABIHAT_RADAR.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{item.surah1Name} ({item.verseKey1})</span>
                <span aria-hidden="true">↔</span>
                <span>{item.surah2Name} ({item.verseKey2})</span>
              </div>
              <div className="space-y-1.5 font-quran text-lg text-slate-900 dark:text-slate-100">
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                  1. «{item.text1Uthmani.replace(/ٱ/g, 'ا')}»
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                  2. «{item.text2Uthmani.replace(/ٱ/g, 'ا')}»
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/60 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{item.ruleTipAr}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
