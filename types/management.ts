import type { Salary } from "@/types/global";

export type DepartmentListItem = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type DepartmentManagerOption = {
  id: string;
  name: string;
  departmentId: string;
};

export type PositionListItem = {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  departmentIsActive: boolean;
  description?: string;
  salary: Salary;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentListSource = {
  _id: { toString(): string };
  name: string;
  code?: string;
  description?: string;
  manager?: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PositionListSource = {
  _id: { toString(): string };
  name: string;
  department: { toString(): string };
  description?: string;
  salary: Salary;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PositionDirectoryResult = {
  departments: DepartmentOption[];
  positions: PositionListItem[];
};
