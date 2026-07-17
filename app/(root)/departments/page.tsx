import DepartmentManagement from "@/components/Management/DepartmentManagement";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { normaliseSearchParams } from "@/lib/search-params";
import { getDepartmentDirectory } from "@/queries/management.queries";
import type { PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

export default async function DepartmentsPage({ searchParams }: PageProps) {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const departments = await getDepartmentDirectory(filters);

  return <DepartmentManagement initialDepartments={departments} />;
}
