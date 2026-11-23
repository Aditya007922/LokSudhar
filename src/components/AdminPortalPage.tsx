import { useEffect, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Lock,
  LogOut,
  Printer,
  Shield,
  UserCheck,
} from 'lucide-react';
import type {
  GrievanceRecord,
  GrievanceStatus,
  Language,
  PortalSession,
  WorkerProfile,
} from '../types/portal';
import { DEPARTMENTS, INDIA_LOCATIONS } from '../data/portalCatalog';
import { TRANSLATIONS } from '../i18n/translations';
import { StatusBadge } from './StatusBadge';
import { LeafletMap } from './LeafletMap';
import { LokSudharBrand } from './LokSudharBrand';
import { signInWithGoogleCitizen } from '../lib/firebase';

interface AdminPortalPageProps {
  language: Language;
  session: PortalSession | null;
  onSessionChange: (session: PortalSession | null) => void;
  liveUpdatedRecord: GrievanceRecord | null;
  liveCreatedRecord: GrievanceRecord | null;
}

interface PortalAuthStatus {
  adminEnvConfigured: boolean;
  adminClaimed: boolean;
}

export function AdminPortalPage({
  language,
  session,
  onSessionChange,
  liveUpdatedRecord,
  liveCreatedRecord,
}: AdminPortalPageProps) {
  const t = TRANSLATIONS[language];
  const [authStatus, setAuthStatus] = useState<PortalAuthStatus | null>(null);
  const [officerName, setOfficerName] = useState('Chief Grievance Officer');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [grievances, setGrievances] = useState<GrievanceRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [nextStatus, setNextStatus] = useState<GrievanceStatus>('Assigned');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    void fetch('/api/auth/portal-status')
      .then((r) => r.json())
      .then((d: PortalAuthStatus) => setAuthStatus(d))
      .catch(() => setAuthStatus({ adminEnvConfigured: false, adminClaimed: false }));
  }, []);

  const fetchAdminData = async (activeSession: PortalSession) => {
    setLoadingList(true);
    try {
      const [gRes, wRes] = await Promise.all([
        fetch('/api/grievances', {
          headers: { Authorization: `Bearer ${activeSession.token}` },
        }),
        fetch('/api/workers'),
      ]);
      const gData = (await gRes.json()) as GrievanceRecord[];
      const wData = (await wRes.json()) as WorkerProfile[];
      if (Array.isArray(gData)) setGrievances(gData);
      if (Array.isArray(wData)) setWorkers(wData);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (session && session.role === 'admin') {
      void fetchAdminData(session);
    }
  }, [session]);

  useEffect(() => {
    if (!session || session.role !== 'admin') return;
    if (liveCreatedRecord) {
      setGrievances((prev) =>
        prev.some((g) => g.id === liveCreatedRecord.id)
          ? prev
          : [liveCreatedRecord, ...prev]
      );
    }
  }, [liveCreatedRecord]);

  useEffect(() => {
    if (!session || session.role !== 'admin') return;
    if (liveUpdatedRecord) {
      setGrievances((prev) =>
        prev.map((g) => (g.id === liveUpdatedRecord.id ? liveUpdatedRecord : g))
      );
    }
  }, [liveUpdatedRecord]);

  const selectedGrievance = grievances.find((g) => g.id === selectedId) || null;

  useEffect(() => {
    if (selectedGrievance) {
      setAssignDept(selectedGrievance.assignedDepartment || selectedGrievance.department);
      setAssignWorkerId(selectedGrievance.assignedWorkerId || '');
      setAssignRemarks('');
      setNextStatus(selectedGrievance.status);
      setStatusRemarks('');
      setResolutionNotes(selectedGrievance.resolutionNotes || '');
      setActionMsg('');
    }
  }, [selectedId]);

  const needsFirstRunClaim =
    authStatus !== null && !authStatus.adminEnvConfigured && !authStatus.adminClaimed;

  const handlePasscodeAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      const endpoint = needsFirstRunClaim ? '/api/auth/admin/claim' : '/api/auth/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName, passcode }),
      });
      const data = (await res.json()) as PortalSession & { error?: string };
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Authentication failed.');
      }
      onSessionChange(data);
      setPasscode('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to authenticate.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleAdminVerify = async () => {
    setAuthError('');
    setAuthBusy(true);
    try {
      const user = await signInWithGoogleCitizen();
      const idToken = await user.getIdToken();
      const res = await fetch('/api/auth/firebase-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role: 'admin' }),
      });
      const data = (await res.json()) as PortalSession & { error?: string };
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Google administrator verification failed.');
      }
      onSessionChange(data);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In verification failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedGrievance) return;
    setActionBusy(true);
    setActionMsg('');
    try {
      const res = await fetch(`/api/grievances/${selectedGrievance.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          assignedDepartment: assignDept,
          assignedWorkerId: assignWorkerId,
          remarks: assignRemarks,
        }),
      });
      const updated = (await res.json()) as GrievanceRecord & { error?: string };
      if (!res.ok) throw new Error(updated.error || 'Assignment failed.');
      setGrievances((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setActionMsg('Department & field officer assignment recorded.');
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to assign.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedGrievance) return;
    setActionBusy(true);
    setActionMsg('');
    try {
      const res = await fetch(`/api/grievances/${selectedGrievance.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          remarks: statusRemarks || `Administrative status updated to ${nextStatus}.`,
          resolutionNotes,
        }),
      });
      const updated = (await res.json()) as GrievanceRecord & { error?: string };
      if (!res.ok) throw new Error(updated.error || 'Status update failed.');
      setGrievances((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setActionMsg(`Grievance status updated to ${updated.status}.`);
      setStatusRemarks('');
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (!session) return;
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (deptFilter !== 'ALL') params.set('department', deptFilter);
    const res = await fetch(`/api/reports/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loksudhar-admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!session || session.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="border border-slate-300 bg-white">
          <div className="p-4 border-b border-slate-200 bg-[#F4F6F9]">
            <LokSudharBrand variant="compact" />
          </div>
          <div className="bg-[#123B70] text-white px-5 py-3.5 flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
            <div>
              <h1 className="text-lg font-bold font-institutional">
                {needsFirstRunClaim
                  ? 'First-Run Administrator Setup'
                  : 'Secure Administrator Portal Login'}
              </h1>
              <p className="text-xs text-slate-200">
                Authorized Grievance Redressal Officers Only
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {authError && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-300 text-xs text-red-900 font-medium"
              >
                {authError}
              </div>
            )}

            {needsFirstRunClaim && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-xs text-amber-950">
                No server administrator passcode is configured yet. Create your Administrator passcode below to claim and lock portal access.
              </div>
            )}

            <form onSubmit={handlePasscodeAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Officer Name / Designation
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {needsFirstRunClaim
                    ? 'Set Administrator Passcode (min 6 characters)'
                    : 'Administrator Passcode'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secure passcode"
                  className="w-full px-3 py-2 text-sm border border-slate-300 font-mono-tabular"
                />
              </div>
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-2.5 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] disabled:opacity-60 cursor-pointer"
              >
                {authBusy
                  ? 'Verifying...'
                  : needsFirstRunClaim
                    ? 'Claim & Enter Admin Portal'
                    : 'Login to Admin Console'}
              </button>
            </form>

            <div className="border-t border-slate-200 pt-4 text-center space-y-2">
              <p className="text-xs text-slate-600">
                Or authenticate via verified Firebase Administrator Google account:
              </p>
              <button
                type="button"
                onClick={handleGoogleAdminVerify}
                disabled={authBusy}
                className="w-full py-2 bg-white border border-slate-400 text-[#123B70] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Sign In with Authorized Google Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredGrievances = grievances.filter((g) => {
    if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
    if (deptFilter !== 'ALL' && g.department !== deptFilter && g.assignedDepartment !== deptFilter) {
      return false;
    }
    if (stateFilter !== 'ALL' && g.state !== stateFilter) return false;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const hay = `${g.referenceNumber} ${g.title} ${g.citizenName} ${g.city} ${g.district}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const pendingCount = grievances.filter((g) => g.status === 'Registered' || g.status === 'Assigned').length;
  const inProgressCount = grievances.filter(
    (g) => g.status === 'Dispatched' || g.status === 'In Progress'
  ).length;
  const resolvedCount = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Console Header */}
      <div className="bg-[#123B70] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4 border border-slate-300">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#F28C28] shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold font-institutional">{t.adminTitle}</h1>
            <p className="text-xs text-slate-200">
              Logged in as: <strong>{session.officerName}</strong> ({session.officerId})
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#123B70] text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV Report</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E2F5A] border border-blue-300 text-white text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={() => onSessionChange(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white text-xs font-semibold hover:bg-red-800 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-300 bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-600">Total Register</p>
          <p className="text-2xl font-bold font-mono-tabular text-[#123B70] mt-1">
            {grievances.length}
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-600">Pending / Assigned</p>
          <p className="text-2xl font-bold font-mono-tabular text-[#B45309] mt-1">
            {pendingCount}
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-600">Field Action Underway</p>
          <p className="text-2xl font-bold font-mono-tabular text-[#123B70] mt-1">
            {inProgressCount}
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-600">Resolved & Closed</p>
          <p className="text-2xl font-bold font-mono-tabular text-[#138808] mt-1">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border border-slate-300 bg-[#F4F6F9] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search Ref No., Citizen, City..."
          className="px-3 py-2 text-xs bg-white border border-slate-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300"
        >
          <option value="ALL">All Statuses</option>
          <option value="Registered">Registered</option>
          <option value="Assigned">Assigned</option>
          <option value="Dispatched">Dispatched</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300"
        >
          <option value="ALL">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300"
        >
          <option value="ALL">All States / UTs</option>
          {INDIA_LOCATIONS.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state}
            </option>
          ))}
        </select>
      </div>

      {/* Main Split: Grievance Register Table & Case Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${selectedGrievance ? 'lg:col-span-7' : 'lg:col-span-12'} border border-slate-300 bg-white`}>
          <div className="bg-[#F4F6F9] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#123B70]" aria-hidden="true" />
              <h2 className="text-sm font-bold text-[#123B70]">
                Grievance Register ({filteredGrievances.length})
              </h2>
            </div>
            {loadingList && <span className="text-xs text-slate-500">Refreshing...</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#123B70] text-white">
                  <th className="py-2.5 px-3">Ref No.</th>
                  <th className="py-2.5 px-3">Citizen & Location</th>
                  <th className="py-2.5 px-3">Department / Subject</th>
                  <th className="py-2.5 px-3">Assigned Officer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right no-print">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGrievances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-600">
                      No grievances match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGrievances.map((g) => (
                    <tr
                      key={g.id}
                      className={`hover:bg-blue-50/50 ${
                        selectedId === g.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono-tabular font-semibold text-[#123B70] whitespace-nowrap">
                        {g.referenceNumber}
                        <div className="text-[11px] font-normal text-slate-500">
                          {new Date(g.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{g.citizenName}</div>
                        <div className="text-slate-600">
                          {g.city}, {g.state}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{g.title}</div>
                        <div className="text-slate-600 truncate">
                          {g.assignedDepartment || g.department}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-800 whitespace-nowrap">
                        {g.assignedWorkerName || (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={g.status} lang={language} />
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap no-print">
                        <button
                          type="button"
                          onClick={() => setSelectedId(g.id)}
                          className="px-2.5 py-1 bg-[#123B70] text-white font-semibold hover:bg-[#0E2F5A] cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedGrievance && (
          <div className="lg:col-span-5 border border-slate-300 bg-white space-y-4 p-4 no-print">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-mono-tabular font-bold text-[#123B70]">
                  {selectedGrievance.referenceNumber}
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedGrievance.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-xs text-slate-600 underline cursor-pointer"
              >
                Close
              </button>
            </div>

            {actionMsg && (
              <div className="p-2.5 bg-emerald-50 border border-[#138808] text-emerald-950 text-xs font-medium">
                {actionMsg}
              </div>
            )}

            <div className="text-xs text-slate-800 space-y-1 bg-[#F4F6F9] border border-slate-200 p-3">
              <p>
                <strong>Citizen:</strong> {selectedGrievance.citizenName} (
                {selectedGrievance.citizenPhone})
              </p>
              <p>
                <strong>Location:</strong> {selectedGrievance.addressLabel}
              </p>
              <p className="pt-1 text-slate-700">{selectedGrievance.description}</p>
            </div>

            <LeafletMap
              latitude={selectedGrievance.latitude}
              longitude={selectedGrievance.longitude}
              interactive={false}
              heightClass="h-44"
            />

            {/* Evidence Review */}
            {(selectedGrievance.photoUrls.length > 0 ||
              selectedGrievance.resolutionPhotoUrls.length > 0) && (
              <div className="border border-slate-200 p-3 space-y-2">
                <p className="text-xs font-bold text-[#123B70]">
                  Attached & Resolution Evidence Review
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedGrievance.photoUrls.map((u) => (
                    <img
                      key={u}
                      src={u}
                      alt="Citizen upload"
                      referrerPolicy="no-referrer"
                      className="w-full h-20 object-cover border border-slate-300"
                    />
                  ))}
                  {selectedGrievance.resolutionPhotoUrls.map((u) => (
                    <img
                      key={u}
                      src={u}
                      alt="Officer resolution evidence"
                      referrerPolicy="no-referrer"
                      className="w-full h-20 object-cover border-2 border-[#138808]"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Assign Department & Worker */}
            <form onSubmit={handleAssignSubmit} className="border border-slate-300 p-3 space-y-3">
              <h4 className="text-xs font-bold text-[#123B70] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Assign Department & Field Officer</span>
              </h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Department Field Officer
                </label>
                <select
                  value={assignWorkerId}
                  onChange={(e) => setAssignWorkerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white"
                >
                  <option value="">-- Select Field Officer --</option>
                  {workers.map((w) => (
                    <option key={w.workerId} value={w.workerId}>
                      {w.name} ({w.workerId}) — {w.department}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={assignRemarks}
                onChange={(e) => setAssignRemarks(e.target.value)}
                placeholder="Assignment directive / remarks"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300"
              />
              <button
                type="submit"
                disabled={actionBusy}
                className="w-full py-2 bg-[#123B70] text-white text-xs font-semibold hover:bg-[#0E2F5A] cursor-pointer"
              >
                Save Assignment
              </button>
            </form>

            {/* Status Update */}
            <form onSubmit={handleStatusUpdate} className="border border-slate-300 p-3 space-y-3">
              <h4 className="text-xs font-bold text-[#123B70]">
                Update Official Status & Closure Verification
              </h4>
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as GrievanceStatus)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white"
              >
                <option value="Registered">Registered</option>
                <option value="Assigned">Assigned</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed (Verified)</option>
              </select>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Official resolution summary"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300"
              />
              <input
                type="text"
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="Audit log remarks"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300"
              />
              <button
                type="submit"
                disabled={actionBusy}
                className="w-full py-2 bg-[#138808] text-white text-xs font-semibold hover:bg-green-800 cursor-pointer"
              >
                Update Status
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
