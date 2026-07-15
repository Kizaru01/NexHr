import DepartmentManagement from "@/components/Management/DepartmentManagement";
import connectToDatabase from "@/database/mongodb";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import Department from "@/models/department.model";

const Departments = async () => {
  await requireHrAdminPage();
  await connectToDatabase();

  const departments = await Department.find({})
    .sort({ name: 1 })
    .select("_id name code description isActive createdAt updatedAt")
    .lean();

  return (
    <DepartmentManagement
      initialDepartments={departments.map((department) => ({
        id: department._id.toString(),
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: department.isActive,
        createdAt: department.createdAt.toISOString(),
        updatedAt: department.updatedAt.toISOString(),
      }))}
    />
  );
};

export default Departments;
