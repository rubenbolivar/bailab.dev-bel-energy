import { Router, Request, Response } from 'express'
import { authService } from '../services/authService'
import { authenticateToken } from '../middleware/auth'
import { UserType } from '@bel-energy/database'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    const result = await authService.login({ email, password })

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, userType, phone } = req.body

    if (!email || !password || !firstName || !lastName || !userType) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      })
    }

    if (!Object.values(UserType).includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type'
      })
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      userType,
      phone
    })

    res.status(201).json({
      success: true,
      data: result
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await authService.getUserById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router