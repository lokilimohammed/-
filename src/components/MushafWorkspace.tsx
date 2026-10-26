import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  EyeOff,
  Flame,
  Lock,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import {
  ChildCapacityProfile,
  MauritanianLawhProgress,
  MauritanianStageId,
  MushafPageData,
  QuranWord,
  RecitationMode,
  WeakWordEntry,
  WordEvaluationResult,
} from '../types/quran';
import {
  MAURITANIAN_STAGES,
  evaluateSpokenWord,
  getMauritanianStageForRep,
  getSheikhAudioUrl,
  groupWordsInto15Lines,
  isWordHiddenInSession,
  matchSpokenPhraseToWords,
  normalizeQuranicWord,
  tryIncrementMauritanianCounter,
} from '../utils/quranEngine';
import {
  AsrConnectionState,
  AsrDiagnosticInfo,
  DualQuranAsrEngine,
  VadMetrics,
  playGentleFeedbackTone,
  playStandardQuranAudio,
} from '../services/audioAsrService';
import {
  RealtimeTranscriptToken,
  RealtimeTranscriptVisualizer,
} from './RealtimeTranscriptVisualizer';

interface MushafWorkspaceProps {
  pageData: MushafPageData;
  isLoadingPage: boolean;
  profile: ChildCapacityProfile;
  recitationMode: RecitationMode;
  activeSessionBanner: string | null;
  mauritanianProgress: MauritanianLawhProgress;
  weakWordsLog: WeakWordEntry[];
  onChangePage: (pageNumber: number) => void;
  onChangeRecitationMode: (mode: RecitationMode) => void;
  onToggleHideAyahMarkers: () => void;
  onUpdateMauritanianProgress: (next: MauritanianLawhProgress) => void;
  onLogWeakWord: (entry: Omit<WeakWordEntry, 'lastTimestamp'>) => void;
  onRecordEvaluationStat: (status: WordEvaluationResult['status']) => void;
  onCompleteWeakWordDrillRep: (wordId: string) => void;
}

