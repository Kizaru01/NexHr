import { EmployeeForm } from "@/components/Forms";
import connectToDatabase from "@/database/mongodb";
import {
  toEmployeeDepartmentOption,
  toEmployeePositionOption,
} from "@/lib/handler/employee.helper";
import Department from "@/models/department.model";
import Position from "@/models/position.model";

const NewEmployee = async (): Promise<React.JSX.Element> => {
  await connectToDatabase();

  const departments = await Department.find({ isActive: true })
    .select("_id name")
    .sort({ name: 1 })
    .lean();

  const positions = await Position.find({
    isActive: true,
    department: { $in: departments.map((department) => department._id) },
  })
    .select("_id name department")
    .sort({ name: 1 })
    .lean();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="page-eyebrow">People directory</p>
        <h1 className="heading-1">Add New Employee</h1>
        <p className="page-description">
          Enter the employee&apos;s name, contact number, work email, and
          employment details. They will complete the remaining personal
          information after activation.
        </p>
      </div>

      <EmployeeForm
        departmentOptions={departments.map(toEmployeeDepartmentOption)}
        positionOptions={positions.map(toEmployeePositionOption)}
      />
    </div>
  );
};

export default NewEmployee;
