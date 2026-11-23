export type Language = 'en' | 'hi';

export type PortalPage =
  | 'home'
  | 'about'
  | 'services'
  | 'lodge'
  | 'track'
  | 'departments'
  | 'help'
  | 'contact'
  | 'admin'
  | 'worker';

export type GrievanceStatus =
  | 'Registered'
  | 'Assigned'
  | 'Dispatched'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type UserRole = 'citizen' | 'worker' | 'admin';

export interface HistoryEntry {
  id: string;
  status: GrievanceStatus;
  remarks: string;
  updatedByName: string;
  updatedByRole: UserRole;
  timestamp: string;
}

export interface GrievanceRecord {
  id: string;
  referenceNumber: string;
  citizenUid?: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  state: string;
  district: string;
  city: string;
  department: string;
  category: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  addressLabel: string;
  photoUrls: string[];
  status: GrievanceStatus;
  priority: 'Normal' | 'High' | 'Urgent';
  assignedDepartment?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  resolutionNotes?: string;
  resolutionPhotoUrls: string[];
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkerProfile {
  workerId: string;
  name: string;
  designation: string;
  department: string;
  district: string;
  badgeCode: string;
}

export interface AnnouncementItem {
  id: string;
  circularNo: string;
  title: string;
  titleHi: string;
  department: string;
  departmentHi: string;
  publishedDate: string;
  summary: string;
  summaryHi: string;
  isImportant: boolean;
}

export interface GrievanceStats {
  totalRegistered: number;
  pendingAndAssigned: number;
  inProgress: number;
  resolvedAndClosed: number;
  avgResolutionHours: number;
  departmentBreakdown: Array<{
    department: string;
    total: number;
    resolved: number;
  }>;
}

export interface PortalSession {
  role: 'admin' | 'worker';
  token: string;
  officerName: string;
  officerId: string;
  department?: string;
}
