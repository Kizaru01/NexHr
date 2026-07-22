import type { NextResponse } from "next/server";

export type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
};
export type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
export type ErrorResponse = ActionResponse<undefined> & { success: false };

export type APIErrorResponse = NextResponse<ErrorResponse>;
export type APIResponse<T = null> = NextResponse<
  SuccessResponse<T> | ErrorResponse
>;

export type UserRole = "admin" | "hr" | "employee";
export type Gender = "Male" | "Female";
export type EmploymentType =
  | "Regular"
  | "Probationary"
  | "Contractual"
  | "Intern"
  | "Part-time";

export type EmploymentStatus =
  | "Active"
  | "Inactive"
  | "On Leave"
  | "Resigned"
  | "Terminated"
  | "Suspended";

export interface Salary {
  basic: number;
  allowance?: number;
}
export interface CreateEmployeeParams {
  requestId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  department: string;
  position: string;
  hireDate: Date;
  employmentType: EmploymentType;
  salary: Salary;
  manager?: string;
  notes?: string;
}
export interface Address {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface EmergencyContactInfo {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface CreateEmployeeInput extends CreateEmployeeParams {
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: Gender;
  avatar?: string;
  address?: Address;
  emergencyContact?: EmergencyContactInfo;
}

export interface UpdateEmployeeInput extends Partial<
  Omit<CreateEmployeeInput, "requestId">
> {
  employeeId: string;
}

export interface UpdatePersonalInformationParams {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: Gender;
  avatar?: string;
}

export interface UpdateEmploymentInformationParams {
  employeeId: string;
  department: string;
  position: string;
  hireDate: Date;
  employmentType: CreateEmployeeParams["employmentType"];
  employmentStatus?: EmploymentStatus;
  manager?: string;
  notes?: string;
}

export interface UpdateEmergencyContactParams {
  employeeId: string;
  emergencyContact: EmergencyContactInfo;
}

export interface UpdateAddressParams {
  employeeId: string;
  address: Address;
}

export interface DeleteEmployeeParams {
  employeeId: string;
}

export interface GetEmployeeByIdParams {
  employeeId: string;
}

export interface GetEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
}

export interface EmployeeListItem {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: Date;
  avatar?: string;
}

export interface EmployeeListResultItem {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: Date;
}

export interface GetEmployeesResult {
  employees: EmployeeListItem[];
  totalEmployees: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeDetail {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: Gender;
  avatar?: string;
  address?: Address;
  emergencyContact?: EmergencyContactInfo;
  department: string;
  position: string;
  hireDate: Date;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  salary: Salary;
  regularizedAt?: Date;
  terminationDate?: Date;
  manager?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
