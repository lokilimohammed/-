import {
  FiveFortressesPlan,
  MauritanianStageId,
  MauritanianStageInfo,
  QuranWord,
  TajweedHeadType,
  WordEvaluationResult,
} from '../types/quran';

/**
 * المراحل الأربع لتكرار اللوح الشنقيطي (100 مرة)
 */
export const MAURITANIAN_STAGES: MauritanianStageInfo[] = [
  {
    id: 1,
    title: 'المرحلة 1: التكرار الغيبي التأسيسي (1–15)',
    subtitle: 'تسميع غيبي مع إظهار كل كلمة فور نطقها وتوجيه صوتي عند التوقف',
    targetCount: 15,
    startRep: 1,
    endRep: 15,
    visibilityMode: 'strict_hidden_100',
  },
  {
    id: 2,
    title: 'المرحلة 2: التكرار الغيبي مع تدقيق التجويد (16–40)',
    subtitle: 'إخفاء الآيات غيباً وكشف كل كلمة بالنطق مع تلوين أحكام التجويد والمتشابهات',
    targetCount: 25,
    startRep: 16,
    endRep: 40,
    visibilityMode: 'strict_hidden_100',
  },
  {
    id: 3,
    title: 'المرحلة 3: التكرار الغيبي المتسارع (41–60)',
    subtitle: 'إخفاء الآيات غيباً وتثبيت الروابط بين الآيات المتتالية بالنطق الصوتي',
    targetCount: 20,
    startRep: 41,
    endRep: 60,
    visibilityMode: 'strict_hidden_100',
  },
  {
    id: 4,
    title: 'المرحلة 4: التسميع الغيبي الإجباري الصارم (61–100)',
    subtitle: 'إخفاء الصفحة بنسبة 100% وتسميعها غيباً بالكامل كلمة تلو كلمة حتى الإتقان التام',
    targetCount: 40,
    startRep: 61,
    endRep: 100,
    visibilityMode: 'strict_hidden_100',
  },
];

/**
 * الأزواج الصوتية المتقاربة في المخارج والصفات (التفخيم والترقيق، الإطباق، القلقلة، الحلق)
 */
export interface PhoneticConfusionRule {
  targetLetter: string;
  spokenLetter: string;
  pairLabel: string;
  head: TajweedHeadType;
  ruleName: string;
  makhrajExplanation: string;
}

