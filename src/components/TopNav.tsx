import React from 'react';
import { Moon, Settings, Sun } from 'lucide-react';

export type ActiveTabId = 'mushaf' | 'fortresses' | 'tajweed_lab' | 'parents_report';

interface TopNavProps {
  activeTab: ActiveTabId;
  isDarkMode: boolean;
  onSelectTab: (tab: ActiveTabId) => void;
  onToggleDarkMode: () => void;
  onOpenCapacityModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  isDarkMode,
  onSelectTab,
  onToggleDarkMode,
  onOpenCapacityModal,
}) => {
  const navItems: { id: ActiveTabId; label: string }[] = [
    { id: 'mushaf', label: 'اللوح والتسميع' },
    { id: 'fortresses', label: 'الحصون الخمسة' },
    { id: 'tajweed_lab', label: 'مختبر التجويد' },
    { id: 'parents_report', label: 'تقارير الوالدين' },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Top Row on Mobile / Zone 1 & Zone 3 on Desktop */}
        <div className="flex items-center justify-between gap-3">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#mushaf"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('mushaf');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            مِشكاة الترتيل
          </a>

          {/* Mobile Actions (shown inline on mobile, moved to right on desktop) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              data-testid="dark-mode-toggle-mobile"
              aria-label={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? 'نهاري' : 'ليلي'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCapacityModal}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>قدرة الطفل</span>
            </button>
          </div>
        </div>

        {/* Zone 2: 4 concise single-line text navigation links (Responsive & scrollable on small screens) */}
        <nav
          aria-label="التنقل الرئيسي"
          className="flex items-center justify-between sm:justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 overflow-x-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 pt-2 md:pt-0"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 py-1.5 px-1 transition-colors border-b-2 ${
                  isActive
                    ? 'border-emerald-600 dark:border-emerald-400 text-slate-950 dark:text-white font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Desktop Actions (Dark Mode Toggle + Child Capacity Modal) */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleDarkMode}
            data-testid="dark-mode-toggle"
            aria-label={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            className="px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>الوضع النهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>الوضع الليلي</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCapacityModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            إعدادات قدرة الطفل
          </button>
        </div>
      </div>
    </header>
  );
};
