import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

export default async function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireHrAdminPage();
  return children;
}
