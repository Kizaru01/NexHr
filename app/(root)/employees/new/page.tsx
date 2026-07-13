import EmployeeForm from "@/components/Forms/EmployeeForm";

const page = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Employee</h1>
        <p className="text-muted-foreground">
          Fill out the employee&apos;s personal, employment, salary, address,
          and emergency contact details.
        </p>
      </div>

      <EmployeeForm />
    </div>
  );
};

export default page;
