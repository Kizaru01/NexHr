export const CONCERN_CATEGORIES = [
  "Payroll & Compensation",
  "Time & Attendance",
  "Leave & Time Off",
  "Benefits",
  "Workplace & Employee Relations",
  "IT & Access",
  "Equipment & Facilities",
  "HR Documents & Requests",
  "Complaint & Ethics",
  "Suggestion & Feedback",
  "Other",
] as const;

export type ConcernCategory = (typeof CONCERN_CATEGORIES)[number];
