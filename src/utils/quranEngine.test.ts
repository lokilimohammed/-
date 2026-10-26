import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeQuranicWord,
  evaluateSpokenWord,
  groupWordsInto15Lines,
  isWordHiddenInSession,
  matchSpokenPhraseToWords,
  tryIncrementMauritanianCounter,
  calculateFiveFortressesPlan,
} from './quranEngine';
import { QuranWord } from '../types/quran';
import { PAGE_604_MADINAH } from '../data/mushafFallbackData';

test('normalizeQuranicWord unifies hamzas, dagger alif, taa marbuta, and strips tashkeel', () => {
  // توحيد الهمزات (أ، إ، آ، ٱ -> ا) وحذف الألف الخنجرية والتشكيل
  assert.equal(normalizeQuranicWord('ٱلرَّحْمَٰنِ'), 'الرحمن');
  assert.equal(normalizeQuranicWord('إِبْرَٰهِيمَ'), 'ابرهيم');
  // توحيد التاء المربوطة والهاء
  assert.equal(normalizeQuranicWord('ٱلْقَارِعَةُ'), 'القارعه');
  assert.equal(normalizeQuranicWord('القارعه'), 'القارعه');
  // توحيد الألف المقصورة والياء
  assert.equal(normalizeQuranicWord('ٱلْهُدَىٰ'), 'الهدي');
});

test('evaluateSpokenWord matches spoken imlaei against uthmani with >95% accuracy without penalizing dagger alif', () => {
  const wordRahman: QuranWord = {
    id: '1:3:1',
    globalIndex: 0,
    verseKey: '1:3',
    surahNumber: 1,
    surahNameAr: 'الفاتحة',
    ayahNumber: 3,
    wordPosition: 1,
    pageNumber: 1,
    lineNumber: 4,
    textUthmani: 'ٱلرَّحْمَـٰنِ',
    textImlaeiSimple: 'الرحمن',
  };

  // الطفل ينطق "الرحمان" (كما يخرجها Web Speech API أحياناً) أو "الرحمن"
  const res1 = evaluateSpokenWord('الرحمان', wordRahman);
  assert.equal(res1.status, 'correct');
  assert.equal(res1.matchedScore, 100);

  const res2 = evaluateSpokenWord('الرحمن', wordRahman);
  assert.equal(res2.status, 'correct');
});

test('evaluateSpokenWord classifies Makharij & Tajweed errors (e.g. س instead of ص, ت instead of ط)', () => {
  const wordSamad: QuranWord = {
    id: '112:2:2',
    globalIndex: 5,
    verseKey: '112:2',
    surahNumber: 112,
    surahNameAr: 'الإخلاص',
    ayahNumber: 2,
    wordPosition: 2,
    pageNumber: 604,
    lineNumber: 2,
    textUthmani: 'ٱلصَّمَدُ',
    textImlaeiSimple: 'الصمد',
  };

  // الطفل نطق السين المرققة بدلاً من الصاد المفخمة المطبقة ("السمد")
  const res = evaluateSpokenWord('السمد', wordSamad);
  assert.equal(res.status, 'tajweed_error');
  assert.ok(res.tajweedAlert);
  assert.equal(res.tajweedAlert?.confusedPair, 'س بدلاً من ص');
  assert.equal(res.tajweedAlert?.head, 'tafkheem_tarqeeq');
});

test('evaluateSpokenWord classifies Mutashabihat drift across surahs', () => {
  const wordMutashabih: QuranWord = {
    id: '109:2:2',
    globalIndex: 4,
    verseKey: '109:2',
    surahNumber: 109,
    surahNameAr: 'الكافرون',
    ayahNumber: 2,
    wordPosition: 2,
    pageNumber: 603,
    lineNumber: 3,
    textUthmani: 'أَعْبُدُ',
    textImlaeiSimple: 'اعبد',
    mutashabihatRef: {
      similarSurahName: 'الكافرون (الآية 4)',
      similarVerseKey: '109:4',
      similarContinuation: 'انا عابد ما عبدتم',
      correctContinuation: 'أعبد ما تعبدون',
      warningNote: 'انتبه للترتيب: الآية الثانية «لا أعبد ما تعبدون» والرابعة «ولا أنا عابد ما عبدتم».',
    },
  };

  const res = evaluateSpokenWord('انا عابد', wordMutashabih);
  assert.equal(res.status, 'mutashabihat_error');
  assert.ok(res.mutashabihatAlert);
  assert.equal(res.mutashabihatAlert?.confusedVerseKey, '109:4');
});