export const PHONETIC_CONFUSION_PAIRS: PhoneticConfusionRule[] = [
  {
    targetLetter: 'ص',
    spokenLetter: 'س',
    pairLabel: 'س بدلاً من ص',
    head: 'tafkheem_tarqeeq',
    ruleName: 'ترقيق حرف الصاد المفخم المطبق',
    makhrajExplanation: 'حرف (ص) مستعلٍ مطبق يرتفع فيه أقصى اللسان إلى الحنك الأعلى، بينما (س) مرقق مستفل.',
  },
  {
    targetLetter: 'س',
    spokenLetter: 'ص',
    pairLabel: 'ص بدلاً من س',
    head: 'tafkheem_tarqeeq',
    ruleName: 'تفخيم حرف السين المرقق',
    makhrajExplanation: 'حرف (س) مرقق مستفل؛ احذر من إطباق اللسان حتى لا ينقلب صاداً.',
  },
  {
    targetLetter: 'ط',
    spokenLetter: 'ت',
    pairLabel: 'ت بدلاً من ط',
    head: 'itbaq_infitah',
    ruleName: 'ترقيق حرف الطاء الأقوى إطباقاً وتفخيماً',
    makhrajExplanation: 'حرف (ط) يخرج من طرف اللسان مع أصول الثنايا العليا مع استعلاء وإطباق قوي، فلا تهمسه كالتاء.',
  },
  {
    targetLetter: 'ت',
    spokenLetter: 'ط',
    pairLabel: 'ط بدلاً من ت',
    head: 'tafkheem_tarqeeq',
    ruleName: 'تفخيم حرف التاء المرقق المهموس',
    makhrajExplanation: 'حرف (ت) مرقق مهموس؛ خفف ضغط اللسان ولا ترفع أقصى اللسان.',
  },
  {
    targetLetter: 'ظ',
    spokenLetter: 'ذ',
    pairLabel: 'ذ بدلاً من ظ',
    head: 'tafkheem_tarqeeq',
    ruleName: 'ترقيق حرف الظاء اللثوي المفخم',
    makhrajExplanation: 'حرف (ظ) يخرج من طرف اللسان مع أطراف الثنايا العليا مع التفخيم والإطباق، بخلاف (ذ) المرقق.',
  },
  {
    targetLetter: 'ظ',
    spokenLetter: 'ز',
    pairLabel: 'ز بدلاً من ظ',
    head: 'itbaq_infitah',
    ruleName: 'إبدال الظاء اللثوية زاياً صفيرية',
    makhrajExplanation: 'أخرج طرف اللسان قليلاً عند النطق بحرف (ظ) مع التفخيم ولا تجعله خلف الأسنان كحرف الزاي.',
  },
  {
    targetLetter: 'ذ',
    spokenLetter: 'ز',
    pairLabel: 'ز بدلاً من ذ',
    head: 'hams_jahr',
    ruleName: 'عدم إخراج طرف اللسان في حرف الذال',
    makhrajExplanation: 'حرف (ذ) لثوي يخرج من طرف اللسان مع أطراف الثنايا العليا وليس من الصفير.',
  },
  {
    targetLetter: 'ض',
    spokenLetter: 'د',
    pairLabel: 'د بدلاً من ض',
    head: 'itbaq_infitah',
    ruleName: 'إبدال الضاد المستطيلة دالاً مرققة',
    makhrajExplanation: 'حرف (ض) يخرج من إحدى حافتي اللسان أو كلتيهما مع ما يحاذيهما من الأضراس العليا مع الاستطالة والتفخيم.',
  },
  {
    targetLetter: 'ق',
    spokenLetter: 'ك',
    pairLabel: 'ك بدلاً من ق',
    head: 'qalqalah',
    ruleName: 'إبدال القاف (أقصى اللسان مع الحنك اللحمي) كافاً',
    makhrajExplanation: 'حرف (ق) مفخم مقلقل يخرج من أقصى اللسان مع الحنك اللحمي، بينما (ك) أدخل إلى الفم مع الحنك العظمي.',
  },
  {
    targetLetter: 'ح',
    spokenLetter: 'ه',
    pairLabel: 'هـ بدلاً من ح',
    head: 'izhar',
    ruleName: 'إضعاف مخرج الحاء من وسط الحلق إلى أقصى الحلق',
    makhrajExplanation: 'حرف (ح) يخرج من وسط الحلق ببحة صافية مهموسة، بينما (هـ) تخرج من أقصى الحلق.',
  },
];

/**
 * خوارزمية التطبيع الإملائي-العثماني الفورية (Orthographic Normalization Pipeline)
 * تقوم بتوحيد الهمزات (أ، إ، آ، ٱ -> ا)، وحذف الألف الخنجرية والمدود العثمانية،
 * وتوحيد التاء المربوطة والهاء عند الوقف، وتوحيد الألف المقصورة والياء، وحذف التشكيل.
 */
