import React from 'react';
import { ViewType, ProjectStatus, TransactionType, PaymentStatus, PocketType, ClientStatus, LeadStatus, ContactChannel } from './types';
import type { User, Client, Project, Package, TeamMember, Transaction, FinancialPocket, AddOn, Profile, TeamProjectPayment, TeamPaymentRecord, AssignedTeamMember, Lead, NotificationSettings, SecuritySettings, RewardLedgerEntry } from './types';

// --- ICONS ---
// A collection of SVG icon components used throughout the application.
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
export const FolderKanbanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path></svg>
);
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
export const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
);
export const PackageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
);
export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l.15.08a2 2 0 0 0 .73-2.73l.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
export const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);
export const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
);
export const Trash2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
);
export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
export const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
);
export const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
);
export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
);
export const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
);
export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
);
export const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16v.01"></path><path d="M16 12h1"></path><path d="M21 12v.01"></path><path d="M12 21v-1a2 2 0 0 0-2-2h-1"></path></svg>
);
export const Share2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
);
export const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>
);
export const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
);
export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
export const PiggyBankIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 1.3 2.5 2.5 2.5 7 0 11-1.5 11-5.5 0-2.3-1.5-4-2.5-4z"></path><path d="m10 9-1.5 1.5"></path><path d="M11.5 17.5a2.5 2.5 0 0 1 5 0V20a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2.5z"></path><path d="M2.5 17.5a2.5 2.5 0 0 0 5 0V20a2 2 0 0 0-2 2h-1a2 2 0 0 0-2-2v-2.5z"></path></svg>
);
export const PieChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);
export const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"></path><circle cx="8.5" cy="8.5" r="1.5"></circle></svg>
);
export const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
export const Users2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 19a6 6 0 0 0-12 0"></path><circle cx="8" cy="10" r="4"></circle><path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8"></path></svg>
);
export const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
);
export const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);
export const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
export const PhoneIncomingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2v6h6"/><path d="M22 16.5A10 10 0 0 1 4.5 9"/><path d="M2 16.1A15 15 0 0 1 15.1 3h5.9"/><path d="M2 16.1v5.9h5.9"/></svg>
);
export const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12"y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>
);
export const LayoutGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect></svg>
);
export const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
export const UsersIconSm = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
export const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="12" y1="12" y2="12"></line></svg>
);
export const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
);


// --- HELPERS ---
// Utility functions used across multiple components.
export const getProjectStatusColor = (status: ProjectStatus): string => {
    switch (status) {
        case ProjectStatus.COMPLETED: return '#10b981'; // emerald-500
        case ProjectStatus.CONFIRMED: return '#3b82f6'; // blue-500
        case ProjectStatus.EDITING: return '#8b5cf6'; // purple-500
        case ProjectStatus.PRINTING: return '#f97316'; // orange-500
        case ProjectStatus.PENDING: return '#eab308'; // yellow-500
        case ProjectStatus.CANCELLED: return '#ef4444'; // red-500
        default: return '#64748b'; // slate-500
    }
};


