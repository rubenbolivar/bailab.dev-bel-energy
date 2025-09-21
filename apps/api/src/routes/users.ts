import { Router } from 'express'

const router = Router()

// GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Get users endpoint - TODO' })
})

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Get user by ID endpoint - TODO' })
})

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Update user endpoint - TODO' })
})

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete user endpoint - TODO' })
})

export default router