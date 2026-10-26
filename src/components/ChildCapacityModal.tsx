import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ChildCapacityProfile } from '../types/quran';

interface ChildCapacityModalProps {
  isOpen: boolean;
  profile: ChildCapacityProfile;
  onClose: () => void;
  onSave: (updated: ChildCapacityProfile) => void;
}

export const ChildCapacityModal: React.FC<ChildCapacityModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [formState, setFormState] = useState<ChildCapacityProfile>(profile);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.childName.trim()) {
      setValidationError('يرجى إدخال اسم الطفل لحفظ ملف القدرة.');
      return;
    }
    if (formState.totalMemorizedJuz < 1 || formState.totalMemorizedJuz > 15) {
      setValidationError('مقدار الحفظ للمراجعة التراكمية يجب أن يكون بين جزء واحد و15 جزءاً.');
      return;
    }
    setValidationError(null);
    onSave(formState);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="capacity-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-4 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 id="capacity-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            إعدادات قدرة الطفل وملف التحفيظ
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة الإعدادات"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold text-red-800 dark:text-red-200">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="child-name-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                اسم الطفل:
              </label>
              <input
                id="child-name-input"
                type="text"
                value={formState.childName}
                onChange={(e) => setFormState({ ...formState, childName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="child-age-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                العمر (سنوات):
              </label>
              <input
                id="child-age-input"
                type="number"
                min={4}
                max={18}
                value={formState.age}
                onChange={(e) => setFormState({ ...formState, age: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="daily-capacity-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                مقدار الورد اليومي الجديد:
              </label>
              <select
                id="daily-capacity-select"
                value={formState.dailyNewCapacity}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    dailyNewCapacity: e.target.value as ChildCapacityProfile['dailyNewCapacity'],
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="half_page">نصف صفحة يومياً (7 أسطر)</option>
                <option value="one_page">صفحة كاملة يومياً (15 سطراً)</option>
                <option value="two_pages">صفحتان يومياً (30 سطراً)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="memorized-juz-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                الأجزاء المحفوظة (1 إلى 15 جزءاً):
              </label>
              <input
                id="memorized-juz-input"
                type="number"
                min={1}
                max={15}
                value={formState.totalMemorizedJuz}
                onChange={(e) =>
                  setFormState({ ...formState, totalMemorizedJuz: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sheikh-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                القارئ المعلم لتصحيح المخارج:
              </label>
              <select
                id="sheikh-select"
                value={formState.preferredSheikh}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    preferredSheikh: e.target.value as 'husary' | 'minshawi',
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="husary">الشيخ محمود خليل الحصري (المصحف المعلم)</option>
                <option value="minshawi">الشيخ محمد صديق المنشاوي (المرتل)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="hadr-mode-checkbox" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                سرعة التسميع في المراجعة:
              </label>
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-xs cursor-pointer">
                <input
                  id="hadr-mode-checkbox"
                  type="checkbox"
                  checked={formState.hadrSpeedMode}
                  onChange={(e) =>
                    setFormState({ ...formState, hadrSpeedMode: e.target.checked })
                  }
                  className="accent-emerald-700"
                />
                <span>تفعيل حساسية الحدر (20 دقيقة للجزء)</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="asr-endpoint-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              رابط نموذج (tarteel-ai/whisper-base-ar-quran & muaalem El Quran):
            </label>
            <input
              id="asr-endpoint-input"
              type="text"
              value={formState.asrEndpointUrl}
              onChange={(e) => setFormState({ ...formState, asrEndpointUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono-tabular bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg cursor-pointer"
            >
              حفظ الإعدادات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
