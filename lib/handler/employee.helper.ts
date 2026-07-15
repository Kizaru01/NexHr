import Employee, { IEmployeeDoc } from "@/models/employee.model";
import { EmployeeDetail, EmployeeListItem } from "@/types/global";
import type { ClientSession } from "mongoose";
import { ConflictError, NotFoundError } from "../http-errors";

interface PopulatedRef {
  _id: { toString(): string };
  name?: string;
}

function isPopulated(ref: unknown): ref is PopulatedRef {
  return !!ref && typeof ref === "object" && "_id" in (ref as object);
}

function refName(ref: unknown): string {
  if (isPopulated(ref)) return ref.name ?? ref._id.toString();
  return ref ? String(ref) : "";
}

function refId(ref: unknown): string | undefined {
  if (isPopulated(ref)) return ref._id.toString();
  return ref ? String(ref) : undefined;
}

/** Fetches an employee by business `employeeId`, populated for display, or throws NotFoundError. */
export async function findEmployeeDetailOrThrow(
  employeeId: string
): Promise<IEmployeeDoc> {
  const employee = await Employee.findOne({ employeeId })
    .populate("department")
    .populate("position")
    .populate("manager");

  if (!employee) {
    throw new NotFoundError("Employee");
  }

  return employee;
}

export async function assertEmailIsUnique(
  email: string,
  excludeEmployeeId?: string,
  session?: ClientSession
): Promise<void> {
  const query = Employee.exists({
    email,
    ...(excludeEmployeeId ? { employeeId: { $ne: excludeEmployeeId } } : {}),
  });

  if (session) query.session(session);

  const exists = await query;

  if (exists) {
    throw new ConflictError(`Email "${email}" is already in use`);
  }
}

export function toEmployeeDetail(employee: IEmployeeDoc): EmployeeDetail {
  return {
    id: employee._id.toString(),
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    birthDate: employee.birthDate,
    gender: employee.gender,
    avatar: employee.avatar,
    address: employee.address,
    emergencyContact: employee.emergencyContact,
    department: refName(employee.department),
    position: refName(employee.position),
    hireDate: employee.hireDate,
    employmentStatus: employee.employmentStatus,
    employmentType: employee.employmentType,
    salary: employee.salary,
    regularizedAt: employee.regularizedAt,
    terminationDate: employee.terminationDate,
    manager: employee.manager ? refName(employee.manager) : undefined,
    notes: employee.notes,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

export function toEmployeeListItem(employee: IEmployeeDoc): EmployeeListItem {
  return {
    id: employee._id.toString(),
    employeeId: employee.employeeId,
    fullName: [employee.firstName, employee.lastName].filter(Boolean).join(" "),
    email: employee.email,
    department: refName(employee.department),
    position: refName(employee.position),
    employmentStatus: employee.employmentStatus,
    employmentType: employee.employmentType,
    hireDate: employee.hireDate,
    avatar: employee.avatar,
  };
}

export { refId };
