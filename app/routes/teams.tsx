import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/teams";
import { prisma } from "~/db.server";

// BACKEND - Fetch all teams
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  const teams = await prisma.team.findMany({
    where: category ? { category } : undefined,
    include: {
      essayPrompts: {
        select: {
          id: true
        }
      },
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Get unique categories for filter
  const allTeams = await prisma.team.findMany({
    select: {
      category: true
    },
    distinct: ['category']
  });

  const categories = allTeams.map(t => t.category).sort();

  return { teams, categories, selectedCategory: category };
}