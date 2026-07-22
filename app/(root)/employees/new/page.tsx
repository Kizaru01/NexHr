import { EmployeeForm } from "@/components/Forms";
import connectToDatabase from "@/database/mongodb";
import {
  toEmployeeDepartmentOption,
  toEmployeeManagerOption,
  toEmployeePositionOption,
} from "@/lib/handler/employee.helper";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";

const NewEmployee = async (): Promise<React.JSX.Element> => {
  await connectToDatabase();

  const [departments, managers] = await Promise.all([
    Department.find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 })
      .lean(),
    Employee.find({ employmentStatus: "Active" })
      .select("_id firstName middleName lastName")
      .sort({ firstName: 1, lastName: 1 })
      .lean(),
  ]);

  const positions = await Position.find({
    isActive: true,
    department: { $in: departments.map((department) => department._id) },
  })
    .select("_id name department")
    .sort({ name: 1 })
    .lean();

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
        departmentOptions={departments.map(toEmployeeDepartmentOption)}
        positionOptions={positions.map(toEmployeePositionOption)}
        managerOptions={managers.map(toEmployeeManagerOption)}
      />
    </div>
  );
};

export default NewEmployee;
