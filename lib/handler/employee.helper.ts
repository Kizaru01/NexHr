import { serialiseDate } from "@/lib/serialization";
import {
  formatPersonName,
  normalisePersonName,
} from "@/lib/person-name";
import Employee, {
  type IEmployee,
  type IEmployeeDoc,
} from "@/models/employee.model";
import type {
  Address,
  EmergencyContactInfo,
  EmployeeDetail,
  EmployeeListItem,
  EmployeePositionSelectOption,
  EmployeeSelectOption,
} from "@/types/global";
import { NotFoundError } from "../http-errors";
import { getUserEmail } from "./user.helper";

interface StringableReference {
  toString(): string;
}

interface PopulatedRef {
  _id: StringableReference;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  manager?: unknown;
}

function isPopulated(ref: unknown): ref is PopulatedRef {
  return ref !== null && typeof ref === "object" && "_id" in ref;
}

function refName(ref: unknown): string {
  if (isPopulated(ref)) {
    const personName = formatPersonName(ref);
    return ref.name ?? (personName || ref._id.toString());
  }
  return ref ? String(ref) : "";
}

function refId(ref: unknown): string | undefined {
  if (isPopulated(ref)) return ref._id.toString();
  return ref ? String(ref) : undefined;
}

function toAddress(address: IEmployee["address"]): Address | undefined {
  if (!address) return undefined;

  return {
    street: address.street,
    barangay: address.barangay,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
  };
}

function toEmergencyContact(
  emergencyContact: IEmployee["emergencyContact"]
): EmergencyContactInfo | undefined {
  if (!emergencyContact) return undefined;

  return {
    name: emergencyContact.name,
    relationship: emergencyContact.relationship,
    phone: emergencyContact.phone,
  };
}

function managerNameForDepartment(department: unknown): string | undefined {
  if (!isPopulated(department) || !department.manager) return undefined;
  return refName(department.manager);
}

export async function findEmployeeDetailOrThrow(
  employeeId: string
): Promise<IEmployeeDoc> {
  const employee = await Employee.findOne({ employeeId })
    .populate("userId", "email isActive")
    .populate({
      path: "department",
      populate: {
        path: "manager",
        select: "firstName middleName lastName",
      },
    })
    .populate("position");

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
    middleName,
    notes,
    phone,
    position,
    regularizedAt,
    profileCompleted,
    terminationDate,
    updatedAt,
    userId,
  } = employee;

  return {
    id: _id.toString(),
    employeeId,
    firstName: normalisePersonName(firstName),
    middleName: middleName
      ? normalisePersonName(middleName)
      : undefined,
    lastName: normalisePersonName(lastName),
    email: getUserEmail(userId),
    phone,
    birthDate: serialiseDate(birthDate),
    gender,
    avatar,
    address: toAddress(address),
    emergencyContact: toEmergencyContact(emergencyContact),
    department: refName(department),
    position: refName(position),
    hireDate: serialiseDate(hireDate),
    employmentStatus,
    employmentType,
    regularizedAt: serialiseDate(regularizedAt),
    terminationDate: serialiseDate(terminationDate),
    profileCompleted,
    manager: managerNameForDepartment(department),
    notes,
    createdAt: serialiseDate(createdAt),
    updatedAt: serialiseDate(updatedAt),
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
    fullName:
      formatPersonName({ firstName, lastName }) || getUserEmail(userId),
    email: getUserEmail(userId),
    department: refName(department),
    position: refName(position),
    employmentStatus,
    employmentType,
    hireDate: serialiseDate(hireDate),
    avatar,
  };
}

export function toEmployeeDepartmentOption(department: {
  _id: StringableReference;
  name: string;
}): EmployeeSelectOption {
  return {
    value: department._id.toString(),
    label: department.name,
  };
}

export function toEmployeePositionOption(position: {
  _id: StringableReference;
  name: string;
  department: StringableReference;
}): EmployeePositionSelectOption {
  return {
    value: position._id.toString(),
    label: position.name,
    departmentId: position.department.toString(),
  };
}

export function toEmployeeManagerOption(manager: {
  _id: StringableReference;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): EmployeeSelectOption {
  return {
    value: manager._id.toString(),
    label: formatPersonName(manager),
  };
}

export { refId };