// --- NAVIGATION ---
// Defines the items available in the main sidebar navigation.
export const NAV_ITEMS = [
  { view: ViewType.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { view: ViewType.CLIENTS, label: 'Klien', icon: UsersIcon },
  { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
  { view: ViewType.TEAM, label: 'Freelancer', icon: BriefcaseIcon },
  { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
  { view: ViewType.CALENDAR, label: 'Kalender', icon: CalendarIcon },
  { view: ViewType.PACKAGES, label: 'Paket Layanan', icon: PackageIcon },
  { view: ViewType.KPI_KLIEN, label: 'KPI Klien', icon: TargetIcon },
  { view: ViewType.SETTINGS, label: 'Pengaturan', icon: SettingsIcon },
];

// --- MOCK DATA ---
// This section contains all the mock data to populate the application.
// In a real-world scenario, this would come from an API.

// --- Users & Profile ---
export const MOCK_USERS: User[] = [
    { id: '40ef4507-b94f-45fd-b58d-83d71bb77381', email: 'admin@venapictures.com', password: 'password123', fullName: 'Admin Vena', role: 'Admin' }
];

export const MOCK_USER_PROFILE: Profile = {
    fullName: "Admin Vena",
    email: "admin@venapictures.com",
    phone: "081234567890",
    companyName: "Vena Pictures",
    website: "https://venapictures.com",
    address: "Jl. Raya Fotografi No. 123, Jakarta, Indonesia",
    bankAccount: "BCA 1234567890 a/n Vena Pictures",
    bio: "Vendor fotografi pernikahan profesional dengan spesialisasi pada momen-momen otentik dan sinematik.",
    incomeCategories: ["DP Proyek", "Pelunasan Proyek", "Penjualan Album", "Sewa Alat", "Lain-lain"],
    expenseCategories: ["Gaji Freelancer", "Hadiah Freelancer", "Penarikan Hadiah Freelancer", "Sewa Tempat", "Transportasi", "Konsumsi", "Marketing", "Sewa Alat", "Cetak Album", "Operasional Kantor", "Transfer Antar Kantong", "Penutupan Anggaran"],
    projectTypes: ["Pernikahan", "Pre-wedding", "Lamaran", "Acara Korporat", "Ulang Tahun"],
    eventTypes: ["Meeting Klien", "Survey Lokasi", "Libur", "Workshop", "Lainnya"],
    notificationSettings: {
        newProject: true,
        paymentConfirmation: true,
        deadlineReminder: true,
    },
    securitySettings: {
        twoFactorEnabled: false,
    }
};

// --- Data Generation Helpers ---
const createMockDate = (monthOffset: number, day: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    date.setDate(day);
    return date.toISOString().split('T')[0];
};

// --- Core Business Entities ---
export const MOCK_CLIENTS: Client[] = [
    { id: 'CLI001', name: 'Andi & Siska', email: 'andi.siska@email.com', phone: '081111111111', since: createMockDate(-3, 15), instagram: '@andisiska', status: ClientStatus.ACTIVE, lastContact: createMockDate(0, -5) },
    { id: 'CLI002', name: 'Budi Santoso', email: 'budi.s@email.com', phone: '082222222222', since: createMockDate(-5, 20), instagram: '@budisan', status: ClientStatus.ACTIVE, lastContact: createMockDate(0, -40) },
    { id: 'CLI003', name: 'Citra Lestari', email: 'citra.l@email.com', phone: '083333333333', since: createMockDate(-1, 5), instagram: '@citralestari', status: ClientStatus.ACTIVE, lastContact: createMockDate(0, -10) },
    { id: 'CLI004', name: 'Dewi Anggraini', email: 'dewi.a@email.com', phone: '084444444444', since: createMockDate(-10, 1), status: ClientStatus.INACTIVE, lastContact: createMockDate(-7, 1) },
    { id: 'CLI005', name: 'Eko Prasetyo', email: 'eko.p@email.com', phone: '085555555555', since: createMockDate(0, -12), instagram: '@ekopras', status: ClientStatus.ACTIVE, lastContact: createMockDate(0, -2) },
];

export const MOCK_LEADS: Lead[] = [
    { id: 'LEAD001', name: 'Fajar Nugraha', contactChannel: ContactChannel.INSTAGRAM, location: 'Jakarta', status: LeadStatus.NEW, date: createMockDate(0, -2) },
    { id: 'LEAD002', name: 'Gita Permata', contactChannel: ContactChannel.WHATSAPP, location: 'Bandung', status: LeadStatus.DISCUSSION, date: createMockDate(0, -5) },
    { id: 'LEAD003', name: 'Hendra Wijaya', contactChannel: ContactChannel.REFERRAL, location: 'Surabaya', status: LeadStatus.FOLLOW_UP, date: createMockDate(0, -8) },
    { id: 'LEAD004', name: 'Indah Sari', contactChannel: ContactChannel.WEBSITE, location: 'Jakarta', status: LeadStatus.REJECTED, date: createMockDate(-1, 15) },
    { id: 'LEAD005', name: 'Joko Anwar', contactChannel: ContactChannel.INSTAGRAM, location: 'Bali', status: LeadStatus.CONVERTED, date: createMockDate(-2, 10) },
];


export const MOCK_PACKAGES: Package[] = [
    { id: 'PKG001', name: 'Paket Silver', price: 15000000, description: '2 Fotografer, 1 Videografer, Album Cetak, 8 Jam Liputan' },
    { id: 'PKG002', name: 'Paket Gold', price: 25000000, description: '2 Fotografer, 2 Videografer, Album Cetak Premium, Same Day Edit, 10 Jam Liputan' },
    { id: 'PKG003', name: 'Paket Platinum', price: 40000000, description: '3 Fotografer, 3 Videografer, Album Kustom, SDE, Drone, 12 Jam Liputan' },
];

export const MOCK_ADDONS: AddOn[] = [
    { id: 'ADD001', name: 'Same Day Edit Video', price: 3500000 },
    { id: 'ADD002', name: 'Sewa Drone', price: 2000000 },
    { id: 'ADD003', name: 'Cetak Kanvas 60x40', price: 750000 },
    { id: 'ADD004', name: 'Jam Liputan Tambahan', price: 1000000 },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: 'TM001', name: 'Bambang Sudiro', role: 'Fotografer', email: 'bambang@photographer.com', phone: '081211112222', standardFee: 1500000, rewardBalance: 350000 },
    { id: 'TM002', name: 'Siti Aminah', role: 'Fotografer', email: 'siti@photographer.com', phone: '081233334444', standardFee: 1500000, rewardBalance: 250000 },
    { id: 'TM003', name: 'Rahmat Hidayat', role: 'Videografer', email: 'rahmat@videographer.com', phone: '081255556666', standardFee: 2000000, rewardBalance: 0 },
    { id: 'TM004', name: 'Dewi Anjani', role: 'Editor', email: 'dewi@editor.com', phone: '081277778888', standardFee: 1000000, rewardBalance: 750000 },
    { id: 'TM005', name: 'Agung Perkasa', role: 'Videografer', email: 'agung@videographer.com', phone: '081299990000', standardFee: 2000000, rewardBalance: 100000 },
];

export const MOCK_PROJECTS: Project[] = [
    { id: 'PRJ001', projectName: 'Pernikahan Andi & Siska', clientName: 'Andi & Siska', clientId: 'CLI001', projectType: 'Pernikahan', packageName: 'Paket Gold', packageId: 'PKG002', addOns: [MOCK_ADDONS[1]], date: createMockDate(1, 10), deadlineDate: createMockDate(2, 10), location: 'Hotel Mulia, Jakarta', progress: 25, status: ProjectStatus.CONFIRMED, totalCost: 27000000, amountPaid: 10000000, paymentStatus: PaymentStatus.DP_TERBAYAR, team: [{ memberId: 'TM001', name: 'Bambang Sudiro', role: 'Fotografer', fee: 1500000, reward: 200000 }, { memberId: 'TM003', name: 'Rahmat Hidayat', role: 'Videografer', fee: 2000000, reward: 250000 }] },
    { id: 'PRJ002', projectName: 'Prewedding Budi & Rekan', clientName: 'Budi Santoso', clientId: 'CLI002', projectType: 'Pre-wedding', packageName: 'Paket Silver', packageId: 'PKG001', addOns: [], date: createMockDate(-1, 25), deadlineDate: createMockDate(0, 25), location: 'Bromo, Jawa Timur', progress: 100, status: ProjectStatus.COMPLETED, totalCost: 15000000, amountPaid: 15000000, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: 'TM002', name: 'Siti Aminah', role: 'Fotografer', fee: 2000000, reward: 250000 }] },
    { id: 'PRJ003', projectName: 'Lamaran Citra', clientName: 'Citra Lestari', clientId: 'CLI003', projectType: 'Lamaran', packageName: 'Paket Silver', packageId: 'PKG001', addOns: [], date: createMockDate(0, 20), deadlineDate: createMockDate(1, 20), location: 'Bandung', progress: 70, status: ProjectStatus.EDITING, totalCost: 15000000, amountPaid: 15000000, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: 'TM001', name: 'Bambang Sudiro', role: 'Fotografer', fee: 1500000, reward: 150000 }] },
    { id: 'PRJ004', projectName: 'Event Perusahaan Dewi', clientName: 'Dewi Anggraini', clientId: 'CLI004', projectType: 'Acara Korporat', packageName: 'Paket Gold', packageId: 'PKG002', addOns: [], date: createMockDate(-8, 5), deadlineDate: createMockDate(-7, 5), location: 'Bali', progress: 100, status: ProjectStatus.COMPLETED, totalCost: 25000000, amountPaid: 25000000, paymentStatus: PaymentStatus.LUNAS, team: [] },
    { id: 'PRJ005', projectName: 'Pernikahan Eko & Pasangan', clientName: 'Eko Prasetyo', clientId: 'CLI005', projectType: 'Pernikahan', packageName: 'Paket Platinum', packageId: 'PKG003', addOns: [MOCK_ADDONS[0], MOCK_ADDONS[1], MOCK_ADDONS[2]], date: createMockDate(2, 15), location: 'Surabaya', progress: 0, status: ProjectStatus.PREPARATION, totalCost: 46250000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [] },
];

