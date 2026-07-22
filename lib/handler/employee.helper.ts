import type { ClientSession } from "mongoose";

import Employee, { type IEmployeeDoc } from "@/models/employee.model";
import type { EmployeeDetail, EmployeeListItem } from "@/types/global";
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
  const {
    _id,
    address,
    avatar,
    birthDate,
    createdAt,
    department,
    email,
    emergencyContact,
    employeeId,
    employmentStatus,
    employmentType,
    firstName,
    gender,
    hireDate,
    lastName,
    manager,
    middleName,
    notes,
    phone,
    position,
    regularizedAt,
    salary,
    terminationDate,
    updatedAt,
  } = employee;

  return {
    id: _id.toString(),
    employeeId,
    firstName,
    middleName,
    lastName,
    email,
    phone,
    birthDate,
    gender,
    avatar,
    address,
    emergencyContact,
    department: refName(department),
    position: refName(position),
    hireDate,
    employmentStatus,
    employmentType,
    salary,
    regularizedAt,
    terminationDate,
    manager: manager ? refName(manager) : undefined,
    notes,
    createdAt,
    updatedAt,
  };
}

export function toEmployeeListItem(employee: IEmployeeDoc): EmployeeListItem {
  const {
    _id,
    avatar,
    department,
    email,
    employeeId,
    employmentStatus,
    employmentType,
    firstName,
    hireDate,
    lastName,
    position,
  } = employee;

  return {
    id: _id.toString(),
    employeeId,
    fullName: [firstName, lastName].filter(Boolean).join(" "),
    email,
    department: refName(department),
    position: refName(position),
    employmentStatus,
    employmentType,
    hireDate,
    avatar,
  };
}

export { refId };
