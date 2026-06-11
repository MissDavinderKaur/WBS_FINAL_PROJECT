import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT;
const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI is required')

app.use(cors())
app.use(express.json())

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })
  
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})

export default mongoose
