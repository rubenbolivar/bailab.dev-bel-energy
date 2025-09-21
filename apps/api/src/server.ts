import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import productRoutes from './routes/products'
import projectRoutes from './routes/projects'
import academyRoutes from './routes/academy'
import calculadoraRoutes from './routes/calculadora'
import calculatorRoutes from './routes/calculator'
import belcashRoutes from './routes/belcash'
import aliadosRoutes from './routes/aliados'
import adminRoutes from './routes/admin'
import paymentRoutes from './routes/payments'
import notificationRoutes from './routes/notifications'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { authenticateToken } from './middleware/auth'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/academy', academyRoutes)
app.use('/api/calculadora', calculadoraRoutes)
app.use('/api/calculator', calculatorRoutes)
app.use('/api/belcash', belcashRoutes)
app.use('/api/aliados', aliadosRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join user-specific room for targeted notifications
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user_${userId}`)
    console.log(`User ${userId} joined room user_${userId}`)
  })

  // Join ally-specific room for ally notifications
  socket.on('join-ally-room', (allyId: string) => {
    socket.join(`ally_${allyId}`)
    console.log(`Ally ${allyId} joined room ally_${allyId}`)
  })

  // Join admin room for admin notifications
  socket.on('join-admin-room', () => {
    socket.join('admin_room')
    console.log('Admin joined admin_room')
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

export { io }