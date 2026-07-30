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

export const CONCERN_STATUSES = [
  "New",
  "Viewed",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

export const CONCERN_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const;

export type ConcernCategory = (typeof CONCERN_CATEGORIES)[number];
export type ConcernStatus = (typeof CONCERN_STATUSES)[number];
export type ConcernPriority = (typeof CONCERN_PRIORITIES)[number];

export const concernCategoryOptions = CONCERN_CATEGORIES.map((value) => ({
  value,
  label: value,
}));

export const concernStatusOptions = CONCERN_STATUSES.map((value) => ({
  value,
  label: value,
}));

export const concernPriorityOptions = CONCERN_PRIORITIES.map((value) => ({
  value,
  label: value,
}));

export const concernSortOptions = [
  { value: "activity-desc", label: "Recent activity" },
  { value: "submitted-desc", label: "Newest submitted" },
  { value: "submitted-asc", label: "Oldest submitted" },
] as const;

export function inferConcernPriority({
  category,
  message,
  subject,
}: {
  category: ConcernCategory;
  message: string;
  subject: string;
}): ConcernPriority {
  const searchableText = `${subject} ${message}`.toLowerCase();
  const urgentSignals = [
    "harassment",
    "violence",
    "threat",
    "unsafe",
    "safety",
    "self-harm",
    "discrimination",
    "retaliation",
  ];

  if (urgentSignals.some((signal) => searchableText.includes(signal))) {
    return "Urgent";
  }

  if (
    category === "Complaint & Ethics" ||
    category === "Workplace & Employee Relations" ||
    category === "Payroll & Compensation"
  ) {
    return "High";
  }

  if (category === "Suggestion & Feedback") {
    return "Low";
  }

  return "Medium";
}
