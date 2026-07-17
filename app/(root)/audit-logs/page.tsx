import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const AuditLogs = async () => {
  await requireHrAdminPage();
  return <div>AuditLogs</div>;
};

export default AuditLogs;
