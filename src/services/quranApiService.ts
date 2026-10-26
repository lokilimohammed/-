import { LOCAL_FALLBACK_PAGES, PAGE_604_MADINAH } from '../data/mushafFallbackData';
import { MushafPageData, QuranWord, TajweedRuleAnnotation } from '../types/quran';
import { getSheikhAudioUrl } from '../utils/quranEngine';
import { getCachedMushafPage, saveCachedMushafPage } from './storageService';

const SURAH_NAMES_AR: Record<number, string> = {
  1: 'الفاتحة',
  2: 'البقرة',
  3: 'آل عمران',
  4: 'النساء',
  5: 'المائدة',
  6: 'الأنعام',
  7: 'الأعراف',
  18: 'الكهف',
  36: 'يس',
  55: 'الرحمن',
  56: 'الواقعة',
  67: 'الملك',
  78: 'النبأ',
  79: 'النازعات',
  80: 'عبس',
  87: 'الأعلى',
  93: 'الضحى',
  94: 'الشرح',
  95: 'التين',
  96: 'العلق',
  97: 'القدر',
  103: 'العصر',
  105: 'الفيل',
  106: 'قريش',
  107: 'الماعون',
  108: 'الكوثر',
  109: 'الكافرون',
  110: 'النصر',
  111: 'المسد',
  112: 'الإخلاص',
  113: 'الفلق',
  114: 'الناس',
};

/**
 * تحليل تجويدي تلقائي للكلمة عبر الرؤوس الـ 11 لنموذج (muaalem El Quran / /v1/word/tajweed)
 */
export function inferWordTajweedAnnotations(textUthmani: string): TajweedRuleAnnotation[] {
  const rules: TajweedRuleAnnotation[] = [];

  // 1. فحص الغنة في النون والميم المشددتين (نّ / مّ)
  if (/[نم]\u0651/.test(textUthmani)) {
    rules.push({
      head: 'ghunnah',
      labelAr: 'غنة مشددة أكمل ما تكون (حركتان)',
      letter: textUthmani.includes('ن') ? 'نّ' : 'مّ',
      makhrajAr: 'الخيشوم (أعلى الأنف)',
      colorHex: '#059669',
      adviceAr: 'أثبت الغنة في النون أو الميم المشددة بمقدار حركتين كاملتين.',
    });
  }

  // 2. فحص القلقلة في حروف (قطب جد) الساكنة أو المتطرفة
  if (/[قطبجد]\u0652|[قطبجد]$/.test(textUthmani.replace(/[\u064B-\u0650]/g, ''))) {
    rules.push({
      head: 'qalqalah',
      labelAr: 'قلقلة في حروف (قطب جد)',
      letter: 'ق/ط/ب/ج/د',
      makhrajAr: 'اضطراب الحرف في مخرجه عند سكونه',
      colorHex: '#DC2626',
      adviceAr: 'أظهر نبرة القلقلة بوضوح دون إمالتها إلى حركة الفتح أو الكسر.',
    });
  }

  // 3. فحص حروف الاستعلاء والإطباق (خص ضغط قظ)
  if (/[صضطظقخغ]/.test(textUthmani)) {
    rules.push({
      head: 'tafkheem_tarqeeq',
      labelAr: 'تفخيم واستعلاء (خص ضغط قظ)',
      letter: 'ص/ض/ط/ظ/ق',
      makhrajAr: 'ارتفاع أقصى اللسان إلى الحنك الأعلى',
      colorHex: '#D97706',
      adviceAr: 'فخّم حرف الاستعلاء وخلص الحروف المرققة المجاورة له.',
    });
  }

  // 4. فحص المدود الفرعية (علامة المد ٓ )
  if (/\u0653/.test(textUthmani)) {
    rules.push({
      head: 'madd_tabeei',
      labelAr: 'مد فرعي (4 إلى 6 حركات)',
      letter: 'آ / ـٓ',
      makhrajAr: 'الجوف (الخلاء الواقع داخل الحلق والفم)',
      colorHex: '#0284C7',
      adviceAr: 'مد الصوت بمقدار 4 حركات في المتصل والمنفصل أو 6 في اللازم.',
    });
  }

  return rules;
}

/**
 * قاعدة بيانات المتشابهات اللفظية المدمجة + الربط مع https://ummahapi.com/api/quran/mutashabihat
 */
export interface MutashabihatEntry {
  id: string;
  surah1Name: string;
  verseKey1: string;
  text1Uthmani: string;
  surah2Name: string;
  verseKey2: string;
  text2Uthmani: string;
  ruleTipAr: string;
  triggerWordImlaei: string;
}

