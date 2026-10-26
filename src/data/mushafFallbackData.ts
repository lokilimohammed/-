import { MushafPageData, QuranWord } from '../types/quran';
import { getSheikhAudioUrl } from '../utils/quranEngine';

interface RawLineSeed {
  lineNumber: number;
  surahNumber: number;
  surahNameAr: string;
  ayahNumber: number;
  words: {
    u: string; // الرسم العثماني
    i: string; // الرسم الإملائي المبسط
    pos: number;
    end?: boolean;
    tajweed?: QuranWord['tajweedRules'];
    mutashabih?: QuranWord['mutashabihatRef'];
  }[];
}

function buildMushafPage(
  pageNumber: number,
  juzNumber: number,
  hizbNumber: number,
  surahHeaders: MushafPageData['surahHeaders'],
  rawLines: RawLineSeed[]
): MushafPageData {
  const words: QuranWord[] = [];
  let globalIdx = 0;

  for (const line of rawLines) {
    for (const w of line.words) {
      words.push({
        id: `${line.surahNumber}:${line.ayahNumber}:${w.pos}:${globalIdx}`,
        globalIndex: globalIdx,
        verseKey: `${line.surahNumber}:${line.ayahNumber}`,
        surahNumber: line.surahNumber,
        surahNameAr: line.surahNameAr,
        ayahNumber: line.ayahNumber,
        wordPosition: w.pos,
        pageNumber,
        lineNumber: line.lineNumber,
        textUthmani: w.u,
        textImlaeiSimple: w.i,
        isAyahEnd: w.end,
        audioUrl: getSheikhAudioUrl(line.surahNumber, line.ayahNumber, w.pos, 'husary'),
        tajweedRules: w.tajweed,
        mutashabihatRef: w.mutashabih,
      });
      globalIdx++;
    }
  }

  return {
    pageNumber,
    juzNumber,
    hizbNumber,
    surahHeaders,
    words,
    source: 'local_indexeddb',
  };
}

/**
 * الصفحة 604 من مصحف المدينة المنورة (15 سطراً قياسياً):
 * سورة الإخلاص، سورة الفلق، سورة الناس
 */