export function normalizeQuranicWord(text: string): string {
  if (!text) return '';

  return (
    text
      .trim()
      // 1. حذف علامات الوقف والرموز العثمانية الخاصة وأرقام الآيات
      .replace(/[\u06D6-\u06ED\u06DD\u06DE\u06E9\uFD3E\uFD3F\u0660-\u06690-9]/g, '')
      // 2. حذف الألف الخنجرية (ٰ \u0670) والواو والياء الصغيرتين العثمانيتين والمدود (ٓ \u0653)
      // حتى يتطابق الرسم العثماني (مثل: الرَّحْمَٰنِ / الصَّلَوٰةَ / إِبْرَٰهِيمَ) مع الإملائي
      .replace(/[\u0670\u0653\u0654\u0655\u06E5\u06E6]/g, '')
      // 3. حذف التشكيل والحركات (الفتحة، الضمة، الكسرة، التنوين، الشدة، السكون، التطويل)
      .replace(/[\u064B-\u0652\u0640]/g, '')
      // 4. توحيد جميع أشكال الهمزات وألف الوصل (أ، إ، آ، ٱ، ؤ، ئ، ء)
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/[ؤ]/g, 'و')
      .replace(/[ئ]/g, 'ي')
      .replace(/ء/g, '')
      // 5. توحيد التاء المربوطة والهاء (عند الوقف والوصل للأطفال)
      .replace(/ة/g, 'ه')
      // 6. توحيد الألف المقصورة والياء
      .replace(/ى/g, 'ي')
      // 7. معالجة الكلمات القرآنية ذات الرسم العثماني الخاص بالواو أو الألف (الصلوة -> الصلاه -> الصله)
      .replace(/صلوه/g, 'صلاه')
      .replace(/زكوه/g, 'زكاه')
      .replace(/حيوه/g, 'حياه')
      .replace(/غدوه/g, 'غداه')
      .replace(/مشكوه/g, 'مشكاه')
      .replace(/ربوا/g, 'ربا')
      // 8. حذف الألف لإجراء مقارنة جذرية مرنة عند اختلاف الألف الخنجرية بين الإملائي والعثماني (مثل: الرحمن / الرحمان، إله / إلاه، لكن / لاكن)
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * استخراج الجذر الهيكلي الصامت للكلمة بدون حروف المد الألفية للمطابقة بين الرسم العثماني والإملائي
 * مثال: "الرحمن" (عثماني بعد حذف الخنجرية) و"الرحمان" (إملائي صوتي) كلاهما يعطي "الرحمن"
 */
export function getConsonantalSkeleton(normalizedWord: string): string {
  if (!normalizedWord) return '';
  // نحتفظ بالألف في أول الكلمة فقط ونزيل الألف المتوسطة الزائدة بسبب الخنجرية
  if (normalizedWord.length <= 2) return normalizedWord;
  return normalizedWord[0] + normalizedWord.slice(1).replace(/ا/g, '');
}

/**
 * حساب مسافة ليفنشتاين (Levenshtein Distance) لقياس التشابه بين الكلمات المنطوقة والمستهدفة
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * بناء رابط النطق الصوتي المعياري للكلمة أو الآية بصوت الشيخ الحصري أو المنشاوي
 */
export function getSheikhAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  wordPosition?: number,
  sheikh: 'husary' | 'minshawi' = 'husary'
): string {
  const sPad = String(surahNumber).padStart(3, '0');
  const aPad = String(ayahNumber).padStart(3, '0');
  if (wordPosition !== undefined) {
    const wPad = String(wordPosition).padStart(3, '0');
    // رابط الكلمة المفردة من Quran.com CDN
    return `https://audio.qurancdn.com/wbw/${sPad}_${aPad}_${wPad}.mp3`;
  }
  const folder =
    sheikh === 'husary'
      ? 'Husary_128kbps'
      : 'Minshawy_Murattal_128kbps';
  return `https://everyayah.com/data/${folder}/${sPad}${aPad}.mp3`;
}

/**
 * فحص ما إذا كان الخطأ ناتجاً عن إبدال حرف بمخرج متقارب (تفخيم/ترقيق أو إطباق أو قلقلة)
 */
export function detectPhoneticMakhrajError(
  spokenRaw: string,
  targetWord: QuranWord,
  sheikh: 'husary' | 'minshawi' = 'husary'
): WordEvaluationResult['tajweedAlert'] | null {
  const normSpoken = normalizeQuranicWord(spokenRaw);
  const normTargetImlaei = normalizeQuranicWord(targetWord.textImlaeiSimple);
  const normTargetUthmani = normalizeQuranicWord(targetWord.textUthmani);

  for (const rule of PHONETIC_CONFUSION_PAIRS) {
    // إذا كانت الكلمة الأصلية تحتوي على الحرف المستهدف، والكلمة المنطوقة استبدلته بالحرف المشابه
    const targetCandidate = normTargetImlaei.includes(rule.targetLetter)
      ? normTargetImlaei
      : normTargetUthmani;

    if (targetCandidate.includes(rule.targetLetter) && normSpoken.includes(rule.spokenLetter)) {
      const replacedSpoken = normSpoken.replace(new RegExp(rule.spokenLetter, 'g'), rule.targetLetter);
      if (
        replacedSpoken === targetCandidate ||
        getConsonantalSkeleton(replacedSpoken) === getConsonantalSkeleton(targetCandidate)
      ) {
        return {
          confusedPair: rule.pairLabel,
          ruleName: rule.ruleName,
          makhrajExplanation: rule.makhrajExplanation,
          head: rule.head,
          sheikhAudioUrl:
            targetWord.audioUrl ||
            getSheikhAudioUrl(targetWord.surahNumber, targetWord.ayahNumber, targetWord.wordPosition, sheikh),
        };
      }
    }
  }
  return null;
}

