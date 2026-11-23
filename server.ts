import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import type {
  AnnouncementItem,
  GrievanceRecord,
  GrievanceStats,
  GrievanceStatus,
  HistoryEntry,
  WorkerProfile,
} from './src/types/portal.ts';

const PORT = 3000;
const ROOT_DIR = process.cwd();
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'loksudhar-db.json');
const FIREBASE_CONFIG_FILE = path.resolve(ROOT_DIR, 'firebase-applet-config.json');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

interface InquiryRecord {
  id: string;
  ticketNo: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface PortalAuthRecord {
  adminHash?: string;
  adminSalt?: string;
  adminOfficerName?: string;
  workerHash?: string;
  workerSalt?: string;
}

interface PortalDatabaseState {
  grievances: GrievanceRecord[];
  workers: WorkerProfile[];
  announcements: AnnouncementItem[];
  inquiries: InquiryRecord[];
  auth: PortalAuthRecord;
  sequenceCounter: number;
}

interface TokenSession {
  role: 'admin' | 'worker';
  officerId: string;
  officerName: string;
  department?: string;
  exp: number;
}

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const BOOTSTRAP_ADMIN_EMAIL = 'vishwanagar22@gmail.com';

let firebaseProjectId = '';
let firebaseOAuthClientId = '';
try {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8')) as {
      projectId?: string;
      oAuthClientId?: string;
    };
    firebaseProjectId = parsed.projectId || '';
    firebaseOAuthClientId = parsed.oAuthClientId || '';
  }
} catch {
  // Ignore config read errors
}

