import EmployeeForm from "@/components/Forms/EmployeeForm";
import connectToDatabase from "@/database/mongodb";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";

const NewEmployee = async () => {
  await connectToDatabase();

  const [departments, positions, managers] = await Promise.all([
    Department.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Position.find({ isActive: true })
      .select("_id title")
      .sort({ title: 1 })
      .lean(),
    Employee.find({ employmentStatus: "Active" })
      .select("_id firstName middleName lastName")
      .sort({ firstName: 1, lastName: 1 })
      .lean(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Employee</h1>
        <p className="text-muted-foreground">
          Fill out the employee&apos;s personal, employment, salary, address,
          and emergency contact details.
        </p>
      </div>

      <EmployeeForm
        departmentOptions={departments.map((department) => ({
          value: department._id.toString(),
          label: department.name,
        }))}
        positionOptions={positions.map((position) => ({
          value: position._id.toString(),
          label: position.title,
        }))}
        managerOptions={managers.map((manager) => ({
          value: manager._id.toString(),
          label: [manager.firstName, manager.middleName, manager.lastName]
            .filter(Boolean)
            .join(" "),
        }))}
      />
    </div>
  );
};

export default NewEmployee;
