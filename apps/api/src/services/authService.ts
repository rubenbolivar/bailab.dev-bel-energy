import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@bel-energy/database'
import { UserType } from '@bel-energy/database'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: UserType
  belScore?: number | null
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: UserType
  phone?: string
}

export class AuthService {
  private jwtSecret: string
  private jwtExpire: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret'
    this.jwtExpire = process.env.JWT_EXPIRE || '7d'
  }

  async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    const { email, password, firstName, lastName, userType, phone } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate unique referral code
    const referralCode = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Date.now().toString().slice(-4)}`

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType,
        phone,
        referralCode,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        belScore: true,
      }
    })

    // Generate JWT token
    const token = this.generateToken(user)

    return { user, token }
  }

  async login(data: LoginData): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = data

    // Find user with all fields including password
    const user = await prisma.user.findUnique({
      where: { email }
    }) as any

    if (!user || !user.password) {
      throw new Error('Invalid credentials')
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Create user object without password
    const userWithoutPassword: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      belScore: user.belScore
    }

    // Generate JWT token
    const token = this.generateToken(userWithoutPassword)

    return { user: userWithoutPassword, token }
  }

  async getUserById(id: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        belScore: true,
      }
    })

    return user
  }

  private generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        userType: user.userType
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpire } as any
    )
  }

  verifyToken(token: string): AuthUser {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any
      return {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        userType: decoded.userType,
        belScore: decoded.belScore,
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}

export const authService = new AuthService()