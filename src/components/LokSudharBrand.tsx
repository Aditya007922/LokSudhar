import { useState } from 'react';
import { Landmark } from 'lucide-react';

interface LokSudharBrandProps {
  variant?: 'header' | 'compact' | 'footer' | 'loading';
  showTagline?: boolean;
  onClick?: () => void;
}

const LOKSUDHAR_LOGO_SRC = '/src/assets/images/loksudhar_logo_1795452726382.jpg';

function LogoMark({ sizeClass }: { sizeClass: string }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`${sizeClass} border border-[#123B70] bg-white flex flex-col items-center justify-center shrink-0 relative overflow-hidden`}
      >
        <div className="w-full h-1 bg-[#F28C28] absolute top-0 left-0" />
        <Landmark className="w-7 h-7 text-[#123B70]" aria-hidden="true" />
        <div className="w-full h-1 bg-[#138808] absolute bottom-0 left-0" />
      </div>
    );
  }

  return (
    <img
      src={LOKSUDHAR_LOGO_SRC}
      alt="LokSudhar (लोक सुधार) Citizen Grievance Redressal Portal Emblem"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${sizeClass} object-contain border border-slate-200 bg-white p-0.5 shrink-0`}
    />
  );
}

export function LokSudharBrand({
  variant = 'header',
  showTagline = true,
  onClick,
}: LokSudharBrandProps) {
  const isFooter = variant === 'footer';
  const isCompact = variant === 'compact';
  const isLoading = variant === 'loading';

  const sizeClass = isLoading
    ? 'w-20 h-20'
    : isCompact
      ? 'w-11 h-11'
      : 'w-14 h-14 sm:w-16 sm:h-16';

  const content = (
    <div
      className={`flex items-center ${isLoading ? 'flex-col text-center gap-3' : 'gap-3.5 text-left'}`}
    >
      <LogoMark sizeClass={sizeClass} />
      <div>
        <div
          className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 ${isLoading ? 'justify-center' : ''}`}
        >
          <span
            className={`font-bold tracking-tight font-institutional ${
              isFooter
                ? 'text-lg text-white'
                : isCompact
                  ? 'text-lg text-[#123B70]'
                  : 'text-xl sm:text-2xl text-[#123B70]'
            } ${onClick ? 'group-hover:underline' : ''}`}
          >
            LokSudhar
          </span>
          <span
            className={`font-bold ${
              isFooter ? 'text-base text-[#F28C28]' : 'text-base sm:text-lg text-[#123B70]'
            }`}
          >
            लोक सुधार
          </span>
          {!isCompact && (
            <span
              className={`text-[11px] font-semibold ${
                isFooter ? 'text-slate-300' : 'text-[#B45309]'
              }`}
            >
              · INDEPENDENT PROTOTYPE
            </span>
          )}
        </div>
        <p
          className={`font-semibold leading-tight mt-0.5 ${
            isFooter
              ? 'text-sm text-slate-200'
              : isCompact
                ? 'text-xs text-slate-800'
                : 'text-sm sm:text-base text-slate-900'
          }`}
        >
          Citizen Grievance Redressal Portal
        </p>
        {showTagline && (
          <p
            className={`text-xs mt-0.5 font-medium ${
              isFooter ? 'text-amber-200' : 'text-[#123B70]'
            }`}
          >
            &ldquo;शिकायत आपकी, समाधान प्रशासन का।&rdquo;
          </p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer group text-left focus-visible:outline-2 focus-visible:outline-[#123B70]"
      >
        {content}
      </button>
    );
  }

  return content;
}
