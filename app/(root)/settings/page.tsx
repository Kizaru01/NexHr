import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const Settings = async () => {
  await requireHrAdminPage();
  return <div>Settings</div>;
};

export default Settings;
