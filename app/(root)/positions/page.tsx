import PositionManagement from "@/components/Management/PositionManagement";
import connectToDatabase from "@/database/mongodb";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import Department from "@/models/department.model";
import Position from "@/models/position.model";

const Positions = async () => {
  await requireHrAdminPage();
  await connectToDatabase();

  const [departments, positions] = await Promise.all([
    Department.find({}).sort({ name: 1 }).select("_id name isActive").lean(),
    Position.find({})
      .sort({ name: 1 })
      .select("_id name department description isActive createdAt updatedAt")
      .lean(),
  ]);

  const departmentById = new Map(
    departments.map((department) => [department._id.toString(), department])
  );

  return (
    <PositionManagement
      departments={departments.map((department) => ({
        id: department._id.toString(),
        name: department.name,
        isActive: department.isActive,
      }))}
      initialPositions={positions.map((position) => {
        const department = departmentById.get(position.department.toString());

        return {
          id: position._id.toString(),
          name: position.name,
          departmentId: position.department.toString(),
          departmentName: department?.name ?? "Deleted department",
          departmentIsActive: department?.isActive ?? false,
          description: position.description,
          isActive: position.isActive,
          createdAt: position.createdAt.toISOString(),
          updatedAt: position.updatedAt.toISOString(),
        };
      })}
    />
  );
};

export default Positions;
