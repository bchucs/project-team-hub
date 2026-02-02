import { PrismaClient } from "@prisma/client"
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3"

const prisma = new PrismaClient()

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: !!process.env.S3_ENDPOINT,
})
const S3_BUCKET = process.env.S3_BUCKET!

async function clearMinIOBucket() {
  console.log("Clearing MinIO bucket...")

  try {
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
    })
    const listResponse = await s3.send(listCommand)

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log("Bucket is already empty")
      return
    }

    // Delete all objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: S3_BUCKET,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
        Quiet: false,
      },
    })
    await s3.send(deleteCommand)

    console.log(`Deleted ${listResponse.Contents.length} resume(s) from MinIO`)
  } catch (error) {
    console.error("Failed to clear MinIO bucket:", error)
    throw error
  }

  console.log("MinIO bucket cleared\n")
}

export async function clearDatabase() {
  console.log("Clearing database...")

  // Delete in order to respect foreign key constraints
  // Start with tables that have no dependents, work up to parent tables
  
  await prisma.interviewSlot.deleteMany()
  console.log("Cleared interview slots")
  
  await prisma.applicationResponse.deleteMany()
  console.log("Cleared application responses")
  
  await prisma.applicationScore.deleteMany()
  console.log("Cleared application scores")
  
  await prisma.application.deleteMany()
  console.log("Cleared applications")
  
  await prisma.applicationQuestion.deleteMany()
  console.log("Cleared application questions")
  
  await prisma.studentProfile.deleteMany()
  console.log("Cleared student profiles")
  
  await prisma.teamMembership.deleteMany()
  console.log("Cleared team memberships")
  
  await prisma.recruitingCycle.deleteMany()
  console.log("Cleared recruiting cycles")
  
  await prisma.team.deleteMany()
  console.log("Cleared teams")
  
  await prisma.user.deleteMany()
  console.log("Cleared users")

  console.log("Database cleared\n")
}

export async function clear() {
  await clearMinIOBucket()
  await clearDatabase()
  await prisma.$disconnect()
}

// If run directly
if (require.main === module) {
  clear()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
