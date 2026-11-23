import type { Language, PortalPage } from '../types/portal';
import { TRANSLATIONS } from '../i18n/translations';
import { LokSudharBrand } from './LokSudharBrand';

interface PortalFooterProps {
  language: Language;
  onNavigate: (page: PortalPage) => void;
}

export function PortalFooter({ language, onNavigate }: PortalFooterProps) {
  const t = TRANSLATIONS[language];

  return (
    <footer className="bg-[#123B70] text-slate-100 border-t-4 border-[#138808] mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <LokSudharBrand variant="footer" />
        </div>

        <div className="md:col-span-3">
          <h2 className="text-base font-bold text-white mb-3 font-institutional">
            {t.footerQuickLinks}
          </h2>
          <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-200">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hover:underline cursor-pointer"
              >
                {t.navHome}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="hover:underline cursor-pointer"
              >
                {t.navAbout}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('lodge')}
                className="hover:underline cursor-pointer"
              >
                {t.navLodge}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('track')}
                className="hover:underline cursor-pointer"
              >
                {t.navTrack}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('departments')}
                className="hover:underline cursor-pointer"
              >
                {t.navDepartments}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('help')}
                className="hover:underline cursor-pointer"
              >
                {t.navHelp}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-base font-bold text-white mb-3 font-institutional">
            {t.footerPortals}
          </h2>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="hover:underline cursor-pointer"
              >
                {t.navServices}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="hover:underline cursor-pointer"
              >
                {t.adminPortalBtn}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('worker')}
                className="hover:underline cursor-pointer"
              >
                {t.workerPortalBtn}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="hover:underline cursor-pointer"
              >
                {t.navContact}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-base font-bold text-white mb-3 font-institutional">
            {t.footerHelpdesk}
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            LokSudhar (लोक सुधार) Grievance Monitoring Cell (Prototype Demo)
            <br />
            Toll-Free Demo Desk: 1800-11-4400
            <br />
            Support Hours: Monday – Saturday, 09:30 AM – 06:00 PM
          </p>
        </div>
      </div>

      <div className="bg-[#0B264B] border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-slate-300 space-y-1">
          <p className="font-medium text-amber-200">{t.footerDisclaimer}</p>
          <p>
            © {new Date().getFullYear()} LokSudhar (लोक सुधार) — Independent Citizen Grievance Redressal Prototype.
          </p>
        </div>
      </div>
    </footer>
  );
}
