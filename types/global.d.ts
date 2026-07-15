type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
};
// TAPOS ETO NAMAN FOR GLOBAL RESPONSE TYPE USUALLY SERVER ACTIONS
type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

// API ERROR RESPONSE TAYA INI GUYZ
type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

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

import type { Address, CreateEmployeeParams } from "@/types/global";

/**
 * NOTE: `CreateEmployeeParams` in `types/global.d.ts` doesn't include
 * `email`/`address`/etc, even though `IEmployee` (the Mongoose model)
 * requires `email`. Rather than editing your existing global type, we
 * extend it here. This keeps the original architecture untouched.
 */
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