export const PAGE_604_MADINAH: MushafPageData = buildMushafPage(
  604,
  30,
  60,
  [
    { lineNumber: 1, surahNumber: 112, surahNameAr: 'سُورَةُ الإِخْلَاصِ', hasBasmalah: true },
    { lineNumber: 5, surahNumber: 113, surahNameAr: 'سُورَةُ الفَلَقِ', hasBasmalah: true },
    { lineNumber: 10, surahNumber: 114, surahNameAr: 'سُورَةُ النَّاسِ', hasBasmalah: true },
  ],
  [
    {
      lineNumber: 2,
      surahNumber: 112,
      surahNameAr: 'الإخلاص',
      ayahNumber: 1,
      words: [
        {
          u: 'قُلْ',
          i: 'قل',
          pos: 1,
          tajweed: [
            {
              head: 'tafkheem_tarqeeq',
              labelAr: 'تفخيم القاف',
              letter: 'ق',
              makhrajAr: 'أقصى اللسان مع الحنك اللحمي',
              colorHex: '#0284C7',
              adviceAr: 'احرص على تفخيم القاف المضمومة وعدم إبدالها كافاً.',
            },
          ],
        },
        { u: 'هُوَ', i: 'هو', pos: 2 },
        {
          u: 'ٱللَّهُ',
          i: 'الله',
          pos: 3,
          tajweed: [
            {
              head: 'tafkheem_tarqeeq',
              labelAr: 'تفخيم لام لفظ الجلالة',
              letter: 'ل',
              makhrajAr: 'حافة اللسان مع اللثة العليا',
              colorHex: '#0284C7',
              adviceAr: 'تُفخم لام لفظ الجلالة لأنها سبقت بفتح (هُوَ اللَّهُ).',
            },
          ],
        },
        {
          u: 'أَحَدٌ',
          i: 'احد',
          pos: 4,
          end: true,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة كبرى في الدال',
              letter: 'د',
              makhrajAr: 'طرف اللسان مع أصول الثنايا العليا',
              colorHex: '#DC2626',
              adviceAr: 'قلقلة الدال عند الوقف (أَحَدْ) من حروف قطب جد.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 2,
      surahNumber: 112,
      surahNameAr: 'الإخلاص',
      ayahNumber: 2,
      words: [
        { u: 'ٱللَّهُ', i: 'الله', pos: 1 },
        {
          u: 'ٱلصَّمَدُ',
          i: 'الصمد',
          pos: 2,
          end: true,
          tajweed: [
            {
              head: 'itbaq_infitah',
              labelAr: 'إطباق وتفخيم الصاد + قلقلة الدال',
              letter: 'ص / د',
              makhrajAr: 'طرف اللسان مع استعلاء أقصى اللسان',
              colorHex: '#D97706',
              adviceAr: 'احذر من ترقيق الصاد فتصبح (السمد)، وقلقل الدال عند الوقف.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 3,
      surahNumber: 112,
      surahNameAr: 'الإخلاص',
      ayahNumber: 3,
      words: [
        { u: 'لَمْ', i: 'لم', pos: 1 },
        {
          u: 'يَلِدْ',
          i: 'يلد',
          pos: 2,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة صغرى في الدال الساكنة',
              letter: 'د',
              makhrajAr: 'طرف اللسان مع أصول الثنايا العليا',
              colorHex: '#DC2626',
              adviceAr: 'قلقل الدال الساكنة في وسط الكلام قلقلة صغرى واضحة.',
            },
          ],
        },
        { u: 'وَلَمْ', i: 'ولم', pos: 3 },
        {
          u: 'يُولَدْ',
          i: 'يولد',
          pos: 4,
          end: true,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة كبرى في الدال',
              letter: 'د',
              makhrajAr: 'طرف اللسان مع أصول الثنايا العليا',
              colorHex: '#DC2626',
              adviceAr: 'أظهر نبرة القلقلة في الدال الموقوف عليها.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 4,
      surahNumber: 112,
      surahNameAr: 'الإخلاص',
      ayahNumber: 4,
      words: [
        { u: 'وَلَمْ', i: 'ولم', pos: 1 },
        { u: 'يَكُن', i: 'يكن', pos: 2 },
        { u: 'لَّهُۥ', i: 'له', pos: 3 },
        { u: 'كُفُوًا', i: 'كفوا', pos: 4 },
        {
          u: 'أَحَدٌۢ',
          i: 'احد',
          pos: 5,
          end: true,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة كبرى عند الوقف',
              letter: 'د',
              makhrajAr: 'طرف اللسان مع أصول الثنايا العليا',
              colorHex: '#DC2626',
              adviceAr: 'قلقلة الدال عند الوقف على رأس الآية.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 6,
      surahNumber: 113,
      surahNameAr: 'الفلق',
      ayahNumber: 1,
      words: [
        { u: 'قُلْ', i: 'قل', pos: 1 },
        {
          u: 'أَعُوذُ',
          i: 'اعوذ',
          pos: 2,
          tajweed: [
            {
              head: 'hams_jahr',
              labelAr: 'إخراج طرف اللسان في الذال',
              letter: 'ذ',
              makhrajAr: 'طرف اللسان مع أطراف الثنايا العليا',
              colorHex: '#059669',
              adviceAr: 'أخرج طرف اللسان في الذال حتى لا تنقلب زاياً (أعوز).',
            },
          ],
        },
        { u: 'بِرَبِّ', i: 'برب', pos: 3 },
        {
          u: 'ٱلْفَلَقِ',
          i: 'الفلق',
          pos: 4,
          end: true,
          mutashabih: {
            similarSurahName: 'سورة الناس (الآية 1)',
            similarVerseKey: '114:1',
            similarContinuation: 'الناس',
            correctContinuation: 'الفلق',
            warningNote: 'نحن في سورة الفلق: «قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ» وليس «بِرَبِّ ٱلنَّاسِ».',
          },
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة القاف الموقوف عليها',
              letter: 'ق',
              makhrajAr: 'أقصى اللسان مع الحنك اللحمي',
              colorHex: '#DC2626',
              adviceAr: 'قلقل القاف مع التفخيم عند الوقف على (الفلق).',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 7,
      surahNumber: 113,
      surahNameAr: 'الفلق',
      ayahNumber: 2,
      words: [
        {
          u: 'مِن',
          i: 'من',
          pos: 1,
          tajweed: [
            {
              head: 'ikhfaa',
              labelAr: 'إخفاء حقيقي بغنة مرققة',
              letter: 'ن',
              makhrajAr: 'الخيشوم مع قرب مخرج الشين',
              colorHex: '#059669',
              adviceAr: 'أخفِ النون الساكنة عند الشين بغنة حركتين.',
            },
          ],
        },
        { u: 'شَرِّ', i: 'شر', pos: 2 },
        { u: 'مَا', i: 'ما', pos: 3 },
        {
          u: 'خَلَقَ',
          i: 'خلق',
          pos: 4,
          end: true,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'تفخيم الخاء والقاف وترقيق اللام بينهما',
              letter: 'خ - ل - ق',
              makhrajAr: 'أدنى الحلق ثم طرف اللسان ثم أقصى اللسان',
              colorHex: '#D97706',
              adviceAr: 'انتبه لترقيق اللام الواقعة بين حرفين مفخمين (خَلَقَ) مع قلقلة القاف.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 8,
      surahNumber: 113,
      surahNameAr: 'الفلق',
      ayahNumber: 3,
      words: [
        { u: 'وَمِن', i: 'ومن', pos: 1 },
        { u: 'شَرِّ', i: 'شر', pos: 2 },
        {
          u: 'غَاسِقٍ',
          i: 'غاسق',
          pos: 3,
          tajweed: [
            {
              head: 'izhar',
              labelAr: 'إظهار حلقي للتنوين عند الهمزة',
              letter: 'قٍ إِ',
              makhrajAr: 'أقصى الحلق',
              colorHex: '#0284C7',
              adviceAr: 'أظهر التنوين في (غاسقٍ) بدون غنة زائدة لأن بعده همزة.',
            },
          ],
        },
        { u: 'إِذَا', i: 'اذا', pos: 4 },
        {
          u: 'وَقَبَ',
          i: 'وقب',
          pos: 5,
          end: true,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة الباء الموقوف عليها',
              letter: 'ب',
              makhrajAr: 'انطباق الشفتين',
              colorHex: '#DC2626',
              adviceAr: 'قلقل الباء في آخر الآية (وَقَبْ).',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 8,
      surahNumber: 113,
      surahNameAr: 'الفلق',
      ayahNumber: 4,
      words: [
        { u: 'وَمِن', i: 'ومن', pos: 1 },
        { u: 'شَرِّ', i: 'شر', pos: 2 },
        {
          u: 'ٱلنَّفَّـٰثَـٰتِ',
          i: 'النفاثات',
          pos: 3,
          tajweed: [
            {
              head: 'ghunnah',
              labelAr: 'غنة النون المشددة أكمل ما تكون',
              letter: 'نّ',
              makhrajAr: 'الخيشوم (حركتان)',
              colorHex: '#059669',
              adviceAr: 'أمسك الغنة في النون المشددة بمقدار حركتين كاملتين.',
            },
          ],
        },
        { u: 'فِى', i: 'في', pos: 4 },
        { u: 'ٱلْعُقَدِ', i: 'العقد', pos: 5, end: true },
      ],
    },
    {
      lineNumber: 9,
      surahNumber: 113,
      surahNameAr: 'الفلق',
      ayahNumber: 5,
      words: [
        { u: 'وَمِن', i: 'ومن', pos: 1 },
        { u: 'شَرِّ', i: 'شر', pos: 2 },
        {
          u: 'حَاسِدٍ',
          i: 'حاسد',
          pos: 3,
          tajweed: [
            {
              head: 'izhar',
              labelAr: 'صفاء الحاء من وسط الحلق',
              letter: 'ح',
              makhrajAr: 'وسط الحلق',
              colorHex: '#0284C7',
              adviceAr: 'أخرج الحاء صافية من وسط الحلق ولا تضعفها فتقترب من الهاء.',
            },
          ],
        },
        { u: 'إِذَا', i: 'اذا', pos: 4 },
        {
          u: 'حَسَدَ',
          i: 'حسد',
          pos: 5,
          end: true,
          tajweed: [
            {
              head: 'qalqalah',
              labelAr: 'قلقلة الدال عند الوقف',
              letter: 'د',
              makhrajAr: 'طرف اللسان مع أصول الثنايا العليا',
              colorHex: '#DC2626',
              adviceAr: 'قلقل الدال في (حَسَدْ) عند الوقف.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 11,
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 1,
      words: [
        { u: 'قُلْ', i: 'قل', pos: 1 },
        { u: 'أَعُوذُ', i: 'اعوذ', pos: 2 },
        { u: 'بِرَبِّ', i: 'برب', pos: 3 },
        {
          u: 'ٱلنَّاسِ',
          i: 'الناس',
          pos: 4,
          end: true,
          mutashabih: {
            similarSurahName: 'سورة الفلق (الآية 1)',
            similarVerseKey: '113:1',
            similarContinuation: 'الفلق',
            correctContinuation: 'الناس',
            warningNote: 'نحن الآن في سورة الناس: «قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ».',
          },
          tajweed: [
            {
              head: 'ghunnah',
              labelAr: 'غنة النون المشددة حركتين',
              letter: 'نّ',
              makhrajAr: 'الخيشوم',
              colorHex: '#059669',
              adviceAr: 'أطل زمن الغنة في النون المشددة من (ٱلنَّاسِ) بمقدار حركتين.',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 12,
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 2,
      words: [
        { u: 'مَلِكِ', i: 'ملك', pos: 1 },
        { u: 'ٱلنَّاسِ', i: 'الناس', pos: 2, end: true },
      ],
    },
    {
      lineNumber: 12,
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 3,
      words: [
        { u: 'إِلَـٰهِ', i: 'اله', pos: 1 },
        { u: 'ٱلنَّاسِ', i: 'الناس', pos: 2, end: true },
      ],
    },
    {
      lineNumber: 13,
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 4,
      words: [
        { u: 'مِن', i: 'من', pos: 1 },
        { u: 'شَرِّ', i: 'شر', pos: 2 },
        { u: 'ٱلْوَسْوَاسِ', i: 'الوسواس', pos: 3 },
        { u: 'ٱلْخَنَّاسِ', i: 'الخناس', pos: 4, end: true },
      ],
    },
    {
      lineNumber: 14,
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 5,
      words: [
        { u: 'ٱلَّذِى', i: 'الذي', pos: 1 },
        { u: 'يُوَسْوِسُ', i: 'يوسوس', pos: 2 },
        { u: 'فِى', i: 'في', pos: 3 },
        {
          u: 'صُدُورِ',
          i: 'صدور',
          pos: 4,
          tajweed: [
            {
              head: 'tafkheem_tarqeeq',
              labelAr: 'تفخيم الصاد وترقيق الدال',
              letter: 'ص / د',
              makhrajAr: 'طرف اللسان',
              colorHex: '#D97706',
              adviceAr: 'فخّم الصاد في (صُدُورِ) ورقّق الدال بعدها حتى لا تنقلب ضاداً.',
            },
          ],
        },
        { u: 'ٱلنَّاسِ', i: 'الناس', pos: 5, end: true },
      ],
    },
    {
      lineNumber: 15,
      surahNumber: 114,
      surahNameAr: 'الناس',
      ayahNumber: 6,
      words: [
        { u: 'مِنَ', i: 'من', pos: 1 },
        {
          u: 'ٱلْجِنَّةِ',
          i: 'الجنة',
          pos: 2,
          tajweed: [
            {
              head: 'ghunnah',
              labelAr: 'غنة النون المشددة',
              letter: 'نّ',
              makhrajAr: 'الخيشوم',
              colorHex: '#059669',
              adviceAr: 'غنة النون المشددة في (ٱلْجِنَّةِ) حركتان كاملتان.',
            },
          ],
        },
        { u: 'وَٱلنَّاسِ', i: 'والناس', pos: 3, end: true },
      ],
    },
  ]
);

/**
 * الصفحة 1 من مصحف المدينة المنورة: سورة الفاتحة
 */
export const PAGE_1_MADINAH: MushafPageData = buildMushafPage(
  1,
  1,
  1,
  [{ lineNumber: 1, surahNumber: 1, surahNameAr: 'سُورَةُ الفَاتِحَةِ', hasBasmalah: false }],
  [
    {
      lineNumber: 2,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 1,
      words: [
        { u: 'بِسْمِ', i: 'بسم', pos: 1 },
        { u: 'ٱللَّهِ', i: 'الله', pos: 2 },
        { u: 'ٱلرَّحْمَـٰنِ', i: 'الرحمن', pos: 3 },
        { u: 'ٱلرَّحِيمِ', i: 'الرحيم', pos: 4, end: true },
      ],
    },
    {
      lineNumber: 3,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 2,
      words: [
        { u: 'ٱلْحَمْدُ', i: 'الحمد', pos: 1 },
        { u: 'لِلَّهِ', i: 'لله', pos: 2 },
        { u: 'رَبِّ', i: 'رب', pos: 3 },
        { u: 'ٱلْعَـٰلَمِينَ', i: 'العالمين', pos: 4, end: true },
      ],
    },
    {
      lineNumber: 4,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 3,
      words: [
        { u: 'ٱلرَّحْمَـٰنِ', i: 'الرحمن', pos: 1 },
        { u: 'ٱلرَّحِيمِ', i: 'الرحيم', pos: 2, end: true },
      ],
    },
    {
      lineNumber: 5,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 4,
      words: [
        { u: 'مَـٰلِكِ', i: 'مالك', pos: 1 },
        { u: 'يَوْمِ', i: 'يوم', pos: 2 },
        { u: 'ٱلدِّينِ', i: 'الدين', pos: 3, end: true },
      ],
    },
    {
      lineNumber: 6,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 5,
      words: [
        { u: 'إِيَّاكَ', i: 'اياك', pos: 1 },
        { u: 'نَعْبُدُ', i: 'نعبد', pos: 2 },
        { u: 'وَإِيَّاكَ', i: 'واياك', pos: 3 },
        {
          u: 'نَسْتَعِينُ',
          i: 'نستعين',
          pos: 4,
          end: true,
          tajweed: [
            {
              head: 'tafkheem_tarqeeq',
              labelAr: 'ترقيق السين والتاء في نستعين',
              letter: 'س / ت',
              makhrajAr: 'طرف اللسان',
              colorHex: '#059669',
              adviceAr: 'احذر من تفخيم التاء فتصبح طاءً (نصطعين).',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 7,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 6,
      words: [
        { u: 'ٱهْدِنَا', i: 'اهدنا', pos: 1 },
        {
          u: 'ٱلصِّرَٰطَ',
          i: 'الصراط',
          pos: 2,
          tajweed: [
            {
              head: 'itbaq_infitah',
              labelAr: 'إطباق الصاد وتفخيم الطاء',
              letter: 'ص / ط',
              makhrajAr: 'طرف اللسان مع أقصى اللسان',
              colorHex: '#D97706',
              adviceAr: 'أعطِ الصاد والطاء حقهما من الإطباق والاستعلاء فلا تقل (السرات).',
            },
          ],
        },
        {
          u: 'ٱلْمُسْتَقِيمَ',
          i: 'المستقيم',
          pos: 3,
          end: true,
          tajweed: [
            {
              head: 'tafkheem_tarqeeq',
              labelAr: 'ترقيق التاء وتفخيم القاف',
              letter: 'ت / ق',
              makhrajAr: 'طرف اللسان ثم أقصى اللسان',
              colorHex: '#0284C7',
              adviceAr: 'خلص ترقيق التاء من تفخيم القاف المجاورة في (المستقيم).',
            },
          ],
        },
      ],
    },
    {
      lineNumber: 8,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 7,
      words: [
        { u: 'صِرَٰطَ', i: 'صراط', pos: 1 },
        { u: 'ٱلَّذِينَ', i: 'الذين', pos: 2 },
        { u: 'أَنْعَمْتَ', i: 'انعمت', pos: 3 },
        { u: 'عَلَيْهِمْ', i: 'عليهم', pos: 4 },
      ],
    },
    {
      lineNumber: 9,
      surahNumber: 1,
      surahNameAr: 'الفاتحة',
      ayahNumber: 7,
      words: [
        { u: 'غَيْرِ', i: 'غير', pos: 5 },
        {
          u: 'ٱلْمَغْضُوبِ',
          i: 'المغضوب',
          pos: 6,
          tajweed: [
            {
              head: 'itbaq_infitah',
              labelAr: 'استطالة وتفخيم الضاد وترقيق الميم',
              letter: 'ض',
              makhrajAr: 'حافة اللسان مع الأضراس العليا',
              colorHex: '#D97706',
              adviceAr: 'حافظ على مخرج الضاد المستطيلة دون إبدالها دالاً أو ظاءً.',
            },
          ],
        },
        { u: 'عَلَيْهِمْ', i: 'عليهم', pos: 7 },
        { u: 'وَلَا', i: 'ولا', pos: 8 },
        {
          u: 'ٱلضَّآلِّينَ',
          i: 'الضالين',
          pos: 9,
          end: true,
          tajweed: [
            {
              head: 'madd_tabeei',
              labelAr: 'مد لازم كلمي مثقل (6 حركات)',
              letter: 'ضَآلِّ',
              makhrajAr: 'الجوف مع حافة اللسان',
              colorHex: '#DC2626',
              adviceAr: 'مد الألف 6 حركات لزوماً مع تشديد اللام دون غنة.',
            },
          ],
        },
      ],
    },
  ]
);

export const LOCAL_FALLBACK_PAGES: Record<number, MushafPageData> = {
  1: PAGE_1_MADINAH,
  604: PAGE_604_MADINAH,
};
