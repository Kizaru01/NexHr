import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

export default async function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  await requireHrAdminPage();
  return children;
}