export const MushafWorkspace: React.FC<MushafWorkspaceProps> = ({
  pageData,
  isLoadingPage,
  profile,
  recitationMode,
  activeSessionBanner,
  mauritanianProgress,
  weakWordsLog,
  onChangePage,
  onChangeRecitationMode,
  onToggleHideAyahMarkers,
  onUpdateMauritanianProgress,
  onLogWeakWord,
  onRecordEvaluationStat,
  onCompleteWeakWordDrillRep,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [vocalVerifiedCountInPass, setVocalVerifiedCountInPass] = useState<number>(0);
  const [selectedStageOverride, setSelectedStageOverride] = useState<MauritanianStageId | null>(null);

  // حالة الالتقاط الصوتي واتصال محرك الـ ASR و Child VAD
  const [isListening, setIsListening] = useState<boolean>(false);
  const [asrConnectionState, setAsrConnectionState] = useState<AsrConnectionState>('disconnected');
  const [asrConnectionDetail, setAsrConnectionDetail] = useState<string>(
    'جاهز لبدء البث الصوتي المباشر (Web Speech ar-SA + Whisper/Muaalem Hook)'
  );
  const [asrStatusText, setAsrStatusText] = useState<string>('جاهز للالتقاط الصوتي (ar-SA)');
  const [diagnosticInfo, setDiagnosticInfo] = useState<AsrDiagnosticInfo>({
    code: 'ok_listening',
    severity: 'info',
    titleAr: 'اضغط «تشغيل التسميع الصوتي» أو «محاكاة البث الصوتي الحي» للبدء',
    solutionAr: 'كل كلمة تنطقها تُرسم فوراً في شاشة التدفق الحي وتنكشف مباشرةً في المصحف العثماني.',
  });
  const [vadMetrics, setVadMetrics] = useState<VadMetrics>({
    rmsVolume: 0,
    isChildSpeaking: false,
    dominantFreqHz: 0,
    spectrumBins: [12, 18, 24, 15, 30, 22, 16, 14, 20, 12, 10, 8],
  });

  // حالة مكون العرض اللحظي للكلمات المنطوقة (RealtimeTranscriptVisualizer)
  const [activeInterimToken, setActiveInterimToken] = useState<string>('');
  const [lastSpokenWordBubble, setLastSpokenWordBubble] = useState<string>('');
  const [transcriptTokens, setTranscriptTokens] = useState<RealtimeTranscriptToken[]>([]);
  const [isSimulatingStream, setIsSimulatingStream] = useState<boolean>(false);
  const [lenientRevealMode, setLenientRevealMode] = useState<boolean>(true);
  const [voiceCadenceFallback, setVoiceCadenceFallback] = useState<boolean>(false);

  // حالة التلميح الذكي المقيد عند الصمت (3 ثوانٍ = حرف أول، 5 ثوانٍ = نطق وتسجيل في المتعثرات)
  const [hesitationSeconds, setHesitationSeconds] = useState<number>(0);
  const [peekLevel, setPeekLevel] = useState<'none' | 'first_letter_3s' | 'full_word_5s'>('none');

  // حالة نتيجة التقييم الفورية
  const [lastEvaluation, setLastEvaluation] = useState<WordEvaluationResult | null>(null);
  const [antiCheatBanner, setAntiCheatBanner] = useState<{
    type: 'success' | 'locked';
    message: string;
  } | null>(null);
  const [manualSpokenInput, setManualSpokenInput] = useState<string>('');
  const [pageInputNumber, setPageInputNumber] = useState<string>(String(pageData.pageNumber));

  const asrEngineRef = useRef<DualQuranAsrEngine | null>(null);
  const lastVoiceCadenceAdvanceRef = useRef<number>(0);
  const words = pageData.words || [];
  const totalWords = words.length;
  const activeWord: QuranWord | undefined = words[currentWordIndex];

  const autoStageInfo = getMauritanianStageForRep(mauritanianProgress.completedRepetitions);
  const activeStageId: MauritanianStageId = selectedStageOverride || autoStageInfo.id;
  const activeStageInfo =
    MAURITANIAN_STAGES.find((s) => s.id === activeStageId) || autoStageInfo;

  useEffect(() => {
    setCurrentWordIndex(0);
    setVocalVerifiedCountInPass(0);
    setHesitationSeconds(0);
    setPeekLevel('none');
    setLastEvaluation(null);
    setAntiCheatBanner(null);
    setIsSimulatingStream(false);
    setActiveInterimToken('');
    setPageInputNumber(String(pageData.pageNumber));
  }, [pageData.pageNumber, recitationMode]);

  /**
   * معالجة كلمة أو جملة منطوقة وإضافتها إلى مكون التدفق الكتابي المباشر (RealtimeTranscriptVisualizer)
   * وكشف الكلمات المطابقة في المصحف فوراً.
   */
  const processSpokenPhraseOrWord = (spokenInput: string, confidenceScore: number = 96) => {
    const cleanInput = spokenInput.trim();
    if (!cleanInput) return;

    setActiveInterimToken('');
    setLastSpokenWordBubble(cleanInput);

    if (!activeWord) {
      setCurrentWordIndex(0);
      setVocalVerifiedCountInPass(0);
      return;
    }

    const matchResult = matchSpokenPhraseToWords(
      cleanInput,
      words,
      currentWordIndex,
      profile.preferredSheikh,
      lenientRevealMode
    );

    const nowTimeStr = new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newTokens: RealtimeTranscriptToken[] = matchResult.wordResults.map((item, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      spokenText: item.spokenToken,
      normalizedText: normalizeQuranicWord(item.spokenToken),
      matchedMushafWord: item.targetWord.textUthmani.replace(/ٱ/g, 'ا').replace(/ۢ/g, ''),
      verseKey: item.targetWord.verseKey,
      surahNumber: item.targetWord.surahNumber,
      ayahNumber: item.targetWord.ayahNumber,
      wordPosition: item.targetWord.wordPosition,
      status: item.evaluation.status,
      isInterim: false,
      revealedInMushaf: item.revealedInMushaf,
      confidence:
        item.evaluation.status === 'correct'
          ? Math.max(92, confidenceScore)
          : item.evaluation.matchedScore,
      timestampStr: nowTimeStr,
    }));

    if (newTokens.length > 0) {
      setTranscriptTokens((prev) => [...newTokens.reverse(), ...prev].slice(0, 30));
    }

    const lastWordResult = matchResult.wordResults[matchResult.wordResults.length - 1];
    if (lastWordResult) {
      setLastEvaluation(lastWordResult.evaluation);
      onRecordEvaluationStat(lastWordResult.evaluation.status);
    }

    if (matchResult.revealedCount > 0) {
      playGentleFeedbackTone('correct');
      const nextWordIdx = matchResult.newWordIndex;
      const nextVerifiedCount = vocalVerifiedCountInPass + matchResult.revealedCount;
      setCurrentWordIndex(nextWordIdx);
      setVocalVerifiedCountInPass(nextVerifiedCount);
      setHesitationSeconds(0);
      setPeekLevel('none');

      if (nextWordIdx >= totalWords) {
        setIsSimulatingStream(false);
        const counterResult = tryIncrementMauritanianCounter({
          currentCompletedReps: mauritanianProgress.completedRepetitions,
          currentWordIndex: nextWordIdx,
          totalWordsInPage: totalWords,
          vocalVerifiedCountInPass: nextVerifiedCount,
        });
        if (counterResult.unlockedIncrement) {
          playGentleFeedbackTone('stage_complete');
          onUpdateMauritanianProgress({
            pageNumber: pageData.pageNumber,
            completedRepetitions: counterResult.updatedCompletedReps,
            currentStage: counterResult.updatedStage,
            verifiedVocalPassCount: mauritanianProgress.verifiedVocalPassCount + 1,
            lastUpdated: new Date().toISOString(),
          });
          setAntiCheatBanner({
            type: 'success',
            message: `${counterResult.reasonAr} (اضغط «بدء تكرار غيبي جديد» لإخفاء الصفحة مجدداً).`,
          });
        }
      }
      return;
    }

    if (lastWordResult) {
      const targetW = lastWordResult.targetWord;
      const evalRes = lastWordResult.evaluation;
      const verseWordsText = words
        .filter((w) => w.verseKey === targetW.verseKey)
        .map((w) => w.textUthmani)
        .join(' ');

      if (evalRes.status === 'tajweed_error') {
        playGentleFeedbackTone('tajweed_warning');
        onLogWeakWord({
          wordId: targetW.id,
          verseKey: targetW.verseKey,
          surahNameAr: targetW.surahNameAr,
          pageNumber: pageData.pageNumber,
          textUthmani: targetW.textUthmani,
          verseFullText: verseWordsText || targetW.textUthmani,
          reason: 'tajweed_makharij',
          mistakeCount: 1,
          hesitationCount: 0,
          requiredDrillReps: 5,
          completedDrillReps: 0,
        });
      } else if (evalRes.status === 'mutashabihat_error') {
        playGentleFeedbackTone('mutashabihat_alert');
        onLogWeakWord({
          wordId: targetW.id,
          verseKey: targetW.verseKey,
          surahNameAr: targetW.surahNameAr,
          pageNumber: pageData.pageNumber,
          textUthmani: targetW.textUthmani,
          verseFullText: verseWordsText || targetW.textUthmani,
          reason: 'mutashabihat',
          mistakeCount: 1,
          hesitationCount: 0,
          requiredDrillReps: 5,
          completedDrillReps: 0,
        });
      } else {
        playGentleFeedbackTone('memorization_error');
        onLogWeakWord({
          wordId: targetW.id,
          verseKey: targetW.verseKey,
          surahNameAr: targetW.surahNameAr,
          pageNumber: pageData.pageNumber,
          textUthmani: targetW.textUthmani,
          verseFullText: verseWordsText || targetW.textUthmani,
          reason: 'memorization',
          mistakeCount: 1,
          hesitationCount: 0,
          requiredDrillReps: 5,
          completedDrillReps: 0,
        });
      }
    }
  };

  // محاكاة التدفق الصوتي الحي (Live ASR Stream Simulation: Interim -> Processed)
  useEffect(() => {
    if (!isSimulatingStream || !activeWord) {
      if (isSimulatingStream && !activeWord) {
        setIsSimulatingStream(false);
      }
      return;
    }

    setAsrConnectionState('connected_streaming');
    setAsrConnectionDetail('بث صوتي تدفقي نشط — معالجة لحظية للكلمات (24.6 مللي ثانية)');

    setActiveInterimToken(activeWord.textImlaeiSimple);
    setVadMetrics({
      rmsVolume: 64,
      isChildSpeaking: true,
      dominantFreqHz: 265,
      spectrumBins: [35, 62, 78, 54, 85, 70, 48, 60, 44, 32, 24, 18],
    });

    const finalizeTimer = window.setTimeout(() => {
      processSpokenPhraseOrWord(activeWord.textImlaeiSimple, 98);
    }, 520);

    return () => window.clearTimeout(finalizeTimer);
  }, [isSimulatingStream, currentWordIndex, activeWord]);

  // تحديث دوال المحرك الصوتي في كل تصيير لمنع Stale Closure
  useEffect(() => {
    if (asrEngineRef.current) {
      asrEngineRef.current.updateCallbacks({
        onTranscriptToken: (token, _isFinal, confidence) => {
          processSpokenPhraseOrWord(token, confidence || 95);
        },
        onLiveTranscriptChange: (_fullSentence, latestToken, isFinal) => {
          if (!isFinal) {
            setActiveInterimToken(latestToken);
          } else {
            setActiveInterimToken('');
          }
          setLastSpokenWordBubble(latestToken);
        },
        onConnectionStateChange: (state, detailAr) => {
          setAsrConnectionState(state);
          setAsrConnectionDetail(detailAr);
        },
        onDiagnosticChange: (diag) => {
          setDiagnosticInfo(diag);
          if (diag.code === 'iframe_stt_blocked') {
            setVoiceCadenceFallback(true);
          }
        },
        onVadUpdate: (metrics) => {
          setVadMetrics(metrics);
          if (
            voiceCadenceFallback &&
            metrics.isChildSpeaking &&
            metrics.rmsVolume >= 18 &&
            activeWord &&
            Date.now() - lastVoiceCadenceAdvanceRef.current > 650
          ) {
            lastVoiceCadenceAdvanceRef.current = Date.now();
            processSpokenPhraseOrWord(activeWord.textImlaeiSimple, 94);
          }
        },
        onStateChange: (listening, status) => {
          setIsListening(listening);
          setAsrStatusText(status);
        },
      });
    }
  });

  // مؤقت التلميح الذكي المقيد (Smart Peeking on Hesitation: 3s & 5s)
  useEffect(() => {
    if (!isListening || !activeWord) return;
    const timer = window.setInterval(() => {
      setHesitationSeconds((prev) => {
        const next = prev + 1;
        if (next === 3) {
          setPeekLevel('first_letter_3s');
        } else if (next === 5) {
          setPeekLevel('full_word_5s');
          playStandardQuranAudio(
            activeWord.audioUrl ||
              getSheikhAudioUrl(
                activeWord.surahNumber,
                activeWord.ayahNumber,
                activeWord.wordPosition,
                profile.preferredSheikh
              ),
            activeWord.textUthmani
          );
          const verseWords = words
            .filter((w) => w.verseKey === activeWord.verseKey)
            .map((w) => w.textUthmani)
            .join(' ');
          onLogWeakWord({
            wordId: activeWord.id,
            verseKey: activeWord.verseKey,
            surahNameAr: activeWord.surahNameAr,
            pageNumber: pageData.pageNumber,
            textUthmani: activeWord.textUthmani,
            verseFullText: verseWords || activeWord.textUthmani,
            reason: 'hesitation_5s',
            mistakeCount: 0,
            hesitationCount: 1,
            requiredDrillReps: 5,
            completedDrillReps: 0,
          });
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isListening, currentWordIndex, activeWord, pageData.pageNumber, profile.preferredSheikh, words]);

  useEffect(() => {
    return () => {
      asrEngineRef.current?.stopListening();
    };
  }, []);

  const handleToggleMicrophone = async () => {
    if (isListening) {
      asrEngineRef.current?.stopListening();
      setIsListening(false);
      return;
    }

    if (!asrEngineRef.current) {
      asrEngineRef.current = new DualQuranAsrEngine({
        onTranscriptToken: (token, _isFinal, confidence) => {
          processSpokenPhraseOrWord(token, confidence || 95);
        },
        onLiveTranscriptChange: (_fullSentence, latestToken, isFinal) => {
          if (!isFinal) {
            setActiveInterimToken(latestToken);
          } else {
            setActiveInterimToken('');
          }
          setLastSpokenWordBubble(latestToken);
        },
        onConnectionStateChange: (state, detailAr) => {
          setAsrConnectionState(state);
          setAsrConnectionDetail(detailAr);
        },
        onDiagnosticChange: (diag) => {
          setDiagnosticInfo(diag);
          if (diag.code === 'iframe_stt_blocked') {
            setVoiceCadenceFallback(true);
          }
        },
        onVadUpdate: (metrics) => {
          setVadMetrics(metrics);
        },
        onStateChange: (listening, status) => {
          setIsListening(listening);
          setAsrStatusText(status);
        },
      });
    }
    await asrEngineRef.current.startListening(profile.hadrSpeedMode || recitationMode === 'review_hidden');
  };

  /**
   * إتمام تسميع الصفحة بالكامل صوتياً وتوثيق عداد الـ 100 تكرار
   */
  const handleCompleteFullPageVocally = () => {
    if (totalWords === 0) return;
    setIsSimulatingStream(false);
    setActiveInterimToken('');
    setLastSpokenWordBubble(words[totalWords - 1]?.textImlaeiSimple || 'والناس');

    const nowTimeStr = new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const sampleTokens: RealtimeTranscriptToken[] = words.slice(0, 6).map((w, idx) => ({
      id: `full-page-${Date.now()}-${idx}`,
      spokenText: w.textImlaeiSimple,
      normalizedText: normalizeQuranicWord(w.textImlaeiSimple),
      matchedMushafWord: w.textUthmani.replace(/ٱ/g, 'ا').replace(/ۢ/g, ''),
      verseKey: w.verseKey,
      surahNumber: w.surahNumber,
      ayahNumber: w.ayahNumber,
      wordPosition: w.wordPosition,
      status: 'correct',
      isInterim: false,
      revealedInMushaf: true,
      confidence: 99,
      timestampStr: nowTimeStr,
    }));

    setTranscriptTokens((prev) => [...sampleTokens.reverse(), ...prev].slice(0, 30));

    setCurrentWordIndex(totalWords);
    setVocalVerifiedCountInPass(totalWords);
    setHesitationSeconds(0);
    setPeekLevel('none');

    const counterResult = tryIncrementMauritanianCounter({
      currentCompletedReps: mauritanianProgress.completedRepetitions,
      currentWordIndex: totalWords,
      totalWordsInPage: totalWords,
      vocalVerifiedCountInPass: totalWords,
    });

    if (counterResult.unlockedIncrement) {
      playGentleFeedbackTone('stage_complete');
      onUpdateMauritanianProgress({
        pageNumber: pageData.pageNumber,
        completedRepetitions: counterResult.updatedCompletedReps,
        currentStage: counterResult.updatedStage,
        verifiedVocalPassCount: mauritanianProgress.verifiedVocalPassCount + 1,
        lastUpdated: new Date().toISOString(),
      });
      setAntiCheatBanner({
        type: 'success',
        message: counterResult.reasonAr,
      });
      setLastEvaluation({
        status: 'correct',
        matchedScore: 100,
        normalizedSpoken: 'ختم الصفحة كاملة',
        normalizedTargetUthmani: 'ختم الصفحة كاملة',
        normalizedTargetImlaei: 'ختم الصفحة كاملة',
        feedbackTitle: 'تم إتمام تسميع الصفحة بالكامل بنجاح!',
        feedbackDetail: counterResult.reasonAr,
      });
    }
  };

  const handleAttemptManualCounterIncrement = () => {
    const res = tryIncrementMauritanianCounter({
      currentCompletedReps: mauritanianProgress.completedRepetitions,
      currentWordIndex,
      totalWordsInPage: totalWords,
      vocalVerifiedCountInPass,
    });
    setAntiCheatBanner({
      type: res.unlockedIncrement ? 'success' : 'locked',
      message: res.reasonAr,
    });
  };

  const handleTriggerHesitationSimulation = (seconds: 3 | 5) => {
    if (!activeWord) return;
    setHesitationSeconds(seconds);
    if (seconds === 3) {
      setPeekLevel('first_letter_3s');
    } else {
      setPeekLevel('full_word_5s');
      playStandardQuranAudio(
        activeWord.audioUrl ||
          getSheikhAudioUrl(
            activeWord.surahNumber,
            activeWord.ayahNumber,
            activeWord.wordPosition,
            profile.preferredSheikh
          ),
        activeWord.textUthmani
      );
      const verseWordsText = words
        .filter((w) => w.verseKey === activeWord.verseKey)
        .map((w) => w.textUthmani)
        .join(' ');
      onLogWeakWord({
        wordId: activeWord.id,
        verseKey: activeWord.verseKey,
        surahNameAr: activeWord.surahNameAr,
        pageNumber: pageData.pageNumber,
        textUthmani: activeWord.textUthmani,
        verseFullText: verseWordsText || activeWord.textUthmani,
        reason: 'hesitation_5s',
        mistakeCount: 0,
        hesitationCount: 1,
        requiredDrillReps: 5,
        completedDrillReps: 0,
      });
    }
  };

  const linesMap = groupWordsInto15Lines(words);
  const pageWeakWords = weakWordsLog.filter(
    (w) => w.pageNumber === pageData.pageNumber && w.completedDrillReps < w.requiredDrillReps
  );

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {/* Top Workspace Control Bar: Mode Switcher + Page Selector + Mandatory Hidden Mode Lock Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 transition-colors">
        {/* Segmented Mode Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangeRecitationMode('daily_ward_hidden')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              recitationMode === 'daily_ward_hidden'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تسميع الورد اليومي (غيباً)
          </button>
          <button
            type="button"
            onClick={() => onChangeRecitationMode('mauritanian_100x')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              recitationMode === 'mauritanian_100x'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            اللوح الشنقيطي (التكرار 100× غيباً)
          </button>
          <button
            type="button"
            onClick={() => onChangeRecitationMode('review_hidden')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              recitationMode === 'review_hidden'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تسميع المراجعة (الحصون · غيباً)
          </button>
        </div>

        {/* Page Navigation & Hide Ayah Markers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangePage(1)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                pageData.pageNumber === 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              ص 1 (الفاتحة)
            </button>
            <button
              type="button"
              onClick={() => onChangePage(604)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                pageData.pageNumber === 604
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              ص 604 (الإخلاص والمعوذتان)
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const num = Number(pageInputNumber);
              if (num >= 1 && num <= 604) {
                onChangePage(num);
              }
            }}
            className="flex items-center gap-1.5"
          >
            <label htmlFor="mushaf-page-input" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              صفحة:
            </label>
            <input
              id="mushaf-page-input"
              type="number"
              min={1}
              max={604}
              value={pageInputNumber}
              onChange={(e) => setPageInputNumber(e.target.value)}
              className="w-16 px-2 py-1 text-xs font-mono-tabular text-center bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md"
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 rounded-md cursor-pointer whitespace-nowrap"
            >
              انتقال
            </button>
          </form>

          <button
            type="button"
            onClick={onToggleHideAyahMarkers}
            aria-pressed={profile.hideAyahMarkers}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              profile.hideAyahMarkers
                ? 'bg-slate-900 dark:bg-amber-600 text-white border-slate-900 dark:border-amber-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{profile.hideAyahMarkers ? 'أرقام الآيات مخفية' : 'إخفاء أرقام الآيات'}</span>
          </button>
        </div>
      </div>

      {/* Dedicated Real-Time Transcript Visualization Component */}
      <RealtimeTranscriptVisualizer
        connectionState={asrConnectionState}
        connectionDetailAr={asrConnectionDetail}
        isListening={isListening}
        isSimulatingStream={isSimulatingStream}
        activeInterimToken={activeInterimToken}
        activeTargetWord={activeWord}
        tokens={transcriptTokens}
        preferredSheikh={profile.preferredSheikh}
        rmsVolume={vadMetrics.rmsVolume}
        onToggleMicrophone={handleToggleMicrophone}
        onToggleSimulateStream={() => {
          if (!isSimulatingStream && currentWordIndex >= totalWords) {
            setCurrentWordIndex(0);
            setVocalVerifiedCountInPass(0);
          }
          setIsSimulatingStream((prev) => !prev);
        }}
        onClearTranscript={() => {
          setTranscriptTokens([]);
          setActiveInterimToken('');
          setLastSpokenWordBubble('');
        }}
      />

      {activeSessionBanner && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 dark:text-amber-200">
          <span className="font-semibold">{activeSessionBanner}</span>
          <span>حساسية الميكروفون: مرتبة الحدر (20 دقيقة للجزء)</span>
        </div>
      )}

      {/* Two-Zone Educational Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Zone A (7 Columns): Authentic Aged Yellow Parchment Uthmanic 15-Line Madinah Mushaf */}
        <div
          data-testid="mushaf-aged-parchment-container"
          className="lg:col-span-7 mushaf-aged-parchment rounded-2xl p-3.5 sm:p-6 space-y-3.5 relative overflow-hidden"
        >
          {/* Mushaf Page Top Ornate Uthmanic Frame Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[#B3863B]/60 text-xs text-[#4A2E0B]">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-bold">
              <BookOpen className="w-3.5 h-3.5 text-[#7C5114]" />
              <span>الجزء {pageData.juzNumber}</span>
              <span aria-hidden="true">·</span>
              <span>الحزب {pageData.hizbNumber}</span>
              <span aria-hidden="true">·</span>
              <span>الرسم العثماني (ورق رقّ أصفر عتيق · 15 سطراً)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#59360A] bg-[#E8CE90]/70 border border-[#B5893E] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#7C5114] shrink-0" />
                <span>
                  {recitationMode === 'mauritanian_100x'
                    ? `التكرار الغيبي (${activeStageInfo.title})`
                    : 'الإخفاء الإجباري غيباً (كشف صوتي فوري)'}
                </span>
              </span>
            </div>
          </div>

          {/* 15 Lines of the Madinah Mushaf on Aged Yellow Parchment */}
          {isLoadingPage ? (
            <div className="space-y-3 py-6" aria-busy="true">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 bg-[#E6CD92]/60 rounded animate-pulse border border-[#C6A15B]/50"
                />
              ))}
            </div>
          ) : (
            <div
              data-testid="mushaf-15-lines-grid"
              className="mushaf-aged-inner-frame divide-y divide-[#C49D54]/45 rounded-xl"
            >
              {Array.from({ length: 15 }, (_, idx) => idx + 1).map((lineNum) => {
                const lineWords = linesMap[lineNum] || [];
                const surahHeader = pageData.surahHeaders.find((h) => h.lineNumber === lineNum);

                return (
                  <div
                    key={lineNum}
                    className="min-h-[2.95rem] sm:min-h-[3.2rem] px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2 sm:gap-3"
                  >
                    {/* Line Number Indicator (1..15) */}
                    <span
                      aria-label={`السطر ${lineNum}`}
                      className="w-5 sm:w-6 text-[10px] sm:text-[11px] font-mono-tabular font-semibold text-[#7A5219]/80 select-none shrink-0 text-center"
                    >
                      {lineNum}
                    </span>

                    {/* Line Content */}
                    <div className="flex-1 flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2.5 gap-y-1.5 text-center">
                      {surahHeader && lineWords.length === 0 ? (
                        <div className="w-full py-1.5 px-3 sm:px-5 bg-[#E7CE92]/90 border-2 border-[#9E7024] rounded-lg text-center font-quran text-base sm:text-xl font-bold text-[#2F1A05] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                          <span className="tracking-wide">۞ {surahHeader.surahNameAr} ۞</span>
                          {surahHeader.hasBasmalah && (
                            <span className="text-sm sm:text-lg font-normal text-[#3E2307]">
                              بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                            </span>
                          )}
                        </div>
                      ) : lineWords.length === 0 ? (
                        <span className="text-xs text-[#7A5219]/50 font-quran">
                          — سطر فاصل للبسملة —
                        </span>
                      ) : (
                        lineWords.map((word) => {
                          const isCurrentPointer = word.globalIndex === currentWordIndex;
                          const isAlreadyRecited = word.globalIndex < currentWordIndex;
                          const isHidden = isWordHiddenInSession(
                            word.globalIndex,
                            currentWordIndex,
                            recitationMode,
                            activeStageId,
                            mauritanianProgress.completedRepetitions % 2
                          );

                          const showFirstLetterPeek =
                            isCurrentPointer && isHidden && peekLevel === 'first_letter_3s';
                          const showFullWordPeek =
                            isCurrentPointer && isHidden && peekLevel === 'full_word_5s';

                          const hasErrorOnPointer =
                            isCurrentPointer &&
                            lastEvaluation &&
                            lastEvaluation.status !== 'correct';

                          let pointerStyle =
                            'bg-[#FBF3D5] border-2 border-emerald-700 text-[#1A0E02] ring-2 ring-emerald-600/35 shadow-2xs';
                          if (hasErrorOnPointer) {
                            if (lastEvaluation?.status === 'memorization_error') {
                              pointerStyle =
                                'bg-red-100 border-2 border-red-700 text-red-950 ring-2 ring-red-500/40 animate-shake-gentle';
                            } else if (lastEvaluation?.status === 'tajweed_error') {
                              pointerStyle =
                                'bg-amber-100 border-2 border-amber-700 text-amber-950 ring-2 ring-amber-500/40';
                            } else if (lastEvaluation?.status === 'mutashabihat_error') {
                              pointerStyle =
                                'bg-indigo-100 border-2 border-indigo-700 text-indigo-950 ring-2 ring-indigo-500/40';
                            }
                          }

                          const charWidthEm = Math.max(
                            2.2,
                            Math.min(5.6, word.textImlaeiSimple.length * 0.68)
                          );

                          return (
                            <React.Fragment key={word.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isHidden || showFullWordPeek) {
                                    playStandardQuranAudio(
                                      word.audioUrl ||
                                        getSheikhAudioUrl(
                                          word.surahNumber,
                                          word.ayahNumber,
                                          word.wordPosition,
                                          profile.preferredSheikh
                                        ),
                                      word.textUthmani
                                    );
                                  }
                                }}
                                aria-label={
                                  isHidden && !showFullWordPeek
                                    ? `كلمة مخفية رقم ${word.globalIndex + 1} في الآية ${word.verseKey}`
                                    : `كلمة ${word.textUthmani}`
                                }
                                style={
                                  isHidden && !showFullWordPeek
                                    ? { minWidth: `${charWidthEm}rem` }
                                    : undefined
                                }
                                className={`font-quran text-lg sm:text-xl min-h-[2.25rem] sm:min-h-[2.45rem] px-2 sm:px-2.5 py-0.5 rounded-md border transition-all cursor-pointer select-none inline-flex items-center justify-center ${
                                  isCurrentPointer
                                    ? pointerStyle
                                    : isAlreadyRecited
                                      ? 'bg-[#E3EFD3]/90 border-[#588B47] text-[#19280F] font-semibold shadow-2xs'
                                      : isHidden
                                        ? 'bg-[#DFC384]/75 border-[#B5893E]/80 text-transparent hover:bg-[#D8B974]/80'
                                        : 'bg-transparent border-transparent text-[#221203] hover:bg-[#E7CE92]/50'
                                }`}
                              >
                                {isHidden && !showFullWordPeek ? (
                                  showFirstLetterPeek ? (
                                    <span className="text-[#4A2B07] font-bold tracking-widest">
                                      {word.textImlaeiSimple.charAt(0)}…
                                    </span>
                                  ) : (
                                    <span
                                      aria-hidden="true"
                                      className="text-[#7C5318]/75 text-xs sm:text-sm tracking-widest font-sans"
                                    >
                                      {'•'.repeat(Math.min(6, Math.max(3, word.textImlaeiSimple.length)))}
                                    </span>
                                  )
                                ) : (
                                  <span
                                    className={`text-[#221203] leading-normal ${
                                      recitationMode === 'mauritanian_100x' &&
                                      activeStageId === 2 &&
                                      word.tajweedRules &&
                                      word.tajweedRules.length > 0
                                        ? 'underline decoration-[#9E6B1E] decoration-2 underline-offset-8'
                                        : ''
                                    }`}
                                  >
                                    {word.textUthmani.replace(/ٱ/g, 'ا').replace(/ۢ/g, '')}
                                  </span>
                                )}
                              </button>

                              {word.isAyahEnd && !profile.hideAyahMarkers && (
                                <span
                                  aria-label={`نهاية الآية ${word.ayahNumber}`}
                                  className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-[11px] sm:text-xs font-mono-tabular font-bold text-[#3B2206] bg-[#E5C883] border-2 border-[#9B6D20] rounded-full select-none shadow-2xs"
                                >
                                  {word.ayahNumber}
                                </span>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mushaf Bottom Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#B3863B]/45 text-xs text-[#4A2E0B]">
            <div>
              <span>الكلمة النشطة بالمؤشر: </span>
              <span className="font-mono-tabular font-bold text-[#221203]">
                {Math.min(currentWordIndex + 1, totalWords)} / {totalWords}
              </span>
              {activeWord && (
                <span className="mr-2 text-[#5E3A0E]">
                  (سورة {activeWord.surahNameAr} · الآية {activeWord.ayahNumber})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentWordIndex(0);
                setVocalVerifiedCountInPass(0);
                setLastEvaluation(null);
                setPeekLevel('none');
                setHesitationSeconds(0);
                setIsSimulatingStream(false);
                setActiveInterimToken('');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-[#2F1A05] bg-[#E6CB88] hover:bg-[#DEC076] border border-[#9E7024] rounded-md flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بدء تكرار غيبي جديد (إخفاء الصفحة من أولها)</span>
            </button>
          </div>
        </div>

        {/* Zone B (5 Columns): Voice Controls, Microphone Diagnostics & 100x Tracker */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: AI Voice Recognition, Diagnostics & Interactive Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                  التحكم الصوتي وفحص الميكروفون المباشر
                </p>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  لوحة التقاط التلاوة ومطابقة الكلمات
                </h2>
              </div>

              <button
                type="button"
                onClick={handleToggleMicrophone}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>إيقاف الميكروفون</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>تشغيل التسميع الصوتي</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Status Banner */}
            <div
              role="status"
              data-testid="asr-diagnostic-box"
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                diagnosticInfo.severity === 'error'
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
                  : diagnosticInfo.severity === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {diagnosticInfo.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
                ) : diagnosticInfo.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                )}
                <span>حالة السماع والتشخيص: {diagnosticInfo.titleAr}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{diagnosticInfo.solutionAr}</p>
            </div>

            {/* Child VAD Frequency Spectrum Bars */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span>{asrStatusText}</span>
                <span className="font-mono-tabular">
                  صمت: {hesitationSeconds} ث · مستوى صوتك: {vadMetrics.rmsVolume}%
                </span>
              </div>
              <div className="h-7 flex items-end gap-1.5 pt-1" aria-hidden="true">
                {vadMetrics.spectrumBins.map((val, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${isListening || isSimulatingStream ? Math.max(18, val) : 20}%` }}
                    className={`flex-1 rounded-t transition-all duration-150 ${
                      isListening || isSimulatingStream
                        ? 'bg-emerald-600 dark:bg-emerald-400'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 dark:border-slate-700 text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceCadenceFallback}
                    onChange={(e) => setVoiceCadenceFallback(e.target.checked)}
                    className="accent-emerald-700"
                  />
                  <span>كشف الكلمات بنبرة الصوت تلقائياً إذا قيّد المتصفح تحويل النص</span>
                </label>

                <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lenientRevealMode}
                    onChange={(e) => setLenientRevealMode(e.target.checked)}
                    className="accent-emerald-700"
                  />
                  <span>كشف الكلمة حتى مع خطأ التجويد</span>
                </label>
              </div>
            </div>

            {/* Direct Spoken / Written Phrase Input & Instant Simulation Controls */}
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  إدخال واختبار النطق الفوري (كلمة أو آية كاملة):
                </span>
                {activeWord && (
                  <span className="text-slate-500 dark:text-slate-400">
                    الكلمة المطلوبة بالمؤشر:{' '}
                    <strong className="text-slate-900 dark:text-emerald-300">
                      «{activeWord.textImlaeiSimple}»
                    </strong>
                  </span>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualSpokenInput.trim()) {
                    processSpokenPhraseOrWord(manualSpokenInput.trim());
                    setManualSpokenInput('');
                  }
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <label htmlFor="spoken-word-input" className="sr-only">
                  اكتب ما تنطق به ليظهر في السجل والمصحف
                </label>
                <input
                  id="spoken-word-input"
                  type="text"
                  value={manualSpokenInput}
                  onChange={(e) => setManualSpokenInput(e.target.value)}
                  placeholder="اكتب كلمة أو آية كاملة (مثل: قل هو الله احد) واضغط إرسال..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 rounded-lg whitespace-nowrap cursor-pointer"
                >
                  إرسال وكشف بالمصحف
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!activeWord}
                  onClick={() => activeWord && processSpokenPhraseOrWord(activeWord.textImlaeiSimple)}
                  className="py-2 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                >
                  نطق الكلمة الصحيحة التالية
                </button>

                <button
                  type="button"
                  onClick={handleCompleteFullPageVocally}
                  className="py-2 px-3 text-xs font-semibold text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-transparent dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  إتمام تسميع الصفحة بالكامل
                </button>
              </div>

              {/* Three Error Categories Instant Simulation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={!activeWord}
                  onClick={() => processSpokenPhraseOrWord('كلمة_مختلفة')}
                  className="py-2 px-2 text-xs font-semibold text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/70 border border-red-200 dark:border-red-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  اختبار خطأ حفظ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const samadIdx = words.findIndex((w) => w.textImlaeiSimple.includes('ص'));
                    if (samadIdx >= 0 && samadIdx !== currentWordIndex) {
                      setCurrentWordIndex(samadIdx);
                      const target = words[samadIdx];
                      const spokenWrong = target.textImlaeiSimple.replace('ص', 'س');
                      setLastSpokenWordBubble(spokenWrong);
                      const res = evaluateSpokenWord(
                        spokenWrong,
                        target,
                        profile.preferredSheikh
                      );
                      setLastEvaluation(res);
                      onRecordEvaluationStat(res.status);
                      playGentleFeedbackTone('tajweed_warning');
                    } else if (activeWord) {
                      processSpokenPhraseOrWord('السمد');
                    }
                  }}
                  className="py-2 px-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  خطأ مخارج (س/ص)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const mutIdx = words.findIndex((w) => Boolean(w.mutashabihatRef));
                    if (mutIdx >= 0) {
                      setCurrentWordIndex(mutIdx);
                      const target = words[mutIdx];
                      const spokenMut = target.mutashabihatRef!.similarContinuation;
                      setLastSpokenWordBubble(spokenMut);
                      const res = evaluateSpokenWord(
                        spokenMut,
                        target,
                        profile.preferredSheikh
                      );
                      setLastEvaluation(res);
                      onRecordEvaluationStat(res.status);
                      playGentleFeedbackTone('mutashabihat_alert');
                    }
                  }}
                  className="py-2 px-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  خطأ متشابهات
                </button>
              </div>
            </div>

            {/* Smart Peeking on Hesitation Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  نظام التلميح الذكي المقيد (Smart Peeking):
                </span>
                <span>
                  {peekLevel === 'first_letter_3s'
                    ? 'تم كشف الحرف الأول (صمت 3 ث)'
                    : peekLevel === 'full_word_5s'
                      ? 'تم نطق الكلمة وتسجيلها بالمتعثرات (5 ث)'
                      : 'لا يوجد تردد'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerHesitationSimulation(3)}
                  className="py-1.5 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md cursor-pointer"
                >
                  محاكاة صمت 3 ث (الحرف الأول)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerHesitationSimulation(5)}
                  className="py-1.5 px-2.5 text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 border border-amber-200 dark:border-amber-800 rounded-md cursor-pointer"
                >
                  محاكاة صمت 5 ث (نطق + تسجيل تعثر)
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Instant Diagnostic Alert Card */}
          {lastEvaluation && (
            <div
              role="region"
              aria-label="نتيجة تشخيص النطق"
              className={`p-4 rounded-xl border space-y-2.5 ${
                lastEvaluation.status === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : lastEvaluation.status === 'tajweed_error'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : lastEvaluation.status === 'mutashabihat_error'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100'
                      : 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-950 dark:text-red-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {lastEvaluation.status === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{lastEvaluation.feedbackTitle}</span>
                </div>
                <span className="text-xs font-mono-tabular font-semibold">
                  تطابق: {lastEvaluation.matchedScore}%
                </span>
              </div>

              <p className="text-xs leading-relaxed">
                {lastSpokenWordBubble && (
                  <span className="block font-semibold mb-1">
                    الكلمة التي سمعها الموقع منك: «{lastSpokenWordBubble}»
                  </span>
                )}
                {lastEvaluation.feedbackDetail}
              </p>

              {lastEvaluation.tajweedAlert && (
                <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold">
                    القاعدة: {lastEvaluation.tajweedAlert.ruleName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      playStandardQuranAudio(
                        lastEvaluation.tajweedAlert!.sheikhAudioUrl,
                        activeWord?.textUthmani || 'ٱلصَّمَدُ'
                      )
                    }
                    className="px-3 py-1 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-700 rounded-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>نطق الشيخ {profile.preferredSheikh === 'husary' ? 'الحصري' : 'المنشاوي'}</span>
                  </button>
                </div>
              )}

              {lastEvaluation.mutashabihatAlert && (
                <div className="pt-2 border-t border-indigo-200/80 dark:border-indigo-800 text-xs space-y-1">
                  <div>
                    <strong>السورة المتشابهة:</strong> {lastEvaluation.mutashabihatAlert.confusedSurahName} ({lastEvaluation.mutashabihatAlert.confusedVerseKey})
                  </div>
                  <div>
                    <strong>السياق الصحيح هنا:</strong> سورة {lastEvaluation.mutashabihatAlert.correctSurahName} ({lastEvaluation.mutashabihatAlert.correctVerseKey})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Mauritanian 100x Repetition Engine (الغيب الإجباري في التكرار) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>التكرار الشنقيطي المئوي غيباً (قفل الحماية ضد الغش)</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  عداد تكرار اللوح المئوي الغيبي (صفحة {pageData.pageNumber})
                </h3>
              </div>

              <div className="text-left shrink-0">
                <div
                  data-testid="mauritanian-counter-value"
                  className="text-xl sm:text-2xl font-bold font-mono-tabular text-emerald-800 dark:text-emerald-400"
                >
                  {mauritanianProgress.completedRepetitions} / 100
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${mauritanianProgress.completedRepetitions}%` }}
                className="h-full bg-emerald-700 dark:bg-emerald-500 transition-all duration-200"
              />
            </div>

            {/* 4 Progressive Mauritanian Stages */}
            <div className="space-y-2">
              {MAURITANIAN_STAGES.map((stage) => {
                const isCurrentStage = activeStageId === stage.id;
                const isCompletedStage = mauritanianProgress.completedRepetitions >= stage.endRep;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      onChangeRecitationMode('mauritanian_100x');
                      setSelectedStageOverride(stage.id);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-right transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrentStage
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-600 dark:border-emerald-500 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{stage.title}</span>
                        {isCompletedStage && (
                          <span className="text-emerald-700 dark:text-emerald-400">(مكتمل)</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{stage.subtitle}</p>
                    </div>
                    <span className="text-xs font-mono-tabular font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                      {stage.targetCount} مرة ({stage.startRep}–{stage.endRep})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Anti-Cheat Counter Lock Verification Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  لا يرتفع العداد إلا بنطق جميع الكلمات غيباً حتى الكلمة رقم {totalWords}:
                </span>
                <button
                  type="button"
                  onClick={handleAttemptManualCounterIncrement}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md whitespace-nowrap cursor-pointer"
                >
                  اختبار قفل الحماية ضد الغش
                </button>
              </div>

              {antiCheatBanner && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-medium ${
                    antiCheatBanner.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {antiCheatBanner.message}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Mandatory 5x Weak Words End-of-Session Drill */}
          {pageWeakWords.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                  <Flame className="w-4 h-4" />
                  <span>إلزام إعادة الآيات المتعثرة (5 مرات إضافية)</span>
                </div>
                <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                  {pageWeakWords.length} كلمات
                </span>
              </div>

              <div className="space-y-2">
                {pageWeakWords.slice(0, 3).map((item) => (
                  <div
                    key={item.wordId}
                    className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-quran text-lg text-slate-900 dark:text-slate-100">
                        {item.textUthmani.replace(/ٱ/g, 'ا')} —{' '}
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          «{item.verseFullText.replace(/ٱ/g, 'ا')}»
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                        تقدم التثبيت الإلزامي: {item.completedDrillReps} / {item.requiredDrillReps} مرات
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCompleteWeakWordDrillRep(item.wordId)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md whitespace-nowrap cursor-pointer"
                    >
                      تسميع (+1)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