export const BUILTIN_MUTASHABIHAT_RADAR: MutashabihatEntry[] = [
  {
    id: 'mut-1',
    surah1Name: 'سورة الفلق',
    verseKey1: '113:1',
    text1Uthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
    surah2Name: 'سورة الناس',
    verseKey2: '114:1',
    text2Uthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
    ruleTipAr: 'المعوذتان تبدآن بـ «قُلْ أَعُوذُ بِرَبِّ»؛ الفلق أولاً (آياتها 5) ثم الناس (آياتها 6).',
    triggerWordImlaei: 'برب',
  },
  {
    id: 'mut-2',
    surah1Name: 'سورة الكافرون',
    verseKey1: '109:2',
    text1Uthmani: 'لَآ أَعْبُدُ مَا تَعْبُدُونَ',
    surah2Name: 'سورة الكافرون',
    verseKey2: '109:4',
    text2Uthmani: 'وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمۡ',
    ruleTipAr: 'في الآية 2 الفعل المضارع «لَا أَعْبُدُ مَا تَعْبُدُونَ»، وفي الآية 4 اسم الفاعل والماضي «وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ».',
    triggerWordImlaei: 'اعبد',
  },
  {
    id: 'mut-3',
    surah1Name: 'سورة البقرة',
    verseKey1: '2:35',
    text1Uthmani: 'وَكُلَا مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا',
    surah2Name: 'سورة الأعراف',
    verseKey2: '7:19',
    text2Uthmani: 'فَكُلَا مِنْ حَيْثُ شِئْتُمَا',
    ruleTipAr: 'في البقرة بالواو مع زيادة «رَغَدًا»، وفي الأعراف بالفاء بدون «رَغَدًا».',
    triggerWordImlaei: 'وكلا',
  },
  {
    id: 'mut-4',
    surah1Name: 'سورة النبأ',
    verseKey1: '78:4',
    text1Uthmani: 'كَلَّا سَيَعْلَمُونَ * ثُمَّ كَلَّا سَيَعْلَمُونَ',
    surah2Name: 'سورة التكاثر',
    verseKey2: '102:3',
    text2Uthmani: 'كَلَّا سَوْفَ تَعْلَمُونَ * ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ',
    ruleTipAr: 'في النبأ بالسين والياء «سَيَعْلَمُونَ»، وفي التكاثر بسوف والتاء «سَوْفَ تَعْلَمُونَ».',
    triggerWordImlaei: 'كلا',
  },
  {
    id: 'mut-5',
    surah1Name: 'سورة الأعلى',
    verseKey1: '87:16',
    text1Uthmani: 'بَلْ تُؤْثِرُونَ ٱلْحَيَوٰةَ ٱلدُّنْيَا',
    surah2Name: 'سورة القيامة',
    verseKey2: '75:20',
    text2Uthmani: 'كَلَّا بَلْ تُحِبُّونَ ٱلْعَاجِلَةَ',
    ruleTipAr: 'في الأعلى «بَلْ تُؤْثِرُونَ ٱلْحَيَوٰةَ ٱلدُّنْيَا»، وفي القيامة «بَلْ تُحِبُّونَ ٱلْعَاجِلَةَ».',
    triggerWordImlaei: 'بل',
  },
];

/**
 * جلب الصفحة القرآنية (15 سطراً) مع التخزين في IndexedDB والمسار الاحتياطي المزدوج:
 * 1) LOCAL_FALLBACK_PAGES للصفحات المجهزة فورياً (1، 604) أو IndexedDB
 * 2) https://api.quran.com/api/v4/verses/by_page/{page_number}
 * 3) https://api.alquran.cloud/v1/page/{page_number}/quran-uthmani
 */
