import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Printer,
  Trash2,
  Upload,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { GrievanceRecord, Language } from '../types/portal';
import { DEPARTMENTS, INDIA_LOCATIONS } from '../data/portalCatalog';
import { TRANSLATIONS } from '../i18n/translations';
import { LeafletMap } from './LeafletMap';
import { LokSudharBrand } from './LokSudharBrand';
import { mirrorGrievanceToFirestore } from '../lib/firebase';

interface LodgeGrievancePageProps {
  language: Language;
  firebaseUser: User | null;
  onSubmitted: (record: GrievanceRecord) => void;
  onTrackRef: (refNumber: string) => void;
}

export function LodgeGrievancePage({
  language,
  firebaseUser,
  onSubmitted,
  onTrackRef,
}: LodgeGrievancePageProps) {
  const t = TRANSLATIONS[language];
  const [citizenName, setCitizenName] = useState(firebaseUser?.displayName || '');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState(firebaseUser?.email || '');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  const [stateName, setStateName] = useState(INDIA_LOCATIONS[0].state);
  const [districtName, setDistrictName] = useState(INDIA_LOCATIONS[0].districts[0].district);
  const [cityName, setCityName] = useState(INDIA_LOCATIONS[0].districts[0].cities[0]);
  const [addressLabel, setAddressLabel] = useState('');

  const [latitude, setLatitude] = useState(INDIA_LOCATIONS[0].districts[0].coords[0]);
  const [longitude, setLongitude] = useState(INDIA_LOCATIONS[0].districts[0].coords[1]);

  const [department, setDepartment] = useState(DEPARTMENTS[0].name);
  const [category, setCategory] = useState(DEPARTMENTS[0].categories[0].en);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<GrievanceRecord | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      if (!citizenName && firebaseUser.displayName) setCitizenName(firebaseUser.displayName);
      if (!citizenEmail && firebaseUser.email) setCitizenEmail(firebaseUser.email);
    }
  }, [firebaseUser]);

  const selectedStateObj =
    INDIA_LOCATIONS.find((s) => s.state === stateName) || INDIA_LOCATIONS[0];
  const selectedDistrictObj =
    selectedStateObj.districts.find((d) => d.district === districtName) ||
    selectedStateObj.districts[0];
  const selectedDeptObj =
    DEPARTMENTS.find((d) => d.name === department) || DEPARTMENTS[0];

  const handleStateChange = (nextState: string) => {
    setStateName(nextState);
    const st = INDIA_LOCATIONS.find((s) => s.state === nextState) || INDIA_LOCATIONS[0];
    const dist = st.districts[0];
    setDistrictName(dist.district);
    setCityName(dist.cities[0]);
    setLatitude(dist.coords[0]);
    setLongitude(dist.coords[1]);
  };

  const handleDistrictChange = (nextDistrict: string) => {
    setDistrictName(nextDistrict);
    const dist =
      selectedStateObj.districts.find((d) => d.district === nextDistrict) ||
      selectedStateObj.districts[0];
    setCityName(dist.cities[0]);
    setLatitude(dist.coords[0]);
    setLongitude(dist.coords[1]);
  };

  const handleDepartmentChange = (nextDept: string) => {
    setDepartment(nextDept);
    const found = DEPARTMENTS.find((d) => d.name === nextDept) || DEPARTMENTS[0];
    setCategory(found.categories[0].en);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photoUrls.length >= 3) {
      setErrorMsg('Maximum 3 photographs may be attached to one grievance.');
      return;
    }

    setErrorMsg('');
    setUploadingPhoto(true);
    try {
      const file = files[0];
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read selected file.'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Upload failed.');
      }
      setPhotoUrls((prev) => [...prev, json.url!]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload photograph.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenUid: firebaseUser?.uid,
          citizenName,
          citizenPhone,
          citizenEmail,
          priority,
          state: stateName,
          district: districtName,
          city: cityName,
          addressLabel: addressLabel || `${cityName}, ${districtName}, ${stateName}`,
          latitude,
          longitude,
          department,
          category,
          title,
          description,
          photoUrls,
        }),
      });
      const data = (await res.json()) as GrievanceRecord & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Unable to submit grievance.');
      }

      if (firebaseUser) {
        void mirrorGrievanceToFirestore({
          referenceNumber: data.referenceNumber,
          citizenName: data.citizenName,
          state: data.state,
          district: data.district,
          city: data.city,
          department: data.department,
          category: data.category,
          title: data.title,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          addressLabel: data.addressLabel,
          photoCount: data.photoUrls.length,
        }).catch(() => {
          // Best-effort Firestore mirror when signed in
        });
      }

      setReceipt(data);
      onSubmitted(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-[#123B70] bg-white p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 pb-4">
            <div className="space-y-2">
              <LokSudharBrand variant="compact" />
              <div className="flex items-center gap-2 pt-1">
                <CheckCircle2 className="w-5 h-5 text-[#138808]" aria-hidden="true" />
                <h1 className="text-lg font-bold text-[#123B70]">
                  {language === 'hi'
                    ? 'शिकायत सफलतापूर्वक पंजीकृत'
                    : 'Grievance Registration Acknowledgement'}
                </h1>
              </div>
            </div>
            <div className="bg-[#F4F6F9] border border-slate-300 px-4 py-2 text-right">
              <p className="text-[11px] text-slate-600 font-semibold">
                {language === 'hi' ? 'शिकायत संदर्भ संख्या' : 'COMPLAINT REFERENCE NO.'}
              </p>
              <p className="text-lg font-bold font-mono-tabular text-[#123B70]">
                {receipt.referenceNumber}
              </p>
            </div>
          </div>

          <table className="w-full text-sm border-collapse border border-slate-300">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <th className="bg-[#F4F6F9] text-left px-3 py-2 w-48 font-semibold text-slate-700 border-r border-slate-300">
                  Complainant Name
                </th>
                <td className="px-3 py-2 text-slate-900">{receipt.citizenName}</td>
              </tr>
              <tr>
                <th className="bg-[#F4F6F9] text-left px-3 py-2 font-semibold text-slate-700 border-r border-slate-300">
                  Location
                </th>
                <td className="px-3 py-2 text-slate-900">
                  {receipt.city}, {receipt.district}, {receipt.state} (
                  <span className="font-mono-tabular text-xs">
                    {receipt.latitude.toFixed(5)}, {receipt.longitude.toFixed(5)}
                  </span>
                  )
                </td>
              </tr>
              <tr>
                <th className="bg-[#F4F6F9] text-left px-3 py-2 font-semibold text-slate-700 border-r border-slate-300">
                  Department & Category
                </th>
                <td className="px-3 py-2 text-slate-900">
                  {receipt.department} — {receipt.category}
                </td>
              </tr>
              <tr>
                <th className="bg-[#F4F6F9] text-left px-3 py-2 font-semibold text-slate-700 border-r border-slate-300">
                  Subject
                </th>
                <td className="px-3 py-2 text-slate-900 font-medium">{receipt.title}</td>
              </tr>
              <tr>
                <th className="bg-[#F4F6F9] text-left px-3 py-2 font-semibold text-slate-700 border-r border-slate-300">
                  Submission Timestamp
                </th>
                <td className="px-3 py-2 font-mono-tabular text-xs text-slate-700">
                  {new Date(receipt.createdAt).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onTrackRef(receipt.referenceNumber)}
                className="px-4 py-2 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] cursor-pointer"
              >
                Track This Grievance
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-400 text-slate-800 text-sm font-semibold hover:bg-slate-100 cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print Receipt</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setReceipt(null);
                setTitle('');
                setDescription('');
                setPhotoUrls([]);
              }}
              className="text-sm font-semibold text-[#123B70] hover:underline cursor-pointer"
            >
              Lodge Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#F28C28] shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold font-institutional">{t.lodgeTitle}</h1>
            <p className="text-xs text-slate-200 mt-0.5">{t.lodgeSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-300 text-red-900 text-sm font-medium"
            >
              {errorMsg}
            </div>
          )}

          {/* Section 1: Complainant Particulars */}
          <fieldset className="border border-slate-300 p-4 space-y-4">
            <legend className="px-2 text-sm font-bold text-[#123B70]">
              1. {language === 'hi' ? 'शिकायतकर्ता का विवरण' : 'Complainant Particulars'}
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-2 focus:outline-[#123B70]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Mobile Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  minLength={7}
                  maxLength={15}
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 text-sm border border-slate-300 font-mono-tabular focus:outline-2 focus:outline-[#123B70]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  placeholder="name@example.org"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-2 focus:outline-[#123B70]"
                />
              </div>
            </div>
          </fieldset>

          {/* Section 2: Jurisdiction & GPS Location */}
          <fieldset className="border border-slate-300 p-4 space-y-4">
            <legend className="px-2 text-sm font-bold text-[#123B70]">
              2. {language === 'hi' ? 'स्थान एवं जीपीएस विवरण' : 'Jurisdiction & Geo-Tagged Location'}
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  State / UT <span className="text-red-600">*</span>
                </label>
                <select
                  value={stateName}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 bg-white focus:outline-2 focus:outline-[#123B70]"
                >
                  {INDIA_LOCATIONS.map((loc) => (
                    <option key={loc.state} value={loc.state}>
                      {loc.state} ({loc.stateHi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  District <span className="text-red-600">*</span>
                </label>
                <select
                  value={districtName}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 bg-white focus:outline-2 focus:outline-[#123B70]"
                >
                  {selectedStateObj.districts.map((dist) => (
                    <option key={dist.district} value={dist.district}>
                      {dist.district}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  City / Municipal Ward <span className="text-red-600">*</span>
                </label>
                <select
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 bg-white focus:outline-2 focus:outline-[#123B70]"
                >
                  {selectedDistrictObj.cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Street Address / Nearest Landmark
              </label>
              <input
                type="text"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                placeholder="e.g., Near Community Park Gate 2, Sector 4"
                className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-2 focus:outline-[#123B70]"
              />
            </div>

            <LeafletMap
              latitude={latitude}
              longitude={longitude}
              interactive
              label={`${cityName}, ${districtName}`}
              onLocationChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </fieldset>

          {/* Section 3: Department & Grievance Description */}
          <fieldset className="border border-slate-300 p-4 space-y-4">
            <legend className="px-2 text-sm font-bold text-[#123B70]">
              3. {language === 'hi' ? 'विभाग एवं शिकायत विवरण' : 'Department & Grievance Details'}
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Concerned Department <span className="text-red-600">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 bg-white focus:outline-2 focus:outline-[#123B70]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Issue Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 bg-white focus:outline-2 focus:outline-[#123B70]"
                >
                  {selectedDeptObj.categories.map((cat) => (
                    <option key={cat.en} value={cat.en}>
                      {language === 'hi' ? cat.hi : cat.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Urgency Level
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'Normal' | 'High' | 'Urgent')
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 bg-white focus:outline-2 focus:outline-[#123B70]"
                >
                  <option value="Normal">Normal (Standard SLA)</option>
                  <option value="High">High (Public Disruption)</option>
                  <option value="Urgent">Urgent (Safety / Health Hazard)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Grievance Subject / Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                minLength={4}
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the civic issue"
                className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-2 focus:outline-[#123B70]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Detailed Complaint Description <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                minLength={10}
                maxLength={3000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact location, duration of the issue, and impact on residents (minimum 10 characters)"
                className="w-full px-3 py-2 text-sm border border-slate-300 focus:outline-2 focus:outline-[#123B70]"
              />
              <div className="text-right text-xs text-slate-500 font-mono-tabular mt-1">
                {description.length} / 3000
              </div>
            </div>
          </fieldset>

          {/* Section 4: Photographs */}
          <fieldset className="border border-slate-300 p-4 space-y-3">
            <legend className="px-2 text-sm font-bold text-[#123B70]">
              4. {language === 'hi' ? 'फोटोग्राफ प्रमाण अपलोड करें' : 'Supporting Photographs (Optional, Max 3)'}
            </legend>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4F6F9] border border-slate-400 text-xs font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer">
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Select Image (JPEG / PNG / WEBP)'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploadingPhoto || photoUrls.length >= 3}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-slate-500">
                Max 5 MB per photograph. Attached: {photoUrls.length}/3
              </span>
            </div>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {photoUrls.map((url, idx) => (
                  <div key={url} className="border border-slate-300 p-1.5 bg-[#F4F6F9]">
                    <img
                      src={url}
                      alt={`Uploaded grievance evidence ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoUrls((prev) => prev.filter((item) => item !== url))
                      }
                      className="mt-1.5 w-full inline-flex items-center justify-center gap-1 py-1 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              By submitting, you confirm this is a LokSudhar demonstration entry and contains no confidential ID numbers.
            </p>
            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="px-6 py-2.5 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Submitting Grievance...' : 'Submit Grievance & Generate Reference No.'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
