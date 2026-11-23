import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type {
  AnnouncementItem,
  GrievanceRecord,
  GrievanceStats,
  Language,
  PortalPage,
  PortalSession,
} from './types/portal';
import {
  auth,
  signInWithGoogleCitizen,
  signOutFirebaseUser,
} from './lib/firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortalHeader } from './components/PortalHeader';
import { PortalFooter } from './components/PortalFooter';
import { LokSudharBrand } from './components/LokSudharBrand';
import { HomePage } from './components/HomePage';
import { LodgeGrievancePage } from './components/LodgeGrievancePage';
import { TrackGrievancePage } from './components/TrackGrievancePage';
import { AdminPortalPage } from './components/AdminPortalPage';
import { WorkerPortalPage } from './components/WorkerPortalPage';
import {
  AboutPage,
  CitizenServicesPage,
  ContactUsPage,
  DepartmentDirectoryPage,
  HelpSupportPage,
} from './components/InfoPages';

const INITIAL_STATS: GrievanceStats = {
  totalRegistered: 0,
  pendingAndAssigned: 0,
  inProgress: 0,
  resolvedAndClosed: 0,
  avgResolutionHours: 36,
  departmentBreakdown: [],
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PortalPage>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState('');

  const [adminSession, setAdminSession] = useState<PortalSession | null>(null);
  const [workerSession, setWorkerSession] = useState<PortalSession | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [stats, setStats] = useState<GrievanceStats>(INITIAL_STATS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [trackRefTarget, setTrackRefTarget] = useState<string>('');

  const [liveCreatedRecord, setLiveCreatedRecord] = useState<GrievanceRecord | null>(null);
  const [liveUpdatedRecord, setLiveUpdatedRecord] = useState<GrievanceRecord | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--portal-scale', String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  const refreshStats = () => {
    return fetch('/api/stats')
      .then((r) => r.json())
      .then((data: GrievanceStats) => {
        if (typeof data.totalRegistered === 'number') setStats(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      refreshStats(),
      fetch('/api/announcements')
        .then((r) => r.json())
        .then((data: AnnouncementItem[]) => {
          if (Array.isArray(data)) setAnnouncements(data);
        })
        .catch(() => {}),
    ]).finally(() => {
      setInitialLoading(false);
    });

    const socket: Socket = io({
      transports: ['websocket', 'polling'],
    });

    socket.on('grievance:created', (record: GrievanceRecord) => {
      setLiveCreatedRecord(record);
      void refreshStats();
    });

    socket.on('grievance:updated', (record: GrievanceRecord) => {
      setLiveUpdatedRecord(record);
      void refreshStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCitizenSignIn = async () => {
    setAuthNotice('');
    setAuthLoading(true);
    try {
      await signInWithGoogleCitizen();
    } catch (err) {
      setAuthNotice(
        err instanceof Error ? err.message : 'Unable to complete Google Sign-In.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCitizenSignOut = async () => {
    await signOutFirebaseUser();
  };

  const handleNavigate = (page: PortalPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTrack = (refNumber: string) => {
    setTrackRefTarget(refNumber);
    handleNavigate('track');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-6">
        <div className="tricolor-rule w-full max-w-md mb-6" />
        <div className="bg-white border border-slate-300 p-8 max-w-md w-full flex flex-col items-center gap-4">
          <LokSudharBrand variant="loading" />
          <p className="text-xs text-slate-600 font-medium">
            Loading Citizen Grievance Redressal Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900">
        <PortalHeader
          currentPage={currentPage}
          onNavigate={handleNavigate}
          language={language}
          onLanguageChange={setLanguage}
          fontScale={fontScale}
          onFontScaleChange={setFontScale}
          highContrast={highContrast}
          onToggleContrast={() => setHighContrast((prev) => !prev)}
          firebaseUser={firebaseUser}
          authLoading={authLoading}
          onCitizenSignIn={handleCitizenSignIn}
          onCitizenSignOut={handleCitizenSignOut}
        />

        {authNotice && (
          <div className="max-w-7xl mx-auto px-4 pt-3 w-full">
            <div className="p-3 bg-amber-50 border border-[#F28C28] text-xs text-amber-950 flex items-center justify-between">
              <span>{authNotice}</span>
              <button
                type="button"
                onClick={() => setAuthNotice('')}
                className="underline font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main id="main-content" className="flex-1">
          {currentPage === 'home' && (
            <HomePage
              language={language}
              stats={stats}
              announcements={announcements}
              onNavigate={handleNavigate}
              onQuickTrack={handleQuickTrack}
            />
          )}
          {currentPage === 'about' && (
            <AboutPage language={language} onNavigate={handleNavigate} />
          )}
          {currentPage === 'services' && (
            <CitizenServicesPage language={language} onNavigate={handleNavigate} />
          )}
          {currentPage === 'lodge' && (
            <LodgeGrievancePage
              language={language}
              firebaseUser={firebaseUser}
              onSubmitted={() => void refreshStats()}
              onTrackRef={handleQuickTrack}
            />
          )}
          {currentPage === 'track' && (
            <TrackGrievancePage
              language={language}
              initialRef={trackRefTarget}
              liveUpdatedRecord={liveUpdatedRecord}
            />
          )}
          {currentPage === 'departments' && (
            <DepartmentDirectoryPage language={language} onNavigate={handleNavigate} />
          )}
          {currentPage === 'help' && <HelpSupportPage language={language} />}
          {currentPage === 'contact' && <ContactUsPage language={language} />}
          {currentPage === 'admin' && (
            <AdminPortalPage
              language={language}
              session={adminSession}
              onSessionChange={setAdminSession}
              liveUpdatedRecord={liveUpdatedRecord}
              liveCreatedRecord={liveCreatedRecord}
            />
          )}
          {currentPage === 'worker' && (
            <WorkerPortalPage
              language={language}
              session={workerSession}
              onSessionChange={setWorkerSession}
              liveUpdatedRecord={liveUpdatedRecord}
            />
          )}
        </main>

        <PortalFooter language={language} onNavigate={handleNavigate} />
      </div>
    </ErrorBoundary>
  );
}
