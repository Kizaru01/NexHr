import type {
  ConcernCategory,
  ConcernPriority,
  ConcernStatus,
} from "@/constants/concerns";

export type ConcernListItem = {
  id: string;
  caseNumber: string;
  employee: string;
  employeeId: string;
  avatar?: string;
  department: string;
  subject: string;
  message: string;
  category: ConcernCategory;
  status: ConcernStatus;
  priority: ConcernPriority;
  submittedAt: string | null;
  updatedAt: string | null;
  lastActivityAt: string | null;
  attachmentCount: number;
};

export type HrConcernDashboardResult = {
  concerns: ConcernListItem[];
  stats: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  page: number;
  totalPages: number;
  total: number;
};

export type EmployeeConcernListResult = {
  concerns: ConcernListItem[];
  stats: {
    total: number;
    inReview: number;
    inProgress: number;
    resolved: number;
  };
  page: number;
  totalPages: number;
  total: number;
};

export type ConcernAttachmentView = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

export type ConcernNoteView = {
  id: string;
  author: string;
  body: string;
  createdAt: string | null;
};

export type ConcernStatusHistoryView = {
  id: string;
  from?: ConcernStatus;
  to: ConcernStatus;
  changedBy: string;
  reason?: string;
  createdAt: string | null;
};

export type ConcernDetail = ConcernListItem & {
  employeeEmail: string;
  employeePosition: string;
  isArchived: boolean;
  viewedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  attachments: ConcernAttachmentView[];
  notes: ConcernNoteView[];
  history: ConcernStatusHistoryView[];
};

export type ConcernDashboardAlert = {
  id: string;
  caseNumber: string;
  subject: string;
  employee: string;
  priority: ConcernPriority;
  status: ConcernStatus;
  createdAt: string | null;
};

export type ConcernDashboardAlerts = {
  unread: number;
  concerns: ConcernDashboardAlert[];
};
