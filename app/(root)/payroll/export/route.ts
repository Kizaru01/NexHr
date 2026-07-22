import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPayrollExport } from "@/lib/queries/hr-dashboard.queries";
import type { FilterValues } from "@/types/filters";

function toCsvValue(value: string | number): string {
  const normalized = String(value).replace(/^([=+\-@])/, "'$1");

  return `"${normalized.replaceAll('"', '""')}"`;
}

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (
    !session?.user?.id ||
    (session.user.role !== "admin" && session.user.role !== "hr")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filters = Object.fromEntries(
    new URL(request.url).searchParams.entries()
  ) as FilterValues;
  const records = await getPayrollExport(filters);
  const rows = [
    [
      "Employee",
      "Employee ID",
      "Department",
      "Position",
      "Month",
      "Year",
      "Gross Pay",
      "Deductions",
      "Tax",
      "Net Pay",
      "Generated At",
    ],
    ...records.map(
      ({
        deductions,
        department,
        employee,
        employeeId,
        generatedAt,
        grossPay,
        month,
        netSalary,
        position,
        tax,
        year,
      }) => [
        employee,
        employeeId,
        department,
        position,
        month,
        year,
        grossPay,
        deductions,
        tax,
        netSalary,
        generatedAt ?? "",
      ]
    ),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(toCsvValue).join(",")).join("\r\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=payroll-export.csv",
      "Cache-Control": "no-store",
    },
  });
}
