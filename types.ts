

export enum ViewType {
  DASHBOARD = 'Dashboard',
  CLIENTS = 'Klien',
  PROJECTS = 'Proyek',
  TEAM = 'Freelancer',
  FINANCE = 'Keuangan',
  CALENDAR = 'Kalender',
  PACKAGES = 'Input Package',
  SETTINGS = 'Pengaturan',
  KPI_KLIEN = 'KPI Klien'
}

export enum ProjectStatus {
  PENDING = 'Tertunda',
  PREPARATION = 'Persiapan',
  CONFIRMED = 'Dikonfirmasi',
  EDITING = 'Editing',
  PRINTING = 'Cetak',
  COMPLETED = 'Selesai',
  CANCELLED = 'Dibatalkan'
}

export enum PaymentStatus {
  LUNAS = 'Lunas',
  DP_TERBAYAR = 'DP Terbayar',
  BELUM_BAYAR = 'Belum Bayar'
}

export enum ClientStatus {
  LEAD = 'Prospek',
  ACTIVE = 'Aktif',
  INACTIVE = 'Tidak Aktif',
  LOST = 'Hilang'
}

export enum LeadStatus {
    NEW = 'Baru Masuk',
    DISCUSSION = 'Sedang Diskusi',
    FOLLOW_UP = 'Menunggu Follow Up',
    CONVERTED = 'Dikonversi',
    REJECTED = 'Ditolak',
}

export enum ContactChannel {
    WHATSAPP = 'WhatsApp',
    INSTAGRAM = 'Instagram',
    WEBSITE = 'Website',
    PHONE = 'Telepon',
    REFERRAL = 'Referensi',
    SUGGESTION_FORM = 'Form Saran',
    OTHER = 'Lainnya',
}

export interface User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: 'Admin' | 'Member';
}

export interface Lead {
    id: string;
    name: string;
    contactChannel: ContactChannel;
    location: string;
    status: LeadStatus;
    date: string; // ISO date string of contact
    notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  since: string;
  instagram?: string;
  status: ClientStatus;
  lastContact: string; // ISO Date String
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // Fotografer, Videografer, Editor etc.
  email: string;
  phone: string;
  standardFee: number;
  rewardBalance: number;
}

export interface AssignedTeamMember {
  memberId: string;
  name: string;
  role: string;
  fee: number; // The fee for THIS project
  reward?: number; // The reward for THIS project
}

export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  clientId: string;
  projectType: string;
  packageName: string;
  packageId: string;
  addOns: AddOn[];
  date: string;
  deadlineDate?: string;
  location: string;
  progress: number; // 0-100
  status: ProjectStatus;
  totalCost: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  team: AssignedTeamMember[];
  notes?: string;
  accommodation?: string;
  driveLink?: string;
  startTime?: string;
  endTime?: string;
}

export enum TransactionType {
  INCOME = 'Pemasukan',
  EXPENSE = 'Pengeluaran'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  projectId?: string;
  category: string;
  method: 'Transfer Bank' | 'Tunai' | 'E-Wallet' | 'Sistem';
  pocketId?: string;
}

export enum PocketType {
    SAVING = 'Nabung & Bayar',
    LOCKED = 'Terkunci',
    SHARED = 'Bersama',
    EXPENSE = 'Anggaran Pengeluaran'
}

export interface FinancialPocket {
  id: string;
  name: string;
  description: string;
  icon: 'piggy-bank' | 'lock' | 'users' | 'clipboard-list';
  type: PocketType;
  amount: number;
  goalAmount?: number; // for SAVING and EXPENSE type
  lockEndDate?: string; // for LOCKED type
  members?: TeamMember[]; // for SHARED type
}

export interface NotificationSettings {
    newProject: boolean;
    paymentConfirmation: boolean;
    deadlineReminder: boolean;
}

export interface SecuritySettings {
    twoFactorEnabled: boolean;
}

export interface Profile {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    website: string;
    address: string;
    bankAccount: string;
    bio: string;
    incomeCategories: string[];
    expenseCategories: string[];
    projectTypes: string[];
    eventTypes: string[];
    notificationSettings: NotificationSettings;
    securitySettings: SecuritySettings;
}

export interface TeamProjectPayment {
    id: string;
    projectId: string;
    teamMemberName: string;
    teamMemberId: string;
    date: string;
    status: 'Paid' | 'Unpaid';
    fee: number;
    reward?: number;
}

export interface TeamPaymentRecord {
    id: string;
    recordNumber: string;
    teamMemberId: string;
    date: string;
    projectPaymentIds: string[];
    totalAmount: number;
}

export interface RewardLedgerEntry {
    id: string;
    teamMemberId: string;
    date: string;
    description: string;
    amount: number; // positive for deposit, negative for withdrawal
    projectId?: string;
}