import DepartmentManagement from "@/components/Management/DepartmentManagement";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { normaliseSearchParams } from "@/lib/search-params";
import { getDepartmentDirectory } from "@/lib/queries/management.queries";
import type { PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

export default async function DepartmentsPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  await requireHrAdminPage();

  const filters = normaliseSearchParams(query);
  const departments = await getDepartmentDirectory(filters);

  return <DepartmentManagement initialDepartments={departments} />;
}
