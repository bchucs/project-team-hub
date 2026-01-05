import type { Route } from "./+types/applications.$id";
import { prisma } from "~/db.server";

// BACKEND - Fetch application data
export async function loader({ params }: Route.LoaderArgs) {
  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      team: {
        include: {
          essayPrompts: {
            orderBy: { order: 'asc' }
          }
        }
      },
      essayResponses: true,
      user: true
    }
  });

  if (!application) {
    throw new Response("Application not found", { status: 404 });
  }

  return { application };
}

// BACKEND - Handle form submissions
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const promptId = formData.get("promptId") as string;
  const content = formData.get("content") as string;

  // Update or create essay response
  await prisma.essayResponse.upsert({
    where: {
      applicationId_promptId: {
        applicationId: params.id!,
        promptId: promptId
      }
    },
    update: {
      content
    },
    create: {
      applicationId: params.id!,
      promptId: promptId,
      content
    }
  });

  return { success: true };
}