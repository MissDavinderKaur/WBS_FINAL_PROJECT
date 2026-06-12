import { z } from 'zod'
import mongoose from 'mongoose'

export type ExpenseDocument = mongoose.Document & {
  userId: string
  description: string
  amount: number
  type: 'Fixed' | 'Variable'
  category: 'Housing' | 'Shopping' | 'Transport' | 'Entertainment' | 'Utilties' | 'Other'
  id: string
}

const expenseSchema = new mongoose.Schema<ExpenseDocument>(
  {
    userId: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

expenseSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

export const ExpenseValidationSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  type: z.enum(['Fixed', 'Variable']),
  category: z.enum(['Housing', 'Shopping', 'Transport', 'Entertainment', 'Utilties', 'Other'])
})

export type ExpenseInput = z.infer<typeof ExpenseValidationSchema>

const ExpenseModel = mongoose.model<ExpenseDocument>('Expense', expenseSchema)
export default ExpenseModel
