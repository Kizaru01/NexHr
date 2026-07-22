import PositionManagement from "@/components/Management/PositionManagement";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { normaliseSearchParams } from "@/lib/search-params";
import { getPositionDirectory } from "@/lib/queries/management.queries";
import type { PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

export default async function PositionsPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const { departments, positions } = await getPositionDirectory(filters);

  return (
    <PositionManagement
      departments={departments}
      initialPositions={positions}
    />
  );
}
