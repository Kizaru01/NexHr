import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/auth";
import connectToDatabase from "@/database/mongodb";
import Employee from "@/models/employee.model";
import Payroll from "@/models/payroll.model";

type RouteContext = { params: Promise<{ id: string }> };

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES[character]
  );
}

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
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

  const { employeeId, firstName, lastName } = employee;
  const {
    allowance,
    basicSalary,
    bonus,
    deductions,
    month,
    netSalary,
    overtimePay,
    tax,
    year,
  } = payroll;
  const period = new Date(year, month - 1, 1).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
  const money = (amount: number): string =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  const escapedPeriod = escapeHtml(period);
  const escapedEmployeeName = escapeHtml(`${firstName} ${lastName}`);
  const payslipStyles = [
    "<style>",
    "body{font-family:Arial,sans-serif;margin:48px;color:#171717}",
    "table{width:100%;border-collapse:collapse;margin-top:24px}",
    "td{border-bottom:1px solid #ddd;padding:10px;text-align:left}",
    "td:last-child{text-align:right}",
    ".total{font-weight:700;font-size:18px}",
    "</style>",
  ].join("");
  const payrollRows = [
    `<tr><td>Basic salary</td><td>${money(basicSalary)}</td></tr>`,
    `<tr><td>Allowance</td><td>${money(allowance)}</td></tr>`,
    `<tr><td>Overtime pay</td><td>${money(overtimePay)}</td></tr>`,
    `<tr><td>Bonus</td><td>${money(bonus)}</td></tr>`,
    `<tr><td>Deductions</td><td>-${money(deductions)}</td></tr>`,
    `<tr><td>Taxes</td><td>-${money(tax)}</td></tr>`,
    `<tr class="total"><td>Net pay</td><td>${money(netSalary)}</td></tr>`,
  ].join("");
  const html = [
    "<!doctype html><html><head><meta charset=\"utf-8\">",
    `<title>Payslip ${escapedPeriod}</title>`,
    payslipStyles,
    "</head><body><h1>NexHR Payslip</h1>",
    `<p><strong>${escapedEmployeeName}</strong> · ${escapeHtml(employeeId)}</p>`,
    `<p>Pay period: ${escapedPeriod}</p>`,
    `<table>${payrollRows}</table></body></html>`,
  ].join("");

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="payslip-${year}-${String(month).padStart(2, "0")}.html"`,
    },
  });
}
