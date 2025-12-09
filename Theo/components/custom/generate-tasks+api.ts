import { ExpoRequest } from "expo-router/server";
import { generateTasksWithAI } from "@/lib/ai";

export async function POST(req: ExpoRequest): Promise<Response> {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return Response.json({ error: "Goal is required" }, { status: 400 });
    }

    const tasks = await generateTasksWithAI(goal);
    return Response.json({ tasks: tasks ?? [] });
  } catch (error) {
    console.error("Error generating tasks:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return Response.json(
      { error: "Failed to generate tasks.", details: errorMessage },
      { status: 500 }
    );
  }
}
