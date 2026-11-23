import {
  CheckCircle2,
  Clock,
  FileCheck2,
  Hammer,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import type { GrievanceStatus } from '../types/portal';

const STATUS_META: Record<
  GrievanceStatus,
  { classes: string; icon: typeof Clock; labelHi: string }
> = {
  Registered: {
    classes: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: FileCheck2,
    labelHi: 'पंजीकृत',
  },
  Assigned: {
    classes: 'bg-blue-50 text-[#123B70] border-blue-300',
    icon: Clock,
    labelHi: 'विभाग को आवंटित',
  },
  Dispatched: {
    classes: 'bg-amber-50 text-amber-900 border-[#F28C28]',
    icon: Navigation,
    labelHi: 'फील्ड टीम रवाना',
  },
  'In Progress': {
    classes: 'bg-orange-50 text-orange-900 border-[#F28C28]',
    icon: Hammer,
    labelHi: 'कार्य प्रगति पर',
  },
  Resolved: {
    classes: 'bg-emerald-50 text-[#138808] border-[#138808]',
    icon: CheckCircle2,
    labelHi: 'निस्तारित',
  },
  Closed: {
    classes: 'bg-green-100 text-green-950 border-[#138808]',
    icon: ShieldCheck,
    labelHi: 'बंद एवं सत्यापित',
  },
};

export function StatusBadge({
  status,
  lang = 'en',
}: {
  status: GrievanceStatus;
  lang?: 'en' | 'hi';
}) {
  const meta = STATUS_META[status] || STATUS_META.Registered;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border whitespace-nowrap ${meta.classes}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{lang === 'hi' ? meta.labelHi : status}</span>
    </span>
  );
}