test('groupWordsInto15Lines maps all words into lines 1..15', () => {
  const words: QuranWord[] = [
    {
      id: 'w1',
      globalIndex: 0,
      verseKey: '112:1',
      surahNumber: 112,
      surahNameAr: 'الإخلاص',
      ayahNumber: 1,
      wordPosition: 1,
      pageNumber: 604,
      lineNumber: 2,
      textUthmani: 'قُلْ',
      textImlaeiSimple: 'قل',
    },
    {
      id: 'w2',
      globalIndex: 1,
      verseKey: '114:6',
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 6,
      wordPosition: 3,
      pageNumber: 604,
      lineNumber: 15,
      textUthmani: 'وَٱلنَّاسِ',
      textImlaeiSimple: 'والناس',
    },
  ];

  const grouped = groupWordsInto15Lines(words);
  assert.equal(Object.keys(grouped).length, 15);
  assert.equal(grouped[2].length, 1);
  assert.equal(grouped[15].length, 1);
  assert.equal(grouped[1].length, 0);
});

test('Mandatory Hidden Mode state machine enforces hidden recitation (غيباً) in both daily ward and Mauritanian 100x repetition stages', () => {
  // في وضع تسميع الورد اليومي (daily_ward_hidden)، الكلمة عند المؤشر وما بعده مخفية، وما قبله مكشوفة
  assert.equal(isWordHiddenInSession(0, 2, 'daily_ward_hidden'), false);
  assert.equal(isWordHiddenInSession(2, 2, 'daily_ward_hidden'), true);

  // في وضع التكرار المئوي (mauritanian_100x) بجميع مراحله (1، 2، 3، 4)، التكرار يكون غيباً أيضاً ولا تظهر الكلمة إلا بعد نطقها
  assert.equal(isWordHiddenInSession(0, 1, 'mauritanian_100x', 1), false);
  assert.equal(isWordHiddenInSession(1, 1, 'mauritanian_100x', 1), true);
  assert.equal(isWordHiddenInSession(2, 1, 'mauritanian_100x', 2), true);
  assert.equal(isWordHiddenInSession(3, 1, 'mauritanian_100x', 3), true);

  // قفل الحماية ضد الغش يرفض زيادة العداد قبل الوصول لآخر كلمة في الصفحة
  const blockedAttempt = tryIncrementMauritanianCounter({
    currentCompletedReps: 14,
    currentWordIndex: 10,
    totalWordsInPage: 47,
    vocalVerifiedCountInPass: 10,
  });
  assert.equal(blockedAttempt.unlockedIncrement, false);
  assert.equal(blockedAttempt.updatedCompletedReps, 14);

  // عند إتمام الصفحة بالكامل صوتياً، يرتفع العداد من 15 إلى 16 وينتقل للمرحلة 2
  const validAttempt = tryIncrementMauritanianCounter({
    currentCompletedReps: 15,
    currentWordIndex: 47,
    totalWordsInPage: 47,
    vocalVerifiedCountInPass: 47,
  });
  assert.equal(validAttempt.unlockedIncrement, true);
  assert.equal(validAttempt.updatedCompletedReps, 16);
  assert.equal(validAttempt.updatedStage, 2);
});

test('matchSpokenPhraseToWords reveals multiple spoken words sequentially in the Mushaf', () => {
  const res = matchSpokenPhraseToWords('قل هو الله احد', PAGE_604_MADINAH.words, 0);
  assert.equal(res.revealedCount, 4);
  assert.equal(res.newWordIndex, 4);
  assert.equal(res.wordResults.length, 4);
  assert.equal(res.wordResults[0].revealedInMushaf, true);
  assert.equal(res.wordResults[3].targetWord.textImlaeiSimple, 'احد');
});

test('calculateFiveFortressesPlan computes Near Review (20 pages) and Far Review weekly tubes up to 15 Juz', () => {
  // طفل يحفظ 5 أجزاء (100 صفحة) ويحفظ حالياً في الصفحة 101
  const plan5Juz = calculateFiveFortressesPlan(5, 1, 101);
  assert.equal(plan5Juz.totalMemorizedPages, 100);
  assert.equal(plan5Juz.fortress3NearReview.pagesCount, 20);
  assert.equal(plan5Juz.fortress3NearReview.fromPage, 81);
  assert.equal(plan5Juz.fortress3NearReview.toPage, 100);
  assert.equal(plan5Juz.fortress4And5FarReview.totalFarPages, 80);
  assert.equal(plan5Juz.fortress4And5FarReview.dailyPagesQuota, 20);
  assert.equal(plan5Juz.fortress4And5FarReview.weeklyTubes.length, 4);

  // طفل يحفظ 15 جزءاً (300 صفحة)
  const plan15Juz = calculateFiveFortressesPlan(15, 2, 301);
  assert.equal(plan15Juz.totalMemorizedPages, 300);
  assert.equal(plan15Juz.fortress4And5FarReview.totalFarPages, 280);
  assert.equal(plan15Juz.fortress4And5FarReview.dailyPagesQuota, 40);
  assert.equal(plan15Juz.fortress4And5FarReview.cycleDays, 7);
});
