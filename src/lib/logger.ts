import Log from "@/models/Log";
import connectToDatabase from "./db";

export async function createLog(data: {
  userName: string;
  userRole: string;
  action: string;
  details?: string;
  path?: string;
}) {
  try {
    await connectToDatabase();
    await Log.create({
      user: {
        name: data.userName,
        role: data.userRole
      },
      action: data.action,
      details: data.details,
      path: data.path,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Log Creation Error:", error);
  }
}