function createSeedState(): PortalDatabaseState {
  const now = Date.now();
  const isoOffset = (hoursAgo: number) => new Date(now - hoursAgo * 3600 * 1000).toISOString();

  const workers: WorkerProfile[] = [
    {
      workerId: 'WRK-101',
      name: 'Rajeshwar Verma',
      designation: 'Junior Engineer (Water Works)',
      department: 'Drinking Water Supply & Jal Board',
      district: 'Lucknow',
      badgeCode: 'LKS-FE-101',
    },
    {
      workerId: 'WRK-102',
      name: 'Sunita Deshmukh',
      designation: 'Senior Sanitary Inspector',
      department: 'Municipal Sanitation & Solid Waste Management',
      district: 'Pune',
      badgeCode: 'LKS-FE-102',
    },
    {
      workerId: 'WRK-103',
      name: 'Arvind Kumar Tiwari',
      designation: 'Assistant Engineer (Urban Roads)',
      department: 'Roads, Footpaths & Public Works (PWD)',
      district: 'New Delhi',
      badgeCode: 'LKS-FE-103',
    },
    {
      workerId: 'WRK-104',
      name: 'Meenakshi Sundaram',
      designation: 'Field Electrical Supervisor',
      department: 'Street Lighting & Civic Electrical Wing',
      district: 'Chennai',
      badgeCode: 'LKS-FE-104',
    },
    {
      workerId: 'WRK-105',
      name: 'Prashant Kulkarni',
      designation: 'Drainage Maintenance Supervisor',
      department: 'Sewerage, Storm Water & Drainage',
      district: 'Bengaluru Urban',
      badgeCode: 'LKS-FE-105',
    },
    {
      workerId: 'WRK-106',
      name: 'Harpreet Singh Gill',
      designation: 'Horticulture Field Officer',
      department: 'Horticulture, Public Parks & Civic Spaces',
      district: 'Jaipur',
      badgeCode: 'LKS-FE-106',
    },
  ];

  const announcements: AnnouncementItem[] = [
    {
      id: 'ann-1',
      circularNo: 'LKS/CIR/2026/014',
      title: 'Monsoon Pre-Desilting & Storm Water Redressal Drive — Priority SLA Active',
      titleHi: 'मानसून पूर्व नाला सफाई एवं वर्षा जल निवारण अभियान — प्राथमिकता SLA सक्रिय',
      department: 'Sewerage, Storm Water & Drainage',
      departmentHi: 'सीवरेज, वर्षा जल एवं नाला प्रबंधन विभाग',
      publishedDate: '2026-11-18',
      summary:
        'All municipal drainage complaints regarding blocked storm drains and missing manhole covers are routed under a 48-hour expedited inspection window.',
      summaryHi:
        'अवरुद्ध नालों एवं खुले मैनहोल ढक्कन संबंधी सभी शिकायतों का 48 घंटे के भीतर त्वरित निरीक्षण सुनिश्चित किया जाएगा।',
      isImportant: true,
    },
    {
      id: 'ann-2',
      circularNo: 'LKS/ADV/2026/011',
      title: 'Mandatory Geo-Tagged Completion Photograph Upload for Field Redressal Closure',
      titleHi: 'शिकायत निवारण समापन हेतु जियो-टैग पूर्णता फोटोग्राफ अपलोड अनिवार्य',
      department: 'Central Grievance Directorate',
      departmentHi: 'केंद्रीय शिकायत निवारण निदेशालय',
      publishedDate: '2026-11-14',
      summary:
        'Field officers must upload verifiable site completion photographs before marking any assigned public grievance as Resolved.',
      summaryHi:
        'फील्ड अधिकारियों को किसी भी आवंटित शिकायत को निस्तारित चिह्नित करने से पूर्व कार्य स्थल का पूर्णता फोटोग्राफ अपलोड करना अनिवार्य है।',
      isImportant: true,
    },
    {
      id: 'ann-3',
      circularNo: 'LKS/SLA/2026/009',
      title: 'Updated Citizen Charter & Escalation Timelines for Street Lighting & Water Supply',
      titleHi: 'स्ट्रीट लाइट एवं पेयजल आपूर्ति हेतु संशोधित नागरिक चार्टर एवं समय-सीमा',
      department: 'Street Lighting & Civic Electrical Wing',
      departmentHi: 'स्ट्रीट लाइट एवं नागरिक विद्युत प्रभाग',
      publishedDate: '2026-11-10',
      summary:
        'Emergency drinking water contamination and dark-zone street light outages carry a 48-hour resolution benchmark across participating urban zones.',
      summaryHi:
        'दूषित पेयजल एवं अंधेरे वाले क्षेत्रों की स्ट्रीट लाइट शिकायतों का निस्तारण 48 घंटे की समय-सीमा में किया जाएगा।',
      isImportant: false,
    },
    {
      id: 'ann-4',
      circularNo: 'LKS/NOT/2026/006',
      title: 'Prototype Notice: Independent Civic-Tech Demonstration Environment',
      titleHi: 'प्रोटोटाइप सूचना: स्वतंत्र नागरिक-तकनीक प्रदर्शन पोर्टल',
      department: 'Portal Administration',
      departmentHi: 'पोर्टल प्रशासन',
      publishedDate: '2026-11-01',
      summary:
        'LokSudhar (लोक सुधार) demonstrates structured public grievance filing, tracking, and field coordination workflows and is not affiliated with any government agency.',
      summaryHi:
        'लोक सुधार (LokSudhar) एक स्वतंत्र प्रदर्शन पोर्टल है और किसी भी सरकारी विभाग या मंत्रालय से संबद्ध नहीं है।',
      isImportant: false,
    },
  ];

  const grievances: GrievanceRecord[] = [
    {
      id: 'grv-100421',
      referenceNumber: 'LKS-2026-100421',
      citizenName: 'Ramesh Chandra Mishra',
      citizenPhone: '9839011223',
      citizenEmail: 'ramesh.mishra@example.org',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      city: 'Gomti Nagar',
      department: 'Drinking Water Supply & Jal Board',
      category: 'Pipeline Leakage & Water Wastage',
      title: 'Main potable water supply valve leaking near Sector 4 intersection',
      description:
        'Continuous pressurized clean water leakage from the roadside distribution main opposite Community Park Gate 2 for the last 36 hours, causing road flooding and low household pressure.',
      latitude: 26.8548,
      longitude: 81.0012,
      addressLabel: 'Sector 4, Gomti Nagar, Lucknow, Uttar Pradesh',
      photoUrls: [],
      status: 'In Progress',
      priority: 'High',
      assignedDepartment: 'Drinking Water Supply & Jal Board',
      assignedWorkerId: 'WRK-101',
      assignedWorkerName: 'Rajeshwar Verma',
      resolutionNotes: 'Field crew isolated sub-valve and ordered 150mm flange gasket replacement.',
      resolutionPhotoUrls: [],
      history: [
        {
          id: 'h-1',
          status: 'Registered',
          remarks: 'Grievance registered online with GPS coordinates.',
          updatedByName: 'Ramesh Chandra Mishra',
          updatedByRole: 'citizen',
          timestamp: isoOffset(42),
        },
        {
          id: 'h-2',
          status: 'Assigned',
          remarks: 'Assigned to Drinking Water Supply & Jal Board and Field Officer Rajeshwar Verma.',
          updatedByName: 'Portal Grievance Officer',
          updatedByRole: 'admin',
          timestamp: isoOffset(36),
        },
        {
          id: 'h-3',
          status: 'In Progress',
          remarks: 'Site inspected; pressure isolated and repair excavation underway.',
          updatedByName: 'Rajeshwar Verma',
          updatedByRole: 'worker',
          timestamp: isoOffset(14),
        },
      ],
      createdAt: isoOffset(42),
      updatedAt: isoOffset(14),
    },
    {
      id: 'grv-100422',
      referenceNumber: 'LKS-2026-100422',
      citizenName: 'Kavita Kulkarni',
      citizenPhone: '9822054321',
      citizenEmail: 'kavita.k@example.org',
      state: 'Maharashtra',
      district: 'Pune',
      city: 'Kothrud',
      department: 'Municipal Sanitation & Solid Waste Management',
      category: 'Overflowing Public Dustbin / Dump Yard',
      title: 'Uncollected secondary waste bin overflowing near school lane',
      description:
        'The twin community waste containers near Karve Road bus stop have not been cleared for three days, creating sanitation hazard for school commuters.',
      latitude: 18.5074,
      longitude: 73.8077,
      addressLabel: 'Karve Road, Kothrud, Pune, Maharashtra',
      photoUrls: [],
      status: 'Resolved',
      priority: 'Normal',
      assignedDepartment: 'Municipal Sanitation & Solid Waste Management',
      assignedWorkerId: 'WRK-102',
      assignedWorkerName: 'Sunita Deshmukh',
      resolutionNotes:
        'Compactor vehicle deployed, bins cleared, surrounding footpath sanitized with disinfectant.',
      resolutionPhotoUrls: ['/src/assets/images/field_inspection_team_1795450982485.jpg'],
      history: [
        {
          id: 'h-4',
          status: 'Registered',
          remarks: 'Grievance submitted by citizen.',
          updatedByName: 'Kavita Kulkarni',
          updatedByRole: 'citizen',
          timestamp: isoOffset(72),
        },
        {
          id: 'h-5',
          status: 'Assigned',
          remarks: 'Routed to Municipal Sanitation & Solid Waste Management.',
          updatedByName: 'Portal Grievance Officer',
          updatedByRole: 'admin',
          timestamp: isoOffset(64),
        },
        {
          id: 'h-6',
          status: 'Resolved',
          remarks: 'Site cleared and sanitized; inspection photograph uploaded.',
          updatedByName: 'Sunita Deshmukh',
          updatedByRole: 'worker',
          timestamp: isoOffset(22),
        },
      ],
      createdAt: isoOffset(72),
      updatedAt: isoOffset(22),
    },
    {
      id: 'grv-100423',
      referenceNumber: 'LKS-2026-100423',
      citizenName: 'Ananya Sharma',
      citizenPhone: '9811077889',
      citizenEmail: 'ananya.sharma@example.org',
      state: 'NCT of Delhi',
      district: 'New Delhi',
      city: 'Connaught Place',
      department: 'Roads, Footpaths & Public Works (PWD)',
      category: 'Deep Potholes / Damaged Road Surface',
      title: 'Severe carriageway pothole near outer circle pedestrian crossing',
      description:
        'A 2-foot wide pothole has developed on the left lane near radial road 4, posing a hazard to two-wheelers during evening traffic.',
      latitude: 28.6315,
      longitude: 77.2167,
      addressLabel: 'Outer Circle Radial 4, New Delhi',
      photoUrls: [],
      status: 'Assigned',
      priority: 'Urgent',
      assignedDepartment: 'Roads, Footpaths & Public Works (PWD)',
      assignedWorkerId: 'WRK-103',
      assignedWorkerName: 'Arvind Kumar Tiwari',
      resolutionPhotoUrls: [],
      history: [
        {
          id: 'h-7',
          status: 'Registered',
          remarks: 'Grievance registered with geo-location pin.',
          updatedByName: 'Ananya Sharma',
          updatedByRole: 'citizen',
          timestamp: isoOffset(18),
        },
        {
          id: 'h-8',
          status: 'Assigned',
          remarks: 'Prioritized and assigned to Assistant Engineer Arvind Kumar Tiwari.',
          updatedByName: 'Portal Grievance Officer',
          updatedByRole: 'admin',
          timestamp: isoOffset(10),
        },
      ],
      createdAt: isoOffset(18),
      updatedAt: isoOffset(10),
    },
    {
      id: 'grv-100424',
      referenceNumber: 'LKS-2026-100424',
      citizenName: 'Siddharth Rao',
      citizenPhone: '9900145678',
      citizenEmail: 'siddharth.rao@example.org',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      city: 'Indiranagar',
      department: 'Sewerage, Storm Water & Drainage',
      category: 'Missing or Broken Manhole Cover',
      title: 'Cracked storm water drain slab near 100 Feet Road junction',
      description:
        'Concrete slab covering the roadside storm water drain has fractured and shifted, creating an open gap adjacent to the pedestrian walkway.',
      latitude: 12.9784,
      longitude: 77.6408,
      addressLabel: '100 Feet Road, Indiranagar, Bengaluru',
      photoUrls: [],
      status: 'Registered',
      priority: 'Urgent',
      resolutionPhotoUrls: [],
      history: [
        {
          id: 'h-9',
          status: 'Registered',
          remarks: 'Grievance lodged and awaiting departmental review.',
          updatedByName: 'Siddharth Rao',
          updatedByRole: 'citizen',
          timestamp: isoOffset(4),
        },
      ],
      createdAt: isoOffset(4),
      updatedAt: isoOffset(4),
    },
  ];

  return {
    grievances,
    workers,
    announcements,
    inquiries: [],
    auth: {},
    sequenceCounter: 100425,
  };
}

