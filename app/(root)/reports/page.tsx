import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const Reports = async () => {
  await requireHrAdminPage();
  return <div>Reports</div>;
};

export default Reports;
