import { auth } from "@/auth";
import connectToDatabase from "@/database/mongodb";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import ConcernAttachment from "@/models/concern-attachment.model";
import Concern from "@/models/concern.model";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/concern-attachments/[id]">
): Promise<Response> {
  const session = await auth();

  if (!session?.user?.id || !session.user.isActive || !session.user.role) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectToDatabase();
  const { id } = await context.params;
  const attachment = await ConcernAttachment.findById(id).select("+data");

  if (!attachment) {
    return new Response("Attachment not found", { status: 404 });
  }

  if (session.user.role === "employee") {
    const employee = await requireEmployeeRecord(session.user.id);
    const concern = await Concern.findOne({
      _id: attachment.concern,
      employee: employee.employeeDatabaseId,
    }).select("_id");

    if (!concern) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const encodedData = attachment.data.split(",", 2)[1];

  if (!encodedData) {
    return new Response("Attachment is unavailable", { status: 410 });
  }

  const safeName = attachment.name.replace(/[\r\n"]/g, "_");
  const bytes = Uint8Array.from(Buffer.from(encodedData, "base64"));

  return new Response(bytes, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": String(bytes.byteLength),
      "Content-Type": attachment.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
