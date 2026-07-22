import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const AuditLogs = async (): Promise<React.JSX.Element> => {
  await requireHrAdminPage();
  return <div>AuditLogs</div>;
};

export default AuditLogs;
