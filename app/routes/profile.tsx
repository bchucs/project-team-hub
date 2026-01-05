import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/profile";
import { prisma } from "~/db.server";

// BACKEND - Fetch user profile data
export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Get actual user ID from session/auth
  // For now, we'll fetch the first user or throw an error
  const user = await prisma.user.findFirst({
    include: {
      applications: {
        include: {
          team: true
        }
      }
    }
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return { user };
}

// BACKEND - Handle profile updates
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  // TODO: Get actual user ID from session/auth
  const userId = formData.get("userId") as string;

  // Whitelist allowed fields
  const data: any = {};

  const name = formData.get("name");
  if (name) data.name = name as string;

  const personalEmail = formData.get("personalEmail");
  if (personalEmail) data.personalEmail = personalEmail as string;

  const phoneNumber = formData.get("phoneNumber");
  if (phoneNumber) data.phoneNumber = phoneNumber as string;

  const expectedGradYear = formData.get("expectedGradYear");
  if (expectedGradYear) data.expectedGradYear = parseInt(expectedGradYear as string);

  const majors = formData.get("majors");
  if (majors) data.majors = (majors as string).split(",").map(m => m.trim());

  const minors = formData.get("minors");
  if (minors) data.minors = (minors as string).split(",").map(m => m.trim());

  const resumeUrl = formData.get("resumeUrl");
  if (resumeUrl) data.resumeUrl = resumeUrl as string;

  // Never allow netId or cornellEmail to be changed!

  try {
    await prisma.user.update({
      where: { id: userId },
      data
    });
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update profile" };
  }
}