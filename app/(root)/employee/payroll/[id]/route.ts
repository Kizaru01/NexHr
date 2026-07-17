import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/auth";
import connectToDatabase from "@/database/mongodb";
import Employee from "@/models/employee.model";
import Payroll from "@/models/payroll.model";

type RouteContext = { params: Promise<{ id: string }> };

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const { id } = await params;
  if (
    !session?.user?.id ||
    session.user.role !== "employee" ||
    !Types.ObjectId.isValid(id)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  await connectToDatabase();
  const employee = await Employee.findOne({ userId: session.user.id })
    .select("_id employeeId firstName lastName")
    .lean();
  if (!employee) return new NextResponse("Not found", { status: 404 });

  const payroll = await Payroll.findOne({
    _id: id,
    employee: employee._id,
  }).lean();
  if (!payroll) return new NextResponse("Not found", { status: 404 });

  const period = new Date(
    payroll.year,
    payroll.month - 1,
    1
  ).toLocaleDateString("en", { month: "long", year: "numeric" });
  const money = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip ${escapeHtml(period)}</title><style>body{font-family:Arial,sans-serif;margin:48px;color:#171717}table{width:100%;border-collapse:collapse;margin-top:24px}td{border-bottom:1px solid #ddd;padding:10px;text-align:left}td:last-child{text-align:right}.total{font-weight:700;font-size:18px}</style></head><body><h1>NexHR Payslip</h1><p><strong>${escapeHtml(`${employee.firstName} ${employee.lastName}`)}</strong> · ${escapeHtml(employee.employeeId)}</p><p>Pay period: ${escapeHtml(period)}</p><table><tr><td>Basic salary</td><td>${money(payroll.basicSalary)}</td></tr><tr><td>Allowance</td><td>${money(payroll.allowance)}</td></tr><tr><td>Overtime pay</td><td>${money(payroll.overtimePay)}</td></tr><tr><td>Bonus</td><td>${money(payroll.bonus)}</td></tr><tr><td>Deductions</td><td>-${money(payroll.deductions)}</td></tr><tr><td>Taxes</td><td>-${money(payroll.tax)}</td></tr><tr class="total"><td>Net pay</td><td>${money(payroll.netSalary)}</td></tr></table></body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="payslip-${payroll.year}-${String(payroll.month).padStart(2, "0")}.html"`,
    },
  });
}
