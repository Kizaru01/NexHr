import type { ConcernCategory } from "@/constants/concerns";

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
  submittedAt: string | null;
  attachmentCount: number;
  isNew: boolean;
};

export type ConcernListResult = {
  concerns: ConcernListItem[];
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
  expiresAt: string | null;
};

export type ConcernDetail = ConcernListItem & {
  employeeEmail: string;
  employeePosition: string;
  viewedAt: string | null;
  attachments: ConcernAttachmentView[];
  notes: ConcernNoteView[];
};

export type ConcernDashboardAlert = {
  id: string;
  caseNumber: string;
  subject: string;
  employee: string;
};

export type ConcernDashboardAlerts = {
  unread: number;
  concerns: ConcernDashboardAlert[];
};
