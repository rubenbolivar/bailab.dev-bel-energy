import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'

// Export custom enums from Prisma schema as both types and values
export {
  UserType,
  UserStatus,
  CustomerType,
  ProfessionalType,
  Specialization,
  AcademyLevel,
  AvailabilityStatus,
  ProductCategory,
  DifficultyLevel,
  ProjectType,
  ProjectStatus,
  FinancingType,
  PaymentStatus,
  QuoteStatus,
  TransactionStatus,
  ContentCategory,
  ContentType,
  ContentLevel,
  ProgressStatus,
  NotificationType,
  NotificationCategory
} from '@prisma/client'