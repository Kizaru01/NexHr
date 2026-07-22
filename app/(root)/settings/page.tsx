import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const Settings = async (): Promise<React.JSX.Element> => {
  await requireHrAdminPage();
  return <div>Settings</div>;
};

export default Settings;
