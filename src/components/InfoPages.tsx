import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Info,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import type { Language, PortalPage } from '../types/portal';
import { DEPARTMENTS, PORTAL_FAQS } from '../data/portalCatalog';

interface InfoPageProps {
  language: Language;
  onNavigate: (page: PortalPage) => void;
}

export function AboutPage({ language, onNavigate }: InfoPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4 flex items-center gap-2.5">
          <Info className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
          <h1 className="text-xl font-bold font-institutional">
            {language === 'hi'
              ? 'लोक सुधार (LokSudhar) पोर्टल का परिचय'
              : 'About LokSudhar (लोक सुधार) — Citizen Grievance Redressal Portal'}
          </h1>
        </div>
        <div className="p-6 space-y-4 text-sm text-slate-800 leading-relaxed">
          <div className="p-4 bg-amber-50 border border-[#F28C28] text-amber-950 font-medium">
            {language === 'hi'
              ? 'महत्वपूर्ण सूचना: लोक सुधार (LokSudhar) एक स्वतंत्र नागरिक-तकनीक प्रोटोटाइप है। यह किसी भी भारत सरकार या राज्य सरकार के मंत्रालय/विभाग से संबद्ध नहीं है।'
              : 'Prototype Notice: LokSudhar (लोक सुधार) is an independent civic-technology prototype designed to model transparent citizen grievance redressal workflows. It is not affiliated with any central, state, or municipal government agency.'}
          </div>
          <p className="font-semibold text-[#123B70]">
            &ldquo;शिकायत आपकी, समाधान प्रशासन का।&rdquo;
          </p>
          <p>
            LokSudhar (लोक सुधार) brings together citizen grievance registration, geo-tagged location verification via interactive Leaflet maps, departmental triage, and field-officer closure evidence in a unified, accessible public service interface.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="border border-slate-300 p-4 bg-[#F4F6F9]">
              <h2 className="font-bold text-[#123B70] mb-1">01. Citizen Filing</h2>
              <p className="text-xs text-slate-700">
                Structured complaint submission with State, District, City selection, GPS pin capture, and photographic evidence.
              </p>
            </div>
            <div className="border border-slate-300 p-4 bg-[#F4F6F9]">
              <h2 className="font-bold text-[#123B70] mb-1">02. Departmental Triage</h2>
              <p className="text-xs text-slate-700">
                Administrators inspect incoming cases, assign responsible civic departments and field officers, and export audit reports.
              </p>
            </div>
            <div className="border border-slate-300 p-4 bg-[#F4F6F9]">
              <h2 className="font-bold text-[#123B70] mb-1">03. Field Verification</h2>
              <p className="text-xs text-slate-700">
                Assigned department engineers view site coordinates, record real-time progress, and upload completion photographs.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('lodge')}
              className="px-5 py-2.5 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] cursor-pointer"
            >
              Lodge a Grievance Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CitizenServicesPage({ language, onNavigate }: InfoPageProps) {
  const services = [
    {
      title: 'Online Citizen Grievance Submission',
      titleHi: 'ऑनलाइन नागरिक शिकायत पंजीकरण',
      desc: 'Submit civic issues with photo uploads, GPS coordinates, and instant Reference Number receipt.',
      actionLabel: 'Open Grievance Form',
      target: 'lodge' as PortalPage,
    },
    {
      title: 'Complaint Status & Evidence Tracking',
      titleHi: 'शिकायत स्थिति एवं समाधान साक्ष्य ट्रैकिंग',
      desc: 'Track real-time action history, assigned department, field engineer details, and completion photos.',
      actionLabel: 'Track by Reference No.',
      target: 'track' as PortalPage,
    },
    {
      title: 'Departmental Nodal Directory & SLA',
      titleHi: 'विभागीय नोडल अधिकारी एवं समय-सीमा',
      desc: 'Inspect participating civic departments, helpline contacts, and Service Level Agreement timelines.',
      actionLabel: 'View Directory',
      target: 'departments' as PortalPage,
    },
    {
      title: 'Citizen Helpdesk & Escalation Matrix',
      titleHi: 'नागरिक सहायता केंद्र एवं अपीलीय स्तर',
      desc: 'Review 3-tier escalation procedures, FAQs, and submit direct portal support inquiries.',
      actionLabel: 'Get Support',
      target: 'help' as PortalPage,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4 flex items-center gap-2.5">
          <ClipboardList className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
          <h1 className="text-xl font-bold font-institutional">
            {language === 'hi' ? 'नागरिक सेवाएं एवं सुविधा केंद्र' : 'Citizen Services Catalog'}
          </h1>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((srv) => (
            <div key={srv.title} className="border border-slate-300 p-5 bg-[#F4F6F9] flex flex-col justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#123B70]">
                  {language === 'hi' ? srv.titleHi : srv.title}
                </h2>
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{srv.desc}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate(srv.target)}
                  className="px-4 py-2 bg-[#123B70] text-white text-xs font-semibold hover:bg-[#0E2F5A] cursor-pointer"
                >
                  {srv.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DepartmentDirectoryPage({ language, onNavigate }: InfoPageProps) {
  const [query, setQuery] = useState('');
  const filtered = DEPARTMENTS.filter((d) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.nameHi.toLowerCase().includes(q) ||
      d.nodalOfficer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
            <h1 className="text-xl font-bold font-institutional">
              {language === 'hi' ? 'विभागीय निर्देशिका' : 'Department & Nodal Officer Directory'}
            </h1>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter department..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 focus:outline-2 focus:outline-[#F28C28]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F4F6F9] border-b border-slate-300 text-xs font-semibold text-slate-700">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Nodal Designation</th>
                <th className="py-3 px-4">Helpline & Email (Prototype)</th>
                <th className="py-3 px-4 text-center">SLA</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#123B70]">
                      {language === 'hi' ? d.nameHi : d.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {d.categories.map((c) => c.en).join(' · ')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-800">
                    {language === 'hi' ? d.nodalOfficerHi : d.nodalOfficer}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 font-mono-tabular">
                    <div>{d.helpline}</div>
                    <div className="text-[#123B70]">{d.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-tabular text-xs font-bold text-[#123B70] whitespace-nowrap">
                    {d.slaDays} Days
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onNavigate('lodge')}
                      className="px-3 py-1.5 bg-[#123B70] text-white text-xs font-semibold hover:bg-[#0E2F5A] cursor-pointer"
                    >
                      File Complaint
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function HelpSupportPage({ language }: { language: Language }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4 flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
          <h1 className="text-xl font-bold font-institutional">
            {language === 'hi' ? 'सहायता, मार्गदर्शन एवं अपीलीय तंत्र' : 'Help, User Guide & Escalation Matrix'}
          </h1>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#123B70] mb-3">
              Three-Tier Grievance Escalation Matrix
            </h2>
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F4F6F9] border-b border-slate-300 text-xs font-semibold text-slate-700">
                    <th className="py-2.5 px-4">Tier</th>
                    <th className="py-2.5 px-4">Authority</th>
                    <th className="py-2.5 px-4">Trigger Window</th>
                    <th className="py-2.5 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#123B70]">Level 1</td>
                    <td className="py-3 px-4">Assigned Department Field Officer & Ward Supervisor</td>
                    <td className="py-3 px-4 font-mono-tabular">0 – 3 Days</td>
                    <td className="py-3 px-4">Site inspection, immediate repair & photo proof</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#123B70]">Level 2</td>
                    <td className="py-3 px-4">Departmental Nodal Officer</td>
                    <td className="py-3 px-4 font-mono-tabular">4 – 7 Days</td>
                    <td className="py-3 px-4">Escalated resource allocation & SLA audit</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#123B70]">Level 3</td>
                    <td className="py-3 px-4">LokSudhar Central Grievance Directorate (Prototype)</td>
                    <td className="py-3 px-4 font-mono-tabular">8+ Days</td>
                    <td className="py-3 px-4">Mandatory review & quality closure verification</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#123B70]">
              Frequently Asked Questions
            </h2>
            <div className="border border-slate-300 divide-y divide-slate-200">
              {PORTAL_FAQS.map((faq, idx) => (
                <details key={faq.id} className="p-4" open={idx === 0}>
                  <summary className="font-semibold text-sm text-[#123B70] cursor-pointer">
                    {idx + 1}. {language === 'hi' ? faq.qHi : faq.qEn}
                  </summary>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                    {language === 'hi' ? faq.aHi : faq.aEn}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactUsPage({ language }: { language: Language }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketNo, setTicketNo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = (await res.json()) as { ticketNo?: string; error?: string };
      if (!res.ok || !data.ticketNo) {
        throw new Error(data.error || 'Unable to submit inquiry.');
      }
      setTicketNo(data.ticketNo);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 border border-slate-300 bg-white">
        <div className="bg-[#123B70] text-white px-5 py-4">
          <h1 className="text-lg font-bold font-institutional">
            {language === 'hi' ? 'संपर्क एवं सहायता केंद्र' : 'Contact Citizen Helpdesk'}
          </h1>
        </div>
        <div className="p-5 space-y-4 text-sm text-slate-800">
          <p className="text-xs bg-amber-50 border border-[#F28C28] p-3 text-amber-950 font-medium">
            Independent LokSudhar (लोक सुधार) Prototype Helpdesk — For workflow demonstration inquiries only.
          </p>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-[#123B70] mt-1 shrink-0" />
            <div>
              <p className="font-semibold">Prototype Helpline</p>
              <p className="text-xs font-mono-tabular text-slate-600">1800-11-4400 (Mon–Sat, 9:30 AM – 6:00 PM)</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-[#123B70] mt-1 shrink-0" />
            <div>
              <p className="font-semibold">Portal Support Desk</p>
              <p className="text-xs font-mono-tabular text-slate-600">helpdesk@loksudhar-prototype.org</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 border border-slate-300 bg-white">
        <div className="bg-[#F4F6F9] border-b border-slate-300 px-5 py-3.5">
          <h2 className="text-base font-bold text-[#123B70] font-institutional">
            Submit Portal Inquiry / Feedback
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {ticketNo && (
            <div className="p-3 bg-emerald-50 border border-[#138808] text-emerald-950 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Inquiry recorded. Reference Ticket: <strong className="font-mono-tabular">{ticketNo}</strong>
              </span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-900 text-sm">
              {errorMsg}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Message *</label>
            <textarea
              required
              minLength={10}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#123B70] text-white text-sm font-semibold hover:bg-[#0E2F5A] disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Sending...' : 'Submit Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
