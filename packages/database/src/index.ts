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

// Re-export enums from generated Prisma client
export { UserType } from '@prisma/client'
export { UserStatus } from '@prisma/client'
export { CustomerType } from '@prisma/client'
export { ProfessionalType } from '@prisma/client'
export { Specialization } from '@prisma/client'
export { AcademyLevel } from '@prisma/client'
export { AvailabilityStatus } from '@prisma/client'
export { ProductCategory } from '@prisma/client'
export { DifficultyLevel } from '@prisma/client'
export { ProjectType } from '@prisma/client'
export { ProjectStatus } from '@prisma/client'
export { FinancingType } from '@prisma/client'
export { PaymentStatus } from '@prisma/client'
export { QuoteStatus } from '@prisma/client'
export { TransactionStatus } from '@prisma/client'
export { ContentCategory } from '@prisma/client'
export { ContentType } from '@prisma/client'
export { ContentLevel } from '@prisma/client'
export { ProgressStatus } from '@prisma/client'
export { NotificationType } from '@prisma/client'
export { NotificationCategory } from '@prisma/client'