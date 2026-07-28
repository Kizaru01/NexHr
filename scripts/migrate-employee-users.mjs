import mongoose from "mongoose";

const databaseUri = process.env.MONGODB_URI;

if (!databaseUri) {
  throw new Error("MONGODB_URI is required to run the employee-user migration.");
}

function normaliseEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function employeeUserDocument(email, id) {
  const now = new Date();

  return {
    ...(id ? { _id: id } : {}),
    email,
    provider: "google",
    role: "employee",
    isActive: true,
    notification: {
      leave: true,
      attendance: true,
      announcements: true,
      payroll: true,
      email: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

async function migrateEmployee(employee, employees, users) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const currentEmployee = await employees.findOne(
        { _id: employee._id },
        { session }
      );

      if (!currentEmployee) return;

      let userId = currentEmployee.userId;
      const legacyEmail = normaliseEmail(currentEmployee.email);

      if (!userId) {
        if (!legacyEmail) {
          throw new Error(
            `Employee ${currentEmployee._id.toString()} has no userId or legacy email.`
          );
        }

        let user = await users.findOne({ email: legacyEmail }, { session });

        if (user && user.role !== "employee") {
          throw new Error(
            `Cannot link employee ${currentEmployee._id.toString()} to a ${user.role} account.`
          );
        }

        if (!user) {
          const result = await users.insertOne(
            employeeUserDocument(legacyEmail),
            { session }
          );
          user = { _id: result.insertedId };
        }

        userId = user._id;
        const conflictingEmployee = await employees.findOne(
          { _id: { $ne: currentEmployee._id }, userId },
          { session }
        );

        if (conflictingEmployee) {
          throw new Error(
            `User ${userId.toString()} is already linked to another employee.`
          );
        }
      } else {
        const linkedUser = await users.findOne({ _id: userId }, { session });

        if (!linkedUser) {
          if (!legacyEmail) {
            throw new Error(
              `Employee ${currentEmployee._id.toString()} references a missing user and has no legacy email.`
            );
          }

          await users.insertOne(employeeUserDocument(legacyEmail, userId), {
            session,
          });
        } else if (linkedUser.role !== "employee") {
          throw new Error(
            `Cannot link employee ${currentEmployee._id.toString()} to a ${linkedUser.role} account.`
          );
        }
      }

      await employees.updateOne(
        { _id: currentEmployee._id },
        { $set: { userId }, $unset: { email: "" } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}

async function runMigration() {
  await mongoose.connect(databaseUri, { bufferCommands: false });

  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB connection is unavailable.");

  const employees = database.collection("employees");
  const users = database.collection("users");
  const records = await employees
    .find({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { email: { $exists: true } },
      ],
    })
    .project({ _id: 1, userId: 1, email: 1 })
    .toArray();

  for (const record of records) {
    await migrateEmployee(record, employees, users);
  }

  const unlinkedEmployees = await employees.countDocuments({
    $or: [{ userId: { $exists: false } }, { userId: null }],
  });

  if (unlinkedEmployees > 0) {
    throw new Error(
      `Migration finished with ${unlinkedEmployees} unlinked employee records.`
    );
  }

  const indexes = await employees.indexes();
  const legacyEmailIndexes = indexes.filter(
    ({ key }) => Object.keys(key).length === 1 && key.email === 1
  );
  const userIdIndex = indexes.find(
    ({ key }) => Object.keys(key).length === 1 && key.userId === 1
  );
  const shouldRebuildUserIdIndex =
    !userIdIndex || userIdIndex.sparse || userIdIndex.unique !== true;

  for (const index of legacyEmailIndexes) {
    if (index.name) await employees.dropIndex(index.name);
  }

  if (shouldRebuildUserIdIndex && userIdIndex?.name) {
    await employees.dropIndex(userIdIndex.name);
  }

  if (shouldRebuildUserIdIndex) {
    await employees.createIndex(
      { userId: 1 },
      { name: "userId_1", unique: true }
    );
  }

  console.log(`Migrated ${records.length} employee record(s).`);
}

try {
  await runMigration();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
