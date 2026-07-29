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
  profileCompleted: boolean;
};

type RequireEmployeeRecordOptions = {
  allowIncompleteProfile?: boolean;
};

const PORTAL_EMPLOYMENT_STATUSES: readonly IEmployeeDoc["employmentStatus"][] =
  ["Active", "On Leave"];

export async function getEmployeeForUserId(
  userId: string
): Promise<IEmployeeDoc | null> {
  return Employee.findOne({ userId }).select(
    "_id employeeId employmentStatus profileCompleted"
  );
}

export async function requireEmployeeRecord(
  userId: string,
  { allowIncompleteProfile = false }: RequireEmployeeRecordOptions = {}
): Promise<{
  employeeDatabaseId: string;
  employeeCode: string;
  profileCompleted: boolean;
}> {
  const employee = await getEmployeeForUserId(userId);

  if (!employee) {
    throw new ForbiddenError(
      "Your account is not linked to an employee record."
    );
  }

  if (!PORTAL_EMPLOYMENT_STATUSES.includes(employee.employmentStatus)) {
    throw new ForbiddenError(
      "Your employment status does not permit portal access."
    );
  }

  if (!employee.profileCompleted && !allowIncompleteProfile) {
    throw new ForbiddenError(
      "Complete your personal profile before using the employee portal."
    );
  }

  return {
    employeeDatabaseId: employee._id.toString(),
    employeeCode: employee.employeeId,
    profileCompleted: employee.profileCompleted,
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

    if (!session.user.isActive) {
      redirect("/sign-in");
    }

    await connectToDatabase();

    const employee = await requireEmployeeRecord(session.user.id, {
      allowIncompleteProfile: true,
    });

    if (!employee.profileCompleted) {
      redirect("/personal");
    }

    return { userId: session.user.id, ...employee };
  }
);

export const requireEmployeePersonalPage = cache(
  async (): Promise<EmployeePortalContext> => {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/sign-in?callbackUrl=/personal");
    }

    if (session.user.role !== "employee") {
      redirect("/");
    }

    if (!session.user.isActive) {
      redirect("/sign-in?callbackUrl=/personal");
    }

    await connectToDatabase();

    const employee = await requireEmployeeRecord(session.user.id, {
      allowIncompleteProfile: true,
    });

    if (employee.profileCompleted) {
      redirect("/employee");
    }

    return { userId: session.user.id, ...employee };
  }
);
