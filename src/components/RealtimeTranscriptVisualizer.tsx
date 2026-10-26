import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Play,
  Radio,
  RefreshCw,
  Square,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { QuranWord, WordEvaluationResult } from '../types/quran';
import { AsrConnectionState, playStandardQuranAudio } from '../services/audioAsrService';
import { getSheikhAudioUrl, normalizeQuranicWord } from '../utils/quranEngine';

export interface RealtimeTranscriptToken {
  id: string;
  spokenText: string;
  normalizedText: string;
  matchedMushafWord: string;
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  wordPosition: number;
  status: WordEvaluationResult['status'];
  isInterim: boolean;
  revealedInMushaf: boolean;
  confidence: number;
  timestampStr: string;
}

interface RealtimeTranscriptVisualizerProps {
  connectionState: AsrConnectionState;
  connectionDetailAr: string;
  isListening: boolean;
  isSimulatingStream: boolean;
  activeInterimToken: string;
  activeTargetWord?: QuranWord;
  tokens: RealtimeTranscriptToken[];
  preferredSheikh: 'husary' | 'minshawi';
  rmsVolume: number;
  onToggleMicrophone: () => void;
  onToggleSimulateStream: () => void;
  onClearTranscript: () => void;
}

export const RealtimeTranscriptVisualizer: React.FC<RealtimeTranscriptVisualizerProps> = ({
  connectionState,
  connectionDetailAr,
  isListening,
  isSimulatingStream,
  activeInterimToken,
  activeTargetWord,
  tokens,
  preferredSheikh,
  rmsVolume,
  onToggleMicrophone,
  onToggleSimulateStream,
  onClearTranscript,
}) => {
  // تحديد مظهر ونص حالة اتصال محرك التعرف الصوتي (ASR Connection Status)
  const getConnectionBadge = () => {
    if (isSimulatingStream) {
      return {
        bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300',
        label: 'متصل — بث صوتي تدفقي حي (Live Stream)',
        icon: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
      };
    }
    switch (connectionState) {
      case 'connected_streaming':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300',
          label: 'متصل — بث مباشر (Web Speech ar-SA)',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'connecting':
      case 'reconnecting':
        return {
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-300',
          label: connectionState === 'connecting' ? 'جاري الاتصال بالمحرك...' : 'إعادة ربط البث التلقائي...',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
        };
      case 'fallback_cadence':
        return {
          bg: 'bg-sky-950/90 border-sky-500/50 text-sky-300',
          label: 'متصل — نمط النبرة الصوتية البديل (VAD)',
          icon: <Activity className="w-3.5 h-3.5 text-sky-400" />,
        };
      case 'error_blocked':
        return {
          bg: 'bg-red-950/90 border-red-500/50 text-red-300',
          label: 'تنبيه اتصال — الميكروفون مقيد أو غير متصل',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          label: 'غير متصل — جاهز لبدء البث الصوتي',
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const connBadge = getConnectionBadge();
  const latestToken = tokens.length > 0 ? tokens[0] : null;
  const displayedActiveSpoken =
    activeInterimToken || latestToken?.spokenText || '';
  const displayedNormalized = displayedActiveSpoken
    ? normalizeQuranicWord(displayedActiveSpoken)
    : '—';

  // نعرض الكلمات على الشاشة بترتيب النطق المتسلسل من اليمين إلى اليسار
  const chronologicalTokens = [...tokens].reverse();

  return (
    <div
      data-testid="realtime-transcript-visualizer"
      className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 space-y-4 shadow-xs"
    >
      {/* 1. Top ASR Connection Status & Stream Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            data-testid="asr-connection-status-badge"
            className={`px-3 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5 ${connBadge.bg}`}
          >
            {connBadge.icon}
            <span>{connBadge.label}</span>
          </div>

          <span className="text-[11px] text-slate-400">
            {connectionDetailAr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSimulateStream}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              isSimulatingStream
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600'
            }`}
          >
            {isSimulatingStream ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>إيقاف البث التدريبي الحي</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>محاكاة البث الصوتي الحي</span>
              </>
            )}
          </button>

          {tokens.length > 0 && (
            <button
              type="button"
              onClick={onClearTranscript}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              مسح الشاشة
            </button>
          )}
        </div>
      </div>

      {/* 2. Active Word Recognition Stage (إبراز الكلمة النشطة قيد المعالجة ومقارنتها بالمصحف) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Box A: Active Recognized Word */}
        <div
          data-testid="active-recognized-word-card"
          className={`p-3 rounded-lg border transition-colors ${
            activeInterimToken
              ? 'bg-emerald-950/60 border-emerald-500/70'
              : latestToken
                ? 'bg-slate-800/90 border-slate-700'
                : 'bg-slate-800/40 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>الكلمة الملتقطة صوتياً الآن:</span>
            <span className="font-mono-tabular text-emerald-400">
              {activeInterimToken
                ? 'قيد المعالجة...'
                : latestToken
                  ? `ثقة ${latestToken.confidence}%`
                  : 'بانتظار الصوت'}
            </span>
          </div>
          <div className="text-xl font-bold text-white truncate">
            {displayedActiveSpoken ? `«${displayedActiveSpoken}»` : 'تحدث الآن...'}
          </div>
        </div>

        {/* Box B: Orthographic Normalization Pipeline Output */}
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>التطبيع الإملائي-العثماني:</span>
            <span className="font-mono-tabular text-slate-400">
              مستوى الصوت: {rmsVolume}%
            </span>
          </div>
          <div className="text-lg font-bold text-amber-300 truncate">
            {displayedNormalized}
          </div>
        </div>

        {/* Box C: Target Word at Mushaf Pointer */}
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>الكلمة المطلوبة بالمؤشر النشط:</span>
            {activeTargetWord && (
              <span className="font-mono-tabular text-slate-300">
                الآية {activeTargetWord.verseKey}
              </span>
            )}
          </div>
          <div className="font-quran text-xl text-emerald-300 truncate">
            {activeTargetWord
              ? `«${activeTargetWord.textImlaeiSimple}»`
              : 'اكتملت كلمات الصفحة'}
          </div>
        </div>
      </div>

      {/* 3. Real-Time Flowing Word Stream Canvas (عرض الكلمات المنطوقة مباشرة على الشاشة فور معالجتها) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">
            شاشة التدفق الكتابي المباشر للكلمات المنطوقة ({tokens.length} كلمة معالجة):
          </span>
          <span>انقر على أي كلمة منطوقة للاستماع لنطق الشيخ المعياري</span>
        </div>

        <div
          data-testid="realtime-word-stream-canvas"
          className="min-h-[5.25rem] max-h-44 overflow-y-auto p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg flex flex-wrap items-center gap-2"
        >
          {chronologicalTokens.length === 0 && !activeInterimToken ? (
            <div className="w-full text-center py-4 text-xs text-slate-400 space-y-1">
              <p>
                لا توجد كلمات منطوقة على الشاشة بعد — اضغط{' '}
                <button
                  type="button"
                  onClick={onToggleMicrophone}
                  className="text-emerald-400 underline font-semibold cursor-pointer"
                >
                  {isListening ? 'تحدث في الميكروفون' : 'تشغيل التسميع الصوتي'}
                </button>{' '}
                أو{' '}
                <button
                  type="button"
                  onClick={onToggleSimulateStream}
                  className="text-amber-300 underline font-semibold cursor-pointer"
                >
                  محاكاة البث الصوتي الحي
                </button>{' '}
                لرؤية الكلمات تتدفق وتنكشف في المصحف مباشرةً.
              </p>
            </div>
          ) : (
            <>
              {chronologicalTokens.map((tok, idx) => {
                const isLatestActive =
                  idx === chronologicalTokens.length - 1 && !activeInterimToken;

                let tokenColorClass =
                  'bg-emerald-950/80 border-emerald-600/70 text-emerald-100';
                let statusTag = 'كُشفت بالمصحف';

                if (tok.status === 'tajweed_error') {
                  tokenColorClass =
                    'bg-amber-950/85 border-amber-500/80 text-amber-100';
                  statusTag = 'تنبيه تجويد';
                } else if (tok.status === 'mutashabihat_error') {
                  tokenColorClass =
                    'bg-indigo-950/85 border-indigo-500/80 text-indigo-100';
                  statusTag = 'تشابه لفظي';
                } else if (tok.status === 'memorization_error') {
                  tokenColorClass =
                    'bg-red-950/85 border-red-500/80 text-red-100';
                  statusTag = 'خطأ حفظ';
                }

                return (
                  <button
                    key={tok.id}
                    type="button"
                    onClick={() =>
                      playStandardQuranAudio(
                        getSheikhAudioUrl(
                          tok.surahNumber,
                          tok.ayahNumber,
                          tok.wordPosition,
                          preferredSheikh
                        ),
                        tok.matchedMushafWord
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg border text-right transition-all flex items-center gap-2 cursor-pointer ${tokenColorClass} ${
                      isLatestActive ? 'ring-2 ring-emerald-400 shadow-sm' : 'opacity-95 hover:opacity-100'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {tok.spokenText}
                        </span>
                        <span aria-hidden="true" className="text-xs opacity-60">
                          ←
                        </span>
                        <span className="font-quran text-base text-amber-200">
                          {tok.matchedMushafWord}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] opacity-85">
                        <span>{statusTag}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{tok.confidence}%</span>
                        {isLatestActive && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-300 font-semibold">
                              نشط الآن
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Volume2 className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  </button>
                );
              })}

              {/* Interim Word Being Processed Right Now */}
              {activeInterimToken && (
                <div
                  data-testid="interim-processing-token"
                  className="px-3.5 py-2 rounded-lg border-2 border-dashed border-amber-400 bg-amber-950/50 text-amber-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-sm text-white">
                      «{activeInterimToken}»
                    </div>
                    <div className="text-[10px] text-amber-300">
                      قيد المعالجة الصوتية اللحظية...
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
