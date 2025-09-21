import { Router } from 'express'

const router = Router()

// GET /api/products
router.get('/', (req, res) => {
  res.json({ message: 'Get products endpoint - TODO' })
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Get product by ID endpoint - TODO' })
})

// POST /api/products
router.post('/', (req, res) => {
  res.json({ message: 'Create product endpoint - TODO' })
})

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Update product endpoint - TODO' })
})

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete product endpoint - TODO' })
})

export default router