export const MOCK_FINANCIAL_POCKETS: FinancialPocket[] = [
    { id: 'POC001', name: 'Dana Darurat', description: 'Untuk keperluan tak terduga', icon: 'piggy-bank', type: PocketType.SAVING, amount: 15000000, goalAmount: 50000000 },
    { id: 'POC002', name: 'Beli Kamera Baru', description: 'Upgrade ke Sony A7IV', icon: 'lock', type: PocketType.LOCKED, amount: 5000000, goalAmount: 35000000, lockEndDate: createMockDate(6, 1) },
    { id: 'POC003', name: 'Anggaran Operasional Bulanan', description: 'Budget untuk pengeluaran rutin', icon: 'clipboard-list', type: PocketType.EXPENSE, amount: 0, goalAmount: 5000000 },
];

const unsortedTransactions: Transaction[] = [
    // Project PRJ002 (Budi) - COMPLETED
    { id: 'TRN001', date: createMockDate(-2, 1), description: 'DP Proyek Prewedding Budi', amount: 7500000, type: TransactionType.INCOME, projectId: 'PRJ002', category: 'DP Proyek', method: 'Transfer Bank' },
    { id: 'TRN002', date: createMockDate(-1, 20), description: 'Pelunasan Proyek Prewedding Budi', amount: 7500000, type: TransactionType.INCOME, projectId: 'PRJ002', category: 'Pelunasan Proyek', method: 'Transfer Bank' },
    { id: 'TRN003', date: createMockDate(-1, 22), description: 'Gaji Freelancer Siti Aminah - Proyek Budi', amount: 2000000, type: TransactionType.EXPENSE, projectId: 'PRJ002', category: 'Gaji Freelancer', method: 'Transfer Bank', pocketId: MOCK_FINANCIAL_POCKETS[2].id },
    { id: 'TRN004', date: createMockDate(-1, 23), description: 'Transportasi & Akomodasi Bromo', amount: 2500000, type: TransactionType.EXPENSE, projectId: 'PRJ002', category: 'Transportasi', method: 'Tunai', pocketId: MOCK_FINANCIAL_POCKETS[2].id },
    // Project PRJ003 (Citra) - EDITING
    { id: 'TRN005', date: createMockDate(-1, 1), description: 'DP Proyek Lamaran Citra', amount: 7500000, type: TransactionType.INCOME, projectId: 'PRJ003', category: 'DP Proyek', method: 'Transfer Bank' },
    { id: 'TRN006', date: createMockDate(0, 18), description: 'Pelunasan Proyek Lamaran Citra', amount: 7500000, type: TransactionType.INCOME, projectId: 'PRJ003', category: 'Pelunasan Proyek', method: 'Transfer Bank' },
    // Project PRJ001 (Andi) - CONFIRMED
    { id: 'TRN007', date: createMockDate(0, -20), description: 'DP Proyek Pernikahan Andi & Siska', amount: 10000000, type: TransactionType.INCOME, projectId: 'PRJ001', category: 'DP Proyek', method: 'Transfer Bank' },
    // General transactions
    { id: 'TRN008', date: createMockDate(0, -15), description: 'Biaya Iklan Instagram', amount: 500000, type: TransactionType.EXPENSE, category: 'Marketing', method: 'E-Wallet', pocketId: MOCK_FINANCIAL_POCKETS[2].id },
    { id: 'TRN009', date: createMockDate(0, -2), description: 'Sewa Studio Foto', amount: 1000000, type: TransactionType.EXPENSE, category: 'Sewa Tempat', method: 'Transfer Bank', pocketId: MOCK_FINANCIAL_POCKETS[2].id },
    { id: 'TRN010', date: createMockDate(-3, 1), description: 'Transfer ke Dana Darurat', amount: 5000000, type: TransactionType.EXPENSE, category: 'Transfer Antar Kantong', method: 'Sistem' },
    { id: 'TRN011', date: createMockDate(-2, 1), description: 'Transfer ke Beli Kamera Baru', amount: 2000000, type: TransactionType.EXPENSE, category: 'Transfer Antar Kantong', method: 'Sistem' },
];

