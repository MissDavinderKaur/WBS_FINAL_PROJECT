import { z } from 'zod'
import mongoose from 'mongoose'

export type IncomeDocument = mongoose.Document & {
  userId: string
  description: string
  amount: number
  frequency: 'Monthly' | 'Yearly' | 'Weekly'
  id: string
}

const incomeSchema = new mongoose.Schema<IncomeDocument>(
  {
    userId: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    frequency: { type: String, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

incomeSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

export const IncomeValidationSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  frequency: z.enum(['Monthly', 'Yearly', 'Weekly'])
})

export type IncomeInput = z.infer<typeof IncomeValidationSchema>

const IncomeModel = mongoose.model<IncomeDocument>('Income', incomeSchema)
export default IncomeModel