/**
 * محرك المطابقة الذكي وتصنيف الأخطاء الثلاثي:
 * 1) تطابق سليم (أكثر من 95% مع مراعاة الرسم العثماني والإملائي)
 * 2) خطأ المخارج والتجويد (س/ص، ت/ط، ذ/ظ، د/ض، ق/ك، ح/هـ)
 * 3) خطأ المتشابهات اللفظية (الانتقال لتكملة آية مشابهة في سورة أخرى)
 * 4) خطأ الحفظ (نسيان أو إبدال كلمة بأخرى)
 */
export function evaluateSpokenWord(
  spokenText: string,
  targetWord: QuranWord,
  sheikh: 'husary' | 'minshawi' = 'husary'
): WordEvaluationResult {
  const normSpoken = normalizeQuranicWord(spokenText);
  const normUthmani = normalizeQuranicWord(targetWord.textUthmani);
  const normImlaei = normalizeQuranicWord(targetWord.textImlaeiSimple);

  const skelSpoken = getConsonantalSkeleton(normSpoken);
  const skelUthmani = getConsonantalSkeleton(normUthmani);
  const skelImlaei = getConsonantalSkeleton(normImlaei);

  // 1. فحص التطابق المباشر مع الإملائي أو العثماني أو الجذر الصامت
  if (
    normSpoken.length > 0 &&
    (normSpoken === normImlaei ||
      normSpoken === normUthmani ||
      skelSpoken === skelImlaei ||
      skelSpoken === skelUthmani)
  ) {
    return {
      status: 'correct',
      matchedScore: 100,
      normalizedSpoken: normSpoken,
      normalizedTargetUthmani: normUthmani,
      normalizedTargetImlaei: normImlaei,
      feedbackTitle: 'نطق سليم وموافق للرسم',
      feedbackDetail: `أحسنت! نطقت كلمة «${targetWord.textUthmani}» بمخرج سليم.`,
    };
  }

  // 2. فحص خطأ المخارج والتجويد (الأزواج الصوتية المتقاربة)
  const tajweedAlert = detectPhoneticMakhrajError(spokenText, targetWord, sheikh);
  if (tajweedAlert) {
    return {
      status: 'tajweed_error',
      matchedScore: 72,
      normalizedSpoken: normSpoken,
      normalizedTargetUthmani: normUthmani,
      normalizedTargetImlaei: normImlaei,
      feedbackTitle: `تنبيه تجويدي: ${tajweedAlert.confusedPair}`,
      feedbackDetail: tajweedAlert.makhrajExplanation,
      tajweedAlert,
    };
  }

  // 3. فحص رادار المتشابهات اللفظية (Mutashabihat Radar)
  if (targetWord.mutashabihatRef) {
    const normMutashabih = normalizeQuranicWord(targetWord.mutashabihatRef.similarContinuation);
    if (
      normSpoken.length > 0 &&
      (normSpoken === normMutashabih ||
        normMutashabih.includes(normSpoken) ||
        normSpoken.includes(normMutashabih))
    ) {
      return {
        status: 'mutashabihat_error',
        matchedScore: 40,
        normalizedSpoken: normSpoken,
        normalizedTargetUthmani: normUthmani,
        normalizedTargetImlaei: normImlaei,
        feedbackTitle: `رادار المتشابهات: انتقلت إلى ${targetWord.mutashabihatRef.similarSurahName}`,
        feedbackDetail: targetWord.mutashabihatRef.warningNote,
        mutashabihatAlert: {
          spokenContinuation: spokenText,
          confusedSurahName: targetWord.mutashabihatRef.similarSurahName,
          confusedVerseKey: targetWord.mutashabihatRef.similarVerseKey,
          correctSurahName: targetWord.surahNameAr,
          correctVerseKey: targetWord.verseKey,
          guidance: targetWord.mutashabihatRef.warningNote,
        },
      };
    }
  }

  // 4. حساب نسبة التقارب للكلمات الطويلة (> 5 حروف) لتجنب ظلم الطفل في همزة الوصل
  const maxLen = Math.max(skelSpoken.length, skelImlaei.length, 1);
  const dist = Math.min(
    levenshteinDistance(skelSpoken, skelImlaei),
    levenshteinDistance(normSpoken, normImlaei)
  );
  const similarity = Math.round(((maxLen - dist) / maxLen) * 100);

  if (similarity >= 95) {
    return {
      status: 'correct',
      matchedScore: similarity,
      normalizedSpoken: normSpoken,
      normalizedTargetUthmani: normUthmani,
      normalizedTargetImlaei: normImlaei,
      feedbackTitle: 'نطق مطابق',
      feedbackDetail: `تطابق بنسبة ${similarity}% مع الكلمة القرآنية.`,
    };
  }

  // 5. خطأ الحفظ (نسيان أو إبدال كلمة)
  return {
    status: 'memorization_error',
    matchedScore: Math.max(0, similarity),
    normalizedSpoken: normSpoken,
    normalizedTargetUthmani: normUthmani,
    normalizedTargetImlaei: normImlaei,
    feedbackTitle: 'تنبيه حفظ: الكلمة غير مطابقة',
    feedbackDetail: `الكلمة المنطوقة «${spokenText || '...'}» تختلف عن الكلمة المطلوبة في الموضع الحالي. ركّز وأعد النطق.`,
  };
}

