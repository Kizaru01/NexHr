import Employee, { type IEmployeeDoc } from "@/models/employee.model";
import type { EmployeeDetail, EmployeeListItem } from "@/types/global";
import { NotFoundError } from "../http-errors";
import { getUserEmail } from "./user.helper";

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
    .populate("userId", "email isActive")
    .populate("department")
    .populate("position")
    .populate("manager");

  if (!employee) {
    throw new NotFoundError("Employee");
  }

  return employee;
}

export function toEmployeeDetail(employee: IEmployeeDoc): EmployeeDetail {
  const {
    _id,
    address,
    avatar,
    birthDate,
    createdAt,
    department,
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
    userId,
  } = employee;

  return {
    id: _id.toString(),
    employeeId,
    firstName,
    middleName,
    lastName,
    email: getUserEmail(userId),
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
    employeeId,
    employmentStatus,
    employmentType,
    firstName,
    hireDate,
    lastName,
    position,
    userId,
  } = employee;

  return {
    id: _id.toString(),
    employeeId,
    fullName: [firstName, lastName].filter(Boolean).join(" "),
    email: getUserEmail(userId),
    department: refName(department),
    position: refName(position),
    employmentStatus,
    employmentType,
    hireDate,
    avatar,
  };
}

export { refId };