let useMongo = false;

const HistorySchema = new mongoose.Schema(
  {
    id: String,
    status: String,
    remarks: String,
    updatedByName: String,
    updatedByRole: String,
    timestamp: String,
  },
  { _id: false }
);

const GrievanceMongoSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  referenceNumber: { type: String, unique: true, index: true },
  citizenUid: String,
  citizenName: String,
  citizenPhone: String,
  citizenEmail: String,
  state: String,
  district: String,
  city: String,
  department: String,
  category: String,
  title: String,
  description: String,
  latitude: Number,
  longitude: Number,
  addressLabel: String,
  photoUrls: [String],
  status: String,
  priority: String,
  assignedDepartment: String,
  assignedWorkerId: String,
  assignedWorkerName: String,
  resolutionNotes: String,
  resolutionPhotoUrls: [String],
  history: [HistorySchema],
  createdAt: String,
  updatedAt: String,
});

const WorkerMongoSchema = new mongoose.Schema({
  workerId: { type: String, unique: true },
  name: String,
  designation: String,
  department: String,
  district: String,
  badgeCode: String,
});

const AnnouncementMongoSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  circularNo: String,
  title: String,
  titleHi: String,
  department: String,
  departmentHi: String,
  publishedDate: String,
  summary: String,
  summaryHi: String,
  isImportant: Boolean,
});

const InquiryMongoSchema = new mongoose.Schema({
  id: String,
  ticketNo: String,
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  createdAt: String,
});

const PortalStateMetaSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  auth: {
    adminHash: String,
    adminSalt: String,
    adminOfficerName: String,
    workerHash: String,
    workerSalt: String,
  },
  sequenceCounter: Number,
});

const GrievanceModel =
  mongoose.models.Grievance || mongoose.model('Grievance', GrievanceMongoSchema);
const WorkerModel = mongoose.models.Worker || mongoose.model('Worker', WorkerMongoSchema);
const AnnouncementModel =
  mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementMongoSchema);
const InquiryModel = mongoose.models.Inquiry || mongoose.model('Inquiry', InquiryMongoSchema);
const PortalMetaModel =
  mongoose.models.PortalMeta || mongoose.model('PortalMeta', PortalStateMetaSchema);

function readFileState(): PortalDatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as PortalDatabaseState;
      if (parsed && Array.isArray(parsed.grievances) && Array.isArray(parsed.workers)) {
        return parsed;
      }
    }
  } catch {
    // Re-seed if corrupted
  }
  const seeded = createSeedState();
  writeFileState(seeded);
  return seeded;
}

