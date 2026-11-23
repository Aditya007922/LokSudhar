import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  LogOut,
  MapPin,
  Upload,
} from 'lucide-react';
import type {
  GrievanceRecord,
  GrievanceStatus,
  Language,
  PortalSession,
  WorkerProfile,
} from '../types/portal';
import { TRANSLATIONS } from '../i18n/translations';
import { StatusBadge } from './StatusBadge';
import { LeafletMap } from './LeafletMap';
import { LokSudharBrand } from './LokSudharBrand';

interface WorkerPortalPageProps {
  language: Language;
  session: PortalSession | null;
  onSessionChange: (session: PortalSession | null) => void;
  liveUpdatedRecord: GrievanceRecord | null;
}

interface PortalAuthStatus {
  workerEnvConfigured: boolean;
  workerClaimed: boolean;
}

export function WorkerPortalPage({
  language,
  session,
  onSessionChange,
  liveUpdatedRecord,
}: WorkerPortalPageProps) {
  const t = TRANSLATIONS[language];
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [authStatus, setAuthStatus] = useState<PortalAuthStatus | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [assignedList, setAssignedList] = useState<GrievanceRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<GrievanceStatus>('In Progress');
  const [remarks, setRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    void Promise.all([
      fetch('/api/workers').then((r) => r.json()),
      fetch('/api/auth/portal-status').then((r) => r.json()),
    ])
      .then(([wData, aData]: [WorkerProfile[], PortalAuthStatus]) => {
        if (Array.isArray(wData)) {
          setWorkers(wData);
          if (wData.length > 0) setSelectedWorkerId(wData[0].workerId);
        }
        setAuthStatus(aData);
      })
      .catch(() => {});
  }, []);

  const loadAssigned = async (activeSession: PortalSession) => {
    const res = await fetch(
      `/api/grievances?assignedWorkerId=${encodeURIComponent(activeSession.officerId)}`,
      {
        headers: { Authorization: `Bearer ${activeSession.token}` },
      }
    );
    const data = (await res.json()) as GrievanceRecord[];
    if (Array.isArray(data)) {
      setAssignedList(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    }
  };

  useEffect(() => {
    if (session && session.role === 'worker') {
      void loadAssigned(session);
    }
  }, [session]);

  useEffect(() => {
    if (!session || session.role !== 'worker' || !liveUpdatedRecord) return;
    if (liveUpdatedRecord.assignedWorkerId === session.officerId) {
      setAssignedList((prev) => {
        const exists = prev.some((g) => g.id === liveUpdatedRecord.id);
        return exists
          ? prev.map((g) => (g.id === liveUpdatedRecord.id ? liveUpdatedRecord : g))
          : [liveUpdatedRecord, ...prev];
      });
    }
  }, [liveUpdatedRecord]);

  const activeGrievance = assignedList.find((g) => g.id === selectedId) || null;

  useEffect(() => {
    if (activeGrievance) {
      setProgressStatus(
        activeGrievance.status === 'Assigned' ? 'Dispatched' : activeGrievance.status
      );
      setResolutionNotes(activeGrievance.resolutionNotes || '');
      setRemarks('');
      setUploadedPhotos([]);
      setFeedbackMsg('');
    }
  }, [selectedId]);

  const needsClaim =
    authStatus !== null && !authStatus.workerEnvConfigured && !authStatus.workerClaimed;

  const handleWorkerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      const endpoint = needsClaim ? '/api/auth/worker/claim' : '/api/auth/worker/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: selectedWorkerId, passcode }),
      });
      const data = (await res.json()) as PortalSession & { error?: string };
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Department officer authentication failed.');
      }
      onSessionChange(data);
      setPasscode('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedbackMsg('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed.');
      setUploadedPhotos((prev) => [...prev, data.url!]);
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !activeGrievance) return;
    setSaving(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/grievances/${activeGrievance.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          status: progressStatus,
          remarks: remarks || `Department field officer updated status to ${progressStatus}.`,
          resolutionNotes,
          resolutionPhotoUrls: uploadedPhotos,
        }),
      });
      const updated = (await res.json()) as GrievanceRecord & { error?: string };
      if (!res.ok) throw new Error(updated.error || 'Unable to save field update.');
      setAssignedList((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setUploadedPhotos([]);
      setRemarks('');
      setFeedbackMsg('Field progress & completion evidence saved and broadcast live.');
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Failed to update progress.');
    } finally {
      setSaving(false);
    }
  };

  if (!session || session.role !== 'worker') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="border border-slate-300 bg-white">
          <div className="p-4 border-b border-slate-200 bg-[#F4F6F9]">
            <LokSudharBrand variant="compact" />
          </div>
          <div className="bg-[#123B70] text-white px-5 py-3.5 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
            <div>
              <h1 className="text-lg font-bold font-institutional">
                {needsClaim
                  ? 'First-Run Department Officer Setup'
                  : 'Department & Field Officer Login'}
              </h1>
              <p className="text-xs text-slate-200">
                Select your registered Officer ID to access assigned complaints
              </p>
            </div>
          </div>

          <form onSubmit={handleWorkerLogin} className="p-6 space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-900">
                {authError}
              </div>
            )}
            {needsClaim && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-xs text-amber-950">
                No department officer passcode is configured yet. Set a passcode below to activate Department Portal access.
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Registered Department Field Officer
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 bg-white"
              >
                {workers.map((w) => (
                  <option key={w.workerId} value={w.workerId}>
                    {w.name} ({w.workerId}) — {w.department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {needsClaim ? 'Set Department Portal Passcode (min 6 chars)' : 'Officer Passcode'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter department officer passcode"
                className="w-full px-3 py-2 text-sm border border-slate-300 font-mono-tabular"
              />
            </div>
            <button
              type="submit"
              disabled={authBusy || !selectedWorkerId}
              className="w-full py-2.5 bg-[#138808] text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 cursor-pointer"
            >
              {authBusy
                ? 'Authenticating...'
                : needsClaim
                  ? 'Activate & Enter Department Portal'
                  : 'Login to Department Queue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-[#123B70] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4 border border-slate-300">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold font-institutional">{t.workerTitle}</h1>
            <p className="text-xs text-slate-200">
              Department Officer: <strong>{session.officerName}</strong> ({session.officerId}) ·{' '}
              {session.department}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSessionChange(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white text-xs font-semibold hover:bg-red-800 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assigned Tasks List */}
        <div className="lg:col-span-5 border border-slate-300 bg-white">
          <div className="bg-[#F4F6F9] border-b border-slate-300 px-4 py-3">
            <h2 className="text-sm font-bold text-[#123B70]">
              Assigned Grievances ({assignedList.length})
            </h2>
          </div>
          {assignedList.length === 0 ? (
            <div className="p-6 text-sm text-slate-600 text-center">
              No grievances are currently assigned to {session.officerId}. Ask an Administrator in the Admin Portal to assign tasks.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {assignedList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 hover:bg-blue-50 cursor-pointer space-y-1.5 ${
                    selectedId === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-xs font-bold text-[#123B70]">
                      {item.referenceNumber}
                    </span>
                    <StatusBadge status={item.status} lang={language} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {item.city}, {item.district}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Grievance Field Action Panel */}
        <div className="lg:col-span-7">
          {activeGrievance ? (
            <div className="border border-slate-300 bg-white p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono-tabular font-bold text-[#123B70]">
                    {activeGrievance.referenceNumber}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{activeGrievance.title}</h3>
                </div>
                <StatusBadge status={activeGrievance.status} lang={language} />
              </div>

              <div className="text-sm text-slate-800 bg-[#F4F6F9] border border-slate-200 p-3 space-y-1">
                <p>
                  <strong>Category:</strong> {activeGrievance.category}
                </p>
                <p>
                  <strong>Site Address:</strong> {activeGrievance.addressLabel}
                </p>
                <p className="pt-1 text-xs text-slate-700">{activeGrievance.description}</p>
              </div>

              <LeafletMap
                latitude={activeGrievance.latitude}
                longitude={activeGrievance.longitude}
                interactive={false}
                label={activeGrievance.addressLabel}
                heightClass="h-60"
              />

              <form onSubmit={handleProgressSubmit} className="border border-slate-300 p-4 space-y-4">
                <h4 className="text-sm font-bold text-[#123B70]">
                  Record Field Progress & Upload Completion Photographs
                </h4>

                {feedbackMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-[#138808] text-emerald-950 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Field Stage
                    </label>
                    <select
                      value={progressStatus}
                      onChange={(e) => setProgressStatus(e.target.value as GrievanceStatus)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 bg-white"
                    >
                      <option value="Dispatched">Dispatched to Site</option>
                      <option value="In Progress">In Progress (Work Underway)</option>
                      <option value="Resolved">Resolved (Work Completed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Upload Completion Photograph
                    </label>
                    <label className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#F4F6F9] border border-slate-400 text-xs font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Uploading...' : 'Select Completion Photo'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                {(uploadedPhotos.length > 0 || activeGrievance.resolutionPhotoUrls.length > 0) && (
                  <div className="grid grid-cols-3 gap-2">
                    {[...activeGrievance.resolutionPhotoUrls, ...uploadedPhotos].map((u) => (
                      <img
                        key={u}
                        src={u}
                        alt="Field completion evidence"
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover border border-slate-300"
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Field Action Summary / Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe repair work completed or inspection findings"
                    className="w-full px-3 py-2 text-xs border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Timeline Log Remark
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Short status entry note for citizen tracking timeline"
                    className="w-full px-3 py-2 text-xs border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2.5 bg-[#138808] text-white text-xs font-semibold hover:bg-green-800 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Updating...' : 'Submit Field Progress Update'}
                </button>
              </form>
            </div>
          ) : (
            <div className="border border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              Select an assigned grievance from the left queue to inspect its map coordinates and update progress.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
