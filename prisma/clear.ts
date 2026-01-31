import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function clearDatabase() {
  console.log("🗑️  Clearing database...")

  // Delete in order to respect foreign key constraints
  // Start with tables that have no dependents, work up to parent tables
  
  await prisma.interviewSlot.deleteMany()
  console.log("  ✓ Cleared interview slots")
  
  await prisma.applicationResponse.deleteMany()
  console.log("  ✓ Cleared application responses")
  
  await prisma.applicationScore.deleteMany()
  console.log("  ✓ Cleared application scores")
  
  await prisma.application.deleteMany()
  console.log("  ✓ Cleared applications")
  
  await prisma.applicationQuestion.deleteMany()
  console.log("  ✓ Cleared application questions")
  
  await prisma.studentProfile.deleteMany()
  console.log("  ✓ Cleared student profiles")
  
  await prisma.teamMembership.deleteMany()
  console.log("  ✓ Cleared team memberships")
  
  await prisma.recruitingCycle.deleteMany()
  console.log("  ✓ Cleared recruiting cycles")
  
  await prisma.team.deleteMany()
  console.log("  ✓ Cleared teams")
  
  await prisma.user.deleteMany()
  console.log("  ✓ Cleared users")

  console.log("✅ Database cleared\n")
}

async function main() {
  await clearDatabase()
  await prisma.$disconnect()
}

// If run directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
