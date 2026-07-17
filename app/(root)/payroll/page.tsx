import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const Payroll = async () => {
  await requireHrAdminPage();
  return <div>Payroll</div>;
};

export default Payroll;
