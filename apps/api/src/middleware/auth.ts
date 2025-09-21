import { Request, Response, NextFunction } from 'express'
import { authService, AuthUser } from '../services/authService'
import { UserType } from '@bel-energy/database'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      })
    }

    const user = authService.verifyToken(token)
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
}

export const requireRole = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }

    next()
  }
}

export const requireAuth = authenticateToken

// Role-based middleware shortcuts
export const requireAdmin = requireRole(['ADMIN'])
export const requireAlly = requireRole(['ALIADO', 'ADMIN'])
export const requireClient = requireRole(['CLIENTE', 'ALIADO', 'ADMIN'])