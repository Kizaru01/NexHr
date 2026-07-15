import type { ClientSession } from "mongoose";

import Counter from "@/models/counter.model";
import Employee from "@/models/employee.model";

const EMPLOYEE_ID_COUNTER = "employeeId";
const EMPLOYEE_ID_PREFIX = "EMP-";
const EMPLOYEE_ID_DIGITS = 6;

async function initializeEmployeeCounter(
  session: ClientSession
): Promise<void> {
  const existingCounter = await Counter.exists({
    _id: EMPLOYEE_ID_COUNTER,
  }).session(session);

  if (existingCounter) return;

  const [highestExistingId] = await Employee.aggregate<{
    sequence?: number;
  }>([
    {
      $match: {
        employeeId: { $regex: "^EMP-\\d+$" },
      },
    },
    {
      $project: {
        sequence: {
          $convert: {
            input: { $substrBytes: ["$employeeId", 4, -1] },
            to: "long",
            onError: 0,
            onNull: 0,
          },
        },
      },
    },
    { $sort: { sequence: -1 } },
    { $limit: 1 },
  ]).session(session);

  const startingSequence = Number(highestExistingId?.sequence ?? 0);
  if (!Number.isSafeInteger(startingSequence) || startingSequence < 0) {
    throw new Error("The existing employee ID sequence is invalid.");
  }

  await Counter.findOneAndUpdate(
    { _id: EMPLOYEE_ID_COUNTER },
    { $setOnInsert: { sequence: startingSequence } },
    {
      new: true,
      upsert: true,
      runValidators: true,
      session,
    }
  );
}

/**
 * Atomically reserves the next employee number in the caller's transaction.
 * An aborted transaction rolls this increment back together with the employee.
 */
export async function getNextEmployeeId(
  session: ClientSession
): Promise<string> {
  await initializeEmployeeCounter(session);

  const counter = await Counter.findOneAndUpdate(
    { _id: EMPLOYEE_ID_COUNTER },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      runValidators: true,
      session,
    }
  );

  if (!counter) {
    throw new Error("Unable to reserve the next employee ID.");
  }

  return `${EMPLOYEE_ID_PREFIX}${counter.sequence
    .toString()
    .padStart(EMPLOYEE_ID_DIGITS, "0")}`;
}
