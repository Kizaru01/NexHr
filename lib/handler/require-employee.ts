import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectToDatabase from "@/database/mongodb";
import { ForbiddenError } from "@/lib/http-errors";
import Employee, { type IEmployeeDoc } from "@/models/employee.model";

export type EmployeePortalContext = {
  userId: string;
  employeeDatabaseId: string;
  employeeCode: string;
};

export async function getEmployeeForUserId(
  userId: string
): Promise<IEmployeeDoc | null> {
  return Employee.findOne({ userId }).select("_id employeeId");
}

export async function requireEmployeeRecord(
  userId: string
): Promise<{ employeeDatabaseId: string; employeeCode: string }> {
  const employee = await getEmployeeForUserId(userId);

  if (!employee) {
    throw new ForbiddenError(
      "Your account is not linked to an employee record."
    );
  }

  return {
    employeeDatabaseId: employee._id.toString(),
    employeeCode: employee.employeeId,
  };
}

export const requireEmployeePage = cache(
  async (): Promise<EmployeePortalContext> => {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/sign-in");
    }

    if (session.user.role !== "employee") {
      redirect("/");
    }

    await connectToDatabase();

    const employee = await requireEmployeeRecord(session.user.id);

    return { userId: session.user.id, ...employee };
  }
);