/**
 * تجميع كلمات الصفحة برمجياً حسب رقم السطر (1 إلى 15) لمطابقة مصحف المدينة المنورة القياسي
 */
export function groupWordsInto15Lines(words: QuranWord[]): Record<number, QuranWord[]> {
  const lines: Record<number, QuranWord[]> = {};
  for (let i = 1; i <= 15; i++) {
    lines[i] = [];
  }
  for (const word of words) {
    const lineNum = Math.min(15, Math.max(1, word.lineNumber || 1));
    lines[lineNum].push(word);
  }
  return lines;
}

/**
 * آلة حالة الإخفاء الإجباري للآيات (Mandatory Hidden Verses State Machine)
 * تحدد ما إذا كانت الكلمة مخفية أم مكشوفة:
 * - في جميع الأوضاع (تسميع الورد اليومي، تسميع المراجعة، وتكرار اللوح الشنقيطي 100 مرة غيباً)،
 *   تكون جميع الكلمات مخفية ولا تظهر الكلمة في المصحف إلا بعد أن ينطقها المستخدم ويتجاوزها المؤشر (wordGlobalIndex < currentWordIndex).
 */
export function isWordHiddenInSession(
  wordGlobalIndex: number,
  currentWordIndex: number,
  _mode: 'daily_ward_hidden' | 'review_hidden' | 'mauritanian_100x',
  _mauritanianStage: MauritanianStageId = 4,
  _alternatingPassParity: number = 0,
  forceShowAllForPrep: boolean = false
): boolean {
  if (forceShowAllForPrep) {
    return false;
  }
  // أي كلمة نطقها المستخدم بالفعل وتجاوزها المؤشر تظهر في المصحف فوراً
  if (wordGlobalIndex < currentWordIndex) {
    return false;
  }
  // جميع الكلمات التي لم ينطقها بعد تبقى مخفية (غيباً) في التسميع والتكرار
  return true;
}

/**
 * معالجة الجمل والكلمات المتتابعة المنطوقة في الميكروفون:
 * تقسم النص المنطوق إلى كلمات فردية وتطابقها بالتتابع مع كلمات المصحف بدءاً من المؤشر الحالي،
 * بحيث تظهر كل كلمة ينطقها القارئ في المصحف فوراً.
 */