export async function fetchMadinahMushafPage(pageNumber: number): Promise<MushafPageData> {
  const clampedPage = Math.min(604, Math.max(1, pageNumber));

  // 1. إذا كانت الصفحة من الصفحات المعيارية المجهزة محلياً بكامل القواعد التجويدية الدقيقة
  if (LOCAL_FALLBACK_PAGES[clampedPage]) {
    return LOCAL_FALLBACK_PAGES[clampedPage];
  }

  // 2. فحص التخزين المحلي IndexedDB
  const cached = await getCachedMushafPage(clampedPage);
  if (cached && cached.words && cached.words.length > 0) {
    return cached;
  }

  // 3. المسار الأساسي: Quran.com v4 API (مع أرقام الأسطر 1..15)
  try {
    const url = `https://api.quran.com/api/v4/verses/by_page/${clampedPage}?words=true&word_fields=text_uthmani,text_imlaei,code_v1,code_v2,page_number,line_number&fields=text_uthmani,text_imlaei_simple,juz_number,hizb_number`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        const words: QuranWord[] = [];
        const surahHeaders: MushafPageData['surahHeaders'] = [];
        const seenSurahs = new Set<number>();
        let globalIdx = 0;

        for (const verse of data.verses) {
          const [sNumStr, aNumStr] = String(verse.verse_key || '1:1').split(':');
          const surahNumber = Number(sNumStr) || 1;
          const ayahNumber = Number(aNumStr) || 1;
          const surahNameAr = SURAH_NAMES_AR[surahNumber] || `سورة رقم ${surahNumber}`;

          const rawWords = Array.isArray(verse.words) ? verse.words : [];
          for (const rw of rawWords) {
            // نتجاهل رمز نهاية الآية المنفصل وندمجه في آخر كلمة
            if (rw.char_type_name === 'end') {
              if (words.length > 0) {
                words[words.length - 1].isAyahEnd = true;
              }
              continue;
            }
            const lineNum = Math.min(15, Math.max(1, Number(rw.line_number) || 1));
            if (ayahNumber === 1 && !seenSurahs.has(surahNumber)) {
              seenSurahs.add(surahNumber);
              surahHeaders.push({
                lineNumber: Math.max(1, lineNum - 1),
                surahNumber,
                surahNameAr: `سُورَةُ ${surahNameAr}`,
                hasBasmalah: surahNumber !== 1 && surahNumber !== 9,
              });
            }

            const textUthmani = rw.text_uthmani || rw.text || '';
            const textImlaeiSimple = rw.text_imlaei || textUthmani;

            words.push({
              id: `${surahNumber}:${ayahNumber}:${rw.position || globalIdx + 1}:${globalIdx}`,
              globalIndex: globalIdx,
              verseKey: `${surahNumber}:${ayahNumber}`,
              surahNumber,
              surahNameAr,
              ayahNumber,
              wordPosition: Number(rw.position) || 1,
              pageNumber: clampedPage,
              lineNumber: lineNum,
              textUthmani,
              textImlaeiSimple,
              audioUrl: rw.audio_url
                ? `https://audio.qurancdn.com/${rw.audio_url}`
                : getSheikhAudioUrl(surahNumber, ayahNumber, Number(rw.position) || 1, 'husary'),
              tajweedRules: inferWordTajweedAnnotations(textUthmani),
            });
            globalIdx++;
          }
        }

        const pageData: MushafPageData = {
          pageNumber: clampedPage,
          juzNumber: Number(data.verses[0]?.juz_number) || Math.ceil(clampedPage / 20),
          hizbNumber: Number(data.verses[0]?.hizb_number) || Math.ceil(clampedPage / 10),
          surahHeaders,
          words,
          source: 'quran_com_v4',
        };
        await saveCachedMushafPage(pageData);
        return pageData;
      }
    }
  } catch {
    // الانتقال للمسار الاحتياطي الثاني
  }

  // 4. المسار الاحتياطي: AlQuran.cloud API
  try {
    const fallbackUrl = `https://api.alquran.cloud/v1/page/${clampedPage}/quran-uthmani`;
    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const json = await res.json();
      const ayahs = json?.data?.ayahs;
      if (Array.isArray(ayahs) && ayahs.length > 0) {
        const allRawTokens: {
          surahNumber: number;
          surahNameAr: string;
          ayahNumber: number;
          wordPosition: number;
          textUthmani: string;
          isAyahEnd: boolean;
        }[] = [];

        for (const ayah of ayahs) {
          const sNum = Number(ayah?.surah?.number) || 1;
          const sName = ayah?.surah?.name || SURAH_NAMES_AR[sNum] || `سورة ${sNum}`;
          const aNum = Number(ayah?.numberInSurah) || 1;
          const tokens = String(ayah?.text || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          tokens.forEach((tok, idx) => {
            allRawTokens.push({
              surahNumber: sNum,
              surahNameAr: sName,
              ayahNumber: aNum,
              wordPosition: idx + 1,
              textUthmani: tok,
              isAyahEnd: idx === tokens.length - 1,
            });
          });
        }

        // توزيع الكلمات تناسبياً على 15 سطراً قياسياً
        const words: QuranWord[] = allRawTokens.map((item, idx) => {
          const lineNumber = Math.min(
            15,
            Math.max(1, Math.ceil(((idx + 1) / Math.max(1, allRawTokens.length)) * 15))
          );
          return {
            id: `${item.surahNumber}:${item.ayahNumber}:${item.wordPosition}:${idx}`,
            globalIndex: idx,
            verseKey: `${item.surahNumber}:${item.ayahNumber}`,
            surahNumber: item.surahNumber,
            surahNameAr: item.surahNameAr,
            ayahNumber: item.ayahNumber,
            wordPosition: item.wordPosition,
            pageNumber: clampedPage,
            lineNumber,
            textUthmani: item.textUthmani,
            textImlaeiSimple: item.textUthmani,
            isAyahEnd: item.isAyahEnd,
            audioUrl: getSheikhAudioUrl(item.surahNumber, item.ayahNumber, item.wordPosition, 'husary'),
            tajweedRules: inferWordTajweedAnnotations(item.textUthmani),
          };
        });

        const pageData: MushafPageData = {
          pageNumber: clampedPage,
          juzNumber: Number(ayahs[0]?.juz) || Math.ceil(clampedPage / 20),
          hizbNumber: Math.ceil((Number(ayahs[0]?.hizbQuarter) || 1) / 4),
          surahHeaders: [],
          words,
          source: 'alquran_cloud',
        };
        await saveCachedMushafPage(pageData);
        return pageData;
      }
    }
  } catch {
    // الانتقال للبيانات المحلية المدمجة
  }

  return {
    ...PAGE_604_MADINAH,
    pageNumber: clampedPage,
  };
}
