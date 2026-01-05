import { useLoaderData, Form } from "react-router";
import type { Route } from "./+types/teams.$id";
import { prisma } from "~/db.server";
import type { Application } from "@prisma/client";

// BACKEND - Fetch team data
export async function loader({ params }: Route.LoaderArgs) {
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      essayPrompts: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!team) {
    throw new Response("Team not found", { status: 404 });
  }

  return { team };
}

// BACKEND - Handle application start
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;

  // TODO: Get actual user ID from session/auth

  try {
    // Create a new application for this team
    const application : Application = await prisma.application.create({
      data: {
        userId: userId,
        teamId: params.id!,
        status: "DRAFT"
      }
    });

    // Redirect to the application page
    return Response.redirect(`/applications/${application.id}`);
  } catch (error) {
    return Response.json({ error: "Failed to start application" }, { status: 500 });
  }
}