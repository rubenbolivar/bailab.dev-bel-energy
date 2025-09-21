import { Router } from 'express'

const router = Router()

// GET /api/projects
router.get('/', (req, res) => {
  res.json({ message: 'Get projects endpoint - TODO' })
})

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Get project by ID endpoint - TODO' })
})

// POST /api/projects
router.post('/', (req, res) => {
  res.json({ message: 'Create project endpoint - TODO' })
})

// PUT /api/projects/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Update project endpoint - TODO' })
})

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete project endpoint - TODO' })
})

export default router