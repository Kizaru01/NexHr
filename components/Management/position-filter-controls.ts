import {
  managementStatusOptions,
  positionSortOptions,
} from "@/constants/filter-options";
import type { FilterControl } from "@/types/filters";
import type { DepartmentOption } from "@/types/management";

export function createPositionFilterControls(
  departments: DepartmentOption[]
): readonly FilterControl[] {
  return [
    {
      type: "search",
      key: "search",
      placeholder: "Search position, department, or description",
      ariaLabel: "Search positions",
      className: "md:w-80",
    },
    {
      type: "select",
      key: "department",
      label: "Department",
      emptyLabel: "All departments",
      options: departments.map((department) => ({
        label: department.name,
        value: department.id,
      })),
    },
    {
      type: "select",
      key: "status",
      label: "Position status",
      emptyLabel: "All statuses",
      options: managementStatusOptions,
    },
    {
      type: "select",
      key: "sort",
      label: "Sort positions",
      emptyLabel: "Default sort",
      options: positionSortOptions,
    },
  ];
}
