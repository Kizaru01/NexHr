import EmailRegistration from "@/components/Forms/RegisterEmailForm";

const Email = (): React.JSX.Element => {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Register with email
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address to continue.
        </p>
        <EmailRegistration />
      </div>
    </main>
  );
};
export default Email;
