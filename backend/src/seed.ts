import 'dotenv/config'
import mongoose from 'mongoose'
import UserModel, { UserValidationSchema } from './models/user'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI is required')

const seedUsers = [
  { email: 'user1@capitaltest.com', password: 'password123' },
  { email: 'user2@capitaltest.com', password: 'password123' },
  { email: 'user3@capitaltest.com', password: 'password123' }
]

async function runSeed() {
  try {
    const validatedUsers = seedUsers.map((user) => UserValidationSchema.parse(user))
    await UserModel.deleteMany({})
    await UserModel.insertMany(validatedUsers)
    console.log('Seeded 3 users successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })

runSeed()