export function matchSpokenPhraseToWords(
  spokenPhrase: string,
  words: QuranWord[],
  startWordIndex: number,
  sheikh: 'husary' | 'minshawi' = 'husary',
  lenientRevealMode: boolean = false
): {
  newWordIndex: number;
  revealedCount: number;
  wordResults: {
    spokenToken: string;
    targetWord: QuranWord;
    evaluation: WordEvaluationResult;
    revealedInMushaf: boolean;
  }[];
} {
  const tokens = spokenPhrase
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let pointer = startWordIndex;
  let revealedCount = 0;
  const wordResults: {
    spokenToken: string;
    targetWord: QuranWord;
    evaluation: WordEvaluationResult;
    revealedInMushaf: boolean;
  }[] = [];

  for (const token of tokens) {
    if (pointer >= words.length) break;
    const targetWord = words[pointer];
    const evaluation = evaluateSpokenWord(token, targetWord, sheikh);

    if (evaluation.status === 'correct' || (lenientRevealMode && evaluation.status === 'tajweed_error')) {
      wordResults.push({
        spokenToken: token,
        targetWord,
        evaluation,
        revealedInMushaf: true,
      });
      pointer++;
      revealedCount++;
    } else {
      wordResults.push({
        spokenToken: token,
        targetWord,
        evaluation,
        revealedInMushaf: false,
      });
      break;
    }
  }

  return {
    newWordIndex: pointer,
    revealedCount,
    wordResults,
  };
}

/**
 * تحديد المرحلة التربوية من رقم التكرار الحالي (1 إلى 100)
 */
export function getMauritanianStageForRep(completedReps: number): MauritanianStageInfo {
  const nextRep = Math.min(100, Math.max(1, completedReps + 1));
  if (nextRep <= 15) return MAURITANIAN_STAGES[0];
  if (nextRep <= 40) return MAURITANIAN_STAGES[1];
  if (nextRep <= 60) return MAURITANIAN_STAGES[2];
  return MAURITANIAN_STAGES[3];
}

/**
 * حماية العداد ضد الغش (Anti-Cheat Counter Lock)
 * لا يرتفع عداد التكرار (من 1 حتى 100) إلا عندما يصل مؤشر الكلمات النشط (currentWordIndex)
 * إلى آخر كلمة في الصفحة عبر النطق الصوتي الفعلي الموثق.
 */
export function tryIncrementMauritanianCounter(params: {
  currentCompletedReps: number;
  currentWordIndex: number;
  totalWordsInPage: number;
  vocalVerifiedCountInPass: number;
}): {
  updatedCompletedReps: number;
  updatedStage: MauritanianStageId;
  unlockedIncrement: boolean;
  reasonAr: string;
} {
  const { currentCompletedReps, currentWordIndex, totalWordsInPage, vocalVerifiedCountInPass } = params;

  if (totalWordsInPage <= 0) {
    return {
      updatedCompletedReps: currentCompletedReps,
      updatedStage: getMauritanianStageForRep(currentCompletedReps).id,
      unlockedIncrement: false,
      reasonAr: 'لا توجد كلمات في الصفحة الحالية.',
    };
  }

  // التحقق من وصول المؤشر إلى نهاية الصفحة وأن الكلمات تم التحقق منها صوتياً
  const reachedLastWord = currentWordIndex >= totalWordsInPage;
  const enoughVocalVerification = vocalVerifiedCountInPass >= Math.ceil(totalWordsInPage * 0.85);

  if (!reachedLastWord || !enoughVocalVerification) {
    return {
      updatedCompletedReps: currentCompletedReps,
      updatedStage: getMauritanianStageForRep(currentCompletedReps).id,
      unlockedIncrement: false,
      reasonAr: 'قفل الحماية ضد الغش نشط: يجب إتمام نطق جميع كلمات الصفحة حتى آخر كلمة لاحتساب التكرار.',
    };
  }

  const nextReps = Math.min(100, currentCompletedReps + 1);
  const nextStage = getMauritanianStageForRep(nextReps).id;

  return {
    updatedCompletedReps: nextReps,
    updatedStage: nextStage,
    unlockedIncrement: true,
    reasonAr: `تم توثيق إتمام الصفحة صوتياً! ارتفع العداد إلى ${nextReps} من 100.`,
  };
}