function writeFileState(state: PortalDatabaseState): void {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

let memoryState: PortalDatabaseState = readFileState();

async function initDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
      useMongo = true;
      const workerCount = await WorkerModel.countDocuments();
      if (workerCount === 0) {
        const seed = createSeedState();
        await WorkerModel.insertMany(seed.workers);
        await AnnouncementModel.insertMany(seed.announcements);
        await GrievanceModel.insertMany(seed.grievances);
        await PortalMetaModel.create({
          key: 'singleton',
          auth: seed.auth,
          sequenceCounter: seed.sequenceCounter,
        });
      }
      console.log('Connected to MongoDB persistence.');
      return;
    } catch (err) {
      console.warn(
        'MONGODB_URI connection failed; falling back to local persistent JSON store.',
        err instanceof Error ? err.message : ''
      );
    }
  }
  memoryState = readFileState();
}

async function getAllGrievances(): Promise<GrievanceRecord[]> {
  if (useMongo) {
    const docs = await GrievanceModel.find({}, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).lean();
    return docs as unknown as GrievanceRecord[];
  }
  return [...memoryState.grievances].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function findGrievanceById(id: string): Promise<GrievanceRecord | null> {
  if (useMongo) {
    const doc = await GrievanceModel.findOne({ id }, { _id: 0, __v: 0 }).lean();
    return (doc as unknown as GrievanceRecord) || null;
  }
  return memoryState.grievances.find((g) => g.id === id) || null;
}

async function findGrievanceByRef(ref: string): Promise<GrievanceRecord | null> {
  const normalized = ref.trim().toUpperCase();
  if (useMongo) {
    const doc = await GrievanceModel.findOne(
      { referenceNumber: normalized },
      { _id: 0, __v: 0 }
    ).lean();
    return (doc as unknown as GrievanceRecord) || null;
  }
  return memoryState.grievances.find((g) => g.referenceNumber.toUpperCase() === normalized) || null;
}

async function saveNewGrievance(record: GrievanceRecord): Promise<void> {
  if (useMongo) {
    await GrievanceModel.create(record);
    return;
  }
  memoryState.grievances.unshift(record);
  writeFileState(memoryState);
}

async function updateGrievanceRecord(record: GrievanceRecord): Promise<void> {
  if (useMongo) {
    await GrievanceModel.updateOne({ id: record.id }, { $set: record });
    return;
  }
  const idx = memoryState.grievances.findIndex((g) => g.id === record.id);
  if (idx >= 0) {
    memoryState.grievances[idx] = record;
    writeFileState(memoryState);
  }
}

async function getWorkers(): Promise<WorkerProfile[]> {
  if (useMongo) {
    const docs = await WorkerModel.find({}, { _id: 0, __v: 0 }).lean();
    return docs as unknown as WorkerProfile[];
  }
  return memoryState.workers;
}

async function getAnnouncements(): Promise<AnnouncementItem[]> {
  if (useMongo) {
    const docs = await AnnouncementModel.find({}, { _id: 0, __v: 0 })
      .sort({ publishedDate: -1 })
      .lean();
    return docs as unknown as AnnouncementItem[];
  }
  return memoryState.announcements;
}

async function saveInquiry(inquiry: InquiryRecord): Promise<void> {
  if (useMongo) {
    await InquiryModel.create(inquiry);
    return;
  }
  memoryState.inquiries.unshift(inquiry);
  writeFileState(memoryState);
}

async function nextSequenceNumber(): Promise<number> {
  if (useMongo) {
    const meta = await PortalMetaModel.findOneAndUpdate(
      { key: 'singleton' },
      { $inc: { sequenceCounter: 1 } },
      { new: true, upsert: true }
    );
    return meta.sequenceCounter || Math.floor(100500 + Math.random() * 9000);
  }
  const seq = memoryState.sequenceCounter;
  memoryState.sequenceCounter += 1;
  writeFileState(memoryState);
  return seq;
}

async function getPortalAuth(): Promise<PortalAuthRecord> {
  if (useMongo) {
    const meta = (await PortalMetaModel.findOne({ key: 'singleton' }).lean()) as {
      auth?: PortalAuthRecord;
    } | null;
    return meta?.auth || {};
  }
  return memoryState.auth || {};
}

async function setPortalAuth(nextAuth: PortalAuthRecord): Promise<void> {
  if (useMongo) {
    await PortalMetaModel.updateOne(
      { key: 'singleton' },
      { $set: { auth: nextAuth } },
      { upsert: true }
    );
    return;
  }
  memoryState.auth = { ...memoryState.auth, ...nextAuth };
  writeFileState(memoryState);
}

function hashPasscode(passcode: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(passcode, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPasscode(passcode: string, storedHash: string, storedSalt: string): boolean {
  const derived = crypto.scryptSync(passcode, storedSalt, 64);
  const target = Buffer.from(storedHash, 'hex');
  if (derived.length !== target.length) return false;
  return crypto.timingSafeEqual(derived, target);
}

function verifyEnvPasscode(input: string, envPasscode: string): boolean {
  const a = Buffer.from(input, 'utf-8');
  const b = Buffer.from(envPasscode, 'utf-8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signSessionToken(session: Omit<TokenSession, 'exp'>): string {
  const payload: TokenSession = {
    ...session,
    exp: Date.now() + 12 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string): TokenSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    const a = Buffer.from(sig, 'utf-8');
    const b = Buffer.from(expectedSig, 'utf-8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenSession;
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function extractSession(req: Request): TokenSession | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return verifySessionToken(header.slice(7).trim());
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = extractSession(req);
  if (!session || session.role !== 'admin') {
    res.status(401).json({ error: 'Administrator authentication required.' });
    return;
  }
  (req as Request & { portalSession?: TokenSession }).portalSession = session;
  next();
}

function requireStaff(req: Request, res: Response, next: NextFunction): void {
  const session = extractSession(req);
  if (!session || (session.role !== 'admin' && session.role !== 'worker')) {
    res.status(401).json({ error: 'Authorized officer authentication required.' });
    return;
  }
  (req as Request & { portalSession?: TokenSession }).portalSession = session;
  next();
}

function cleanString(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '******';
  return `******${digits.slice(-4)}`;
}

function sanitizeGrievanceForPublic(record: GrievanceRecord): GrievanceRecord {
  return {
    ...record,
    citizenPhone: maskPhone(record.citizenPhone),
    citizenEmail: undefined,
  };
}

function computeStats(list: GrievanceRecord[]): GrievanceStats {
  const totalRegistered = list.length;
  const pendingAndAssigned = list.filter(
    (g) => g.status === 'Registered' || g.status === 'Assigned'
  ).length;
  const inProgress = list.filter(
    (g) => g.status === 'Dispatched' || g.status === 'In Progress'
  ).length;
  const resolvedList = list.filter((g) => g.status === 'Resolved' || g.status === 'Closed');
  const resolvedAndClosed = resolvedList.length;

  let avgResolutionHours = 38;
  if (resolvedList.length > 0) {
    const totalHrs = resolvedList.reduce((acc, item) => {
      const diff =
        (new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime()) /
        (1000 * 60 * 60);
      return acc + Math.max(2, diff);
    }, 0);
    avgResolutionHours = Math.round(totalHrs / resolvedList.length);
  }

  const deptMap = new Map<string, { total: number; resolved: number }>();
  for (const item of list) {
    const entry = deptMap.get(item.department) || { total: 0, resolved: 0 };
    entry.total += 1;
    if (item.status === 'Resolved' || item.status === 'Closed') {
      entry.resolved += 1;
    }
    deptMap.set(item.department, entry);
  }

  const departmentBreakdown = Array.from(deptMap.entries()).map(([department, counts]) => ({
    department,
    total: counts.total,
    resolved: counts.resolved,
  }));

  return {
    totalRegistered,
    pendingAndAssigned,
    inProgress,
    resolvedAndClosed,
    avgResolutionHours,
    departmentBreakdown,
  };
}

async function startServer(): Promise<void> {
  await initDatabase();

  const app = express();
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: false,
    },
  });

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '15mb' }));

  io.on('connection', (socket) => {
    socket.emit('portal:connected', { connectedAt: new Date().toISOString() });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, portal: 'LokSudhar', persistence: useMongo ? 'mongodb' : 'file-store' });
  });

  app.get('/api/stats', async (_req, res) => {
    const list = await getAllGrievances();
    res.json(computeStats(list));
  });

  app.get('/api/announcements', async (_req, res) => {
    const items = await getAnnouncements();
    res.json(items);
  });

  app.get('/api/workers', async (_req, res) => {
    const workers = await getWorkers();
    res.json(workers);
  });

  app.get('/api/auth/portal-status', async (_req, res) => {
    const authData = await getPortalAuth();
    res.json({
      adminEnvConfigured: Boolean(process.env.ADMIN_PASSCODE?.trim()),
      adminClaimed: Boolean(authData.adminHash),
      workerEnvConfigured: Boolean(process.env.WORKER_PASSCODE?.trim()),
      workerClaimed: Boolean(authData.workerHash),
    });
  });

  app.post('/api/auth/admin/claim', async (req, res) => {
    if (process.env.ADMIN_PASSCODE?.trim()) {
      res.status(403).json({ error: 'Administrator passcode is managed by environment configuration.' });
      return;
    }
    const authData = await getPortalAuth();
    if (authData.adminHash) {
      res.status(409).json({ error: 'Administrator credentials have already been claimed.' });
      return;
    }
    const officerName = cleanString(req.body?.officerName, 80) || 'Chief Grievance Officer';
    const passcode = cleanString(req.body?.passcode, 100);
    if (passcode.length < 6) {
      res.status(400).json({ error: 'Passcode must be at least 6 characters.' });
      return;
    }
    const { hash, salt } = hashPasscode(passcode);
    await setPortalAuth({ adminHash: hash, adminSalt: salt, adminOfficerName: officerName });
    const token = signSessionToken({
      role: 'admin',
      officerId: 'ADM-001',
      officerName,
    });
    res.json({
      role: 'admin',
      token,
      officerId: 'ADM-001',
      officerName,
    });
  });

  app.post('/api/auth/admin/login', async (req, res) => {
    const passcode = cleanString(req.body?.passcode, 100);
    const officerNameInput = cleanString(req.body?.officerName, 80);
    if (!passcode) {
      res.status(400).json({ error: 'Passcode is required.' });
      return;
    }
    const envPass = process.env.ADMIN_PASSCODE?.trim();
    if (envPass) {
      if (!verifyEnvPasscode(passcode, envPass)) {
        res.status(401).json({ error: 'Invalid administrator passcode.' });
        return;
      }
      const officerName = officerNameInput || 'Portal Grievance Administrator';
      const token = signSessionToken({ role: 'admin', officerId: 'ADM-001', officerName });
      res.json({ role: 'admin', token, officerId: 'ADM-001', officerName });
      return;
    }
    const authData = await getPortalAuth();
    if (!authData.adminHash || !authData.adminSalt) {
      res.status(404).json({ error: 'Administrator passcode not configured yet. Please claim first.' });
      return;
    }
    if (!verifyPasscode(passcode, authData.adminHash, authData.adminSalt)) {
      res.status(401).json({ error: 'Invalid administrator passcode.' });
      return;
    }
    const officerName = officerNameInput || authData.adminOfficerName || 'Portal Grievance Officer';
    const token = signSessionToken({ role: 'admin', officerId: 'ADM-001', officerName });
    res.json({ role: 'admin', token, officerId: 'ADM-001', officerName });
  });

  app.post('/api/auth/firebase-verify', async (req, res) => {
    const idToken = cleanString(req.body?.idToken, 4096);
    const requestedRole = req.body?.role === 'worker' ? 'worker' : 'admin';
    const workerId = cleanString(req.body?.workerId, 64);

    if (!idToken) {
      res.status(400).json({ error: 'Missing Firebase ID token.' });
      return;
    }

    try {
      const verifyUrl = new URL('https://oauth2.googleapis.com/tokeninfo');
      verifyUrl.searchParams.set('id_token', idToken);
      const googleRes = await fetch(verifyUrl.toString());
      if (!googleRes.ok) {
        res.status(401).json({ error: 'Unable to verify Firebase session token.' });
        return;
      }
      const claims = (await googleRes.json()) as {
        email?: string;
        email_verified?: string | boolean;
        name?: string;
        aud?: string;
        sub?: string;
      };
      const email = (claims.email || '').toLowerCase();
      const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
      const validAudience =
        !firebaseOAuthClientId ||
        claims.aud === firebaseOAuthClientId ||
        claims.aud === firebaseProjectId;

      if (!emailVerified || !validAudience) {
        res.status(403).json({ error: 'Verified Google account required.' });
        return;
      }

      if (requestedRole === 'admin') {
        if (email !== BOOTSTRAP_ADMIN_EMAIL) {
          res.status(403).json({
            error: `Account ${email} is not listed as an authorized portal administrator.`,
          });
          return;
        }
        const officerName = claims.name || 'Authorized Administrator';
        const token = signSessionToken({
          role: 'admin',
          officerId: claims.sub || 'ADM-FIREBASE',
          officerName,
        });
        res.json({ role: 'admin', token, officerId: claims.sub || 'ADM-FIREBASE', officerName });
        return;
      }

      const workers = await getWorkers();
      const worker = workers.find((w) => w.workerId === workerId);
      if (!worker) {
        res.status(400).json({ error: 'Select a valid field officer profile.' });
        return;
      }
      if (email !== BOOTSTRAP_ADMIN_EMAIL) {
        res.status(403).json({
          error: 'Google single sign-on for department portal is limited to authorized coordinator accounts; use Officer Passcode otherwise.',
        });
        return;
      }
      const token = signSessionToken({
        role: 'worker',
        officerId: worker.workerId,
        officerName: worker.name,
        department: worker.department,
      });
      res.json({
        role: 'worker',
        token,
        officerId: worker.workerId,
        officerName: worker.name,
        department: worker.department,
      });
    } catch {
      res.status(502).json({ error: 'Token verification service temporarily unavailable.' });
    }
  });

  app.post('/api/auth/worker/claim', async (req, res) => {
    if (process.env.WORKER_PASSCODE?.trim()) {
      res.status(403).json({ error: 'Department officer passcode is managed by environment configuration.' });
      return;
    }
    const authData = await getPortalAuth();
    if (authData.workerHash) {
      res.status(409).json({ error: 'Department portal passcode has already been claimed.' });
      return;
    }
    const workerId = cleanString(req.body?.workerId, 64);
    const passcode = cleanString(req.body?.passcode, 100);
    const workers = await getWorkers();
    const worker = workers.find((w) => w.workerId === workerId);
    if (!worker) {
      res.status(400).json({ error: 'Please select a registered department field officer.' });
      return;
    }
    if (passcode.length < 6) {
      res.status(400).json({ error: 'Passcode must be at least 6 characters.' });
      return;
    }
    const { hash, salt } = hashPasscode(passcode);
    await setPortalAuth({ workerHash: hash, workerSalt: salt });
    const token = signSessionToken({
      role: 'worker',
      officerId: worker.workerId,
      officerName: worker.name,
      department: worker.department,
    });
    res.json({
      role: 'worker',
      token,
      officerId: worker.workerId,
      officerName: worker.name,
      department: worker.department,
    });
  });

  app.post('/api/auth/worker/login', async (req, res) => {
    const workerId = cleanString(req.body?.workerId, 64);
    const passcode = cleanString(req.body?.passcode, 100);
    const workers = await getWorkers();
    const worker = workers.find((w) => w.workerId === workerId);
    if (!worker) {
      res.status(400).json({ error: 'Please select a registered department field officer.' });
      return;
    }
    if (!passcode) {
      res.status(400).json({ error: 'Passcode is required.' });
      return;
    }

    const envPass = process.env.WORKER_PASSCODE?.trim();
    if (envPass) {
      if (!verifyEnvPasscode(passcode, envPass)) {
        res.status(401).json({ error: 'Invalid officer passcode.' });
        return;
      }
    } else {
      const authData = await getPortalAuth();
      if (!authData.workerHash || !authData.workerSalt) {
        res.status(404).json({ error: 'Officer passcode not configured yet. Please claim first.' });
        return;
      }
      if (!verifyPasscode(passcode, authData.workerHash, authData.workerSalt)) {
        res.status(401).json({ error: 'Invalid officer passcode.' });
        return;
      }
    }

    const token = signSessionToken({
      role: 'worker',
      officerId: worker.workerId,
      officerName: worker.name,
      department: worker.department,
    });
    res.json({
      role: 'worker',
      token,
      officerId: worker.workerId,
      officerName: worker.name,
      department: worker.department,
    });
  });

  app.get('/api/grievances/recent-refs', async (_req, res) => {
    const list = await getAllGrievances();
    res.json(
      list.slice(0, 6).map((g) => ({
        referenceNumber: g.referenceNumber,
        title: g.title,
        department: g.department,
        status: g.status,
        city: g.city,
        state: g.state,
      }))
    );
  });

  app.get('/api/grievances/track/:refNumber', async (req, res) => {
    const refNumber = cleanString(req.params.refNumber, 32);
    if (!refNumber) {
      res.status(400).json({ error: 'Reference number is required.' });
      return;
    }
    const found = await findGrievanceByRef(refNumber);
    if (!found) {
      res.status(404).json({ error: 'No grievance found matching this Reference Number.' });
      return;
    }
    res.json(sanitizeGrievanceForPublic(found));
  });

  app.get('/api/grievances', async (req, res) => {
    const session = extractSession(req);
    const list = await getAllGrievances();

    const statusFilter = cleanString(req.query.status, 40);
    const deptFilter = cleanString(req.query.department, 120);
    const stateFilter = cleanString(req.query.state, 80);
    const workerFilter = cleanString(req.query.assignedWorkerId, 64);
    const searchFilter = cleanString(req.query.search, 120).toLowerCase();

    const filtered = list.filter((g) => {
      if (statusFilter && statusFilter !== 'ALL' && g.status !== statusFilter) return false;
      if (deptFilter && deptFilter !== 'ALL' && g.department !== deptFilter && g.assignedDepartment !== deptFilter) {
        return false;
      }
      if (stateFilter && stateFilter !== 'ALL' && g.state !== stateFilter) return false;
      if (workerFilter && g.assignedWorkerId !== workerFilter) return false;
      if (searchFilter) {
        const haystack = `${g.referenceNumber} ${g.title} ${g.description} ${g.city} ${g.district} ${g.citizenName}`.toLowerCase();
        if (!haystack.includes(searchFilter)) return false;
      }
      return true;
    });

    if (session && (session.role === 'admin' || session.role === 'worker')) {
      res.json(filtered);
      return;
    }
    res.json(filtered.map(sanitizeGrievanceForPublic));
  });

  app.post('/api/uploads', async (req, res) => {
    const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Only JPEG, PNG, or WEBP image uploads are permitted.' });
      return;
    }
    const mime = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size must be between 1 byte and 5 MB.' });
      return;
    }
    const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const safeName = `ev_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, safeName);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid file destination.' });
      return;
    }
    fs.writeFileSync(targetPath, buffer);
    res.status(201).json({ url: `/api/uploads/${safeName}` });
  });

  app.get('/api/uploads/:filename', (req, res) => {
    const filename = cleanString(req.params.filename, 100);
    if (!/^[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }
    const resolved = path.resolve(UPLOADS_DIR, filename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'Evidence file not found.' });
      return;
    }
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(resolved);
  });

  app.post('/api/grievances', async (req, res) => {
    const citizenName = cleanString(req.body?.citizenName, 120);
    const citizenPhone = cleanString(req.body?.citizenPhone, 24);
    const citizenEmail = cleanString(req.body?.citizenEmail, 160);
    const citizenUid = cleanString(req.body?.citizenUid, 128);
    const state = cleanString(req.body?.state, 80);
    const district = cleanString(req.body?.district, 80);
    const city = cleanString(req.body?.city, 80);
    const department = cleanString(req.body?.department, 120);
    const category = cleanString(req.body?.category, 120);
    const title = cleanString(req.body?.title, 200);
    const description = cleanString(req.body?.description, 3000);
    const addressLabel = cleanString(req.body?.addressLabel, 250);
    const priority =
      req.body?.priority === 'Urgent' || req.body?.priority === 'High' ? req.body.priority : 'Normal';

    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);

    if (
      citizenName.length < 2 ||
      citizenPhone.length < 7 ||
      state.length < 2 ||
      district.length < 2 ||
      city.length < 2 ||
      department.length < 2 ||
      category.length < 2 ||
      title.length < 4 ||
      description.length < 10
    ) {
      res.status(400).json({ error: 'Please complete all mandatory grievance fields accurately.' });
      return;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      res.status(400).json({ error: 'Valid GPS latitude and longitude coordinates are required.' });
      return;
    }

    const rawPhotoUrls = Array.isArray(req.body?.photoUrls) ? req.body.photoUrls : [];
    const photoUrls = rawPhotoUrls
      .filter((u: unknown): u is string => typeof u === 'string' && u.startsWith('/api/uploads/'))
      .slice(0, 3);

    const seq = await nextSequenceNumber();
    const year = new Date().getFullYear();
    const referenceNumber = `LKS-${year}-${seq}`;
    const nowIso = new Date().toISOString();
    const id = `grv-${seq}-${crypto.randomBytes(3).toString('hex')}`;

    const initialHistory: HistoryEntry = {
      id: `h-${Date.now()}`,
      status: 'Registered',
      remarks: `Grievance registered online via LokSudhar (लोक सुधार) Portal (${city}, ${district}).`,
      updatedByName: citizenName,
      updatedByRole: 'citizen',
      timestamp: nowIso,
    };

    const newRecord: GrievanceRecord = {
      id,
      referenceNumber,
      citizenUid: citizenUid || undefined,
      citizenName,
      citizenPhone,
      citizenEmail: citizenEmail || undefined,
      state,
      district,
      city,
      department,
      category,
      title,
      description,
      latitude,
      longitude,
      addressLabel: addressLabel || `${city}, ${district}, ${state}`,
      photoUrls,
      status: 'Registered',
      priority,
      resolutionPhotoUrls: [],
      history: [initialHistory],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await saveNewGrievance(newRecord);
    io.emit('grievance:created', sanitizeGrievanceForPublic(newRecord));
    res.status(201).json(newRecord);
  });

  app.patch('/api/grievances/:id/assign', requireAdmin, async (req, res) => {
    const id = cleanString(req.params.id, 64);
    const grievance = await findGrievanceById(id);
    if (!grievance) {
      res.status(404).json({ error: 'Grievance record not found.' });
      return;
    }

    const assignedDepartment = cleanString(req.body?.assignedDepartment, 120) || grievance.department;
    const assignedWorkerId = cleanString(req.body?.assignedWorkerId, 64);
    const remarks =
      cleanString(req.body?.remarks, 500) ||
      `Assigned to ${assignedDepartment}${assignedWorkerId ? ` (${assignedWorkerId})` : ''}.`;

    const workers = await getWorkers();
    const worker = workers.find((w) => w.workerId === assignedWorkerId);
    const session = (req as Request & { portalSession?: TokenSession }).portalSession!;
    const nowIso = new Date().toISOString();

    const updated: GrievanceRecord = {
      ...grievance,
      assignedDepartment,
      assignedWorkerId: worker ? worker.workerId : grievance.assignedWorkerId,
      assignedWorkerName: worker ? worker.name : grievance.assignedWorkerName,
      status: grievance.status === 'Registered' ? 'Assigned' : grievance.status,
      updatedAt: nowIso,
      history: [
        ...grievance.history,
        {
          id: `h-${Date.now()}`,
          status: grievance.status === 'Registered' ? 'Assigned' : grievance.status,
          remarks: worker
            ? `${remarks} Assigned Field Officer: ${worker.name} (${worker.workerId}).`
            : remarks,
          updatedByName: session.officerName,
          updatedByRole: 'admin',
          timestamp: nowIso,
        },
      ],
    };

    await updateGrievanceRecord(updated);
    io.emit('grievance:updated', sanitizeGrievanceForPublic(updated));
    res.json(updated);
  });

  app.patch('/api/grievances/:id/status', requireStaff, async (req, res) => {
    const id = cleanString(req.params.id, 64);
    const grievance = await findGrievanceById(id);
    if (!grievance) {
      res.status(404).json({ error: 'Grievance record not found.' });
      return;
    }

    const session = (req as Request & { portalSession?: TokenSession }).portalSession!;
    if (session.role === 'worker' && grievance.assignedWorkerId !== session.officerId) {
      res.status(403).json({ error: 'You may only update grievances assigned to your Officer ID.' });
      return;
    }

    const allowedStatuses: GrievanceStatus[] = [
      'Registered',
      'Assigned',
      'Dispatched',
      'In Progress',
      'Resolved',
      'Closed',
    ];
    const nextStatus = req.body?.status as GrievanceStatus;
    if (!allowedStatuses.includes(nextStatus)) {
      res.status(400).json({ error: 'Invalid grievance status transition.' });
      return;
    }

    if (session.role === 'worker' && (nextStatus === 'Closed' || nextStatus === 'Registered')) {
      res.status(403).json({ error: 'Only an Administrator can mark a grievance Closed.' });
      return;
    }

    const remarks =
      cleanString(req.body?.remarks, 1000) || `Status updated to ${nextStatus}.`;
    const resolutionNotes =
      cleanString(req.body?.resolutionNotes, 2000) || grievance.resolutionNotes;

    const incomingPhotos = Array.isArray(req.body?.resolutionPhotoUrls)
      ? req.body.resolutionPhotoUrls.filter(
          (u: unknown): u is string => typeof u === 'string' && u.startsWith('/api/uploads/')
        )
      : [];

    const mergedPhotos = Array.from(
      new Set([...(grievance.resolutionPhotoUrls || []), ...incomingPhotos])
    ).slice(0, 5);

    const nowIso = new Date().toISOString();
    const updated: GrievanceRecord = {
      ...grievance,
      status: nextStatus,
      resolutionNotes,
      resolutionPhotoUrls: mergedPhotos,
      updatedAt: nowIso,
      history: [
        ...grievance.history,
        {
          id: `h-${Date.now()}`,
          status: nextStatus,
          remarks,
          updatedByName: session.officerName,
          updatedByRole: session.role,
          timestamp: nowIso,
        },
      ],
    };

    await updateGrievanceRecord(updated);
    io.emit('grievance:updated', sanitizeGrievanceForPublic(updated));
    res.json(updated);
  });

  app.get('/api/reports/export', requireAdmin, async (req, res) => {
    const list = await getAllGrievances();
    const statusFilter = cleanString(req.query.status, 40);
    const deptFilter = cleanString(req.query.department, 120);

    const filtered = list.filter((g) => {
      if (statusFilter && statusFilter !== 'ALL' && g.status !== statusFilter) return false;
      if (deptFilter && deptFilter !== 'ALL' && g.department !== deptFilter) return false;
      return true;
    });

    const csvEscape = (value: unknown) => {
      const str = String(value ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Reference Number',
      'Status',
      'Priority',
      'Citizen Name',
      'State',
      'District',
      'City',
      'Department',
      'Category',
      'Title',
      'Assigned Department',
      'Assigned Worker',
      'Created At',
      'Updated At',
    ];

    const rows = filtered.map((g) =>
      [
        g.referenceNumber,
        g.status,
        g.priority,
        g.citizenName,
        g.state,
        g.district,
        g.city,
        g.department,
        g.category,
        g.title,
        g.assignedDepartment || '',
        g.assignedWorkerName || '',
        g.createdAt,
        g.updatedAt,
      ]
        .map(csvEscape)
        .join(',')
    );

    const csvContent = [headers.map(csvEscape).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="loksudhar-grievance-report.csv"');
    res.send(csvContent);
  });

  app.post('/api/inquiries', async (req, res) => {
    const name = cleanString(req.body?.name, 120);
    const email = cleanString(req.body?.email, 160);
    const phone = cleanString(req.body?.phone, 24);
    const subject = cleanString(req.body?.subject, 200);
    const message = cleanString(req.body?.message, 2000);

    if (name.length < 2 || email.length < 5 || subject.length < 3 || message.length < 10) {
      res.status(400).json({ error: 'Please complete all required inquiry fields.' });
      return;
    }

    const ticketNo = `HDK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
    await saveInquiry({
      id: `inq-${Date.now()}`,
      ticketNo,
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ ticketNo, message: 'Inquiry recorded by LokSudhar Citizen Helpdesk.' });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`LokSudhar (लोक सुधार) portal server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