export const MOCK_TRANSACTIONS: Transaction[] = unsortedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


export const MOCK_TEAM_PROJECT_PAYMENTS: TeamProjectPayment[] = [
    { id: 'TPP-PRJ001-TM001', projectId: 'PRJ001', teamMemberName: 'Bambang Sudiro', teamMemberId: 'TM001', date: MOCK_PROJECTS[0].date, status: 'Unpaid', fee: 1500000, reward: 200000 },
    { id: 'TPP-PRJ001-TM003', projectId: 'PRJ001', teamMemberName: 'Rahmat Hidayat', teamMemberId: 'TM003', date: MOCK_PROJECTS[0].date, status: 'Unpaid', fee: 2000000, reward: 250000 },
    { id: 'TPP-PRJ002-TM002', projectId: 'PRJ002', teamMemberName: 'Siti Aminah', teamMemberId: 'TM002', date: MOCK_PROJECTS[1].date, status: 'Paid', fee: 2000000, reward: 250000 },
    { id: 'TPP-PRJ003-TM001', projectId: 'PRJ003', teamMemberName: 'Bambang Sudiro', teamMemberId: 'TM001', date: MOCK_PROJECTS[2].date, status: 'Unpaid', fee: 1500000, reward: 150000 },
];

export const MOCK_TEAM_PAYMENT_RECORDS: TeamPaymentRecord[] = [
    {
        id: 'TPR001',
        recordNumber: 'PAY-FR-TM002-1234',
        teamMemberId: 'TM002',
        date: createMockDate(-1, 22),
        projectPaymentIds: ['TPP-PRJ002-TM002'],
        totalAmount: 2000000,
    }
];