/**
 * محرك المراجعة المتدرجة وفق منهجية "الحصون الخمسة" (من جزء واحد = 20 صفحة إلى 15 جزءاً = 300 صفحة)
 */
export function calculateFiveFortressesPlan(
  totalMemorizedJuz: number,
  dailyNewPages: number,
  currentTargetPage: number
): FiveFortressesPlan {
  const clampedJuz = Math.min(15, Math.max(1, Math.round(totalMemorizedJuz)));
  const totalMemorizedPages = clampedJuz * 20; // كل جزء يعادل 20 صفحة في مصحف المدينة
  const safeTargetPage = Math.min(604, Math.max(1, currentTargetPage));

  // الحصن الأول: القراءة المستمرة والتحضير (الأسبوعي والليلي والقبلي)
  const weeklyPagesFrom = safeTargetPage;
  const weeklyPagesTo = Math.min(604, safeTargetPage + Math.max(5, dailyNewPages * 7) - 1);

  // الحصن الثالث: مراجعة القريب (آخر 20 صفحة ملاصقة لصفحة الحفظ الجديد في وضع الإخفاء الإجباري)
  const nearPagesCount = Math.min(20, totalMemorizedPages);
  const nearToPage = Math.max(1, safeTargetPage - 1);
  const nearFromPage = Math.max(1, nearToPage - nearPagesCount + 1);

  // الحصن الرابع والخامس: أنابيب مراجعة البعيد (كل ما زاد عن آخر 20 صفحة وصولاً إلى 15 جزءاً)
  const totalFarPages = Math.max(0, totalMemorizedPages - 20);

  // قدرة الطفل اليومية في مراجعة البعيد: من جزء (20 صفحة) إلى جزأين (40 صفحة) يومياً
  const dailyPagesQuota =
    totalFarPages === 0
      ? 0
      : clampedJuz <= 5
        ? 20 // جزء يومياً
        : clampedJuz <= 10
          ? 30 // جزء ونصف يومياً
          : 40; // جزآن يومياً (للـ 11 إلى 15 جزءاً)

  const cycleDays = totalFarPages > 0 ? Math.ceil(totalFarPages / dailyPagesQuota) : 0;

  const arabicDays = [
    'السبت',
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
  ];

  const weeklyTubes = [];
  if (totalFarPages > 0) {
    const numTubes = Math.min(7, Math.max(1, cycleDays));
    for (let i = 0; i < numTubes; i++) {
      const fromP = 1 + i * dailyPagesQuota;
      const toP = Math.min(totalFarPages, fromP + dailyPagesQuota - 1);
      const count = Math.max(0, toP - fromP + 1);
      if (count > 0) {
        const startJuz = Math.ceil(fromP / 20);
        const endJuz = Math.ceil(toP / 20);
        const juzLabel =
          startJuz === endJuz ? `الجزء ${startJuz}` : `الأجزاء ${startJuz}–${endJuz}`;
        weeklyTubes.push({
          dayIndex: i,
          dayNameAr: arabicDays[i % arabicDays.length],
          fromPage: fromP,
          toPage: toP,
          pagesCount: count,
          juzLabel,
          // مرتبة الحدر: 20 دقيقة للجزء الواحد (أي دقيقة واحدة لكل صفحة)
          estimatedMinutesHadr: count * 1,
          completedToday: i === 0,
        });
      }
    }
  }

  return {
    totalMemorizedJuz: clampedJuz,
    totalMemorizedPages,
    currentTargetPage: safeTargetPage,
    fortress1Preparation: {
      weeklyPagesFrom,
      weeklyPagesTo,
      nightlyPage: safeTargetPage,
      preSessionListeningMinutes: 15,
    },
    fortress2NewLawh: {
      targetPage: safeTargetPage,
      pagesCount: dailyNewPages,
      requiredRepetitions: 100,
    },
    fortress3NearReview: {
      fromPage: nearFromPage,
      toPage: nearToPage,
      pagesCount: nearPagesCount,
      mandatoryHiddenMode: true,
    },
    fortress4And5FarReview: {
      totalFarPages,
      dailyPagesQuota,
      cycleDays,
      hadrTargetMinutesPerJuz: 20,
      weeklyTubes,
    },
  };
}
