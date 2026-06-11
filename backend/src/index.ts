import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import 'dotenv/config'
import mongoose from 'mongoose'
import userRoutes from './routes/user'
import authMiddleware from './middleware/auth'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
const port = process.env.PORT;
const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI is required')

app.use(cors())
app.use(express.json())
app.use(authMiddleware)
app.use('/api/users', userRoutes)

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })
  
export default mongoose