export const MOCK_REWARD_LEDGER_ENTRIES: RewardLedgerEntry[] = [
    { id: 'RLE-001', teamMemberId: 'TM002', date: createMockDate(-1, 22), description: 'Hadiah dari proyek: Prewedding Budi & Rekan', amount: 250000, projectId: 'PRJ002' },
    { id: 'RLE-002', teamMemberId: 'TM001', date: createMockDate(-4, 5), description: 'Hadiah dari proyek: Pernikahan Fajar & Gita', amount: 300000, projectId: 'PRJ-OLD-1' },
    { id: 'RLE-003', teamMemberId: 'TM001', date: createMockDate(-3, 10), description: 'Hadiah dari proyek: Event Korporat XYZ', amount: 200000, projectId: 'PRJ-OLD-2' },
    { id: 'RLE-004', teamMemberId: 'TM004', date: createMockDate(-2, 1), description: 'Hadiah dari proyek: Editing Video Kompilasi', amount: 750000, projectId: 'PRJ-OLD-3' },
    { id: 'RLE-005', teamMemberId: 'TM005', date: createMockDate(-1, 15), description: 'Hadiah dari proyek: Video Teaser Pernikahan', amount: 100000, projectId: 'PRJ-OLD-4' },
    { id: 'RLE-006', teamMemberId: 'TM001', date: createMockDate(-2, 15), description: 'Penarikan saldo hadiah', amount: -150000 },
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());