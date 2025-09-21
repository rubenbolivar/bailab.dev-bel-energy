import { Router } from 'express'

const router = Router()

// GET /api/academy/content
router.get('/content', (req, res) => {
  res.json({ message: 'Get academy content endpoint - TODO' })
})

// GET /api/academy/content/:id
router.get('/content/:id', (req, res) => {
  res.json({ message: 'Get academy content by ID endpoint - TODO' })
})

// GET /api/academy/progress
router.get('/progress', (req, res) => {
  res.json({ message: 'Get user progress endpoint - TODO' })
})

// POST /api/academy/progress/:contentId
router.post('/progress/:contentId', (req, res) => {
  res.json({ message: 'Update progress endpoint - TODO' })
})

// GET /api/academy/certificates
router.get('/certificates', (req, res) => {
  res.json({ message: 'Get certificates endpoint - TODO' })
})

export default router