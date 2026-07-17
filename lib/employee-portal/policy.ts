export const leaveEntitlements = {
  Annual: 15,
  Sick: 10,
  Emergency: 5,
  Maternity: 105,
  Paternity: 7,
  "Without Pay": null,
} as const;

export type LeaveType = keyof typeof leaveEntitlements;

export function leaveDurationInDays(startDate: Date, endDate: Date): number {
  const start = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );
  const end = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  );

  return Math.floor((end - start) / 86_400_000) + 1;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
