import path from 'path'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import UserModel, { UserValidationSchema } from './models/user'
import IncomeModel from './models/income'
import ExpenseModel from './models/expense'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI is required')

async function runSeed() {
  try {
    const validated = UserValidationSchema.parse({ email: 'user@capitaltest.com', password: 'password123' })
    const hashed = { ...validated, password: await bcrypt.hash(validated.password, 10) }

    await UserModel.deleteMany({})
    await IncomeModel.deleteMany({})
    await ExpenseModel.deleteMany({})

    const [user] = await UserModel.insertMany([hashed])
    const userId = user._id.toString()

    await IncomeModel.insertMany([
      { userId, description: 'Monthly salary', amount: 3500, frequency: 'Monthly' },
      { userId, description: 'Freelance work', amount: 800, frequency: 'Monthly' },
    ])

    await ExpenseModel.insertMany([
      { userId, description: 'Rent', amount: 1200, type: 'Fixed', category: 'Housing' },
      { userId, description: 'Groceries', amount: 250, type: 'Variable', category: 'Shopping' },
      { userId, description: 'Monthly bus pass', amount: 80, type: 'Fixed', category: 'Transport' },
      { userId, description: 'Netflix subscription', amount: 15, type: 'Fixed', category: 'Entertainment' },
      { userId, description: 'Electricity bill', amount: 90, type: 'Variable', category: 'Utilties' },
      { userId, description: 'Gym membership', amount: 40, type: 'Fixed', category: 'Other' },
      { userId, description: 'Dining out', amount: 120, type: 'Variable', category: 'Entertainment' },
    ])

    console.log('Seeded 1 user, 2 income entries, and 7 expense entries successfully.')
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
