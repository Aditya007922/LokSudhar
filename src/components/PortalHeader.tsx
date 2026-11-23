import { useState } from 'react';
import {
  Contrast,
  LogIn,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  Building2,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Language, PortalPage } from '../types/portal';
import { TRANSLATIONS } from '../i18n/translations';
import { LokSudharBrand } from './LokSudharBrand';

interface PortalHeaderProps {
  currentPage: PortalPage;
  onNavigate: (page: PortalPage) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  highContrast: boolean;
  onToggleContrast: () => void;
  firebaseUser: User | null;
  authLoading: boolean;
  onCitizenSignIn: () => void;
  onCitizenSignOut: () => void;
}

export function PortalHeader({
  currentPage,
  onNavigate,
  language,
  onLanguageChange,
  fontScale,
  onFontScaleChange,
  highContrast,
  onToggleContrast,
  firebaseUser,
  authLoading,
  onCitizenSignIn,
  onCitizenSignOut,
}: PortalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const navItems: Array<{ id: PortalPage; label: string }> = [
    { id: 'home', label: t.navHome },
    { id: 'about', label: t.navAbout },
    { id: 'services', label: t.navServices },
    { id: 'lodge', label: t.navLodge },
    { id: 'track', label: t.navTrack },
    { id: 'departments', label: t.navDepartments },
    { id: 'help', label: t.navHelp },
    { id: 'contact', label: t.navContact },
  ];

  const handleNavClick = (page: PortalPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-xs no-print">
      <div className="tricolor-rule" aria-hidden="true" />

      {/* Top Accessibility, Language & Prototype Notice Utility Strip */}
      <div className="bg-[#F4F6F9] border-b border-slate-300 text-xs text-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-[#123B70]">
              {language === 'hi'
                ? 'लोक सुधार · स्वतंत्र प्रोटोटाइप पोर्टल'
                : 'LokSudhar (लोक सुधार) · Independent Prototype'}
            </span>
            <span className="text-slate-400" aria-hidden="true">
              |
            </span>
            <a
              href="#main-content"
              className="underline text-[#123B70] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-[#123B70]"
            >
              {t.skipToContent}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Font size accessibility controls */}
            <div className="flex items-center gap-1 border border-slate-300 bg-white px-1.5 py-0.5">
              <span className="text-[11px] text-slate-600 pr-1 hidden sm:inline">
                {t.accessibilityTextSize}:
              </span>
              <button
                type="button"
                aria-label="Decrease text size"
                onClick={() => onFontScaleChange(Math.max(0.9, Number((fontScale - 0.1).toFixed(2))))}
                className="px-1.5 py-0.5 font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                A-
              </button>
              <button
                type="button"
                aria-label="Reset text size"
                onClick={() => onFontScaleChange(1)}
                className="px-1.5 py-0.5 font-semibold text-[#123B70] hover:bg-slate-200 cursor-pointer"
              >
                A
              </button>
              <button
                type="button"
                aria-label="Increase text size"
                onClick={() => onFontScaleChange(Math.min(1.2, Number((fontScale + 0.1).toFixed(2))))}
                className="px-1.5 py-0.5 font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                A+
              </button>
            </div>

            {/* High Contrast toggle */}
            <button
              type="button"
              onClick={onToggleContrast}
              aria-pressed={highContrast}
              className={`inline-flex items-center gap-1 px-2 py-0.5 border cursor-pointer whitespace-nowrap ${
                highContrast
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{highContrast ? t.normalContrast : t.highContrast}</span>
            </button>

            {/* English / Hindi Language Selector */}
            <div
              className="inline-flex border border-slate-300 bg-white"
              role="group"
              aria-label="Language Selector"
            >
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 font-medium cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#123B70] text-white'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 font-medium cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#123B70] text-white'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Citizen Login / Register */}
            {firebaseUser ? (
              <div className="inline-flex items-center gap-2 bg-white border border-slate-300 px-2 py-0.5">
                <UserCheck className="w-3.5 h-3.5 text-[#138808]" aria-hidden="true" />
                <span className="font-medium text-slate-900 max-w-[140px] truncate">
                  {firebaseUser.displayName || firebaseUser.email}
                </span>
                <button
                  type="button"
                  onClick={onCitizenSignOut}
                  className="inline-flex items-center gap-1 text-[#123B70] underline hover:text-red-700 cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-3 h-3" aria-hidden="true" />
                  <span>{t.signOut}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onCitizenSignIn}
                disabled={authLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#123B70] text-white font-semibold hover:bg-[#0E2F5A] disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{authLoading ? 'Signing in...' : t.citizenLogin}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Institutional Masthead */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <LokSudharBrand variant="header" onClick={() => handleNavClick('home')} />

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'admin'
                  ? 'bg-[#123B70] text-white border-[#123B70]'
                  : 'bg-[#F4F6F9] text-[#123B70] border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.adminPortalBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('worker')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'worker'
                  ? 'bg-[#138808] text-white border-[#138808]'
                  : 'bg-[#F4F6F9] text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.workerPortalBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navy Navigation Bar */}
      <nav
        aria-label="Primary Portal Navigation"
        className="bg-[#123B70] text-white border-b-3 border-[#F28C28]"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between lg:hidden py-2.5">
            <span className="text-sm font-semibold">
              {navItems.find((i) => i.id === currentPage)?.label || t.navHome}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-sm font-medium cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>

          {/* Desktop single-line nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer border-b-3 ${
                      isActive
                        ? 'bg-[#0E2F5A] text-white border-[#F28C28]'
                        : 'text-slate-100 border-transparent hover:bg-[#0E2F5A] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Mobile vertical nav drawer */}
          {mobileMenuOpen && (
            <ul className="lg:hidden pb-3 space-y-1 border-t border-blue-900 pt-2">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm font-medium cursor-pointer ${
                        isActive
                          ? 'bg-[#0E2F5A] text-white font-semibold'
                          : 'text-slate-100 hover:bg-[#0E2F5A]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Clear Prototype Notice Strip */}
      <div className="bg-[#FFFBEB] border-b border-amber-300 text-amber-950 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 text-center font-medium">
          {t.prototypeBanner}
        </div>
      </div>
    </header>
  );
}
