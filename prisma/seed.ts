import { PrismaClient, TeamCategory, QuestionType } from "@prisma/client"
import { hashPassword } from "../lib/password"
import { clearDatabase } from "./clear"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data first
  await clearDatabase()
  
  console.log("🌱 Seeding database...")

  // Create a platform admin user (needed for createdBy relations)
  const hashedPassword = await hashPassword("password123")
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cornell.edu" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@cornell.edu",
      name: "Platform Admin",
      role: "PLATFORM_ADMIN",
      password: hashedPassword,
    },
  })

  console.log("✓ Created admin user")

  // Team data
  const teamsData = [
    {
      name: "Cornell iGEM",
      slug: "cornell-igem",
      category: "BIOMEDICAL_ENGINEERING" as TeamCategory,
      shortDescription: "Student team that applies synthetic biology to real-world problems and competes in the iGEM Giant Jamboree.",
      description: "Cornell iGEM is a student-run project team that uses synthetic biology to tackle real-world challenges. Each year, we design and build innovative biological systems, then present our work at the iGEM Giant Jamboree, the world's largest synthetic biology competition. Our team brings together students from diverse backgrounds including biology, engineering, computer science, and policy.",
      contactEmail: "cornelligem@gmail.com",
      websiteUrl: "https://igem.engineering.cornell.edu/",
      instagramHandle: "cornelligem",
      memberCount: 50,
      tags: ["synthetic biology", "bioengineering", "research", "competition"],
      brandColor: "#10B981",
      subteams: ["Wet Lab", "Product Development", "Policy & Practices", "Business", "Wiki"],
    },
    {
      name: "Cornell Steel Bridge",
      slug: "cornell-steel-bridge",
      category: "STRUCTURAL_ENGINEERING" as TeamCategory,
      shortDescription: "Designs, fabricates, and competes with steel bridges annually.",
      description: "Cornell Steel Bridge is a project team dedicated to the design, fabrication, and construction of steel bridges for the annual ASCE Steel Bridge Competition. Our team provides hands-on experience in structural engineering, welding, and project management while competing against top engineering schools nationwide.",
      contactEmail: "steelbridge@cornell.edu",
      websiteUrl: "https://steelbridge.engineering.cornell.edu/",
      instagramHandle: "cornellsteelbridge",
      memberCount: 25,
      tags: ["structural design", "fabrication", "competition"],
      brandColor: "#6366F1",
      subteams: ["Design", "Fabrication", "Construction", "Business"],
    },
    {
      name: "Cornell Electric Vehicles",
      slug: "cornell-ev",
      category: "CAR" as TeamCategory,
      shortDescription: "Builds autonomous and energy-efficient electric vehicles.",
      description: "Cornell Electric Vehicles (CEV) designs and builds autonomous, energy-efficient electric vehicles. Our multidisciplinary team works on cutting-edge technology in mechanical systems, electrical engineering, autonomous navigation, and data analytics. We compete in national competitions and push the boundaries of sustainable transportation.",
      contactEmail: "cornellev@cornell.edu",
      websiteUrl: "https://www.cornellelectricvehicles.org/",
      instagramHandle: "cornellelectricvehicles",
      memberCount: 40,
      tags: ["vehicles", "autonomy", "hardware", "controls"],
      brandColor: "#F59E0B",
      subteams: ["Mechanical", "Electrical", "Autonomy", "Data & Analytics", "Operations"],
    },
    {
      name: "Cornell Data Science",
      slug: "cornell-data-science",
      category: "SOFTWARE" as TeamCategory,
      shortDescription: "Develops data-driven solutions to challenges across domains.",
      description: "Cornell Data Science is one of the largest project teams on campus, bringing together students passionate about data engineering, machine learning, and analytics. We work on real-world projects spanning quantitative finance, natural language processing, and data visualization, while building a strong community of data enthusiasts.",
      contactEmail: "info@cornelldata.science",
      websiteUrl: "https://cornelldata.science/",
      instagramHandle: "cornelldatascience",
      memberCount: 92,
      tags: ["ML/AI", "data engineering", "analytics"],
      brandColor: "#8B5CF6",
      subteams: ["Data Engineering", "Data Science", "Quantitative Finance", "Machine Learning Engineering"],
    },
    {
      name: "Cornell AppDev",
      slug: "cornell-appdev",
      category: "SOFTWARE" as TeamCategory,
      shortDescription: "Builds apps using professional-grade workflows and tools.",
      description: "Cornell AppDev is a project team that builds mobile and web applications used by thousands of Cornell students. We use industry-standard development practices, design thinking, and agile methodologies to create polished products. Our apps include Eatery, CourseGrab, and Transit—tools that improve daily life on campus.",
      contactEmail: "team@cornellappdev.com",
      websiteUrl: "https://www.cornellappdev.com/",
      instagramHandle: "cornellappdev",
      memberCount: 60,
      tags: ["app dev", "UX", "mobile", "web"],
      brandColor: "#EC4899",
      subteams: ["Product Design", "Backend", "iOS", "Android", "Marketing"],
    },
    {
      name: "Cornell Rocketry",
      slug: "cornell-rocketry",
      category: "AEROSPACE" as TeamCategory,
      shortDescription: "Designs, assembles, and launches high-powered rockets for competition.",
      description: "Cornell Rocketry Team designs, builds, and launches high-powered rockets to compete in the Spaceport America Cup and other national competitions. Our team works on propulsion systems, avionics, airframe structures, and recovery mechanisms, providing members with hands-on aerospace engineering experience.",
      contactEmail: "rocketry@cornell.edu",
      websiteUrl: "https://cornellrocketryteam.com/",
      instagramHandle: "cornellrocketry",
      memberCount: 50,
      tags: ["aerospace", "propulsion", "avionics"],
      brandColor: "#EF4444",
      subteams: ["Propulsion", "Avionics", "Airframe", "Recovery", "Business"],
    },
    {
      name: "Cornell Engineering World Health",
      slug: "cornell-ewh",
      category: "BIOMEDICAL_ENGINEERING" as TeamCategory,
      shortDescription: "Designs and implements health solutions for underserved communities.",
      description: "Cornell Engineering World Health designs and implements engineering solutions to address healthcare challenges in underserved communities around the world. We work on medical devices, health education tools, and sustainable healthcare infrastructure, combining technical skills with global health impact.",
      contactEmail: "ewhcornell@gmail.com",
      websiteUrl: "https://www.cornellewh.org/",
      instagramHandle: "cornellewh",
      memberCount: 35,
      tags: ["health tech", "humanitarian engineering"],
      brandColor: "#14B8A6",
      subteams: ["Design", "Implementation", "Outreach", "Research"],
    },
    {
      name: "Cornell Baja Racing",
      slug: "cornell-baja",
      category: "RACING" as TeamCategory,
      shortDescription: "Designs and races off-road vehicles in competitions.",
      description: "Cornell Baja Racing designs, builds, and races off-road vehicles in the annual Baja SAE competitions. Our team tackles challenges in suspension design, powertrain optimization, and driver ergonomics while competing against engineering schools from around the world in endurance races and technical events.",
      contactEmail: "baja@cornell.edu",
      websiteUrl: "https://www.cornellbaja.com/",
      instagramHandle: "cornellbaja",
      memberCount: 30,
      tags: ["automotive", "design", "fabrication"],
      brandColor: "#F97316",
      subteams: ["Suspension", "Powertrain", "Frame", "Ergonomics", "Business"],
    },
    {
      name: "Cornell Autonomous Underwater Vehicle",
      slug: "cornell-auv",
      category: "AUTONOMOUS_WATER" as TeamCategory,
      shortDescription: "Builds autonomous underwater vehicles for competition and research.",
      description: "Cornell AUV builds autonomous underwater vehicles that can navigate, detect objects, and complete tasks without human intervention. Our team competes in the RoboSub competition and works on cutting-edge technology in computer vision, controls, and marine robotics.",
      contactEmail: "auv@cornell.edu",
      websiteUrl: "https://www.cornellauv.com/",
      instagramHandle: "cornellauv",
      memberCount: 28,
      tags: ["robotics", "marine tech", "autonomy"],
      brandColor: "#0EA5E9",
      subteams: ["Mechanical", "Electrical", "Software", "Business"],
    },
    {
      name: "Engineers Without Borders Cornell",
      slug: "ewb-cornell",
      category: "ENVIRONMENTAL" as TeamCategory,
      shortDescription: "Implements sustainable engineering projects in communities worldwide.",
      description: "Engineers Without Borders Cornell partners with communities around the world to implement sustainable engineering solutions. Our projects focus on water, sanitation, energy, and infrastructure, giving students the opportunity to apply their technical skills to create lasting positive change.",
      contactEmail: "ewb@cornell.edu",
      websiteUrl: "https://www.ewbcornell.org/",
      instagramHandle: "ewbcornell",
      memberCount: 45,
      tags: ["global development", "sustainability"],
      brandColor: "#22C55E",
      subteams: ["Ghana Program", "Ecuador Program", "Morocco Program", "Fundraising"],
    },
  ]

  // Create teams with subteams
  for (const teamData of teamsData) {
    const { subteams, ...teamFields } = teamData

    const team = await prisma.team.upsert({
      where: { slug: teamData.slug },
      update: {},
      create: {
        ...teamFields,
        isActive: true,
        isRecruiting: true,
        createdById: adminUser.id,
      },
    })

    // Create subteams
    for (const subteamName of subteams) {
      await prisma.subteam.upsert({
        where: {
          id: `${team.id}-${subteamName.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          id: `${team.id}-${subteamName.toLowerCase().replace(/\s+/g, "-")}`,
          teamId: team.id,
          name: subteamName,
          isRecruiting: true,
        },
      })
    }

    console.log(`✓ Created team: ${team.name}`)
  }

  // Default application questions (used by all teams)
  const defaultQuestions = [
    {
      question: "Tell us about your relevant experience",
      description: "Include coursework, personal projects, internships, or other team experiences.",
      type: QuestionType.LONG_TEXT,
      isRequired: true,
      order: 1,
    },
    {
      question: "Why are you interested in joining this team?",
      description: "What excites you about our projects and mission?",
      type: QuestionType.LONG_TEXT,
      isRequired: true,
      order: 2,
    },
    {
      question: "What unique skills or perspectives would you bring?",
      description: "Think about both technical and non-technical contributions.",
      type: QuestionType.LONG_TEXT,
      isRequired: true,
      order: 3,
    },
    {
      question: "Can you commit to the time requirements?",
      description: "Most teams require 10-15 hours per week.",
      type: QuestionType.SELECT,
      isRequired: true,
      order: 4,
      options: ["Yes, I can fully commit", "I can commit with some flexibility", "I need to discuss my schedule"],
    },
    {
      question: "Is there anything else you'd like us to know?",
      description: "Optional - share any additional context about your application.",
      type: QuestionType.LONG_TEXT,
      isRequired: false,
      order: 5,
    },
  ]

  // Create recruiting cycles for all teams
  console.log("\n📅 Creating recruiting cycles...")

  const allTeams = await prisma.team.findMany()

  for (const team of allTeams) {
    // Create recruiting cycle
    const cycle = await prisma.recruitingCycle.upsert({
      where: {
        id: `${team.id}-spring-2026`,
      },
      update: {},
      create: {
        id: `${team.id}-spring-2026`,
        teamId: team.id,
        name: "Spring 2026",
        semester: "2026-Spring",
        applicationOpenDate: new Date("2026-01-20"),
        applicationDeadline: new Date("2026-01-29T23:59:59"),
        decisionDate: new Date("2026-02-10"),
        isActive: true,
        createdById: adminUser.id,
      },
    })

    // Create application questions for this cycle
    for (const q of defaultQuestions) {
      await prisma.applicationQuestion.upsert({
        where: {
          id: `${cycle.id}-q${q.order}`,
        },
        update: {},
        create: {
          id: `${cycle.id}-q${q.order}`,
          cycleId: cycle.id,
          question: q.question,
          description: q.description,
          type: q.type,
          isRequired: q.isRequired,
          order: q.order,
          options: q.options || [],
          createdById: adminUser.id,
        },
      })
    }

    console.log(`✓ Created recruiting cycle for: ${team.name}`)
  }

  // Create a sample student user with a predictable ID for testing
  const studentUser = await prisma.user.upsert({
    where: { email: "student@cornell.edu" },
    update: {
      password: hashedPassword,
    },
    create: {
      id: "demo-student-user-id",
      email: "student@cornell.edu",
      name: "Demo Student",
      role: "STUDENT",
      password: hashedPassword,
    },
  })

  // Create student profile
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      firstName: "Demo",
      lastName: "Student",
      netId: "ds123",
      year: "SOPHOMORE",
      college: "ENGINEERING",
      major: "Computer Science",
      expectedGraduation: "2027-Spring",
      skills: ["Python", "JavaScript", "React"],
      isComplete: true,
    },
  })

  console.log("✓ Created sample student")

  // Create a demo team leader with a predictable ID for testing
  const teamLeaderUser = await prisma.user.upsert({
    where: { email: "leader@cornell.edu" },
    update: {
      password: hashedPassword,
    },
    create: {
      id: "demo-team-leader-id",
      email: "leader@cornell.edu",
      name: "Demo Team Leader",
      role: "TEAM_LEAD",
      password: hashedPassword,
    },
  })

  // Link team leader to Cornell AppDev
  const appDevTeam = await prisma.team.findUnique({ where: { slug: "cornell-appdev" } })
  if (appDevTeam) {
    await prisma.teamMembership.upsert({
      where: {
        teamId_userId: {
          userId: teamLeaderUser.id,
          teamId: appDevTeam.id,
        },
      },
      update: {},
      create: {
        userId: teamLeaderUser.id,
        teamId: appDevTeam.id,
        role: "LEAD",
        joinedAt: new Date("2023-09-01"),
      },
    })

    // Get the active recruiting cycle for AppDev
    const appDevCycle = await prisma.recruitingCycle.findFirst({
      where: { teamId: appDevTeam.id, isActive: true },
    })

    if (appDevCycle) {
      // Create sample applications for AppDev
      const sampleApplicants = [
        { firstName: "Alex", lastName: "Johnson", netId: "aj456", email: "aj456@cornell.edu", year: "SOPHOMORE" as const, major: "Computer Science", subteam: "iOS" },
        { firstName: "Maria", lastName: "Garcia", netId: "mg789", email: "mg789@cornell.edu", year: "JUNIOR" as const, major: "Information Science", subteam: "Backend" },
        { firstName: "James", lastName: "Chen", netId: "jc123", email: "jc123@cornell.edu", year: "FRESHMAN" as const, major: "Computer Science", subteam: "iOS" },
        { firstName: "Emily", lastName: "Brown", netId: "eb234", email: "eb234@cornell.edu", year: "SENIOR" as const, major: "Computer Science", subteam: "Android" },
        { firstName: "David", lastName: "Kim", netId: "dk567", email: "dk567@cornell.edu", year: "SOPHOMORE" as const, major: "Computer Science", subteam: "Backend" },
        { firstName: "Sarah", lastName: "Miller", netId: "sm890", email: "sm890@cornell.edu", year: "JUNIOR" as const, major: "Information Science", subteam: "Product Design" },
        { firstName: "Michael", lastName: "Lee", netId: "ml111", email: "ml111@cornell.edu", year: "FRESHMAN" as const, major: "Computer Science", subteam: "iOS" },
        { firstName: "Lisa", lastName: "Wang", netId: "lw222", email: "lw222@cornell.edu", year: "JUNIOR" as const, major: "Computer Science", subteam: "Backend" },
      ]

      const statuses = ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED"] as const

      for (let i = 0; i < sampleApplicants.length; i++) {
        const applicant = sampleApplicants[i]

        // Create user for applicant
        const applicantUser = await prisma.user.upsert({
          where: { email: applicant.email },
          update: {},
          create: {
            email: applicant.email,
            name: `${applicant.firstName} ${applicant.lastName}`,
            role: "STUDENT",
          },
        })

        // Create student profile with predictable ID
        const profile = await prisma.studentProfile.upsert({
          where: { userId: applicantUser.id },
          update: {},
          create: {
            id: `sample-profile-${i}`,
            userId: applicantUser.id,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            netId: applicant.netId,
            year: applicant.year,
            college: "ENGINEERING",
            major: applicant.major,
            expectedGraduation: "2027-Spring",
            skills: ["JavaScript", "React", "Swift"],
            isComplete: true,
          },
        })

        // Find subteam
        const subteam = await prisma.subteam.findFirst({
          where: { teamId: appDevTeam.id, name: applicant.subteam },
        })

        // Create application - studentId references StudentProfile.id
        await prisma.application.upsert({
          where: { id: `sample-app-${i}` },
          update: {},
          create: {
            id: `sample-app-${i}`,
            studentId: profile.id,
            cycleId: appDevCycle.id,
            subteamId: subteam?.id || null,
            status: statuses[i % statuses.length],
            completionPercent: 100,
            submittedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // Stagger submission dates
          },
        })
      }

      console.log("✓ Created sample applications for Cornell AppDev")
    }
  }

  console.log("✓ Created demo team leader")

  console.log("\n✅ Seeding complete!")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
