import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";

const Settings = async (): Promise<React.JSX.Element> => {
  await requireHrAdminPage();
  return (
    <section className="space-y-6">
      <div>
        <p className="page-eyebrow">Administration</p>
        <h1 className="heading-1">Settings</h1>
        <p className="page-description">
          Configure your workspace preferences and organization defaults.
        </p>
      </div>
      <div className="surface-card p-6">
        <h2 className="heading-3">Workspace settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Settings options will appear here as they become available.
        </p>
      </div>
    </section>
  );
};

export default Settings;
