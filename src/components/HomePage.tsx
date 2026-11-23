import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FilePlus2,
  MapPinned,
  Megaphone,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import type {
  AnnouncementItem,
  GrievanceStats,
  Language,
  PortalPage,
} from '../types/portal';
import { DEPARTMENTS, PORTAL_FAQS } from '../data/portalCatalog';
import { TRANSLATIONS } from '../i18n/translations';

interface HomePageProps {
  language: Language;
  stats: GrievanceStats;
  announcements: AnnouncementItem[];
  onNavigate: (page: PortalPage) => void;
  onQuickTrack: (refNumber: string) => void;
}

const HERO_IMG = '/src/assets/images/portal_hero_banner_1795450981445.jpg';
const DESK_IMG = '/src/assets/images/citizen_desk_service_1795450980888.jpg';
const FIELD_IMG = '/src/assets/images/field_inspection_team_1795450982485.jpg';

export function HomePage({
  language,
  stats,
  announcements,
  onNavigate,
  onQuickTrack,
}: HomePageProps) {
  const t = TRANSLATIONS[language];
  const [quickRef, setQuickRef] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<AnnouncementItem | null>(null);
  const [heroImgErr, setHeroImgErr] = useState(false);
  const [deskImgErr, setDeskImgErr] = useState(false);
  const [fieldImgErr, setFieldImgErr] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRef.trim()) {
      onNavigate('track');
      return;
    }
    onQuickTrack(quickRef.trim().toUpperCase());
  };

  return (
    <div className="space-y-10 pb-6">
      {/* Government-style Welcome Banner */}
      <section className="bg-[#F4F6F9] border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold tracking-wider text-[#123B70]">
              {t.heroKicker}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#123B70] leading-tight text-balance">
              {t.heroHeadline}
            </h1>
            <p className="text-base text-slate-700 leading-relaxed max-w-2xl">
              {t.heroBody}
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('lodge')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] cursor-pointer whitespace-nowrap"
              >
                <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                <span>{t.btnSubmitGrievance}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('track')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-[#123B70] border-2 border-[#123B70] text-sm font-semibold hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>{t.btnTrackGrievance}</span>
              </button>
            </div>

            {/* Quick Track Reference Form */}
            <form
              onSubmit={handleTrackSubmit}
              className="bg-white border border-slate-300 p-3 flex flex-col sm:flex-row gap-2 max-w-xl"
            >
              <label htmlFor="quick-track-input" className="sr-only">
                {t.quickTrackPlaceholder}
              </label>
              <input
                id="quick-track-input"
                type="text"
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
                placeholder={t.quickTrackPlaceholder}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 font-mono-tabular focus:outline-2 focus:outline-[#123B70]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] cursor-pointer whitespace-nowrap"
              >
                {t.quickTrackBtn}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            {!heroImgErr ? (
              <figure className="h-full border border-slate-300 bg-white p-1.5 flex flex-col">
                <img
                  src={HERO_IMG}
                  alt="LokSudhar public service administrative secretariat building"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgErr(true)}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <figcaption className="pt-2 px-1 text-xs text-slate-600">
                  {language === 'hi'
                    ? 'लोक सुधार — एकीकृत नागरिक शिकायत निवारण सेवा केंद्र (प्रोटोटाइप चित्र)'
                    : 'LokSudhar (लोक सुधार) — Centralized Citizen Facilitation & Grievance Redressal Desk'}
                </figcaption>
              </figure>
            ) : (
              <div className="h-full min-h-64 border border-slate-300 bg-[#123B70] text-white p-6 flex flex-col justify-center">
                <Building2 className="w-10 h-10 text-[#F28C28] mb-3" />
                <p className="font-institutional text-xl font-bold">{t.portalTitle}</p>
                <p className="text-sm text-slate-200 mt-1">{t.tagline}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Grievance Statistics Strip */}
      <section className="max-w-7xl mx-auto px-4" aria-label="Grievance Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-300 bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-600">{t.statTotal}</p>
            <p className="text-3xl font-bold text-[#123B70] mt-1 font-mono-tabular">
              {stats.totalRegistered}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'hi' ? 'सक्रिय पोर्टल अभिलेख' : 'Active portal records'}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-600">{t.statPending}</p>
            <p className="text-3xl font-bold text-[#B45309] mt-1 font-mono-tabular">
              {stats.pendingAndAssigned}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'hi' ? 'विभागीय समीक्षाधीन' : 'Under departmental review'}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-600">{t.statInProgress}</p>
            <p className="text-3xl font-bold text-[#123B70] mt-1 font-mono-tabular">
              {stats.inProgress}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'hi' ? 'फील्ड अधिकारी द्वारा कार्यवाही' : 'Field action underway'}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-600">{t.statResolved}</p>
            <p className="text-3xl font-bold text-[#138808] mt-1 font-mono-tabular">
              {stats.resolvedAndClosed}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono-tabular">
              {t.statAvgHours}: ~{stats.avgResolutionHours}h
            </p>
          </div>
        </div>
      </section>

      {/* Important Announcements & Citizen Services Grid */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Announcements Table */}
        <div className="lg:col-span-7 border border-slate-300 bg-white">
          <div className="bg-[#123B70] text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#F28C28] shrink-0" aria-hidden="true" />
              <h2 className="text-base font-bold font-institutional">{t.announcementsTitle}</h2>
            </div>
            <span className="text-xs text-slate-200 font-mono-tabular">
              {announcements.length} {language === 'hi' ? 'परिपत्र' : 'Notices'}
            </span>
          </div>
          <p className="px-4 py-2 text-xs text-slate-600 bg-[#F4F6F9] border-b border-slate-200">
            {t.announcementsSubtitle}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700">
                  <th className="py-2.5 px-4">{language === 'hi' ? 'परिपत्र सं.' : 'Circular No.'}</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'तिथि' : 'Date'}</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'विषय' : 'Subject'}</th>
                  <th className="py-2.5 px-4 text-right">{language === 'hi' ? 'विवरण' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono-tabular text-xs font-medium text-[#123B70] whitespace-nowrap">
                      {item.circularNo}
                    </td>
                    <td className="py-3 px-4 font-mono-tabular text-xs text-slate-600 whitespace-nowrap">
                      {item.publishedDate}
                    </td>
                    <td className="py-3 px-4 text-slate-900">
                      <div className="font-medium">
                        {language === 'hi' ? item.titleHi : item.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {language === 'hi' ? item.departmentHi : item.department}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(item)}
                        className="text-xs font-semibold text-[#123B70] hover:underline cursor-pointer"
                      >
                        {language === 'hi' ? 'देखें' : 'Read Circular'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citizen Service Quick Modules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-slate-300 bg-white">
            <div className="bg-[#F4F6F9] border-b border-slate-300 px-4 py-3">
              <h2 className="text-base font-bold text-[#123B70] font-institutional">
                {t.citizenServicesTitle}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">{t.citizenServicesSubtitle}</p>
            </div>
            <div className="divide-y divide-slate-200">
              <button
                type="button"
                onClick={() => onNavigate('lodge')}
                className="w-full p-4 text-left hover:bg-slate-50 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <FilePlus2 className="w-5 h-5 text-[#123B70] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#123B70]">
                      {language === 'hi' ? 'ऑनलाइन नागरिक शिकायत दर्ज करें' : 'Online Grievance Registration'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'hi'
                        ? 'फोटो एवं जीपीएस लोकेशन के साथ शिकायत दर्ज करें'
                        : 'Submit complaints with State/District selection, GPS map pin & photo evidence.'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('track')}
                className="w-full p-4 text-left hover:bg-slate-50 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 text-[#138808] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#123B70]">
                      {language === 'hi' ? 'संदर्भ संख्या से स्थिति जांचें' : 'Track Complaint & Resolution Evidence'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'hi'
                        ? 'विभागीय आवंटन, समय-सारणी एवं पूर्णता फोटो देखें'
                        : 'View assigned department, officer action timeline, and field completion photos.'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('departments')}
                className="w-full p-4 text-left hover:bg-slate-50 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#123B70] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#123B70]">
                      {language === 'hi' ? 'विभागीय नोडल अधिकारी निर्देशिका' : 'Department & Nodal Officer Directory'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'hi'
                        ? 'सभी नागरिक विभागों की हेल्पलाइन व निवारण समय सीमा देखें'
                        : 'Inspect SLA benchmarks, nodal designations, and prototype helpdesks.'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('help')}
                className="w-full p-4 text-left hover:bg-slate-50 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#F28C28] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#123B70]">
                      {language === 'hi' ? 'नागरिक चार्टर एवं सहायता केंद्र' : 'Escalation Matrix & Citizen Support'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'hi'
                        ? 'शिकायत प्रक्रिया, समय सीमा एवं अपीलीय मार्गदर्शन'
                        : 'Review step-by-step filing guidance and multi-level escalation rules.'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!deskImgErr ? (
              <div className="border border-slate-300 bg-white p-1.5">
                <img
                  src={DESK_IMG}
                  alt="Citizen facilitation counter"
                  referrerPolicy="no-referrer"
                  onError={() => setDeskImgErr(true)}
                  className="w-full h-28 object-cover"
                />
                <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                  {language === 'hi' ? 'नागरिक सुविधा केंद्र' : 'Citizen Facilitation Desk'}
                </p>
              </div>
            ) : null}
            {!fieldImgErr ? (
              <div className="border border-slate-300 bg-white p-1.5">
                <img
                  src={FIELD_IMG}
                  alt="Civic field inspection team"
                  referrerPolicy="no-referrer"
                  onError={() => setFieldImgErr(true)}
                  className="w-full h-28 object-cover"
                />
                <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                  {language === 'hi' ? 'क्षेत्रीय निरीक्षण दल' : 'Geo-Tagged Field Verification'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Department Information & SLA Table */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="border border-slate-300 bg-white">
          <div className="bg-[#F4F6F9] border-b border-slate-300 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPinned className="w-4 h-4 text-[#123B70]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#123B70] font-institutional">
                {t.deptSummaryTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('departments')}
              className="text-xs font-semibold text-[#123B70] hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'पूर्ण निर्देशिका देखें →' : 'View Full Directory →'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#123B70] text-white text-xs">
                  <th className="py-2.5 px-4">{language === 'hi' ? 'विभाग' : 'Department'}</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'नोडल अधिकारी' : 'Nodal Officer'}</th>
                  <th className="py-2.5 px-4 text-center">{language === 'hi' ? 'निवारण SLA' : 'Target SLA'}</th>
                  <th className="py-2.5 px-4 text-right">{language === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DEPARTMENTS.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {language === 'hi' ? dept.nameHi : dept.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">
                      {language === 'hi' ? dept.nodalOfficerHi : dept.nodalOfficer}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-tabular text-xs font-semibold text-[#123B70] whitespace-nowrap">
                      {dept.slaDays} {language === 'hi' ? 'कार्य दिवस' : 'Working Days'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onNavigate('lodge')}
                        className="px-3 py-1 bg-[#F4F6F9] border border-slate-300 text-xs font-semibold text-[#123B70] hover:bg-slate-200 cursor-pointer"
                      >
                        {language === 'hi' ? 'शिकायत दर्ज करें' : 'Lodge'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="border border-slate-300 bg-white">
          <div className="bg-[#F4F6F9] border-b border-slate-300 px-4 py-3">
            <h2 className="text-base font-bold text-[#123B70] font-institutional">
              {t.faqTitle}
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {PORTAL_FAQS.map((faq, idx) => (
              <details key={faq.id} className="group px-4 py-3.5" open={idx === 0}>
                <summary className="font-semibold text-sm text-[#123B70] cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>
                    {idx + 1}. {language === 'hi' ? faq.qHi : faq.qEn}
                  </span>
                  <span className="text-xs text-slate-500 group-open:hidden">+ Expand</span>
                  <span className="text-xs text-slate-500 hidden group-open:inline">− Collapse</span>
                </summary>
                <p className="mt-2.5 text-sm text-slate-700 leading-relaxed max-w-4xl">
                  {language === 'hi' ? faq.aHi : faq.aEn}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Circular Detail Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="circular-modal-title"
        >
          <div className="bg-white border border-slate-400 max-w-lg w-full shadow-lg">
            <div className="bg-[#123B70] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-mono-tabular">{selectedNotice.circularNo}</span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                aria-label="Close circular dialog"
                className="text-white hover:text-[#F28C28] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <h3 id="circular-modal-title" className="text-lg font-bold text-[#123B70]">
                {language === 'hi' ? selectedNotice.titleHi : selectedNotice.title}
              </h3>
              <p className="text-xs text-slate-600 font-mono-tabular">
                {language === 'hi' ? selectedNotice.departmentHi : selectedNotice.department} ·{' '}
                {selectedNotice.publishedDate}
              </p>
              <p className="text-sm text-slate-800 leading-relaxed border-t border-slate-200 pt-3">
                {language === 'hi' ? selectedNotice.summaryHi : selectedNotice.summary}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-[#123B70] text-white text-xs font-semibold hover:bg-[#0E2F5A] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
