export type DepartmentListItem = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type PositionListItem = {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  departmentIsActive: boolean;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
