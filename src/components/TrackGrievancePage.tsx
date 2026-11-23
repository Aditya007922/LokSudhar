import { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Printer,
  Search,
  UserCheck,
} from 'lucide-react';
import type { GrievanceRecord, Language } from '../types/portal';
import { TRANSLATIONS } from '../i18n/translations';
import { StatusBadge } from './StatusBadge';
import { LeafletMap } from './LeafletMap';

interface RecentRefItem {
  referenceNumber: string;
  title: string;
  department: string;
  status: GrievanceRecord['status'];
  city: string;
  state: string;
}

interface TrackGrievancePageProps {
  language: Language;
  initialRef?: string;
  liveUpdatedRecord?: GrievanceRecord | null;
}

export function TrackGrievancePage({
  language,
  initialRef,
  liveUpdatedRecord,
}: TrackGrievancePageProps) {
  const t = TRANSLATIONS[language];
  const [refInput, setRefInput] = useState(initialRef || '');
  const [record, setRecord] = useState<GrievanceRecord | null>(null);
  const [recentRefs, setRecentRefs] = useState<RecentRefItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchByReference = async (refNumber: string) => {
    const trimmed = refNumber.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/grievances/track/${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as GrievanceRecord & { error?: string };
      if (!res.ok) {
        setRecord(null);
        throw new Error(data.error || 'Grievance not found.');
      }
      setRecord(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to fetch grievance status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetch('/api/grievances/recent-refs')
      .then((r) => r.json())
      .then((items: RecentRefItem[]) => {
        if (Array.isArray(items)) setRecentRefs(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      void fetchByReference(initialRef);
    }
  }, [initialRef]);

  useEffect(() => {
    if (
      liveUpdatedRecord &&
      record &&
      liveUpdatedRecord.referenceNumber === record.referenceNumber
    ) {
      setRecord(liveUpdatedRecord);
    }
  }, [liveUpdatedRecord]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchByReference(refInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4">
          <h1 className="text-xl font-bold font-institutional">{t.trackTitle}</h1>
          <p className="text-xs text-slate-200 mt-0.5">{t.trackSubtitle}</p>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <label htmlFor="track-ref-input" className="sr-only">
              Complaint Reference Number
            </label>
            <input
              id="track-ref-input"
              type="text"
              required
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Enter Complaint Reference Number (e.g. LKS-2026-100421)"
              className="flex-1 px-3 py-2.5 text-sm border border-slate-400 font-mono-tabular focus:outline-2 focus:outline-[#123B70]"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] disabled:opacity-60 cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Searching...' : 'Search Status'}</span>
            </button>
          </form>

          {recentRefs.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">
                {language === 'hi'
                  ? 'त्वरित जांच हेतु हाल की संदर्भ संख्याएं:'
                  : 'Recent Public Reference Numbers (click to inspect):'}
              </p>
              <div className="flex flex-wrap gap-2">
                {recentRefs.map((item) => (
                  <button
                    key={item.referenceNumber}
                    type="button"
                    onClick={() => {
                      setRefInput(item.referenceNumber);
                      void fetchByReference(item.referenceNumber);
                    }}
                    className="px-2.5 py-1 text-xs font-mono-tabular bg-[#F4F6F9] border border-slate-300 text-[#123B70] hover:bg-blue-50 hover:border-[#123B70] cursor-pointer"
                  >
                    {item.referenceNumber} ({item.status})
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-300 text-sm text-red-900 font-medium"
            >
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Grievance Dossier */}
      {record && (
        <div className="border border-slate-300 bg-white">
          <div className="bg-[#F4F6F9] border-b border-slate-300 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600">
                LOKSUDHAR (लोक सुधार) GRIEVANCE DOSSIER
              </p>
              <h2 className="text-xl font-bold text-[#123B70] font-mono-tabular">
                {record.referenceNumber}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={record.status} lang={language} />
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer no-print"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Summary Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border border-slate-300 p-4 bg-[#F4F6F9] text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Submission Date</span>
                </p>
                <p className="font-mono-tabular text-xs font-semibold text-slate-900 mt-1">
                  {new Date(record.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Department Assigned</p>
                <p className="text-xs font-semibold text-[#123B70] mt-1">
                  {record.assignedDepartment || record.department}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Assigned Field Officer</span>
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-1">
                  {record.assignedWorkerName
                    ? `${record.assignedWorkerName} (${record.assignedWorkerId})`
                    : 'Awaiting Officer Assignment'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Jurisdiction</span>
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-1">
                  {record.city}, {record.district}, {record.state}
                </p>
              </div>
            </div>

            {/* Complaint Description & Map Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="border border-slate-300 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    {record.category} · Priority: {record.priority}
                  </p>
                  <h3 className="text-lg font-bold text-[#123B70]">{record.title}</h3>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {record.description}
                  </p>
                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                    Reported by: <span className="font-semibold">{record.citizenName}</span> (
                    <span className="font-mono-tabular">{record.citizenPhone}</span>)
                  </p>
                </div>

                {/* Citizen Submitted Photos */}
                {record.photoUrls.length > 0 && (
                  <div className="border border-slate-300 p-4">
                    <h4 className="text-sm font-bold text-[#123B70] mb-3">
                      Complainant Submitted Photographs
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {record.photoUrls.map((url, idx) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Complainant photograph ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-32 object-cover border border-slate-300"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Evidence */}
                <div className="border border-slate-300 p-4 bg-[#F4F6F9]">
                  <h4 className="text-sm font-bold text-[#123B70] mb-2">
                    Resolution Remarks & Field Evidence
                  </h4>
                  {record.resolutionNotes ? (
                    <p className="text-sm text-slate-800 mb-3">{record.resolutionNotes}</p>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Resolution remarks will appear here once field action is recorded.
                    </p>
                  )}
                  {record.resolutionPhotoUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {record.resolutionPhotoUrls.map((url, idx) => (
                        <figure key={url} className="border border-slate-300 bg-white p-1">
                          <img
                            src={url}
                            alt={`Resolution evidence ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-32 object-cover"
                          />
                          <figcaption className="text-[11px] text-slate-600 mt-1">
                            Completion Evidence #{idx + 1}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <LeafletMap
                  latitude={record.latitude}
                  longitude={record.longitude}
                  interactive={false}
                  label={`${record.referenceNumber} — ${record.addressLabel}`}
                  heightClass="h-80"
                />
                <p className="text-xs text-slate-600 mt-2">
                  Address / Landmark: {record.addressLabel}
                </p>
              </div>
            </div>

            {/* Structured Status History Table */}
            <div className="border border-slate-300">
              <div className="bg-[#123B70] text-white px-4 py-2.5 text-sm font-bold">
                Official Action & Status History
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700">
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4">Stage / Status</th>
                      <th className="py-2.5 px-4">Action By</th>
                      <th className="py-2.5 px-4">Official Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.history.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono-tabular text-xs text-slate-700 whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <StatusBadge status={entry.status} lang={language} />
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-800 whitespace-nowrap">
                          {entry.updatedByName} ({entry.updatedByRole.toUpperCase()})
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-800">{entry.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
